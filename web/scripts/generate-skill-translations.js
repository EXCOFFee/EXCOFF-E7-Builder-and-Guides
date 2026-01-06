/**
 * Script para generar traducciones completas de skills - v2
 * Más robusto contra errores de API
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// Cargar datos actuales
const currentSkillsPath = path.join(__dirname, '../messages/skills/en.json');
const customHeroesPath = path.join(__dirname, '../../api/database/data/custom_heroes.json');

let currentSkills = {};
let customHeroes = {};

try {
    currentSkills = JSON.parse(fs.readFileSync(currentSkillsPath, 'utf8'));
    customHeroes = JSON.parse(fs.readFileSync(customHeroesPath, 'utf8'));
} catch (e) {
    console.error('Error loading files:', e.message);
    process.exit(1);
}

// Función para obtener datos de CeciliaBot con timeout
function fetchCeciliaBotHero(slug) {
    return new Promise((resolve) => {
        const url = `https://cecilia-bot-api.vercel.app/api/v1/getItem?list=hero&id=${slug}`;

        const req = https.get(url, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(data);
                    resolve(parsed);
                } catch (e) {
                    resolve(null);
                }
            });
        });

        req.on('error', () => resolve(null));
        req.setTimeout(10000, () => {
            req.destroy();
            resolve(null);
        });
    });
}

// Función para limpiar descripción de markdown
function cleanDescription(desc) {
    if (!desc) return '';
    return desc
        .replace(/\*\*/g, '')
        .replace(/\*/g, '')
        .replace(/--/g, '')
        .replace(/_/g, '')
        .replace(/\n/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

// Función para extraer skills de CeciliaBot - más robusta
function extractSkills(heroData) {
    if (!heroData) return null;

    const skills = {};
    let skillsArray = heroData.skills;

    // Si no hay skills array, intentar buscar en otra estructura
    if (!Array.isArray(skillsArray)) {
        return null;
    }

    skillsArray.forEach((skill, index) => {
        if (!skill) return;

        const skillKey = `S${index + 1}`;
        const name = skill.name || `Skill ${index + 1}`;
        // Limpiar descripción - asegurarse que sea string
        const rawDesc = skill.description;
        const description = typeof rawDesc === 'string' ? cleanDescription(rawDesc) : '';

        if (name && description) {
            skills[skillKey] = { name, description };

            // Buscar soulburn effect en soul_description (CeciliaBot usa este campo)
            if (skill.soulburn && skill.soul_description) {
                const sbEffect = typeof skill.soul_description === 'string'
                    ? cleanDescription(skill.soul_description)
                    : '';
                if (sbEffect) {
                    skills[skillKey].soulburn_effect = sbEffect;
                }
            }
        }
    });

    return Object.keys(skills).length > 0 ? skills : null;
}

// Función para obtener skills de custom_heroes.json
function getBalancePatchSkills(slug) {
    const hero = customHeroes[slug];
    if (!hero || !hero.skills) return null;

    const skills = {};

    ['S1', 'S2', 'S3'].forEach(key => {
        if (hero.skills[key]) {
            skills[key] = {
                name: hero.skills[key].name || `Skill ${key}`,
                description: hero.skills[key].description || '',
            };

            if (hero.skills[key].soulburn_effect) {
                skills[key].soulburn_effect = hero.skills[key].soulburn_effect;
            }
        }
    });

    return Object.keys(skills).length > 0 ? skills : null;
}

// Obtener lista de slugs desde Fribbels
async function getFribbelsHeroes() {
    return new Promise((resolve, reject) => {
        https.get('https://raw.githubusercontent.com/fribbels/Fribbels-Epic-7-Optimizer/main/data/cache/herodata.json', (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const heroes = JSON.parse(data);
                    const slugs = Object.keys(heroes)
                        .filter(k => k !== 'temp')
                        .map(name => ({
                            name: name,
                            slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
                        }));
                    resolve(slugs);
                } catch (e) {
                    reject(e);
                }
            });
        }).on('error', reject);
    });
}

