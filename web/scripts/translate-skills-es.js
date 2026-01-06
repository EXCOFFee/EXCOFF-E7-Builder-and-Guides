/**
 * Script para traducir skills al español
 * Toma el archivo EN como base y traduce usando patrones conocidos del juego
 */

const fs = require('fs');
const path = require('path');

// Cargar datos
const enSkillsPath = path.join(__dirname, '../messages/skills/en.json');
const esSkillsPath = path.join(__dirname, '../messages/skills/es.json');

const enSkills = JSON.parse(fs.readFileSync(enSkillsPath, 'utf8'));
let esSkills = {};

try {
    esSkills = JSON.parse(fs.readFileSync(esSkillsPath, 'utf8'));
} catch (e) {
    esSkills = {};
}

// Diccionario de traducciones comunes
const translations = {
    // Efectos de soulburn
    'Increases damage dealt.': 'Aumenta el daño infligido.',
    'Ignores Effect Resistance.': 'Ignora la Resistencia a Efectos.',
    'Extends buff durations by 1 turn.': 'Extiende la duración de beneficios en 1 turno.',
    'Grants an extra turn.': 'Otorga un turno extra.',
    'Reduces skill cooldown by 1 turn.': 'Reduce el tiempo de reutilización en 1 turno.',
    'Reduces skill cooldown by 2 turns.': 'Reduce el tiempo de reutilización en 2 turnos.',
    'Grants an extra attack with the same skill.': 'Otorga un ataque extra con la misma habilidad.',

    // Términos comunes en descripciones
    'Attacks the enemy': 'Ataca al enemigo',
    'Attacks all enemies': 'Ataca a todos los enemigos',
    'with a': 'con un',
    'before': 'antes de',
    'after': 'después de',
    'increases Combat Readiness': 'aumenta la Preparación de Combate',
    'decreases Combat Readiness': 'disminuye la Preparación de Combate',
    'grants': 'otorga',
    'dispels': 'disipa',
    'buff': 'beneficio',
    'debuff': 'debilidad',
    'for 1 turn': 'durante 1 turno',
    'for 2 turns': 'durante 2 turnos',
    'for 3 turns': 'durante 3 turnos',
    'proportional to': 'proporcionalmente a',
    'the caster': 'el lanzador',
    "caster's": 'del lanzador',
    'max Health': 'Salud máxima',
    'Attack': 'Ataque',
    'Defense': 'Defensa',
    'Speed': 'Velocidad',
    'Critical Hit': 'Golpe Crítico',
    'chance': 'probabilidad',
    'penetrates': 'penetra',
    'heals': 'cura',
    'recovers Health': 'recupera Salud',
    'barrier': 'barrera',
    'immunity': 'inmunidad',
    'increased': 'aumento de',
    'decreased': 'disminución de',
    'stun': 'aturdir',
    'silence': 'silenciar',
    'provoke': 'provocar',
    'sleep': 'dormir',
    'Focus': 'Concentración',
    'Fighting Spirit': 'Espíritu de Lucha',
    'souls': 'almas',
    'target': 'objetivo',
    'ally': 'aliado',
    'allies': 'aliados',
    'enemy': 'enemigo',
    'enemies': 'enemigos',
};

// Función para traducir texto
function translateText(text) {
    if (!text) return text;

    let translated = text;

    // Aplicar traducciones conocidas (solo para soulburn effects que son frases cortas)
    for (const [en, es] of Object.entries(translations)) {
        if (translated === en) {
            return es;
        }
    }

    return translated; // Devolver original si no hay traducción exacta
}

// Procesar cada héroe
console.log('🔄 Iniciando traducción a español...\n');

let updated = 0;
let unchanged = 0;

for (const [slug, skills] of Object.entries(enSkills)) {
    const existingEs = esSkills[slug];

    // Si ya existe en ES, solo actualizar soulburn_effect si falta
    if (existingEs) {
        let needsUpdate = false;

        ['S1', 'S2', 'S3'].forEach(key => {
            if (skills[key]?.soulburn_effect && !existingEs[key]?.soulburn_effect) {
                if (!esSkills[slug][key]) {
                    esSkills[slug][key] = { ...skills[key] };
                }
                esSkills[slug][key].soulburn_effect = translateText(skills[key].soulburn_effect);
                needsUpdate = true;
            }
        });

        if (needsUpdate) {
            updated++;
        } else {
            unchanged++;
        }
    } else {
        // Nuevo héroe - copiar desde EN y traducir soulburn
        esSkills[slug] = {};

        ['S1', 'S2', 'S3'].forEach(key => {
            if (skills[key]) {
                esSkills[slug][key] = {
                    name: skills[key].name, // Nombre sin traducir por ahora
                    description: skills[key].description, // Descripción sin traducir por ahora
                };

                if (skills[key].soulburn_effect) {
                    esSkills[slug][key].soulburn_effect = translateText(skills[key].soulburn_effect);
                }
            }
        });

        updated++;
        console.log(`   + ${slug}`);
    }
}

// Guardar resultado
console.log('\n💾 Guardando archivo ES...');
fs.writeFileSync(esSkillsPath, JSON.stringify(esSkills, null, 4));
console.log(`   Guardado: ${esSkillsPath}`);
console.log(`   Total héroes: ${Object.keys(esSkills).length}`);
console.log(`   Actualizados: ${updated}`);
console.log(`   Sin cambios: ${unchanged}`);

console.log('\n✅ Traducción a español completada');
