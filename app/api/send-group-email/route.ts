import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { target, subject, message } = await request.json()

    if (!target || !subject || !message) {
      return NextResponse.json({ error: 'Champs manquants' }, { status: 400 })
    }

    const supabase = await createClient()

    // 1. Récupérer tous les élèves ayant un email
    const { data: allStudents, error: fetchError } = await supabase
      .from('profiles')
      .select('id, first_name, email, subscriptions!inner(type, end_date)')
      .eq('role', 'eleve')

    if (fetchError) throw fetchError

    const today = new Date().toISOString().split('T')[0]
    let targetedStudents: any[] = []

    // 2. Filtrer selon la cible choisie
    if (target === 'all') {
      targetedStudents = allStudents.filter(s => s.email)
    } else if (target === 'annuel') {
      targetedStudents = allStudents.filter(s =>
        s.email && s.subscriptions?.some((sub: any) => sub.type === 'annuel' && sub.end_date >= today)
      )
    } else if (target === 'ete') {
      targetedStudents = allStudents.filter(s =>
        s.email && s.subscriptions?.some((sub: any) => sub.type.includes('_ete') && sub.end_date >= today)
      )
    } else if (target === 'carte') {
      targetedStudents = allStudents.filter(s =>
        s.email && s.subscriptions?.some((sub: any) => !sub.type.includes('annuel') && !sub.type.includes('_ete') && sub.end_date >= today)
      )
    }

    if (targetedStudents.length === 0) {
      return NextResponse.json({ message: 'Aucun élève trouvé pour cette cible.' })
    }

    // 3. Préparer les destinataires pour Brevo
    const recipients = targetedStudents.map(s => ({ email: s.email, name: s.first_name }))

    // 4. Envoyer via l'API Brevo
    const brevoResponse = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': process.env.BREVO_API_KEY!,
      },
      body: JSON.stringify({
        sender: { name: "Atelier Rêve de Porcelaine", email: "contact@reve-de-porcelaine" }, // L'adresse validée Brevo
        to: recipients,
        subject: subject,
        htmlContent: `<div style="font-family: sans-serif; color: #333;"><p>Bonjour,</p><p>${message.replace(/\n/g, '<br>')}</p><p>Atelier Rêve de Porcelaine 🎨</p></div>`,
      }),
    })

    if (!brevoResponse.ok) {
      const errData = await brevoResponse.json()
      console.error("Erreur Brevo:", errData)
      return NextResponse.json({ error: `Erreur Brevo: ${errData.message}` }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: `Email envoyé à ${targetedStudents.length} élève(s).` })

  } catch (error: any) {
    console.error(error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
