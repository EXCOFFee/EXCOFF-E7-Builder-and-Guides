import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Formato fijo: sin locale explícito, Node (servidor) y el navegador pueden escribir "6.818"
// y "6,818" y React descarta el HTML del servidor (error de hidratación #418).
const numberFormat = new Intl.NumberFormat("en-US")

/** Números de stats con separador de miles como en el juego (6,818). */
export function formatNumber(value: number | null | undefined): string {
  return numberFormat.format(value ?? 0)
}

/** Fecha en el idioma del usuario, en UTC para que servidor y navegador den el mismo día. */
export function formatDate(date: string | number | Date, locale: string = "en"): string {
  return new Date(date).toLocaleDateString(locale, { timeZone: "UTC" })
}
