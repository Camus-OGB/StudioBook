// Modèles de messages (français) pour les notifications email.
// Chaque fonction renvoie { subject, html, text } prêt à passer à sendEmail().
//
// Le rendu HTML utilise des styles inline et une structure en tableaux : c'est
// une exigence des clients mail (Gmail, Outlook…) qui ignorent les feuilles de
// style externes et le flexbox. Cette contrainte est propre aux emails et ne
// contredit pas la convention Tailwind de l'application.

const PRIMARY = '#4527A0' // violet IMA
const ACCENT = '#FFB300' // ambre IMA
const INK = '#1f2933'
const MUTED = '#6b7280'
const FAINT = '#9aa1ad'
const LIGHT = '#faf9fd'
const BORDER = '#ece9f5'
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://studio.semecity.com'
const FONT = "font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;"

export interface RenderedEmail {
  subject: string
  html: string
  text: string
}

// Données minimales d'une réservation pour le récapitulatif.
export interface ReservationResume {
  id: string
  typeRes: string
  materielsChoisis: string[]
  espacesChoisis: string[]
  dateDebut?: string | null
  dateFin?: string | null
  heureDebut?: string | null
  heureFin?: string | null
  objetProjet: string
  statut: string
  notes?: string | null
}

// ── Gabarit commun ─────────────────────────────────────────────────────────

function layout(opts: { titre: string; preheader: string; badge?: string; contenu: string }): string {
  const { titre, preheader, badge, contenu } = opts
  return `<!doctype html>
<html lang="fr">
  <head><meta charset="utf-8" /><meta name="viewport" content="width=device-width,initial-scale=1" /></head>
  <body style="margin:0;padding:0;background:#f1f0f6;${FONT}color:${INK};">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${preheader}</div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f1f0f6;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid ${BORDER};">
            <!-- En-tête -->
            <tr>
              <td style="background:${PRIMARY};padding:26px 32px;">
                <table role="presentation" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="vertical-align:middle;">
                      <span style="display:inline-block;width:40px;height:40px;border-radius:50%;background:#ffffff;color:${PRIMARY};font-size:16px;font-weight:bold;text-align:center;line-height:40px;">IS</span>
                    </td>
                    <td style="vertical-align:middle;padding-left:12px;">
                      <span style="color:#ffffff;font-size:19px;font-weight:bold;">IMA Studio</span>
                      <span style="color:rgba(255,255,255,.7);font-size:13px;display:block;margin-top:2px;">Sème City · Cotonou</span>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr><td style="height:4px;background:${ACCENT};line-height:4px;font-size:0;">&nbsp;</td></tr>
            <!-- Corps -->
            <tr>
              <td style="padding:32px;">
                ${badge ? `<div style="margin:0 0 14px;">${badge}</div>` : ''}
                <h1 style="margin:0 0 18px;font-size:23px;line-height:1.3;color:${INK};">${titre}</h1>
                ${contenu}
              </td>
            </tr>
            <!-- Pied de page -->
            <tr>
              <td style="padding:22px 32px;background:${LIGHT};border-top:1px solid ${BORDER};font-size:12px;line-height:1.6;color:${FAINT};">
                <strong style="color:${MUTED};">IMA Studio</strong> — Studio multimédia de Sème City, Cotonou, Bénin.<br />
                Cet email est automatique, merci de ne pas y répondre.
              </td>
            </tr>
          </table>
          <div style="max-width:600px;margin:16px auto 0;font-size:11px;color:${FAINT};text-align:center;">
            © IMA Studio · Sème City
          </div>
        </td>
      </tr>
    </table>
  </body>
</html>`
}

function paragraphe(html: string): string {
  return `<p style="margin:0 0 16px;font-size:15px;line-height:1.65;color:${INK};">${html}</p>`
}

function bouton(href: string, libelle: string): string {
  return `<table role="presentation" align="center" cellpadding="0" cellspacing="0" style="margin:28px auto 4px;">
    <tr><td style="border-radius:10px;background:${ACCENT};">
      <a href="${href}" style="display:inline-block;padding:14px 32px;color:#3a2700;font-weight:bold;text-decoration:none;font-size:15px;${FONT}">${libelle} →</a>
    </td></tr>
  </table>`
}

