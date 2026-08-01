import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { sessionId } = await request.json()

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID manquant' }, { status: 400 })
    }

    const supabase = await createClient()

    // 1. Récupérer les infos de la session et les élèves inscrits
    const { data: sessionData, error: sessionError } = await supabase
    .from('sessions')
    .select(`id, session_date, creneaux ( jour, heure_debut, heure_fin ), bookings ( profiles ( email, first_name ) )`)
    .eq('id', sessionId)
    .single()

    if (sessionError || !sessionData) {
      return NextResponse.json({ error: 'Session non trouvée' }, { status: 404 })
    }

    const rawStudents = sessionData.bookings.map((b: any) => {
      const profile = Array.isArray(b.profiles) ? b.profiles[0] : b.profiles;
      return profile;
    }).filter((p: any) => p && p.email)

    // On enlève les doublons (si un élève a deux lignes de booking pour la même séance)
    const uniqueStudentsMap = new Map();
    rawStudents.forEach(s => {
      if (!uniqueStudentsMap.has(s.email)) {
        uniqueStudentsMap.set(s.email, s);
      }
    });
    const students = Array.from(uniqueStudentsMap.values());

    if (students.length === 0) {
      return NextResponse.json({ message: 'Aucun élève inscrit à cette séance.' })
    }

    // 2. Préparer l'email
    const dateStr = new Date(sessionData.session_date + 'T00:00:00').toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })
    const heureStr = (sessionData.creneaux as any).heure_debut.substring(0, 5)

    const subject = `⚠️ Atelier Rêve de Porcelaine : Annulation du cours du ${dateStr}`
    const htmlContent = `
    <div style="font-family: sans-serif; color: #333;">
    <h2 style="color: #15803d;">Bonjour,</h2>
    <p>Cécile sera absente et le cours de céramique du <strong>${dateStr}</strong> à <strong>${heureStr}</strong> est malheureusement annulé.</p>
    <p>Séance reportée ou créditée sur votre compte.</p>
    <p>À bientôt à l'atelier ! 🎨</p>
    </div>
    `

    // 3. Envoyer via l'API Brevo
    const brevoResponse = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': process.env.BREVO_API_KEY!,
      },
      body: JSON.stringify({
        sender: { name: "Atelier Rêve de Porcelaine", email: "contact@reve-de-porcelaine.fr" },
        to: students.map((s: any) => ({ email: s.email, name: s.first_name })),
                           subject: subject,
                           htmlContent: htmlContent,
      }),
    })

    if (!brevoResponse.ok) {
      const errData = await brevoResponse.json()
      console.error("Erreur Brevo:", errData)
      // On renvoie le vrai message de Brevo pour comprendre l'erreur
      const errorMessage = errData.message || JSON.stringify(errData);
      return NextResponse.json({ error: `Erreur Brevo: ${errorMessage}` }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: `Email envoyé à ${students.length} élève(s).` })

  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
