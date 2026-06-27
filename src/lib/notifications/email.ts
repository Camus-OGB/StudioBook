// Envoi d'emails transactionnels via l'API Brevo (ex-Sendinblue).
// Documentation : https://developers.brevo.com/reference/sendtransacemail
//
// Variables d'environnement requises :
//   BREVO_API_KEY      → clé API transactionnelle Brevo
//   NOTIF_SENDER_EMAIL → expéditeur (doit être un expéditeur validé dans Brevo)
//   NOTIF_SENDER_NAME  → nom affiché de l'expéditeur (défaut : « IMA Studio »)
//
// Conçu pour ne JAMAIS lever d'exception : en cas d'erreur ou de configuration
// manquante, on logge et on renvoie { ok: false }. L'appelant décide quoi faire.

const BREVO_ENDPOINT = 'https://api.brevo.com/v3/smtp/email'

export interface EmailMessage {
  to: string
  toName?: string
  subject: string
  html: string
  text: string
}

export interface EmailResult {
  ok: boolean
  skipped?: boolean
  error?: string
}

export async function sendEmail(message: EmailMessage): Promise<EmailResult> {
  const apiKey = process.env.BREVO_API_KEY
  const senderEmail = process.env.NOTIF_SENDER_EMAIL
  const senderName = process.env.NOTIF_SENDER_NAME ?? 'IMA Studio'

  // Pas de configuration → on saute l'envoi sans casser le flux (utile en dev).
  if (!apiKey || !senderEmail) {
    console.warn(
      '[notifications] Email non envoyé : BREVO_API_KEY ou NOTIF_SENDER_EMAIL manquant.',
    )
    return { ok: false, skipped: true }
  }

  try {
    const response = await fetch(BREVO_ENDPOINT, {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
        'api-key': apiKey,
      },
      body: JSON.stringify({
        sender: { name: senderName, email: senderEmail },
        to: [{ email: message.to, name: message.toName ?? message.to }],
        subject: message.subject,
        htmlContent: message.html,
        textContent: message.text,
      }),
    })

    if (!response.ok) {
      const detail = await response.text().catch(() => '')
      console.error(
        `[notifications] Échec envoi email Brevo (${response.status}) : ${detail}`,
      )
      return { ok: false, error: `Brevo ${response.status}` }
    }

    const body = await response.text().catch(() => '')
    console.log(`[notifications] Email Brevo accepté (${response.status}) → ${message.to} · ${body}`)
    return { ok: true }
  } catch (error) {
    console.error('[notifications] Erreur réseau envoi email Brevo', error)
    return { ok: false, error: 'network' }
  }
}
