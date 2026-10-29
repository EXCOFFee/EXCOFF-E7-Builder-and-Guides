"""Genera el catálogo de tags desde catalog_spec.py.

Uso (desde la raíz del repo): python -I web/scripts/tags/build_tags.py [<ref_git_del_catalogo_viejo>]

Las traducciones marcadas para reutilizar salen del catálogo anterior, leído de git
(por defecto el commit 41829cc, último con el catálogo de 382 tags).
"""
import json
import os
import re
import subprocess
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import catalog_spec as spec  # noqa: E402

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..'))
OLD_REF = sys.argv[1] if len(sys.argv) > 1 else '41829cc'
LOCALES = ['en', 'es', 'ja', 'ko', 'pt', 'zh']


def parse_old_catalog():
    """{(id, tipo): traducciones} del pros-cons-tags.ts viejo."""
    src = subprocess.run(['git', 'show', f'{OLD_REF}:web/src/lib/pros-cons-tags.ts'],
                         cwd=ROOT, capture_output=True, text=True, encoding='utf-8', check=True).stdout
    string = r"'((?:[^'\\]|\\.)*)'|\"((?:[^\"\\]|\\.)*)\""
    entry = re.compile(r"\{ id: '(\w+)', type: '(pro|con)', category: '\w+', translations: t\((.*?)\) \}")
    old = {}
    for m in entry.finditer(src):
        args = [a or b for a, b in re.findall(string, m.group(3))]
        args = [a.replace("\\'", "'").replace('\\"', '"') for a in args]
        assert len(args) == 6, m.group(0)
        old[(m.group(1), m.group(2))] = tuple(args)
    return old


def ts_str(value):
    return "'" + value.replace('\\', '\\\\').replace("'", "\\'") + "'"


def ts_t(tr):
    return 't(' + ', '.join(ts_str(x) for x in tr) + ')'


def build():
    old = parse_old_catalog()
    categories = {}  # id -> (grupo, tipo)
    for type_, groups in spec.GROUPS.items():
        for group_id, _, cats in groups:
            for cat_id, _ in cats:
                assert cat_id not in categories, f'categoría repetida {cat_id}'
                categories[cat_id] = (group_id, type_)

    tags = []
    seen = set()
    for type_, rows in (('pro', spec.PROS), ('con', spec.CONS)):
        for tag_id, cat_id, tr, aliases in rows:
            assert tag_id not in seen, f'tag repetido {tag_id}'
            seen.add(tag_id)
            group_id, cat_type = categories[cat_id]
            assert cat_type == type_, f'{tag_id}: categoría {cat_id} es de otro tipo'
            if tr is None:
                assert (tag_id, type_) in old, f'{tag_id}: no hay traducción vieja para reutilizar'
                tr = old[(tag_id, type_)]
            tags.append(dict(id=tag_id, type=type_, group=group_id, category=cat_id, tr=tr, aliases=aliases))

    new_ids = {('pro', x['id']) for x in tags if x['type'] == 'pro'} | {('con', x['id']) for x in tags if x['type'] == 'con'}
    for type_, merges in (('pro', spec.PRO_MERGES), ('con', spec.CON_MERGES)):
        for src, dst in merges.items():
            assert (type_, dst) in new_ids, f'{src} -> {dst}: destino inexistente'
            assert (type_, src) not in new_ids, f'{src}: sigue en el catálogo y además se fusiona'
    return old, tags


