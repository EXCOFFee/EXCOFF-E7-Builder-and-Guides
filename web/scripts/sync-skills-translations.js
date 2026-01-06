/**
 * Script para sincronizar archivos de traducción de skills
 * Copia la estructura de EN a todos los demás idiomas, manteniendo traducciones existentes
 */

const fs = require('fs');
const path = require('path');

const languages = ['ja', 'ko', 'pt', 'zh'];
const enSkillsPath = path.join(__dirname, '../messages/skills/en.json');
const enSkills = JSON.parse(fs.readFileSync(enSkillsPath, 'utf8'));

console.log('🔄 Sincronizando archivos de traducción de skills...\n');
console.log(`   Base EN: ${Object.keys(enSkills).length} héroes\n`);

for (const lang of languages) {
    const langPath = path.join(__dirname, `../messages/skills/${lang}.json`);
    let langSkills = {};

    try {
        langSkills = JSON.parse(fs.readFileSync(langPath, 'utf8'));
    } catch (e) {
        langSkills = {};
    }

    const existingCount = Object.keys(langSkills).length;
    let added = 0;
    let updated = 0;

    for (const [slug, skills] of Object.entries(enSkills)) {
        if (!langSkills[slug]) {
            // Nuevo héroe - copiar desde EN
            langSkills[slug] = { ...skills };
            added++;
        } else {
            // Héroe existente - agregar soulburn_effect si falta
            ['S1', 'S2', 'S3'].forEach(key => {
                if (skills[key]?.soulburn_effect && !langSkills[slug][key]?.soulburn_effect) {
                    if (!langSkills[slug][key]) {
                        langSkills[slug][key] = { ...skills[key] };
                    } else {
                        langSkills[slug][key].soulburn_effect = skills[key].soulburn_effect;
                    }
                    updated++;
                }
            });
        }
    }

    // Guardar
    fs.writeFileSync(langPath, JSON.stringify(langSkills, null, 4));

    console.log(`   ${lang.toUpperCase()}:`);
    console.log(`      Existían: ${existingCount}`);
    console.log(`      Agregados: ${added}`);
    console.log(`      Actualizados: ${updated}`);
    console.log(`      Total: ${Object.keys(langSkills).length}`);
    console.log();
}

console.log('✅ Sincronización completada');
