// Mide qué falta traducir: claves ausentes y textos idénticos al inglés, por idioma y archivo.
// Uso: node web/scripts/qa/i18n_gaps.js [--list ui|glossary|artifacts] [--locale es]
const fs = require('fs');
const path = require('path');

const MESSAGES = path.join(__dirname, '..', '..', 'messages');
const LOCALES = ['es', 'pt', 'ko', 'ja', 'zh'];
const FILES = { ui: '', glossary: 'glossary', artifacts: 'artifacts' };

// Textos que son iguales en todos los idiomas: nombres propios, siglas, números, URLs
const SAME_EVERYWHERE = /^(?:[A-Z0-9+\-%./:() ]{1,6}|\{[a-z]+\}|https?:.*|EXCOFF.*|Epic Seven|E7|Discord|YouTube|STOVE|Fribbels.*|CeciliaBot|RTA|PvE|PvP|GW|ATK|DEF|HP|SPD|EFF|RES|CRIT|C\.DMG|S\d|Builds?|Tier List|OK|Email)$/i;

function flatten(obj, prefix = '', out = {}) {
    for (const [k, v] of Object.entries(obj)) {
        const key = prefix ? `${prefix}.${k}` : k;
        if (v && typeof v === 'object') flatten(v, key, out);
        else out[key] = v;
    }
    return out;
}

const load = (dir, locale) => flatten(JSON.parse(fs.readFileSync(path.join(MESSAGES, dir, `${locale}.json`), 'utf8')));

const args = process.argv.slice(2);
const listKind = args.includes('--list') ? args[args.indexOf('--list') + 1] : null;
const listLocale = args.includes('--locale') ? args[args.indexOf('--locale') + 1] : null;

for (const [kind, dir] of Object.entries(FILES)) {
    const en = load(dir, 'en');
    const row = [];
    for (const locale of LOCALES) {
        const tr = load(dir, locale);
        const missing = Object.keys(en).filter((k) => !(k in tr));
        // Artefactos: la clave es el nombre en inglés y el valor el traducido
        const same = Object.keys(en).filter(
            (k) => k in tr && tr[k] === en[k] && typeof en[k] === 'string' && !SAME_EVERYWHERE.test(en[k].trim())
        );
        row.push(`${locale}: ${missing.length} faltan, ${same.length} en inglés`);
        if (listKind === kind && (!listLocale || listLocale === locale)) {
            for (const k of missing) console.log(`  [${locale}] FALTA  ${k} = ${JSON.stringify(en[k])}`);
            for (const k of same) console.log(`  [${locale}] INGLÉS ${k} = ${JSON.stringify(en[k])}`);
        }
    }
    console.log(`${kind.padEnd(9)} (${Object.keys(en).length} claves) | ${row.join(' | ')}`);
}