// Pastille de statut colorée.
function statutPill(statut: string): string {
  const map: Record<string, [string, string]> = {
    Confirmée: ['#e8f7ef', '#157347'],
    Refusée: ['#fbe4e4', '#c0392b'],
    'En attente': ['#fff4d6', '#9a6b00'],
  }
  const [bg, color] = map[statut] ?? ['#eef0f4', MUTED]
  return `<span style="display:inline-block;padding:6px 14px;border-radius:9999px;background:${bg};color:${color};font-size:12px;font-weight:bold;letter-spacing:.4px;text-transform:uppercase;">${statut}</span>`
}

// Récapitulatif lisible d'une réservation, dans une carte (HTML + texte).
function resumeReservation(r: ReservationResume): { html: string; text: string } {
  const lignes: Array<[string, string]> = []
  lignes.push(['Référence', `RES-${r.id.slice(-8).toUpperCase()}`])
  lignes.push(['Type', r.typeRes === 'Les deux' ? 'Matériel et espace' : r.typeRes])
  if (r.materielsChoisis.length > 0) lignes.push(['Matériel', r.materielsChoisis.join(', ')])
  if (r.espacesChoisis.length > 0) lignes.push(['Espace', r.espacesChoisis.join(', ')])
  if (r.dateDebut) {
    const periode =
      r.dateFin && r.dateFin !== r.dateDebut ? `du ${r.dateDebut} au ${r.dateFin}` : r.dateDebut
    lignes.push(['Date', periode])
  }
  if (r.heureDebut && r.heureFin) lignes.push(['Horaire', `${r.heureDebut} – ${r.heureFin}`])
  lignes.push(['Objet', r.objetProjet])

  const rows = lignes
    .map(([k, v], i) => {
      const bb = i < lignes.length - 1 ? `border-bottom:1px solid ${BORDER};` : ''
      return `<tr>
        <td style="padding:11px 0;${bb}color:${FAINT};font-size:11px;text-transform:uppercase;letter-spacing:.4px;width:130px;vertical-align:top;">${k}</td>
        <td style="padding:11px 0;${bb}color:${INK};font-size:14px;font-weight:600;">${v}</td>
      </tr>`
    })
    .join('')

  const html = `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:8px 0;">
    <tr><td style="background:${LIGHT};border:1px solid ${BORDER};border-radius:12px;padding:4px 18px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">${rows}</table>
    </td></tr>
  </table>`

  const text = lignes.map(([k, v]) => `${k} : ${v}`).join('\n')
  return { html, text }
}

// Encadré « message de l'équipe » (notes du refus/validation).
function encadreNotes(notes: string): string {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:18px 0 0;">
    <tr><td style="background:#fff8e6;border-left:4px solid ${ACCENT};border-radius:8px;padding:14px 16px;font-size:14px;line-height:1.6;color:${INK};">
      <strong style="display:block;margin-bottom:4px;color:#9a6b00;">Message de l’équipe</strong>${notes}
    </td></tr>
  </table>`
}

// ── 1. Inscription créée ─────────────────────────────────────────────────────

export function inscriptionEmail(params: { prenom: string; userId: string }): RenderedEmail {
  const { prenom, userId } = params
  const subject = `Bienvenue à l'IMA Studio — votre identifiant ${userId}`

  const html = layout({
    titre: 'Bienvenue à l’IMA Studio 🎬',
    preheader: `Votre identifiant usager : ${userId}`,
    contenu: `
      ${paragraphe(`Bonjour <strong>${prenom}</strong>,`)}
      ${paragraphe(
        'Votre inscription a bien été enregistrée. Voici votre identifiant usager, à conserver précieusement : il vous sera demandé pour chacune de vos réservations.',
      )}
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:8px 0;">
        <tr><td align="center" style="background:#f0ecfb;border:2px dashed ${PRIMARY};border-radius:12px;padding:20px;">
          <div style="font-size:11px;text-transform:uppercase;letter-spacing:1px;color:${PRIMARY};font-weight:bold;">Votre identifiant</div>
          <div style="margin-top:6px;font-size:26px;font-weight:bold;letter-spacing:1px;color:${PRIMARY};">${userId}</div>
        </td></tr>
      </table>
      ${bouton(`${APP_URL}/reservation`, 'Faire une réservation')}
      ${paragraphe(`<span style="color:${MUTED};">À très bientôt au studio !</span>`)}
    `,
  })

  const text = `Bonjour ${prenom},

Votre inscription à l'IMA Studio a bien été enregistrée.
Votre identifiant usager : ${userId}
Conservez-le : il vous sera demandé pour chacune de vos réservations.

Faire une réservation : ${APP_URL}/reservation

À très bientôt au studio !
— IMA Studio, Sème City`

  return { subject, html, text }
}

