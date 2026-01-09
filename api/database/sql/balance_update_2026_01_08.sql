-- Balance Update 2026-01-08
-- Update skill scalings for existing heroes based on patch notes

-- Last Rider Krau: S2 Barrier 10% -> 14% (15% -> 21% at max)
UPDATE heroes 
SET skills = JSON_SET(
    skills,
    '$.S2.barrier_base', 0.14,
    '$.S2.barrier_max', 0.21,
    '$.S2.notes', 'Barrier from 10% to 14% caster max HP (15% to 21% at max enhance)'
)
WHERE code = 'last-rider-krau' OR slug = 'last-rider-krau';

-- Dragon Bride Senya: S3 Health scaling 9% -> 11%, removed 11% from soulburn
UPDATE heroes 
SET skills = JSON_SET(
    skills,
    '$.S3.hp_scaling', 0.11,
    '$.S3.soulburn_hp_scaling', 0,
    '$.S3.notes', 'Health scaling from 9% to 11%, removed 11% health scaling from soulburn'
)
WHERE code = 'dragon-bride-senya' OR slug = 'dragon-bride-senya';

-- Hwayoung: S3 Penetration from 0.000196 to 0.000213 * ATK_DIFF
UPDATE heroes 
SET skills = JSON_SET(
    skills,
    '$.S3.penetration_rate', 0.000213,
    '$.S3.notes', 'Penetration from 0.000196 to 0.000213 * ATK_DIFF (4.695 ATK diff for 100% pen)'
)
WHERE code = 'hwayoung' OR slug = 'hwayoung';

-- Landy: S3 Barrier 80% ATK
UPDATE heroes 
SET skills = JSON_SET(
    skills,
    '$.S3.barrier', 0.80,
    '$.S3.barrier_stat', 'atk',
    '$.S3.notes', 'Added barrier 80% caster Attack'
)
WHERE code = 'landy' OR slug = 'landy';

-- Midnight Gala Lilias: S1 Heal 30% -> 40% ATK, S1 SB att_rate 1.1 -> 1.8, heal 50% -> 40%
UPDATE heroes 
SET skills = JSON_SET(
    skills,
    '$.S1.heal', 0.40,
    '$.S1.soulburn_rate', 1.8,
    '$.S1.soulburn_heal', 0.40,
    '$.S1.notes', 'Heal from 30% to 40% ATK, SB att_rate from 1.1 to 1.8, SB heal from 50% to 40% ATK'
)
WHERE code = 'midnight-gala-lilias' OR slug = 'midnight-gala-lilias';

-- Savior Adin: S3 att_rate 1.1 -> 1.2, SB att_rate 1.65
UPDATE heroes 
SET skills = JSON_SET(
    skills,
    '$.S3.rate', 1.2,
    '$.S3.soulburn_rate', 1.65,
    '$.S3.soulburn_pow', 1.0,
    '$.S3.notes', 'att_rate from 1.1 to 1.2, SB att_rate 1.65 pow 1.0'
)
WHERE code = 'savior-adin' OR slug = 'savior-adin';

-- Update data_hash to invalidate cache
UPDATE heroes SET data_hash = CONCAT(data_hash, '-balance-2026-01-08') 
WHERE code IN ('last-rider-krau', 'dragon-bride-senya', 'hwayoung', 'landy', 'midnight-gala-lilias', 'savior-adin')
   OR slug IN ('last-rider-krau', 'dragon-bride-senya', 'hwayoung', 'landy', 'midnight-gala-lilias', 'savior-adin');
