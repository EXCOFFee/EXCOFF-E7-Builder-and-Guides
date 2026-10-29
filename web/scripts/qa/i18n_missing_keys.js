// Claves usadas con t('area.clave', 'texto') en el código que no están en messages/en.json.
// i18n_gaps.js compara los idiomas contra en.json; esto encuentra las que faltan en todos.
// Uso: node web/scripts/qa/i18n_missing_keys.js [archivo_o_carpeta ...]
const fs = require('fs');
const path = require('path');

const WEB = path.resolve(__dirname, '..', '..');
const en = JSON.parse(fs.readFileSync(path.join(WEB, 'messages', 'en.json'), 'utf8'));
const targets = process.argv.slice(2).length ? process.argv.slice(2) : [path.join(WEB, 'src')];

const has = (key) => key.split('.').reduce((node, part) => (node && typeof node === 'object' ? node[part] : undefined), en) !== undefined;
const files = [];
const walk = (p) => {
    const stat = fs.statSync(p);
    if (stat.isDirectory()) fs.readdirSync(p).forEach((f) => walk(path.join(p, f)));
    else if (/\.(tsx?|jsx?)$/.test(p)) files.push(p);
};
targets.forEach((t) => walk(path.resolve(t)));

const missing = new Map();
const call = /\bt\(\s*'([a-zA-Z]+\.[\w.]+)'\s*,\s*'((?:[^'\\]|\\.)*)'/g;
for (const file of files) {
    for (const m of fs.readFileSync(file, 'utf8').matchAll(call)) {
        if (!has(m[1]) && !missing.has(m[1])) missing.set(m[1], { text: m[2], file: path.relative(WEB, file) });
    }
}
for (const [key, { text, file }] of missing) console.log(`${key}\t${text}\t${file}`);
console.error(`${missing.size} claves sin traducción en ${files.length} archivos`);
