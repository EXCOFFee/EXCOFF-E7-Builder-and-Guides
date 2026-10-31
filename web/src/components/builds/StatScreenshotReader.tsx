'use client';

import { useEffect, useId, useRef, useState } from 'react';
import type { Worker } from 'tesseract.js';
import { useTranslations } from '@/hooks/useTranslations';
import { STAT_FIELDS, type StatKey } from './buildFormModel';

/**
 * Rangos razonables de cada stat de una build terminada: un número afuera probablemente se
 * leyó mal (se marca para revisar, igual se puede usar).
 */
const PLAUSIBLE: Record<StatKey, [number, number]> = {
    atk: [300, 9000],
    def: [200, 6000],
    hp: [2000, 70000],
    spd: [70, 400],
    crit_chance: [0, 100],
    crit_dmg: [100, 400],
    eff: [0, 450],
    res: [0, 450],
};

type Status = 'idle' | 'reading' | 'review' | 'error';

const isPlausible = (key: StatKey, value: number) => value >= PLAUSIBLE[key][0] && value <= PLAUSIBLE[key][1];

/** Stats que el juego muestra en % y siempre con un decimal ("95.0%") */
const PERCENT_STATS = new Set<StatKey>(['crit_chance', 'crit_dmg', 'eff', 'res']);

/** "3,868." -> 3868, "155.0%" -> 155, "1.234" (miles en otros idiomas) -> 1234 */
function parseNumber(token: string): number {
    // Lo que sigue a un "%" es ruido pegado ("95.0%8f")
    let raw = token.split('%')[0].replace(/[^\d.,]/g, '').replace(/[.,]+$/, '');
    if (/^\d{1,3}([.,]\d{3})+$/.test(raw)) raw = raw.replace(/[.,]/g, '');
    return Math.round(parseFloat(raw.replace(',', '.')));
}

/**
 * El valor de una celda releída sola. Si la pantalla muestra los % con un decimal ("95.0%",
 * `decimals`) y el OCR perdió el punto ("950%"), se saca el decimal; si leyó el punto como un 1
 * ("28110%" por "281.0%"), se achica hasta entrar en el rango posible del stat.
 */
export function cellValue(text: string, key: StatKey, decimals: boolean): number {
    let raw = text.split('%')[0].replace(/[^\d.,]/g, '');
    if (!PERCENT_STATS.has(key)) return parseNumber(raw);
    if (decimals && !/[.,]/.test(raw) && raw.length >= 2) raw = raw.slice(0, -1);
    let value = parseNumber(raw);
    while (value > PLAUSIBLE[key][1] && value >= 10) value = Math.floor(value / 10);
    return value;
}

/**
 * Entre varias lecturas de la misma celda: la que más se repite; si no hay acuerdo, la primera
 * dentro del rango posible del stat, y si no, la primera que haya.
 */
export function pickReading(readings: number[], key: StatKey): number {
    const valid = readings.filter(Number.isFinite);
    const counts = new Map<number, number>();
    for (const value of valid) counts.set(value, (counts.get(value) ?? 0) + 1);
    const [top] = [...counts.entries()].sort((a, b) => b[1] - a[1]);
    if (top && top[1] > 1) return top[0];
    return valid.find((value) => isPlausible(key, value)) ?? valid[0] ?? NaN;
}

/** Los números, en el orden del juego; uno que no se pudo leer (NaN) queda vacío para completar a mano */
const toStats = (numbers: number[]): Partial<Record<StatKey, string>> =>
    Object.fromEntries(STAT_FIELDS.slice(0, numbers.length).flatMap((field, i) =>
        Number.isFinite(numbers[i]) ? [[field.key, String(numbers[i])]] : []));

/**
 * Números de la pantalla de stats, en orden de lectura, asignados en el orden del juego: ATK,
 * DEF, HP, SPD, crítico, daño crítico, efectividad, resistencia. Así no depende del idioma.
 * De cada línea se toma el ÚLTIMO número: el valor está a la derecha, y el OCR en inglés a veces
 * lee letras coreanas/japonesas/chinas del nombre del stat como dígitos sueltos. Se saltean los
 * que vienen después de "+" o "(" (bonificaciones del equipo).
 */