def write_ts(tags):
    lines = [
        '/**',
        ' * Tags de pros y contras de las builds (Epic Seven).',
        ' *',
        ' * ARCHIVO GENERADO por web/scripts/tags/build_tags.py desde catalog_spec.py: no editar a mano.',
        ' * Dos niveles para filtrar: grupo (p. ej. "Daño") y categoría (p. ej. "Escalado").',
        ' * Los alias se usan solo para buscar (sinónimos y términos de la comunidad).',
        ' */',
        '',
        "export type TagType = 'pro' | 'con';",
        "export type Locale = 'en' | 'es' | 'ja' | 'ko' | 'pt' | 'zh';",
        '',
        'export interface TagTranslations {',
        *[f'    {loc}: string;' for loc in LOCALES],
        '}',
        '',
        'export interface TagGroup {',
        '    id: string;',
        '    type: TagType;',
        '    labels: TagTranslations;',
        '}',
        '',
        'export interface TagCategory {',
        '    id: string;',
        '    group: string;',
        '    type: TagType;',
        '    labels: TagTranslations;',
        '}',
        '',
        'export interface Tag {',
        '    id: string;',
        '    type: TagType;',
        '    group: string;',
        '    category: string;',
        '    translations: TagTranslations;',
        '    aliases: string[];',
        '}',
        '',
        'const t = (en: string, es: string, ja: string, ko: string, pt: string, zh: string): TagTranslations =>',
        '    ({ en, es, ja, ko, pt, zh });',
        '',
        'export const TAG_GROUPS: TagGroup[] = [',
    ]
    for type_, groups in spec.GROUPS.items():
        for group_id, tr, _ in groups:
            lines.append(f"    {{ id: '{group_id}', type: '{type_}', labels: {ts_t(tr)} }},")
    lines += ['];', '', 'export const TAG_CATEGORIES: TagCategory[] = [']
    for type_, groups in spec.GROUPS.items():
        for group_id, _, cats in groups:
            for cat_id, tr in cats:
                lines.append(f"    {{ id: '{cat_id}', group: '{group_id}', type: '{type_}', labels: {ts_t(tr)} }},")
    lines.append('];')
    for type_, name in (('pro', 'PROS_TAGS'), ('con', 'CONS_TAGS')):
        lines += ['', f'export const {name}: Tag[] = [']
        for tag in (x for x in tags if x['type'] == type_):
            aliases = '[' + ', '.join(ts_str(a) for a in tag['aliases']) + ']'
            lines.append(f"    {{ id: '{tag['id']}', type: '{type_}', group: '{tag['group']}', category: '{tag['category']}', "
                         f"translations: {ts_t(tag['tr'])}, aliases: {aliases} }},")
        lines.append('];')
    lines += [
        '',
        'export const ALL_TAGS: Tag[] = [...PROS_TAGS, ...CONS_TAGS];',
        '',
        'const TAGS_BY_ID = new Map(ALL_TAGS.map((tag) => [tag.id, tag]));',
        '',
        'export function getTagById(id: string): Tag | undefined {',
        '    return TAGS_BY_ID.get(id);',
        '}',
        '',
        'function pick(labels: TagTranslations, locale: string): string {',
        '    return labels[locale as Locale] || labels.en;',
        '}',
        '',
        'export function getTagLabel(tag: Tag, locale: string): string {',
        '    return pick(tag.translations, locale);',
        '}',
        '',
        'export function getGroupLabel(groupId: string, locale: string): string {',
        '    const group = TAG_GROUPS.find((g) => g.id === groupId);',
        '    return group ? pick(group.labels, locale) : groupId;',
        '}',
        '',
        'export function getCategoryLabel(categoryId: string, locale: string): string {',
        '    const category = TAG_CATEGORIES.find((c) => c.id === categoryId);',
        '    return category ? pick(category.labels, locale) : categoryId;',
        '}',
        '',
        '/** Búsqueda en el nombre del tag en todos los idiomas y en sus alias (sin acentos ni mayúsculas) */',
        'export function tagMatches(tag: Tag, query: string): boolean {',
        '    const q = normalize(query);',
        '    if (!q) return true;',
        '    return [...Object.values(tag.translations), ...tag.aliases].some((text) => normalize(text).includes(q));',
        '}',
        '',
        'function normalize(text: string): string {',
        "    return text.normalize('NFD').replace(/[\\u0300-\\u036f]/g, '').toLowerCase().trim();",
        '}',
        '',
        '/** Tags de un tipo filtrados por grupo, categoría y búsqueda, agrupados por categoría (orden del catálogo) */',
        'export function groupTagsByCategory(type: TagType, filters: { group?: string; category?: string; search?: string }): [string, Tag[]][] {',
        "    const { group = 'all', category = 'all', search = '' } = filters;",
        "    const byCategory = new Map<string, Tag[]>();",
        "    for (const tag of type === 'pro' ? PROS_TAGS : CONS_TAGS) {",
        "        if ((group !== 'all' && tag.group !== group) || (category !== 'all' && tag.category !== category) || !tagMatches(tag, search)) continue;",
        '        byCategory.set(tag.category, [...(byCategory.get(tag.category) ?? []), tag]);',
        '    }',
        '    return [...byCategory.entries()];',
        '}',
        '',
        'export const MAX_PROS = 5;',
        'export const MAX_CONS = 5;',
        '',
    ]
    path = os.path.join(ROOT, 'web', 'src', 'lib', 'pros-cons-tags.ts')
    open(path, 'w', encoding='utf-8', newline='\n').write('\n'.join(lines))


