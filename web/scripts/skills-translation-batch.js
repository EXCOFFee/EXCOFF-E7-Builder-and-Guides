#!/usr/bin/env node
/**
 * Traducción de skills por tandas (pt, ko, ja, zh) a partir de messages/skills/en.json.
 *
 *   node scripts/skills-translation-batch.js status
 *       Cuántos héroes siguen idénticos al inglés en cada idioma.
 *   node scripts/skills-translation-batch.js extract <n> [<orden.json>]
 *       Imprime el texto en inglés de los próximos n héroes sin traducir (en el orden dado,
 *       o alfabético), en formato compacto para traducir.
 *   node scripts/skills-translation-batch.js apply <tanda.json>
 *       Valida y escribe una tanda: { "<Héroe>": { "S1": { "name": [pt, ko, ja, zh],
 *       "description": [...], "soulburn_effect": [...] } } }.
 *
 * Validaciones: mismas skills y campos que el inglés, ningún texto vacío, los mismos números
 * que el original y el alfabeto esperado en cada idioma. Si algo falla no se escribe nada.
 */
const fs = require('fs');
const path = require('path');

const DIR = path.join(__dirname, '..', 'messages', 'skills');
const LOCALES = ['pt', 'ko', 'ja', 'zh'];
const FIELDS = ['name', 'description', 'soulburn_effect'];
const SCRIPT = {
    pt: /[a-zà-ú]/i,
    ko: /[가-힣]/,
    ja: /[぀-ヿ一-鿿]/,
    zh: /[一-鿿]/,
};

const read = (locale) => {
    const raw = fs.readFileSync(path.join(DIR, `${locale}.json`), 'utf8');
    return { raw, data: JSON.parse(raw) };
};

function write(locale, raw, data) {
    const eol = raw.includes('\r\n') ? '\r\n' : '\n';
    const sorted = Object.fromEntries(Object.keys(data).sort().map((k) => [k, data[k]]));
    const text = JSON.stringify(sorted, null, 4).replace(/\n/g, eol) + (raw.endsWith('\n') ? eol : '');
    fs.writeFileSync(path.join(DIR, `${locale}.json`), text);
}

/**
 * Un héroe está pendiente en un idioma si alguna descripción sigue idéntica al inglés
 * (los nombres pueden coincidir: nombres propios como "Judradjim" no se traducen en pt).
 */
function pending(en, tr, hero) {
    return Object.entries(en[hero].skills || {}).some(([key, skill]) =>
        ['description', 'soulburn_effect'].some((f) => skill[f] && tr[hero]?.skills?.[key]?.[f] === skill[f])
    );
}

// Números del texto: 1,000 / 1.000 / 50% → "1000", "50"
const numbers = (text) => (text.match(/\d[\d,.]*/g) || []).map((n) => n.replace(/[,.](?=\d{3}\b)/g, '').replace(/[.,]$/, '')).sort();

const [, , command, arg, orderFile] = process.argv;
const en = read('en').data;

if (command === 'status') {
    for (const locale of LOCALES) {
        const tr = read(locale).data;
        const left = Object.keys(en).filter((h) => pending(en, tr, h)).length;
        console.log(`${locale}: ${Object.keys(en).length - left} traducidos, ${left} pendientes`);
    }
} else if (command === 'extract') {
    const trs = LOCALES.map((l) => read(l).data);
    let order = Object.keys(en).sort();
    if (orderFile) order = JSON.parse(fs.readFileSync(orderFile, 'utf8')).order;
    const batch = order.filter((h) => en[h] && trs.some((tr) => pending(en, tr, h))).slice(0, Number(arg) || 20);
    for (const hero of batch) {
        console.log(`## ${hero}`);
        for (const [key, skill] of Object.entries(en[hero].skills || {})) {
            for (const f of FIELDS) if (skill[f]) console.log(`${key}.${f}: ${skill[f]}`);
        }
    }
} else if (command === 'apply') {
    const batch = JSON.parse(fs.readFileSync(arg, 'utf8'));
    const errors = [];
    for (const [hero, skills] of Object.entries(batch)) {
        if (!en[hero]) { errors.push(`${hero}: no existe en en.json`); continue; }
        for (const [key, skill] of Object.entries(en[hero].skills || {})) {
            for (const f of FIELDS) {
                if (!skill[f]) continue;
                const values = skills[key]?.[f];
                if (!Array.isArray(values) || values.length !== 4) { errors.push(`${hero} ${key}.${f}: faltan traducciones`); continue; }
                values.forEach((value, i) => {
                    const locale = LOCALES[i];
                    if (!value || !value.trim()) errors.push(`${hero} ${key}.${f} [${locale}]: vacío`);
                    else if (!SCRIPT[locale].test(value)) errors.push(`${hero} ${key}.${f} [${locale}]: no parece ${locale}`);
                    else if (f !== 'name' && numbers(value).join() !== numbers(skill[f]).join())
                        errors.push(`${hero} ${key}.${f} [${locale}]: números ${numbers(value)} ≠ ${numbers(skill[f])}`);
                });
            }
        }
        for (const key of Object.keys(skills)) if (!en[hero].skills?.[key]) errors.push(`${hero}: ${key} no existe`);
    }
    if (errors.length) {
        console.error(errors.join('\n'));
        console.error(`\n${errors.length} errores: no se escribió nada`);
        process.exit(1);
    }
    LOCALES.forEach((locale, i) => {
        const { raw, data } = read(locale);
        for (const [hero, skills] of Object.entries(batch)) {
            data[hero] ??= { _name: hero, skills: {} };
            for (const [key, fields] of Object.entries(skills)) {
                data[hero].skills[key] ??= {};
                for (const [f, values] of Object.entries(fields)) data[hero].skills[key][f] = values[i];
            }
        }
        write(locale, raw, data);
    });
    console.log(`ok: ${Object.keys(batch).length} héroes en ${LOCALES.join(', ')}`);
} else {
    console.log('uso: status | extract <n> [orden.json] | apply <tanda.json>');
}