export function parseStatScreen(text: string): Partial<Record<StatKey, string>> {
    const numbers: number[] = [];
    for (const line of text.split('\n')) {
        // "Lv. 60" u otros números arriba de los stats correrían todo un lugar
        if (/\blv\.?\s*\d/i.test(line)) continue;
        const tokens = [...line.matchAll(/\d[\d.,]*/g)].filter((m) => !/[+(]\s*$/.test(line.slice(0, m.index)));
        if (tokens.length === 0) continue;
        const value = parseNumber(tokens[tokens.length - 1][0]);
        if (Number.isFinite(value)) numbers.push(value);
        if (numbers.length === STAT_FIELDS.length) break;
    }
    return toStats(numbers);
}

interface Box {
    x0: number;
    x1: number;
    y0: number;
    y1: number;
}

export interface OcrLine {
    text: string;
    words: { text: string; bbox: Box; symbols?: { text: string; bbox: Box }[] }[];
}

/** Una fila de stat: lo que leyó la primera pasada (NaN si nada) y la celda del valor */
export interface StatRow {
    value: number;
    box: Box;
}

const median = (values: number[]) => [...values].sort((a, b) => a - b)[Math.floor(values.length / 2)];

/**
 * Lectura por posición, para capturas enteras del juego: los valores de los stats están
 * alineados a la derecha en una misma columna. Se busca la columna donde terminan más números
 * en líneas seguidas (se toleran hasta 2 líneas seguidas sin número ahí: el dibujo del héroe o
 * el bonus del equipo a veces lo tapan) y se toman las 8 primeras filas. Así quedan afuera el
 * poder (más a la izquierda), el nivel, la barra de arriba, el equipo y "ataque doble" (9.ª).
 * Cada fila trae la celda donde está el valor, para releerla sola. Null si no hay 8 filas.
 */
export function findStatRows(lines: OcrLine[]): StatRow[] | null {
    const candidates = lines.map((line) => {
        if (/\blv\.?\s*\d/i.test(line.text)) return [];
        return line.words.flatMap((word, i) => {
            if (!/\d/.test(word.text) || /^[+(]/.test(word.text) || /[+(]$/.test(line.words[i - 1]?.text ?? '')) return [];
            const value = parseNumber(word.text);
            if (!Number.isFinite(value)) return [];
            // El borde derecho del último dígito o "%": la basura pegada ("95.0%8f") no lo corre
            const digits = (word.symbols ?? []).filter((sym) => /[\d%]/.test(sym.text));
            const right = digits[digits.length - 1]?.bbox.x1 ?? word.bbox.x1;
            const charWidth = (right - word.bbox.x0) / Math.max(1, digits.length || word.text.length);
            return [{ value, right, height: word.bbox.y1 - word.bbox.y0, charWidth }];
        });
    });

    type Hit = (typeof candidates)[number][number];
    let best: { start: number; hits: (Hit | null)[]; right: number } | null = null;
    for (const column of candidates.flat()) {
        const tolerance = Math.max(column.height, 8);
        for (let start = 0; start < lines.length; start++) {
            const first = candidates[start].find((c) => Math.abs(c.right - column.right) <= tolerance);
            if (!first) continue;
            const hits: (Hit | null)[] = [];
            let misses = 0;
            for (let i = start; i < lines.length && misses <= 2; i++) {
                const hit = candidates[i].find((c) => Math.abs(c.right - column.right) <= tolerance) ?? null;
                hits.push(hit);
                misses = hit ? 0 : misses + 1;
            }
            while (hits.length && !hits[hits.length - 1]) hits.pop();
            const count = hits.slice(0, STAT_FIELDS.length).filter(Boolean).length;
            if (hits.length >= STAT_FIELDS.length && count > (best?.hits.slice(0, STAT_FIELDS.length).filter(Boolean).length ?? 0)) {
                best = { start, hits, right: column.right };
            }
        }
    }
    if (!best) return null;

    const found = best.hits.slice(0, STAT_FIELDS.length);
    const real = found.filter((h): h is Hit => h !== null);
    // Mitad de las filas como mínimo: con menos, la "columna" puede ser casualidad
    if (real.length < STAT_FIELDS.length / 2) return null;
    const height = median(real.map((h) => h.height));
    const charWidth = median(real.map((h) => h.charWidth));
    const right = median(real.map((h) => h.right));
    const pad = Math.round(height * 0.3);

    return found.map((hit, i) => {
        const line = lines[best.start + i];
        // La altura de la fila sale de las palabras de tamaño normal (el nombre del stat): una
        // burbuja o un brillo pegado al número agranda su caja y metería la fila de al lado
        const normal = line.words.filter((w) => Math.abs(w.bbox.y1 - w.bbox.y0 - height) <= height * 0.35);
        const y0 = normal.length ? median(normal.map((w) => w.bbox.y0)) : median(line.words.map((w) => w.bbox.y0));
        return {
            value: hit?.value ?? NaN,
            // Hasta 6,5 caracteres ("155.0%") a la izquierda del borde de la columna
            box: { x0: Math.max(0, Math.round(right - charWidth * 6.5 - pad)), x1: Math.round(right + pad), y0: Math.max(0, y0 - pad), y1: y0 + height + pad },
        };
    });
}

/**
 * Texto oscuro sobre fondo claro y al menos 1400 px de ancho: Tesseract lee mejor. En capturas
 * enteras (apaisadas) solo se usa la mitad izquierda, donde el juego pone los stats; los colores
 * fuertes (bonus naranja del equipo, íconos rojos) se borran: los valores son blancos o grises.
 * Devuelve dos versiones: en blanco y negro (para encontrar las filas) y en grises (para releer
 * cada valor: los bordes suaves conservan la diferencia entre 9 y 4, o 0 y 6).
 */
async function preprocess(file: File): Promise<{ binary: HTMLCanvasElement; gray: HTMLCanvasElement }> {
    const bitmap = await createImageBitmap(file);
    const sourceWidth = bitmap.width / bitmap.height > 1.4 ? Math.round(bitmap.width * 0.45) : bitmap.width;
    const scale = Math.max(1, 1400 / sourceWidth);
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(sourceWidth * scale);
    canvas.height = Math.round(bitmap.height * scale);
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(bitmap, 0, 0, sourceWidth, bitmap.height, 0, 0, canvas.width, canvas.height);

    const image = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const px = image.data;
    let total = 0;
    for (let i = 0; i < px.length; i += 4) total += 0.299 * px[i] + 0.587 * px[i + 1] + 0.114 * px[i + 2];
    const dark = total / (px.length / 4) < 128; // la pantalla del juego es oscura con letras claras
    const grayImage = ctx.createImageData(canvas.width, canvas.height);
    const gx = grayImage.data;
    for (let i = 0; i < px.length; i += 4) {
        const saturation = Math.max(px[i], px[i + 1], px[i + 2]) - Math.min(px[i], px[i + 1], px[i + 2]);
        const lum = saturation > 70 ? (dark ? 0 : 255) : 0.299 * px[i] + 0.587 * px[i + 1] + 0.114 * px[i + 2];
        const ink = dark ? 255 - lum : lum;
        gx[i] = gx[i + 1] = gx[i + 2] = ink;
        gx[i + 3] = 255;
        px[i] = px[i + 1] = px[i + 2] = ink > 150 ? 255 : 0;
    }
    ctx.putImageData(image, 0, 0);
    const gray = document.createElement('canvas');
    gray.width = canvas.width;
    gray.height = canvas.height;
    gray.getContext('2d')!.putImageData(grayImage, 0, 0);
    return { binary: canvas, gray };
}

/**
 * La celda de un valor en su propio canvas, al doble de tamaño y binarizada con su propio
 * contraste: con el umbral de toda la captura, un valor sobre un fondo claro (el escudo de un
 * héroe) se perdía. `threshold` es qué parte de lo más oscuro cuenta como número.
 */
function cropCell(source: HTMLCanvasElement, box: Box, threshold: number): HTMLCanvasElement {
    const width = Math.max(1, Math.min(source.width, box.x1) - box.x0);
    const height = Math.max(1, Math.min(source.height, box.y1) - box.y0);
    // Con un margen blanco alrededor: Tesseract lee mal lo que toca el borde de la imagen
    const margin = 16;
    const cell = document.createElement('canvas');
    cell.width = width * 2 + 2 * margin;
    cell.height = height * 2 + 2 * margin;
    const ctx = cell.getContext('2d')!;
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, cell.width, cell.height);
    ctx.drawImage(source, box.x0, box.y0, width, height, margin, margin, width * 2, height * 2);
    const image = ctx.getImageData(0, 0, cell.width, cell.height);
    const px = image.data;
    let min = 255;
    let max = 0;
    for (let i = 0; i < px.length; i += 4) {
        min = Math.min(min, px[i]);
        max = Math.max(max, px[i]);
    }
    const range = Math.max(1, max - min);
    // Lo más oscuro es el número; un fondo partido (claro y gris) queda todo de fondo
    for (let i = 0; i < px.length; i += 4) px[i] = px[i + 1] = px[i + 2] = (px[i] - min) / range < threshold ? 0 : 255;
    ctx.putImageData(image, 0, 0);
    return cell;
}

interface StatScreenshotReaderProps {
    onApply: (stats: Partial<Record<StatKey, string>>) => void;
}

/**
 * Lee los stats desde una captura de la pantalla de stats del héroe, en el navegador
 * (Tesseract.js se descarga solo al usarlo; la imagen no se sube). Siempre se revisa y
 * corrige antes de pasar los valores al formulario.
 */
export function StatScreenshotReader({ onApply }: StatScreenshotReaderProps) {
    const { t } = useTranslations();
    const inputId = useId();
    const [status, setStatus] = useState<Status>('idle');
    const [progress, setProgress] = useState(0);
    const [read, setRead] = useState<Partial<Record<StatKey, string>>>({});
    // Un solo worker para todas las capturas (crearlo carga el motor y el idioma: segundos)
    const workerRef = useRef<Worker | null>(null);
    // El % de avance es el de la lectura de toda la captura; las celdas releídas son instantáneas
    const trackProgressRef = useRef(true);

    useEffect(() => () => {
        workerRef.current?.terminate();
        workerRef.current = null;
    }, []);

    const readFile = async (file: File) => {
        setStatus('reading');
        setProgress(0);
        trackProgressRef.current = true;
        try {
            const [{ createWorker }, { binary, gray }] = await Promise.all([import('tesseract.js'), preprocess(file)]);
            workerRef.current ??= await createWorker('eng', 1, {
                logger: (m: { status: string; progress: number }) => {
                    if (trackProgressRef.current && m.status === 'recognizing text') setProgress(Math.round(m.progress * 100));
                },
            });
            const worker = workerRef.current;
            const { data } = await worker.recognize(binary, {}, { text: true, blocks: true });
            const lines = (data.blocks ?? []).flatMap((b) => b.paragraphs.flatMap((p) => p.lines));
            const rows = findStatRows(lines);
            let values = parseStatScreen(data.text);
            if (rows) {
                // Segunda pasada: cada valor solo, con solo dígitos permitidos (el dibujo del
                // héroe al lado mete letras y puntos que cambian el número)
                trackProgressRef.current = false;
                const numbers = rows.map((row) => row.value);
                const decimals = /\d[.,]\d\s*%/.test(data.text);
                await worker.setParameters({ tessedit_char_whitelist: '0123456789.,%' });
                try {
                    for (const [i, { box }] of rows.entries()) {
                        const key = STAT_FIELDS[i].key;
                        // Tres lecturas (grises con dos umbrales y blanco y negro) y gana la mayoría:
                        // cada una falla en casos distintos (un 8 que pierde trazo, un 9 sobre el escudo)
                        const readings: number[] = [];
                        for (const [source, threshold] of [[gray, 0.4], [gray, 0.25], [binary, 0.5]] as const) {
                            readings.push(cellValue((await worker.recognize(cropCell(source, box, threshold))).data.text, key, decimals));
                        }
                        const best = pickReading(readings, key);
                        if (Number.isFinite(best)) numbers[i] = best;
                    }
                } finally {
                    await worker.setParameters({ tessedit_char_whitelist: '' });
                }
                values = toStats(numbers);
            }
            if (Object.keys(values).length === 0) throw new Error('no numbers');
            setRead(values);
            setStatus('review');
        } catch {
            // Un worker que falló no se reutiliza: se cierra para no dejar la memoria ocupada
            await workerRef.current?.terminate().catch(() => undefined);
            workerRef.current = null;
            setStatus('error');
        }
    };

    const doubtful = (key: StatKey) => {
        const value = Number(read[key]);
        if (!read[key] || !Number.isFinite(value)) return false;
        const [min, max] = PLAUSIBLE[key];
        return value < min || value > max;
    };

    return (
        <div className="mb-4 rounded-lg border border-dashed border-e7-gold/30 p-3">
            {status !== 'review' && (
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-xs text-gray-400">
                        {t('builds.ocrHint', 'Upload a screenshot of the hero’s stat screen and we’ll fill the numbers in. It’s read in your browser; the image isn’t uploaded.')}
                    </p>
                    <label
                        htmlFor={inputId}
                        className={`shrink-0 rounded-lg border border-e7-gold/40 px-3 py-1.5 text-sm text-e7-gold ${status === 'reading' ? 'opacity-50' : 'cursor-pointer hover:bg-e7-gold/10'}`}
                    >
                        {t('builds.ocrButton', 'Read stats from a screenshot')}
                    </label>
                    <input
                        id={inputId}
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        className="sr-only"
                        disabled={status === 'reading'}
                        onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) readFile(file);
                            e.target.value = '';
                        }}
                    />
                </div>
            )}

            {status === 'reading' && (
                <p role="status" className="mt-2 text-sm text-slate-300">
                    {t('builds.ocrReading', 'Reading the screenshot… {progress}%').replace('{progress}', String(progress))}
                </p>
            )}
            {status === 'error' && (
                <p role="alert" className="mt-2 text-sm text-red-400">
                    {t('builds.ocrError', 'No stats could be read. Try a sharper screenshot of the stat screen, or type them in.')}
                </p>
            )}

            {status === 'review' && (
                <div>
                    <p className="mb-2 text-sm text-slate-300">{t('builds.ocrReview', 'Check the values before using them:')}</p>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                        {STAT_FIELDS.map(({ key, label }) => (
                            <label key={key} className="text-xs text-gray-400">
                                {label}
                                <input
                                    type="number"
                                    inputMode="numeric"
                                    value={read[key] ?? ''}
                                    onChange={(e) => setRead({ ...read, [key]: e.target.value })}
                                    // Están dentro del formulario de la build: Enter lo enviaría
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') e.preventDefault();
                                    }}
                                    aria-invalid={doubtful(key)}
                                    className={`mt-1 w-full rounded-md border bg-e7-void px-2 py-1 text-sm text-white ${doubtful(key) ? 'border-amber-400' : 'border-e7-gold/30'}`}
                                />
                                {doubtful(key) && <span className="mt-0.5 block text-[11px] text-amber-300">{t('builds.ocrDoubtful', 'Check this one')}</span>}
                            </label>
                        ))}
                    </div>
                    <div className="mt-3 flex gap-2">
                        <button
                            type="button"
                            onClick={() => {
                                onApply(Object.fromEntries(Object.entries(read).filter(([, v]) => v !== '')));
                                setStatus('idle');
                            }}
                            className="rounded-lg bg-e7-gold px-3 py-1.5 text-sm font-semibold text-black hover:bg-yellow-400"
                        >
                            {t('builds.ocrApply', 'Use these values')}
                        </button>
                        <button type="button" onClick={() => setStatus('idle')} className="rounded-lg px-3 py-1.5 text-sm text-gray-300 hover:text-white">
                            {t('common.cancel', 'Cancel')}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