def write_php(tags):
    def ids(type_):
        return '\n'.join(f"        '{x['id']}'," for x in tags if x['type'] == type_)

    php = f"""<?php

// ARCHIVO GENERADO por web/scripts/tags/build_tags.py: no editar a mano.
// IDs válidos de pros y contras de las builds (los mismos que web/src/lib/pros-cons-tags.ts).

return [
    'max_per_side' => 5,
    'max_note_length' => 200,
    'pro' => [
{ids('pro')}
    ],
    'con' => [
{ids('con')}
    ],
];
"""
    open(os.path.join(ROOT, 'api', 'config', 'build_tags.php'), 'w', encoding='utf-8', newline='\n').write(php)


def write_migration_map(old, tags):
    new_ids = {(x['type'], x['id']) for x in tags}
    data = {'pro': {}, 'con': {}, 'con_to_counter_hero': spec.CON_TO_COUNTER_HERO}
    for (tag_id, type_), _ in sorted(old.items()):
        if (type_, tag_id) in new_ids:
            continue
        merges = spec.PRO_MERGES if type_ == 'pro' else spec.CON_MERGES
        if type_ == 'con' and tag_id in spec.CON_TO_COUNTER_HERO:
            continue
        data[type_][tag_id] = merges.get(tag_id)  # None = se descarta
    # IDs que ya no estaban en el catálogo viejo pero siguen en builds de producción
    for type_, merges in (('pro', spec.PRO_MERGES), ('con', spec.CON_MERGES)):
        for src, dst in merges.items():
            data[type_].setdefault(src, dst)
    path = os.path.join(ROOT, 'api', 'database', 'data', 'tag_migration_2026_10.json')
    with open(path, 'w', encoding='utf-8', newline='\n') as f:
        json.dump(data, f, ensure_ascii=False, indent=2, sort_keys=True)
        f.write('\n')
    return data


if __name__ == '__main__':
    sys.stdout.reconfigure(encoding='utf-8')
    old, tags = build()
    write_ts(tags)
    write_php(tags)
    mapping = write_migration_map(old, tags)
    pros = sum(1 for x in tags if x['type'] == 'pro')
    print(f'catálogo viejo: {len(old)} tags; nuevo: {len(tags)} ({pros} pros, {len(tags) - pros} contras)')
    print(f"conversiones: {sum(1 for v in mapping['pro'].values() if v)} pros + {sum(1 for v in mapping['con'].values() if v)} contras; "
          f"descartados: {sum(1 for v in mapping['pro'].values() if not v)} pros + {sum(1 for v in mapping['con'].values() if not v)} contras; "
          f"a counters: {len(mapping['con_to_counter_hero'])}")
