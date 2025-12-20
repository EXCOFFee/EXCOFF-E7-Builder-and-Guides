-- Script SQL para actualizar las URLs de artefactos en Hostinger
-- Ejecutar en phpMyAdmin en la tabla 'artifacts'
-- URL Base: https://moccasin-sparrow-217730.hostingersite.com

-- Para "Tome of the Life's End" (nuevo artefacto de Hecate)
UPDATE artifacts 
SET image_url = 'https://moccasin-sparrow-217730.hostingersite.com/images/artifacts/icon_art0231.png'
WHERE name LIKE '%Tome of the Life%End%' OR slug LIKE '%tome%life%end%';

-- NOTA IMPORTANTE:
-- Los archivos de iconos son: icon_art0001.png, icon_art0002.png, etc.
-- Los códigos en la DB son: efk21, ef504, efw13, etc.
-- 
-- NO existe un mapeo directo entre efk21 -> art0001
-- 
-- OPCIONES:
-- 
-- 1. OPCIÓN RÁPIDA: Usar URLs de EpicSevenDB (funcionan para la mayoría)
--    Ejemplo: https://www.e7vau.lt/static/game/artifact/{code}.png
--
-- 2. OPCIÓN MANUAL: Si tienes el JSON de Fribbels con los nombres,
--    puedes mapear manualmente cada artefacto a su archivo icon_art####.png
--
-- EJEMPLO: Si sabes que "Sigurd Scythe" es icon_art0005.png:
-- UPDATE artifacts 
-- SET image_url = 'https://moccasin-sparrow-217730.hostingersite.com/images/artifacts/icon_art0005.png'
-- WHERE name = 'Sigurd Scythe';

-- ALTERNATIVA: Usar e7vau.lt que tiene las imágenes disponibles
-- Esta es la opción más rápida si no quieres mapear manualmente:

UPDATE artifacts 
SET image_url = CONCAT('https://www.e7vau.lt/static/game/artifact/', code, '.png')
WHERE image_url IS NULL OR image_url = '' OR image_url LIKE '%epc7db%';

-- Verificar los cambios:
-- SELECT id, name, code, image_url FROM artifacts LIMIT 20;
