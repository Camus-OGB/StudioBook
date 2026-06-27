// Point d'entrée des notifications : fonctions de haut niveau appelées par les
// routes API. Chacune orchestre les canaux (email aujourd'hui, WhatsApp demain)
// et NE LÈVE JAMAIS d'exception — un échec de notification ne doit jamais faire
// échouer la création d'un usager ou d'une réservation.
//
// Usage typique dans une route (envoi non bloquant pour la réponse) :
//   await notifyReservationRecue({ ... })   // déjà tolérant aux erreurs

import { sendEmail } from '@/lib/notifications/email'
import { sendWhatsApp } from '@/lib/notifications/whatsapp'
import {
  inscriptionEmail,
  reservationRecueEmail,
  statutChangeEmail,
  type ReservationResume,
} from '@/lib/notifications/templates'

// Normalise un numéro WhatsApp en format international sans séparateurs.
function normaliseWhatsApp(numero: string): string {
  return numero.replace(/[^\d]/g, '')
}

// ── 1. Inscription créée → email de bienvenue à l'usager ─────────────────────

export async function notifyInscription(params: {
  email: string
  prenom: string
  nom: string
  userId: string
}): Promise<{ emailSent: boolean }> {
  const { email, prenom, nom, userId } = params
  const mail = inscriptionEmail({ prenom, userId })
  const res = await sendEmail({
    to: email,
    toName: `${prenom} ${nom}`,
    subject: mail.subject,
    html: mail.html,
    text: mail.text,
  })
  if (!res.ok && !res.skipped) {
    console.error(`[notifications] Email de bienvenue non délivré à ${email}`)
  }
  return { emailSent: res.ok }
}

// ── 2. Réservation reçue → accusé de réception (email + WhatsApp) ─────────────

export async function notifyReservationRecue(params: {
  email: string
  prenom: string
  nom: string
  whatsapp: string
  reservation: ReservationResume
}): Promise<{ emailSent: boolean }> {
  const { email, prenom, nom, whatsapp, reservation } = params
  const mail = reservationRecueEmail({ prenom, reservation })

  const [emailRes] = await Promise.all([
    sendEmail({
      to: email,
      toName: `${prenom} ${nom}`,
      subject: mail.subject,
      html: mail.html,
      text: mail.text,
    }),
    sendWhatsApp({
      to: normaliseWhatsApp(whatsapp),
      text: `Bonjour ${prenom}, votre demande de réservation (réf. ${reservation.id}) a bien été reçue et est en attente de validation. — IMA Studio`,
    }),
  ])
  return { emailSent: emailRes.ok }
}

// ── 3. Changement de statut → notification à l'usager (email + WhatsApp) ──────

export async function notifyStatutChange(params: {
  email: string
  prenom: string
  nom: string
  whatsapp: string
  reservation: ReservationResume
}): Promise<{ emailSent: boolean }> {
  const { email, prenom, nom, whatsapp, reservation } = params
  const mail = statutChangeEmail({ prenom, reservation })

  const [emailRes] = await Promise.all([
    sendEmail({
      to: email,
      toName: `${prenom} ${nom}`,
      subject: mail.subject,
      html: mail.html,
      text: mail.text,
    }),
    sendWhatsApp({
      to: normaliseWhatsApp(whatsapp),
      text: `Bonjour ${prenom}, le statut de votre réservation (réf. ${reservation.id}) est désormais : ${reservation.statut}. — IMA Studio`,
    }),
  ])
  return { emailSent: emailRes.ok }
}
