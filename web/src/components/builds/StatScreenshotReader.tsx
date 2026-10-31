'use client';

import { useId, useState } from 'react';
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
        const tokens = [...line.matchAll(/\d[\d.,]*/g)].filter((m) => !/[+(]\s*$/.test(line.slice(0, m.index)));
        if (tokens.length === 0) continue;
        let raw = tokens[tokens.length - 1][0];
        // "1,234" o "1.234" (separador de miles según el idioma) -> 1234
        if (/^\d{1,3}([.,]\d{3})+$/.test(raw)) raw = raw.replace(/[.,]/g, '');
        const value = Math.round(parseFloat(raw.replace(',', '.')));
        if (Number.isFinite(value)) numbers.push(value);
        if (numbers.length === STAT_FIELDS.length) break;
    }
    return Object.fromEntries(STAT_FIELDS.slice(0, numbers.length).map((field, i) => [field.key, String(numbers[i])]));
}

/** Escala de grises, texto oscuro sobre fondo claro y al menos 1400 px de ancho: Tesseract lee mejor */
async function preprocess(file: File): Promise<HTMLCanvasElement> {
    const bitmap = await createImageBitmap(file);
    const scale = Math.max(1, 1400 / bitmap.width);
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);

    const image = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const px = image.data;
    let total = 0;
    for (let i = 0; i < px.length; i += 4) total += 0.299 * px[i] + 0.587 * px[i + 1] + 0.114 * px[i + 2];
    const dark = total / (px.length / 4) < 128; // la pantalla del juego es oscura con letras claras
    for (let i = 0; i < px.length; i += 4) {
        const lum = 0.299 * px[i] + 0.587 * px[i + 1] + 0.114 * px[i + 2];
        const v = (dark ? 255 - lum : lum) > 150 ? 255 : 0;
        px[i] = px[i + 1] = px[i + 2] = v;
    }
    ctx.putImageData(image, 0, 0);
    return canvas;
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

    const readFile = async (file: File) => {
        setStatus('reading');
        setProgress(0);
        try {
            const [{ createWorker }, canvas] = await Promise.all([import('tesseract.js'), preprocess(file)]);
            const worker = await createWorker('eng', 1, {
                logger: (m: { status: string; progress: number }) => {
                    if (m.status === 'recognizing text') setProgress(Math.round(m.progress * 100));
                },
            });
            const { data } = await worker.recognize(canvas);
            await worker.terminate();
            const values = parseStatScreen(data.text);
            if (Object.keys(values).length === 0) throw new Error('no numbers');
            setRead(values);
            setStatus('review');
        } catch {
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
