'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'

const supabase = createClient()

// --- TYPES ---
type Profile = {
  id: string
  first_name: string
  last_name: string
  subscription_type: string
  sessions_left: number
  is_minor: boolean
  role: string
  creneau_id?: string | null
}

type Creation = {
  id: string
  piece_name: string | null
  weight_kg: number
  firing_passes: number
  cost: number
  created_at: string
}

type Paiement = {
  id: string
  montant: number
  date_paiement: string
  mode: string
}

type Prices = {
  tarif_annuel_adulte: number
  tarif_annuel_enfant: number
  tarif_3_seances_adulte: number
  tarif_3_seances_enfant: number
  tarif_5_seances_adulte: number
  tarif_5_seances_enfant: number
  tarif_10_seances_adulte: number
  tarif_10_seances_enfant: number
}

type Session = {
  id: string
  session_date: string
  creneau_id: string
  creneaux: {
    jour: string
    heure_debut: string
    heure_fin: string
    public_cible: string
  }
}

type MyBooking = {
  session_id: string
  status: string
}

type Creneau = {
  id: string
  jour: string
  heure_debut: string
  heure_fin: string
  public_cible: string
}

export default function DashboardPage() {
  // ==========================================
  // 1. TOUS LES STATES (HOOKS) EN PREMIER
  // ==========================================
  const [profile, setProfile] = useState<Profile | null>(null)
  const [prices, setPrices] = useState<Prices | null>(null)
  const [creations, setCreations] = useState<Creation[]>([])
  const [paiements, setPaiements] = useState<Paiement[]>([])
  const [loading, setLoading] = useState(true)
  const [sessions, setSessions] = useState<Session[]>([])
  const [myBookings, setMyBookings] = useState<MyBooking[]>([])
  const [creneaux, setCreneaux] = useState<Creneau[]>([])
  const [newPassword, setNewPassword] = useState('')
  const [showPasswordForm, setShowPasswordForm] = useState(false)

  // Auth & Formulaires
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errorLogin, setErrorLogin] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [isForgotPassword, setIsForgotPassword] = useState(false)
  const [resetEmailSent, setResetEmailSent] = useState(false)

  // Choix forfait
  const [choosingPlan, setChoosingPlan] = useState(false)
  const [updatingPlan, setUpdatingPlan] = useState(false)
  const [editSubscription, setEditSubscription] = useState<string>('')
  const [selectedCreneauId, setSelectedCreneauId] = useState<string>('')

  // Mode récupération mot de passe
  const [isRecoveryMode, setIsRecoveryMode] = useState(false)

  // ==========================================
  // 2. LES FONCTIONS DE RÉCUPÉRATION
  // ==========================================
  const fetchUserData = async (userId: string) => {
    const { data: profileData } = await supabase.from('profiles').select('*').eq('id', userId).single()
    if (profileData) setProfile(profileData)

      const { data: pricesData } = await supabase.from('parametres').select('*').eq('id', 1).single()
      if (pricesData) setPrices(pricesData)

        const { data: creationsData } = await supabase.from('creations').select('*').eq('profile_id', userId).order('created_at', { ascending: false })
        if (creationsData) setCreations(creationsData)

          const { data: paiementsData } = await supabase.from('paiements').select('*').eq('profile_id', userId).order('date_paiement', { ascending: false })
          if (paiementsData) setPaiements(paiementsData)

            const { data: creneauxData } = await supabase.from('creneaux').select('*').eq('actif', true)
            if (creneauxData) setCreneaux(creneauxData)

              const today = new Date().toISOString().split('T')[0]
              const { data: sessionsData } = await supabase
              .from('sessions')
              .select(`id, session_date, creneau_id, creneaux ( jour, heure_debut, heure_fin, public_cible )`)
              .gte('session_date', today)
              .order('session_date', { ascending: true })

              if (sessionsData && profileData) {
                let filteredSessions = sessionsData;
                if (profileData.is_minor) {
                  filteredSessions = sessionsData.filter(s => (s.creneaux as any).public_cible?.startsWith('enfants'));
                } else {
                  filteredSessions = sessionsData.filter(s => (s.creneaux as any).public_cible === 'adultes');
                }
                setSessions(filteredSessions as any)
              }

              const { data: bookingsData } = await supabase
              .from('bookings')
              .select('session_id, status')
              .eq('profile_id', userId)
              if (bookingsData) setMyBookings(bookingsData)

                setLoading(false)
  }

  // ==========================================
  // LES USEEFFECT
  // ==========================================
  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      try {
        // On utilise getSession au lieu de getUser pour éviter l'erreur réseau si le token local est périmé
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          // C'est ici qu'on attrape l'erreur "Invalid Refresh Token"
          // On nettoie le cache local pour repartir à zéro
          await supabase.auth.signOut();
          if (mounted) setLoading(false);
          return;
        }

        if (session) {
          if (mounted) await fetchUserData(session.user.id);
        } else {
          if (mounted) setLoading(false);
        }
      } catch (err) {
        // Sécurité supplémentaire en cas de bug critique
        await supabase.auth.signOut();
        if (mounted) setLoading(false);
      }
    };

    initAuth();

    // LA MAGIE : Si Supabase détecte que c'est un clic sur un lien de reset VALIDE
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;

      if (event === 'PASSWORD_RECOVERY') {
        setShowPasswordForm(true); // On ouvre le formulaire jaune
        if (session) {
          fetchUserData(session.user.id);
        }
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      authListener.subscription.unsubscribe();
    };
  }, [])

  // ==========================================
  // 4. LES FONCTIONS D'ACTIONS
  // ==========================================
  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorLogin('')

    if (isSignUp) {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { first_name: firstName, last_name: lastName } }
      })
      if (error) {
        setErrorLogin(error.message)
      } else {
        alert('Inscription réussie ! Vous pouvez maintenant vous connecter.')
        setIsSignUp(false)
      }
    } else {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) { setErrorLogin(error.message) } else if (data.user) { setLoading(true); await fetchUserData(data.user.id); }
    }
  }
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorLogin('')
    setResetEmailSent(false)

    // On envoie l'email de reset qui redirigera directement vers /dashboard
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/dashboard`,
    })

    if (error) {
      setErrorLogin(error.message)
    } else {
      setResetEmailSent(true)
    }
  }

  const handleChoosePlan = async () => {
    if (!profile || !editSubscription) return
      setUpdatingPlan(true)
      let sessionsToAdd = editSubscription === 'annuel' ? 33 : editSubscription === '10_seances' ? 10 : editSubscription === '5_seances' ? 5 : 3

      const updateData: any = {
        subscription_type: editSubscription,
        sessions_left: sessionsToAdd,
        creneau_id: editSubscription === 'annuel' ? selectedCreneauId : null
      }

      const { error } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', profile.id)

      if (!error) {
        setProfile({ ...profile, ...updateData })
        setChoosingPlan(false)
        setSelectedCreneauId('')
        setEditSubscription('')
      } else {
        alert("Erreur lors de la mise à jour du forfait.")
      }
      setUpdatingPlan(false)
  }

  const handleBookSession = async (sessionId: string) => {
    const { error } = await supabase.rpc('book_card_session', { p_session_id: sessionId })
    if (error) { alert(error.message) } else { if (profile) await fetchUserData(profile.id) }
  }

  const handleDeclareAbsence = async (sessionId: string) => {
    const { error } = await supabase.rpc('declare_absence_annuel', { p_session_id: sessionId })
    if (error) { alert(error.message) } else { if (profile) await fetchUserData(profile.id) }
  }

  const handleChangePassword = async () => {
    if (!newPassword) return
      const { error } = await supabase.auth.updateUser({ password: newPassword })
      if (!error) {
        alert('Mot de passe mis à jour avec succès ! Vous pouvez vous connecter.')
        setNewPassword('')
        setShowPasswordForm(false)
        setIsRecoveryMode(false)
        await supabase.auth.signOut()
        setProfile(null)
      } else {
        alert('Erreur : ' + error.message)
      }
  }

  // ==========================================
  // 5. CALCULS
  // ==========================================
  const totalCreations = creations.reduce((sum, c) => sum + c.cost, 0)
  const totalPaiements = paiements.reduce((sum, p) => sum + p.montant, 0)

  const getSubscriptionPrice = () => {
    if (!prices || !profile) return 0
      const isMinor = profile.is_minor
      switch (profile.subscription_type) {
        case 'annuel': return isMinor ? prices.tarif_annuel_enfant : prices.tarif_annuel_adulte
        case '3_seances': return isMinor ? prices.tarif_3_seances_enfant : prices.tarif_3_seances_adulte
        case '5_seances': return isMinor ? prices.tarif_5_seances_enfant : prices.tarif_5_seances_adulte
        case '10_seances': return isMinor ? prices.tarif_10_seances_enfant : prices.tarif_10_seances_adulte
        default: return 0
      }
  }
  const soldeDu = getSubscriptionPrice() + totalCreations - totalPaiements

  const forfaitLabels: { [key: string]: string } = {
    'aucun': 'Aucun forfait choisi',
    'annuel': 'Forfait Annuel',
    '3_seances': 'Carte 3 séances',
    '5_seances': 'Carte 5 séances',
    '10_seances': 'Carte 10 séances'
  }

  // ==========================================
  // 6. AFFICHAGE
  // ==========================================
  if (loading) return <div className="p-8 text-center text-green-800 font-bold">Chargement de votre espace...</div>

    // --- FORMULAIRE RÉINITIALISATION MOT DE PASSE ---
    if (isRecoveryMode) {
      return (
        <div className="min-h-screen bg-green-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-lg border-t-4 border-yellow-400">
        <div className="flex justify-center mb-6">
        <Image src="/logo.png" alt="Logo" width={80} height={80} className="rounded-full" />
        </div>
        <h1 className="text-2xl font-bold text-green-800 mb-2 text-center">Nouveau mot de passe</h1>
        <p className="text-sm text-gray-500 mb-6 text-center">Choisissez votre nouveau mot de passe.</p>

        <form onSubmit={(e) => { e.preventDefault(); handleChangePassword(); }} className="space-y-4">
        <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Nouveau mot de passe</label>
        <input
        type="password"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        className="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-900"
        required
        minLength={6}
        />
        </div>
        <button
        type="submit"
        className="w-full bg-green-700 text-white py-3 px-4 rounded-lg hover:bg-green-800 transition font-bold text-lg"
        >
        Changer le mot de passe
        </button>
        </form>
        </div>
        </div>
      )
    }

    // --- ACCUEIL ADMIN ---
    if (profile?.role === 'admin') {
      return (
        <div className="min-h-screen bg-green-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-lg border-t-4 border-yellow-400 text-center">
        <div className="flex justify-center mb-4">
        <Image src="/logo.png" alt="Logo" width={56} height={56} className="rounded-full" />
        </div>
        <h1 className="text-2xl font-bold text-green-800 mb-2">Bonjour {profile.first_name} 👋</h1>
        <p className="text-gray-600 mb-6">Vous êtes connecté en tant qu'administrateur.</p>
        <Link href="/admin" className="block w-full bg-green-700 text-white font-bold py-3 rounded-lg hover:bg-green-800 transition text-lg mb-4">
        Accéder à l'Espace Admin
        </Link>
        <button onClick={async () => { await supabase.auth.signOut(); setProfile(null); }} className="text-gray-500 py-2 text-sm hover:text-gray-700">Se déconnecter</button>
        </div>
        <div className="flex flex-col items-end gap-2">
        <button onClick={async () => { await supabase.auth.signOut(); setProfile(null); }} className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded hover:bg-gray-200">Déconnexion</button>
        <button onClick={() => setShowPasswordForm(!showPasswordForm)} className="text-xs text-gray-400 hover:text-gray-600">Changer mdp</button>
        </div>
        {showPasswordForm && (
          <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-200 mb-4 flex gap-2 items-end">
          <div className="flex-1">
          <label className="text-xs text-gray-600 block">Nouveau mot de passe</label>
          <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full p-2 border rounded bg-white text-gray-900" />
          </div>
          <button onClick={handleChangePassword} className="bg-green-700 text-white px-4 py-2 rounded text-sm font-semibold">Valider</button>
          </div>
        )}
        </div>
      )
    }

    // --- FORMULAIRE CONNEXION / INSCRIPTION / OUBLI MDP ---
    if (!profile) {
      return (
        <div className="min-h-screen bg-green-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-lg border-t-4 border-yellow-400">
        <div className="flex justify-center mb-6">
        <Image src="/logo.png" alt="Logo" width={80} height={80} className="rounded-full" />
        </div>

        <h1 className="text-2xl font-bold text-green-800 mb-6 text-center">
        {isForgotPassword ? 'Mot de passe oublié' : isSignUp ? 'Créer mon compte' : 'Connexion Élève'}
        </h1>

        {/* FORMULAIRE MOT DE PASSE OUBLIÉ */}
        {isForgotPassword ? (
          <div className="space-y-4">
          {resetEmailSent ? (
            <div className="bg-green-50 border border-green-200 text-green-800 p-4 rounded-lg text-center">
            <p className="font-bold">Email envoyé ! ✉️</p>
            <p className="text-sm mt-1">Vérifiez votre boîte de réception et cliquez sur le lien pour changer votre mot de passe.</p>
            </div>
          ) : (
            <form onSubmit={handleForgotPassword} className="space-y-4">
            <p className="text-sm text-gray-600 text-center">Entrez l'email de votre compte, nous vous enverrons un lien pour réinitialiser votre mot de passe.</p>
            <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-900" required />
            </div>
            {errorLogin && <p className="text-red-500 text-sm bg-red-50 p-2 rounded">{errorLogin}</p>}
            <button type="submit" className="w-full bg-green-700 text-white py-3 px-4 rounded-lg hover:bg-green-800 transition font-bold text-lg">
            Envoyer le lien
            </button>
            </form>
          )}
          <div className="text-center pt-4">
          <button onClick={() => { setIsForgotPassword(false); setErrorLogin('') }} className="text-sm text-green-700 hover:underline">
          Retour à la connexion
          </button>
          </div>
          </div>
        ) : (
          /* FORMULAIRE CONNEXION / INSCRIPTION CLASSIQUE */
          <form onSubmit={handleAuth} className="space-y-4">
          {isSignUp && (
            <>
            <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Prénom</label>
            <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-900" required />
            </div>
            <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
            <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-900" required />
            </div>
            </>
          )}
          <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-900" required />
          </div>
          <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-900" required />
          </div>
          {errorLogin && <p className="text-red-500 text-sm bg-red-50 p-2 rounded">{errorLogin}</p>}
          <button type="submit" className="w-full bg-green-700 text-white py-3 px-4 rounded-lg hover:bg-green-800 transition font-bold text-lg">
          {isSignUp ? "S'inscrire" : 'Se connecter'}
          </button>
          </form>
        )}

        {!isForgotPassword && (
          <div className="mt-6 flex flex-col items-center gap-2">
          <button onClick={() => { setIsSignUp(!isSignUp); setErrorLogin('') }} className="text-sm text-green-700 hover:underline">
          {isSignUp ? 'Déjà un compte ? Se connecter' : "Pas de compte ? S'inscrire"}
          </button>
          {!isSignUp && (
            <button onClick={() => { setIsForgotPassword(true); setErrorLogin('') }} className="text-sm text-orange-600 hover:underline">
            Mot de passe oublié ?
            </button>
          )}
          </div>
        )}

        <div className="mt-4 pt-4 border-t border-gray-100 text-center">
        <Link href="/admin" className="text-xs text-gray-300 hover:text-gray-500 transition">⚙️</Link>
        </div>
        </div>
        </div>
      )
    }

    // --- CHOIX DU FORFAIT ---
    if (profile.subscription_type === 'aucun' && !choosingPlan) {
      return (
        <div className="min-h-screen bg-green-50 p-6">
        <div className="max-w-md mx-auto bg-white rounded-2xl shadow-lg p-6 text-center border-t-4 border-yellow-400">
        <div className="flex justify-center mb-4">
        <Image src="/logo.png" alt="Logo" width={56} height={56} className="rounded-full" />
        </div>
        <h1 className="text-2xl font-bold text-green-800 mb-2">Bonjour {profile.first_name} 👋</h1>
        <p className="text-gray-600 mb-6">Vous n'avez pas encore choisi de formule.</p>
        <button onClick={() => setChoosingPlan(true)} className="w-full bg-yellow-400 text-green-900 font-bold py-3 rounded-lg hover:bg-yellow-300 transition text-lg">
        Choisir mon forfait
        </button>
        <button onClick={async () => { await supabase.auth.signOut(); setProfile(null); }} className="mt-4 w-full text-gray-500 py-2 text-sm hover:text-gray-700">Se déconnecter</button>
        </div>
        </div>
      )
    }

    if (profile.subscription_type === 'aucun' && choosingPlan && prices) {
      const isMinor = profile.is_minor
      return (
        <div className="min-h-screen bg-green-50 p-6">
        <div className="max-w-md mx-auto bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-green-800 mb-4 text-center">Choisissez votre formule</h2>
        <div className="space-y-3">
        <div className={`p-4 border-2 rounded-xl transition ${editSubscription === 'annuel' ? 'border-green-600 bg-green-50' : 'border-gray-200 bg-white'}`}>
        <button onClick={() => { setEditSubscription('annuel'); setSelectedCreneauId('') }} className="w-full text-left">
        <div className="font-bold text-green-800">Forfait Annuel</div>
        <div className="text-green-600 font-bold text-xl">{isMinor ? `${prices.tarif_annuel_enfant} €` : `${prices.tarif_annuel_adulte} €`}</div>
        </button>
        {editSubscription === 'annuel' && (
          <div className="mt-3 border-t pt-3">
          <label className="block text-sm font-medium text-gray-700 mb-1">Choisissez votre créneau fixe :</label>
          <select
          value={selectedCreneauId}
          onChange={(e) => setSelectedCreneauId(e.target.value)}
          className="w-full p-2 border border-green-300 rounded-lg bg-white text-gray-900"
          required
          >
          <option value="">-- Sélectionner un jour --</option>
          {creneaux.filter(c => isMinor ? c.public_cible.startsWith('enfants') : c.public_cible === 'adultes').map(c => (
            <option key={c.id} value={c.id}>
            {c.jour} de {c.heure_debut.substring(0,5)} à {c.heure_fin.substring(0,5)} ({c.public_cible.replace('_', ' ')})
            </option>
          ))}
          </select>
          </div>
        )}
        </div>

        <button onClick={() => { setEditSubscription('3_seances'); setSelectedCreneauId(''); }} className={`w-full p-4 border-2 rounded-xl text-left transition ${editSubscription === '3_seances' ? 'border-green-600 bg-green-50' : 'border-gray-200 bg-white hover:bg-gray-50'}`}>
        <div className="font-bold text-gray-800">Carte 3 séances</div>
        <div className="text-gray-600 font-bold text-xl">{isMinor ? `${prices.tarif_3_seances_enfant} €` : `${prices.tarif_3_seances_adulte} €`}</div>
        </button>

        <button onClick={() => { setEditSubscription('5_seances'); setSelectedCreneauId(''); }} className={`w-full p-4 border-2 rounded-xl text-left transition ${editSubscription === '5_seances' ? 'border-green-600 bg-green-50' : 'border-gray-200 bg-white hover:bg-gray-50'}`}>
        <div className="font-bold text-gray-800">Carte 5 séances</div>
        <div className="text-gray-600 font-bold text-xl">{isMinor ? `${prices.tarif_5_seances_enfant} €` : `${prices.tarif_5_seances_adulte} €`}</div>
        </button>

        <button onClick={() => { setEditSubscription('10_seances'); setSelectedCreneauId(''); }} className={`w-full p-4 border-2 rounded-xl text-left transition ${editSubscription === '10_seances' ? 'border-green-600 bg-green-50' : 'border-gray-200 bg-white hover:bg-gray-50'}`}>
        <div className="font-bold text-gray-800">Carte 10 séances</div>
        <div className="text-gray-600 font-bold text-xl">{isMinor ? `${prices.tarif_10_seances_enfant} €` : `${prices.tarif_10_seances_adulte} €`}</div>
        </button>
        </div>

        <button
        onClick={handleChoosePlan}
        disabled={updatingPlan || (editSubscription === 'annuel' && !selectedCreneauId)}
        className="mt-6 w-full bg-yellow-400 text-green-900 font-bold py-3 rounded-lg hover:bg-yellow-300 transition text-lg disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
        {updatingPlan ? 'Enregistrement...' : 'Valider mon choix'}
        </button>
        <button onClick={() => setChoosingPlan(false)} className="mt-4 w-full text-gray-500 py-2 text-sm hover:text-gray-700">Annuler</button>
        </div>
        </div>
      )
    }

    // --- ÉCRAN DE RÉCUPÉRATION (Si on a cliqué sur le lien email) ---
    if (profile && isRecoveryMode) {
      return (
        <div className="min-h-screen bg-green-50 p-4 md:p-8">
        <div className="max-w-md mx-auto bg-white p-8 rounded-2xl shadow-lg border-t-4 border-yellow-400">
        <div className="flex justify-center mb-6">
        <Image src="/logo.png" alt="Logo" width={80} height={80} className="rounded-full" />
        </div>
        <h1 className="text-2xl font-bold text-green-800 mb-2 text-center">Nouveau mot de passe</h1>
        <p className="text-sm text-gray-500 mb-6 text-center">Pour des raisons de sécurité, veuillez choisir votre nouveau mot de passe.</p>

        <form onSubmit={(e) => { e.preventDefault(); handleChangePassword(); }} className="space-y-4">
        <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Nouveau mot de passe</label>
        <input
        type="password"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        className="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-900"
        required
        minLength={6}
        />
        </div>
        <button
        type="submit"
        className="w-full bg-green-700 text-white py-3 px-4 rounded-lg hover:bg-green-800 transition font-bold text-lg"
        >
        Changer le mot de passe
        </button>
        </form>
        </div>
        </div>
      )
    }
    // --- TABLEAU DE BORD ÉLÈVE COMPLET ---
    return (
      <div className="min-h-screen bg-green-50 p-4 md:p-8">
      <div className="max-w-2xl mx-auto space-y-6">

      {/* HEADER */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border-l-8 border-yellow-400 flex justify-between items-center">
      <div className="flex items-center gap-4">
      <Image src="/logo.png" alt="Logo" width={50} height={50} className="rounded-full" />
      <div>
      <h1 className="text-xl font-bold text-green-800">Bonjour {profile.first_name} 👋</h1>
      <p className="text-sm text-gray-500">{forfaitLabels[profile.subscription_type]}</p>
      </div>
      </div>
      <div className="flex flex-col items-end gap-2">
      <button onClick={async () => { await supabase.auth.signOut(); setProfile(null); }} className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded hover:bg-gray-200">Déconnexion</button>
      <button onClick={() => setShowPasswordForm(!showPasswordForm)} className="text-xs text-blue-600 hover:underline cursor-pointer">
      Changer mon mot de passe
      </button>
      </div>
      </div>

      {/* FORMULAIRE CHANGEMENT MOT DE PASSE (S'ouvre tout seul si on vient de l'email) */}
      {showPasswordForm && (
        <div className="bg-yellow-50 p-4 rounded-2xl shadow-sm border border-yellow-200 space-y-3">
        <h3 className="font-bold text-yellow-800">Définir un nouveau mot de passe</h3>
        <div className="flex gap-2 items-end">
        <div className="flex-1">
        <label className="text-xs text-gray-600 block mb-1">Nouveau mot de passe</label>
        <input
        type="password"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        className="w-full p-2 border border-gray-300 rounded-lg bg-white text-gray-900"
        placeholder="Minimum 6 caractères"
        />
        </div>
        <button onClick={handleChangePassword} className="bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-green-800 transition">
        Valider
        </button>
        </div>
        </div>
      )}

      {/* SÉANCES RESTANTES */}
      {profile.subscription_type !== 'annuel' && (
        <div className="bg-yellow-50 border-2 border-yellow-300 rounded-2xl p-6 text-center shadow-sm">
        <p className="text-sm text-yellow-800 font-medium">Séances restantes :</p>
        <p className="text-5xl font-bold text-yellow-600 mt-2">{profile.sessions_left}</p>
        </div>
      )}

      {/* CARDE SOLDE */}
      <div className={`p-5 rounded-2xl shadow-md border-l-8 ${soldeDu > 0 ? 'bg-orange-50 border-orange-500' : 'bg-green-50 border-green-500'}`}>
      <h3 className="font-bold text-lg text-gray-800 mb-3">Ma Situation Financière</h3>
      <div className="grid grid-cols-3 gap-3 text-sm mb-4">
      <div className="bg-white p-2 rounded text-center shadow-sm">
      <div className="text-gray-500 text-xs">Forfait</div>
      <div className="font-bold text-green-800">{getSubscriptionPrice().toFixed(2)}€</div>
      </div>
      <div className="bg-white p-2 rounded text-center shadow-sm">
      <div className="text-gray-500 text-xs">Cuissons</div>
      <div className="font-bold text-green-800">{totalCreations.toFixed(2)}€</div>
      </div>
      <div className="bg-white p-2 rounded text-center shadow-sm">
      <div className="text-gray-500 text-xs">Payé</div>
      <div className="font-bold text-green-800">{totalPaiements.toFixed(2)}€</div>
      </div>
      </div>
      <div className="text-right text-xl font-bold border-t pt-3">
      Reste à payer : <span className={soldeDu > 0 ? 'text-red-600' : 'text-green-600'}>{soldeDu > 0 ? `${soldeDu.toFixed(2)}€` : 'Soldé ✅'}</span>
      </div>
      </div>

      {/* LISTES FINANCIÈRES */}
      <div className="grid md:grid-cols-2 gap-6">
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
      <h3 className="font-bold mb-3 text-gray-800">Mes Créations 🎨 ({totalCreations.toFixed(2)}€)</h3>
      {creations.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-4">Aucune pièce enregistrée.</p>
      ) : (
        <div className="max-h-48 overflow-y-auto space-y-2 text-sm">
        {creations.map(c => (
          <div key={c.id} className="flex justify-between bg-gray-50 p-2 rounded border">
          <span className="text-gray-700">{c.piece_name || 'Pièce'} <span className="text-xs text-gray-400">({c.weight_kg}kg)</span></span>
          <span className="font-semibold text-green-700">{c.cost.toFixed(2)}€</span>
          </div>
        ))}
        </div>
      )}
      </div>

      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
      <h3 className="font-bold mb-3 text-gray-800">Mes Paiements 💰 ({totalPaiements.toFixed(2)}€)</h3>
      {paiements.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-4">Aucun paiement enregistré.</p>
      ) : (
        <div className="max-h-48 overflow-y-auto space-y-2 text-sm">
        {paiements.map(p => (
          <div key={p.id} className="flex justify-between bg-gray-50 p-2 rounded border">
          <span className="text-gray-700">{new Date(p.date_paiement).toLocaleDateString('fr-FR')} <span className="text-xs text-gray-400">({p.mode})</span></span>
          <span className="font-semibold text-green-700">+{p.montant.toFixed(2)}€</span>
          </div>
        ))}
        </div>
      )}
      </div>
      </div>

      {/* CALENDRIER */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
      <h3 className="font-bold mb-3 text-gray-800">📅 Prochaines séances</h3>

      {(() => {
        const displayedSessions = profile.subscription_type === 'annuel'
      ? sessions.filter(s => s.creneau_id === profile.creneau_id)
      : sessions;

      if (displayedSessions.length === 0) {
        return <p className="text-sm text-gray-400 text-center py-4">Aucune séance à venir pour l'instant.</p>;
      }

      return (
        <div className="space-y-3">
        {displayedSessions.map(session => {
          const booking = myBookings.find(b => b.session_id === session.id)
          const dateObj = new Date(session.session_date + 'T00:00:00')
          const dateStr = dateObj.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })
          const heureDebut = (session.creneaux as any).heure_debut?.substring(0, 5) || ''
          const heureFin = (session.creneaux as any).heure_fin?.substring(0, 5) || ''

          return (
            <div key={session.id} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg border border-gray-100">
            <div>
            <div className="font-semibold text-green-800 capitalize">{dateStr}</div>
            <div className="text-xs text-gray-500">De {heureDebut} à {heureFin}</div>
            </div>

            <div>
            {profile.subscription_type === 'annuel' ? (
              booking?.status === 'absent_annuel' ? (
                <span className="text-xs bg-gray-200 text-gray-600 px-3 py-1 rounded font-semibold">Absent ✅</span>
              ) : (
                <button onClick={() => handleDeclareAbsence(session.id)} className="bg-orange-500 text-white px-3 py-1 rounded text-xs font-bold hover:bg-orange-600 transition">
                Je serai absent
                </button>
              )
            ) : profile.subscription_type !== 'aucun' ? (
              booking?.status === 'booked_card' ? (
                <span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded font-bold">Inscrit ✅</span>
              ) : (
                <button onClick={() => handleBookSession(session.id)} className="bg-green-600 text-white px-3 py-1 rounded text-xs font-bold hover:bg-green-700 transition">
                Réserver
                </button>
              )
            ) : null}
            </div>
            </div>
          )
        })}
        </div>
      )
      })()}
      </div>

      </div>
      </div>
    )
}