// ── 2. Réservation reçue (en attente de validation) ──────────────────────────

export function reservationRecueEmail(params: {
  prenom: string
  reservation: ReservationResume
}): RenderedEmail {
  const { prenom, reservation } = params
  const subject = 'Votre demande de réservation a bien été reçue'
  const resume = resumeReservation(reservation)

  const html = layout({
    titre: 'Demande de réservation reçue',
    preheader: 'Votre demande est en attente de validation par l’équipe du studio.',
    badge: statutPill('En attente'),
    contenu: `
      ${paragraphe(`Bonjour <strong>${prenom}</strong>,`)}
      ${paragraphe(
        'Nous avons bien reçu votre demande. Elle est <strong>en attente de validation</strong> par l’équipe du studio — vous recevrez un nouveau message dès qu’elle sera traitée.',
      )}
      ${resume.html}
      ${paragraphe(`<span style="color:${MUTED};">Merci de votre confiance.</span>`)}
    `,
  })

  const text = `Bonjour ${prenom},

Nous avons bien reçu votre demande de réservation.
Statut : en attente de validation par l'équipe du studio.
Vous recevrez un message dès qu'elle sera traitée.

${resume.text}

Merci de votre confiance.
— IMA Studio, Sème City`

  return { subject, html, text }
}

// ── 3. Changement de statut (confirmée / refusée / autre) ─────────────────────

export function statutChangeEmail(params: {
  prenom: string
  reservation: ReservationResume
}): RenderedEmail {
  const { prenom, reservation } = params
  const resume = resumeReservation(reservation)

  let subject: string
  let titre: string
  let intro: string

  switch (reservation.statut) {
    case 'Confirmée':
      subject = 'Votre réservation est confirmée ✅'
      titre = 'Réservation confirmée'
      intro =
        'Bonne nouvelle ! Votre réservation a été <strong>confirmée</strong> par l’équipe du studio. Nous vous attendons au créneau prévu.'
      break
    case 'Refusée':
      subject = 'Votre demande de réservation n’a pas pu être validée'
      titre = 'Réservation non validée'
      intro =
        'Nous sommes au regret de vous informer que votre demande n’a pas pu être <strong>validée</strong>. N’hésitez pas à proposer un autre créneau.'
      break
    default:
      subject = `Mise à jour de votre réservation — ${reservation.statut}`
      titre = 'Mise à jour de votre réservation'
      intro = `Le statut de votre réservation est désormais : <strong>${reservation.statut}</strong>.`
  }

  const html = layout({
    titre,
    preheader: subject,
    badge: statutPill(reservation.statut),
    contenu: `
      ${paragraphe(`Bonjour <strong>${prenom}</strong>,`)}
      ${paragraphe(intro)}
      ${resume.html}
      ${reservation.notes ? encadreNotes(reservation.notes) : ''}
    `,
  })

  const notesText = reservation.notes ? `\nMessage de l'équipe : ${reservation.notes}\n` : ''
  const introText = intro.replace(/<\/?strong>/g, '')
  const text = `Bonjour ${prenom},

${introText}

${resume.text}
${notesText}
— IMA Studio, Sème City`

  return { subject, html, text }
}
