import { prisma } from '@/lib/prisma'

/**
 * Génère un identifiant usager au format IMA-ANNÉE-XXXX (ex : IMA-2025-0001).
 * Incrémente le compteur unique (id = 1) dans une transaction Prisma pour
 * garantir l'unicité même en cas d'inscriptions concurrentes.
 */
export async function genUserId(): Promise<string> {
  const annee = new Date().getFullYear()

  const compteur = await prisma.$transaction(async (tx) => {
    const counter = await tx.idCounter.upsert({
      where: { id: 1 },
      update: { value: { increment: 1 } },
      create: { id: 1, value: 1 },
    })
    return counter.value
  })

  return `IMA-${annee}-${compteur.toString().padStart(4, '0')}`
}

type CsvColumn<T> = { key: keyof T; label: string }

/**
 * Sérialise des lignes en CSV (séparateur virgule) précédé d'un BOM
 * pour qu'Excel ouvre correctement les caractères accentués.
 */
export function mkCSV<T extends Record<string, unknown>>(
  rows: T[],
  columns: CsvColumn<T>[],
): string {
  const escape = (value: unknown): string => {
    if (value === null || value === undefined) return ''
    const str = Array.isArray(value) ? value.join('; ') : String(value)
    if (/[",\n\r]/.test(str)) return `"${str.replace(/"/g, '""')}"`
    return str
  }

  const header = columns.map((c) => escape(c.label)).join(',')
  const body = rows
    .map((row) => columns.map((c) => escape(row[c.key])).join(','))
    .join('\n')

  return `﻿${header}\n${body}`
}

/** Formate une date au format français jj/mm/aaaa. */
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(d)
}

/** Concatène des classes Tailwind en ignorant les valeurs falsy. */
export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(' ')
}
