/**
 * Genera los datos de buffs/debuffs por skill desde CeciliaBot y descarga los íconos que falten.
 *
 * Salida:
 *   src/data/hero-effects.json  { "<Hero Name>": { "S1": { "buffs": [id], "debuffs": [id] } } }
 *   src/data/effects.json       { "<id>": { "name", "description", "type": "buff"|"debuff", "icon": "<file>.png"|null } }
 *   public/images/buff/<id>.png (solo los que no existen)
 *
 * Uso: node scripts/generate-hero-effects.mjs   (volver a correr al agregar héroes nuevos)
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const API = 'https://cecilia-bot-api.vercel.app/api/v1';
const ICON_BASE = 'https://raw.githubusercontent.com/CeciliaBot/E7Assets-Temp/main/assets/buff';
const DATA_DIR = path.join(__dirname, '../src/data');
const ICON_DIR = path.join(__dirname, '../public/images/buff');
const CONCURRENCY = 4;

async function fetchJson(url, retries = 3) {
    for (let attempt = 1; ; attempt++) {
        try {
            const res = await fetch(url, { signal: AbortSignal.timeout(30000) });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            return await res.json();
        } catch (error) {
            if (attempt >= retries) throw error;
            await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
        }
    }
}

/** Ejecuta `worker` sobre `items` con concurrencia limitada. */
async function mapLimit(items, limit, worker) {
    const results = new Array(items.length);
    let next = 0;
    const runners = Array.from({ length: limit }, async () => {
        while (next < items.length) {
            const index = next++;
            results[index] = await worker(items[index], index);
        }
    });
    await Promise.all(runners);
    return results;
}

/** Nombre de archivo del ícono: algunos ids de CeciliaBot ya traen la extensión (p. ej. "stic_penres_up.png"). */
function iconFile(id) {
    return `${id.replace(/\.png$/, '')}.png`;
}

async function downloadIcon(id) {
    const target = path.join(ICON_DIR, iconFile(id));
    if (fs.existsSync(target)) return true;

    const res = await fetch(`${ICON_BASE}/${iconFile(id)}`, { signal: AbortSignal.timeout(30000) });
    if (!res.ok) return false;
    fs.writeFileSync(target, Buffer.from(await res.arrayBuffer()));
    return true;
}

async function main() {
    console.log('🔄 Generando efectos de skills desde CeciliaBot...\n');

    const heroList = await fetchJson(`${API}/getList?list=hero`);
    console.log(`   Héroes en CeciliaBot: ${heroList.length}`);

    const heroEffects = {};
    const effects = {};
    let failed = 0;

    await mapLimit(heroList, CONCURRENCY, async (entry) => {
        let hero;
        try {
            hero = await fetchJson(`${API}/getItem?list=hero&id=${entry._id}`);
        } catch (error) {
            failed++;
            console.warn(`   ⚠️  ${entry._id}: ${error.message}`);
            return;
        }

        const skills = {};
        (hero.skills || []).forEach((skill, index) => {
            // El S3 despertado puede otorgar efectos distintos a la versión base
            const source = skill.awakened || skill;
            const buffs = [...(source.buff || skill.buff || [])];
            const debuffs = [...(source.debuff || skill.debuff || [])];

            for (const [list, type] of [[buffs, 'buff'], [debuffs, 'debuff']]) {
                for (const effect of list) {
                    if (!effects[effect._id]) {
                        effects[effect._id] = {
                            name: effect.name,
                            description: effect.description || '',
                            type,
                        };
                    }
                }
            }

            if (buffs.length || debuffs.length) {
                skills[`S${index + 1}`] = {
                    buffs: buffs.map((effect) => effect._id),
                    debuffs: debuffs.map((effect) => effect._id),
                };
            }
        });

        if (Object.keys(skills).length) heroEffects[hero.name] = skills;
    });

    const ids = Object.keys(effects).sort();
    console.log(`   Efectos únicos: ${ids.length}. Descargando íconos que falten...`);

    fs.mkdirSync(ICON_DIR, { recursive: true });
    const before = fs.readdirSync(ICON_DIR).length;
    const available = await mapLimit(ids, CONCURRENCY, (id) => downloadIcon(id).catch(() => false));
    ids.forEach((id, index) => {
        effects[id].icon = available[index] ? iconFile(id) : null;
    });
    const downloaded = fs.readdirSync(ICON_DIR).length - before;

    const sortObject = (obj) => Object.fromEntries(Object.entries(obj).sort(([a], [b]) => a.localeCompare(b)));
    fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(path.join(DATA_DIR, 'hero-effects.json'), JSON.stringify(sortObject(heroEffects), null, 2) + '\n');
    fs.writeFileSync(path.join(DATA_DIR, 'effects.json'), JSON.stringify(sortObject(effects), null, 2) + '\n');

    const missingIcons = ids.filter((id) => !effects[id].icon);
    console.log(`\n✅ ${Object.keys(heroEffects).length} héroes con efectos, ${ids.length} efectos, ${downloaded} íconos nuevos`);
    if (missingIcons.length) console.log(`   Sin ícono en CeciliaBot (${missingIcons.length}): ${missingIcons.join(', ')}`);
    if (failed) console.log(`   ⚠️  ${failed} héroes no se pudieron descargar`);
}

main().catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
});
