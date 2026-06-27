// Envoi de notifications WhatsApp — STUB.
//
// L'intégration WhatsApp (Meta Cloud API ou Twilio) sera branchée ici plus tard.
// L'interface est figée dès maintenant pour que le reste du code (index.ts et les
// routes) n'ait PAS à changer le jour où l'on activera WhatsApp : il suffira
// d'implémenter le corps de sendWhatsApp() et d'ajouter les variables d'env.
//
// Tant que ce n'est pas configuré, la fonction renvoie { ok: false, skipped: true }
// et ne lève jamais d'exception.

export interface WhatsAppMessage {
  // Numéro au format international, ex. « 22990000000 » (sans + ni espaces).
  to: string
  // Texte du message (les modèles WhatsApp approuvés viendront plus tard).
  text: string
}

export interface WhatsAppResult {
  ok: boolean
  skipped?: boolean
  error?: string
}

export async function sendWhatsApp(
  message: WhatsAppMessage,
): Promise<WhatsAppResult> {
  // Garde-fou : tant qu'aucun fournisseur n'est configuré, on saute l'envoi.
  const configured = Boolean(process.env.WHATSAPP_PROVIDER)
  if (!configured) {
    return { ok: false, skipped: true }
  }

  // TODO: brancher le fournisseur choisi (Meta Cloud API / Twilio) ici.
  //       message.to + message.text sont prêts à être utilisés.
  console.warn(
    `[notifications] WHATSAPP_PROVIDER défini mais sendWhatsApp() non encore implémenté (destinataire : ${message.to}).`,
  )
  return { ok: false, skipped: true }
}