// Función principal
async function main() {
    console.log('🚀 Iniciando generación de traducciones (v2)...\n');

    // 1. Obtener lista de héroes
    console.log('📥 Descargando lista de héroes de Fribbels...');
    const fribbelsHeroes = await getFribbelsHeroes();
    console.log(`   Encontrados: ${fribbelsHeroes.length} héroes\n`);

    // 2. Identificar héroes faltantes
    const existingSlugs = new Set(Object.keys(currentSkills));
    const missingHeroes = fribbelsHeroes.filter(h => !existingSlugs.has(h.slug));
    const balancePatchSlugs = Object.keys(customHeroes).filter(k => k !== '_meta');

    console.log(`📊 Estado actual:`);
    console.log(`   - Traducidos: ${existingSlugs.size}`);
    console.log(`   - Faltan: ${missingHeroes.length}`);
    console.log(`   - Balance patches: ${balancePatchSlugs.length}\n`);

    // 3. Copiar skills existentes
    const newSkills = { ...currentSkills };

    // 4. Actualizar con balance patches
    console.log('🔄 Aplicando balance patches...');
    for (const slug of balancePatchSlugs) {
        const patchSkills = getBalancePatchSkills(slug);
        if (patchSkills) {
            if (newSkills[slug]) {
                ['S1', 'S2', 'S3'].forEach(key => {
                    if (patchSkills[key]) {
                        newSkills[slug][key] = {
                            ...newSkills[slug][key],
                            ...patchSkills[key]
                        };
                    }
                });
            } else {
                newSkills[slug] = patchSkills;
            }
            console.log(`   ✓ ${slug}`);
        }
    }

    // 5. Descargar héroes faltantes de CeciliaBot
    console.log('\n📥 Descargando héroes faltantes de CeciliaBot...');
    const toDownload = missingHeroes.filter(h => !newSkills[h.slug]);
    console.log(`   Total a descargar: ${toDownload.length}\n`);

    let downloaded = 0;
    let failed = 0;
    const failedHeroes = [];

    for (let i = 0; i < toDownload.length; i++) {
        const hero = toDownload[i];

        try {
            const data = await fetchCeciliaBotHero(hero.slug);

            if (data && data.skills && Array.isArray(data.skills)) {
                const skills = extractSkills(data);
                if (skills && Object.keys(skills).length > 0) {
                    newSkills[hero.slug] = skills;
                    downloaded++;
                    console.log(`   ✓ ${hero.slug} (${i + 1}/${toDownload.length})`);
                } else {
                    failed++;
                    failedHeroes.push(hero.slug);
                    console.log(`   ✗ ${hero.slug} (no valid skills)`);
                }
            } else {
                failed++;
                failedHeroes.push(hero.slug);
                console.log(`   ✗ ${hero.slug} (API: no skills array)`);
            }
        } catch (error) {
            failed++;
            failedHeroes.push(hero.slug);
            console.log(`   ✗ ${hero.slug} (error: ${error.message})`);
        }

        // Pequeña pausa
        await new Promise(r => setTimeout(r, 150));
    }

    console.log(`\n   ✅ Descargados: ${downloaded}`);
    console.log(`   ❌ Fallidos: ${failed}`);

    if (failedHeroes.length > 0) {
        console.log(`\n   Héroes fallidos:`);
        failedHeroes.forEach(h => console.log(`      - ${h}`));
    }

    // 6. Guardar resultado
    console.log('\n💾 Guardando archivo...');
    fs.writeFileSync(currentSkillsPath, JSON.stringify(newSkills, null, 4));
    console.log(`   Guardado: ${currentSkillsPath}`);
    console.log(`   Total héroes: ${Object.keys(newSkills).length}`);

    console.log('\n✅ Generación completada');
}

main().catch(err => {
    console.error('Error fatal:', err);
    process.exit(1);
});
