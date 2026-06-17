import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { studentName, requestType, message } = await request.json()

    if (!studentName || !requestType) {
      return NextResponse.json({ error: 'Champs manquants' }, { status: 400 })
    }

    // 1. Préparer l'email pour Cécile
    const subject = `Nouvelle demande de ${studentName} - ${requestType}`
    const htmlContent = `
    <div style="font-family: sans-serif; color: #333;">
    <h2 style="color: #15803d;">Nouvelle demande d'élève</h2>
    <p><strong>Élève :</strong> ${studentName}</p>
    <p><strong>Type de demande :</strong> ${requestType}</p>
    <p><strong>Message :</strong> ${message || 'Aucun message'}</p>
    <hr>
    <p><em>Ce message a été envoyé depuis l'espace élève de Rêve de Porcelaine.</em></p>
    </div>
    `

    // 2. Envoyer via l'API Brevo
    const brevoResponse = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': process.env.BREVO_API_KEY!,
      },
      body: JSON.stringify({
        sender: { name: "Atelier Rêve de Porcelaine", email: "contact@reve-de-porcelaine" }, // L'adresse validée dans Brevo
        to: [{ email: "contact@reve-de-porcelaine", name: "Atelier reve de porcelaine" }], // Cécile reçoit le mail
        subject: subject,
        htmlContent: htmlContent,
      }),
    })

    if (!brevoResponse.ok) {
      const errData = await brevoResponse.json()
      console.error("Erreur Brevo:", errData)
      return NextResponse.json({ error: `Erreur Brevo: ${errData.message}` }, { status: 500 })
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
