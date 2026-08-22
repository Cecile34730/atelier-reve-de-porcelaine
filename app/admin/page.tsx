'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect, useState, useCallback } from 'react'
import Image from 'next/image'

const supabase = createClient()

type Profile = {
  id: string
  first_name: string
  last_name: string
  email: string | null
  subscription_type: string
  sessions_left: number
  subscriptions?: any[]
  role: string
  is_minor: boolean
  creneau_id?: string | null
  custom_subscription_price?: number | null
  summer_access?: boolean | null
}

type Creation = { id: string; piece_name: string | null; weight_kg: number; firing_passes: number; cost: number; created_at: string }
type Paiement = { id: string; montant: number; date_paiement: string; mode: string; note: string | null }
type Prices = { tarif_annuel_adulte: number; tarif_annuel_enfant: number; tarif_3_seances_adulte: number; tarif_3_seances_enfant: number; tarif_5_seances_adulte: number; tarif_5_seances_enfant: number; tarif_10_seances_adulte: number; tarif_10_seances_enfant: number; tarif_1_seance_adulte: number; tarif_1_seance_enfant: number; tarif_session_ete: number }

export default function AdminPage() {
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [prices, setPrices] = useState<Prices | null>(null)
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)

  const [selectedStudent, setSelectedStudent] = useState<Profile | null>(null)
  const [creations, setCreations] = useState<Creation[]>([])
  const [paiements, setPaiements] = useState<Paiement[]>([])
  const [studentSubscriptions, setStudentSubscriptions] = useState<any[]>([])

  const [newCreation, setNewCreation] = useState({ piece_name: '', weight_kg: '', firing_passes: 1 })
  const [newPaiement, setNewPaiement] = useState({ montant: '', date_paiement: new Date().toISOString().split('T')[0], mode: 'especes', note: '' })
  const [editSubscription, setEditSubscription] = useState<string>('')
  const [editSessionsLeft, setEditSessionsLeft] = useState<number>(0)
  const [saving, setSaving] = useState(false)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errorLogin, setErrorLogin] = useState('')
  const [groupTarget, setGroupTarget] = useState('all')
  const [groupSubject, setGroupSubject] = useState('')
  const [groupMessage, setGroupMessage] = useState('')
  const [sendingGroupEmail, setSendingGroupEmail] = useState(false)

  const [activeTab, setActiveTab] = useState<'eleves' | 'planning' | 'bilan'| 'com'>('eleves')
  const [planningSessions, setPlanningSessions] = useState<any[]>([])
  const [creneauxList, setCreneauxList] = useState<any[]>([])
  const [generating, setGenerating] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [editCustomPrice, setEditCustomPrice] = useState<string>('')
  const [editingCreationId, setEditingCreationId] = useState<string | null>(null)
  const [editCreationName, setEditCreationName] = useState('')
  const [editCreationWeight, setEditCreationWeight] = useState('')
  const [editCreationPasses, setEditCreationPasses] = useState<number>(1)

  const [yearCreations, setYearCreations] = useState<any[]>([])
  const [yearPaiements, setYearPaiement] = useState<any[]>([])

  const fetchStudents = useCallback(async () => {
    const { data } = await supabase.from('profiles').select('*, subscriptions(*)').eq('role', 'eleve').order('first_name')
    if (data) setProfiles(data)
  }, [])

  const fetchPrices = useCallback(async () => {
    const { data } = await supabase.from('parametres').select('*').eq('id', 1).single()
    if (data) setPrices(data)
  }, [])

  const fetchPlanning = async () => {
    const today = new Date().toISOString().split('T')[0]
    const { data } = await supabase.from('sessions').select(`id, session_date, creneau_id, annulee, creneaux ( jour, heure_debut, heure_fin, capacite_max, public_cible ), bookings ( profile_id, status, profiles ( first_name, last_name ) )`).gte('session_date', today).order('session_date', { ascending: true })
    if (data) setPlanningSessions(data)
  }

  const getSchoolYearDates = () => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth(); // 0 = Janvier, 6 = Juillet, 7 = Août

    let startYear = currentYear;
    // Si on est avant septembre (de janvier à août), l'année scolaire a commencé l'année dernière
    if (currentMonth < 8) {
      startYear = currentYear - 1;
    }
    // ON MODIFIE LA FIN POUR INCLURE L'ÉTÉ (08-31 au lieu de 06-30)
    return { start: `${startYear}-09-01`, end: `${startYear + 1}-08-31` };
  }

  const fetchYearSummary = async () => {
    const { start, end } = getSchoolYearDates();
    const { data: cData } = await supabase.from('creations').select('*, profiles ( first_name, last_name )').gte('created_at', start).lte('created_at', end + 'T23:59:59');
    if (cData) setYearCreations(cData);
    const { data: pData } = await supabase.from('paiements').select('*').gte('date_paiement', start).lte('date_paiement', end);
    if (pData) setYearPaiement(pData);
  }

  useEffect(() => {
    const init = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser()
        if (error || !user) { window.location.href = '/dashboard'; return }
        const { data } = await supabase.from('profiles').select('role').eq('id', user.id).single()
        if (data?.role === 'admin') {
          setIsAdmin(true); await fetchStudents(); await fetchPrices();
          const { data: creneauxData } = await supabase.from('creneaux').select('*'); if (creneauxData) setCreneauxList(creneauxData); await fetchPlanning();
        } else { window.location.href = '/dashboard'; return }
      } catch { window.location.href = '/dashboard' } finally { setLoading(false) }
    }
    init()
  }, [fetchStudents, fetchPrices])

  const selectStudent = async (student: Profile) => {
    setSelectedStudent(student);
    setEditSubscription('aucun');
    setEditSessionsLeft(0);
    setEditCustomPrice(student.custom_subscription_price?.toString() || '');

    const { data: cData } = await supabase.from('creations').select('*').eq('profile_id', student.id).order('created_at', { ascending: false });
    if (cData) setCreations(cData);

    const { data: pData } = await supabase.from('paiements').select('*').eq('profile_id', student.id).order('date_paiement', { ascending: false });
    if (pData) setPaiements(pData);

    const today = new Date().toISOString().split('T')[0];

    // 1. On récupère le profil frais
    const { data: freshProfile } = await supabase.from('profiles').select('*').eq('id', student.id).single();

    // 2. On récupère les forfaits actifs de l'élève
    const { data: subsData } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('profile_id', student.id)
    .gte('end_date', today)
    .order('start_date', { ascending: true });

    setStudentSubscriptions(subsData || []);

    // 3. On met à jour l'interface avec le profil ET les forfaits frais
    if (freshProfile) {
      setSelectedStudent({ ...freshProfile, subscriptions: subsData || [] } as Profile);
      setEditCustomPrice(freshProfile.custom_subscription_price?.toString() || '');
    }

    // 4. On cherche le forfait principal pour pré-remplir le menu déroulant
    let { data: activeSub } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('profile_id', student.id)
    .lte('start_date', today)
    .gte('end_date', today)
    .maybeSingle();

    if (!activeSub) {
      const { data: upcomingSub } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('profile_id', student.id)
      .gte('start_date', today)
      .order('start_date', { ascending: true })
      .limit(1)
      .maybeSingle();
      activeSub = upcomingSub;
    }

    if (activeSub) {
      setEditSubscription(activeSub.type);
      setEditSessionsLeft(activeSub.sessions_left);
    } else {
      setEditSubscription('aucun');
      setEditSessionsLeft(0);
    }
  };

  const handleLogin = async (e: React.FormEvent) => { e.preventDefault(); setErrorLogin(''); const { error } = await supabase.auth.signInWithPassword({ email, password }); if (error) { setErrorLogin(error.message) } else { setLoading(true); window.location.reload() } }
  const handleLogout = async () => { await supabase.auth.signOut(); window.location.href = '/dashboard' }

  const handleUpdateSubscription = async () => {
    if (!selectedStudent) return;
    setSaving(true);
    try {
      const chosenType = editSubscription;
      const chosenSessions = chosenType === 'annuel' ? 33 : (parseInt(String(editSessionsLeft)) || 0);

      const now = new Date();
      let startYear = now.getFullYear();
      const month = now.getMonth() + 1;

      if (month <= 6) {
        startYear -= 1;
      }

      const todayStr = now.toISOString().split('T')[0];
      let startDate = '', endDate = '';
      if (chosenType === 'annuel') { startDate = `${startYear}-09-01`; endDate = `${startYear + 1}-06-30`; }
      else if (chosenType.includes('_ete')) {
        // Si on est en juillet/août, l'été c'est l'année en cours. Sinon, c'est l'année suivante.
        const summerYear = (month >= 7 && month <= 8) ? startYear : startYear + 1;
        startDate = `${summerYear}-07-01`;
        endDate = `${summerYear}-08-31`;
      }
      else if (chosenType !== 'aucun') {
        startDate = (month < 9) ? todayStr : `${startYear}-09-01`;
        endDate = `${startYear + 1}-08-31`;
      }

      const today = now.toISOString().split('T')[0];
      const yesterday = new Date(new Date().setDate(new Date().getDate() - 1)).toISOString().split('T')[0];

      // 1. On sauvegarde le prix personnalisé dans le profil
      await supabase.from('profiles').update({
        custom_subscription_price: editCustomPrice ? parseFloat(editCustomPrice) : null
      }).eq('id', selectedStudent.id);

      // 2. On récupère tous les forfaits ACTIFS de l'élève
      const { data: activeSubs } = await supabase
      .from('subscriptions')
      .select('id, type')
      .eq('profile_id', selectedStudent.id)
      .gte('end_date', today);

      // 3. Si on choisit un forfait principal, on EXPIRE les autres forfaits principaux
      const isMainSub = !chosenType.includes('_ete');
      if (activeSubs && activeSubs.length > 0) {
        for (const sub of activeSubs) {
          const subIsMain = !sub.type.includes('_ete');
          if (chosenType !== 'aucun' && isMainSub && subIsMain && sub.type !== chosenType) {
            await supabase.from('subscriptions').update({ end_date: yesterday }).eq('id', sub.id);
          }
          if (chosenType === 'aucun' && subIsMain) {
            await supabase.from('subscriptions').update({ end_date: yesterday }).eq('id', sub.id);
          }
        }
      }

      // 4. On insère ou met à jour le nouveau forfait choisi
      if (chosenType !== 'aucun') {
        const { data: chosenSub } = await supabase
        .from('subscriptions')
        .select('id')
        .eq('profile_id', selectedStudent.id)
        .eq('type', chosenType)
        .gte('end_date', today)
        .maybeSingle();

        if (chosenSub) {
          const { error } = await supabase.from('subscriptions').update({
            sessions_left: chosenSessions, start_date: startDate, end_date: endDate
          }).eq('id', chosenSub.id);
          if (error) throw error;
        } else {
          const { error } = await supabase.from('subscriptions').insert({
            profile_id: selectedStudent.id, type: chosenType, sessions_left: chosenSessions, start_date: startDate, end_date: endDate
          });
          if (error) throw error;
        }
      }

      // 5. On recharge TOUTES les données de l'élève pour recalculer le solde
      await selectStudent(selectedStudent);

    } catch (error: any) {
      alert('Erreur de sauvegarde : ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleAddCreation = async (e: React.FormEvent) => {
    e.preventDefault(); if (!selectedStudent || !newCreation.weight_kg) return; setSaving(true)
    const { data, error } = await supabase.from('creations').insert({ profile_id: selectedStudent.id, piece_name: newCreation.piece_name || null, weight_kg: parseFloat(newCreation.weight_kg) / 1000, firing_passes: newCreation.firing_passes }).select().single()
    if (!error && data) { setCreations([data, ...creations]); setNewCreation({ piece_name: '', weight_kg: '', firing_passes: 1 }) } else { alert('Erreur: ' + error?.message) }
    setSaving(false)
  }

  const handleDeleteCreation = async (creationId: string) => {
    if (!selectedStudent) return;
    if (!confirm("Supprimer cette création ?")) return;
    setSaving(true)
    const { error } = await supabase.from('creations').delete().eq('id', creationId)
    if (!error) {
      setCreations(creations.filter(c => c.id !== creationId))
      await selectStudent(selectedStudent)
    } else { alert('Erreur : ' + error.message) }
    setSaving(false)
  }

  const handleDeletePaiement = async (paiementId: string) => {
    if (!selectedStudent) return;
    if (!confirm("Supprimer ce paiement ?")) return;
    try {
      setSaving(true);
      const { error, data } = await supabase
      .from('paiements')
      .delete()
      .eq('id', paiementId)
      .select();
      if (error) { alert('Erreur Supabase : ' + error.message); return; }
      if (!data || data.length === 0) { alert("Aucun paiement supprimé. Vérifiez les droits RLS dans Supabase."); return; }
      setPaiements(paiements.filter(p => p.id !== paiementId));
      await selectStudent(selectedStudent);
    } catch (err: any) { alert('Erreur inattendue : ' + err.message); } finally { setSaving(false); }
  };

  const handleAddPaiement = async (e: React.FormEvent) => {
    e.preventDefault(); if (!selectedStudent || !newPaiement.montant) return; setSaving(true)
    const { data, error } = await supabase.from('paiements').insert({ profile_id: selectedStudent.id, montant: parseFloat(newPaiement.montant), date_paiement: newPaiement.date_paiement, mode: newPaiement.mode, note: newPaiement.note || null }).select().single()
    if (!error && data) { setPaiements([data, ...paiements]); setNewPaiement({ ...newPaiement, montant: '', note: '' }) } else { alert('Erreur: ' + error?.message) }
    setSaving(false)
  }

  const startEditingCreation = (c: Creation) => { setEditingCreationId(c.id); setEditCreationName(c.piece_name || ''); setEditCreationWeight((c.weight_kg * 1000).toString()); setEditCreationPasses(c.firing_passes) }
  const handleUpdateCreation = async (creationId: string) => {
    if (!selectedStudent) return; setSaving(true)
      const { error } = await supabase.from('creations').update({ piece_name: editCreationName || null, weight_kg: parseFloat(editCreationWeight) / 1000, firing_passes: editCreationPasses }).eq('id', creationId)
      if (!error) { await selectStudent(selectedStudent); setEditingCreationId(null) } else { alert('Erreur: ' + error.message) }
      setSaving(false)
  }

  const handleGenerateYear = async () => {
    if (!confirm("Générer l'année scolaire (hors vacances et hors été) ?")) return; setGenerating(true)
      const { data, error } = await supabase.rpc('generate_yearly_sessions')
      if (error) { alert("Erreur: " + error.message) } else if (data) { alert(`✨ ${data.message} (${data.count} nouvelles).`); await fetchPlanning() }
      setGenerating(false)
  }

  const handleResetPassword = async () => {
    if (!selectedStudent?.email) { alert("Cet élève n'a pas d'email associé."); return }
    if (!confirm(`Envoyer un email de réinitialisation à ${selectedStudent.email} ?`)) return
      const { error } = await supabase.auth.resetPasswordForEmail(selectedStudent.email, { redirectTo: `${window.location.origin}/dashboard` })
      if (!error) alert('Email envoyé !'); else alert('Erreur: ' + error.message)
  }

  const getCreneauName = (creneauId: string | null | undefined) => { if (!creneauId) return ''; const creneau = creneauxList.find(c => c.id === creneauId); return creneau ? `(${creneau.jour} ${creneau.heure_debut.substring(0,5)})` : '' }

  const totalCreations = creations.reduce((sum, c) => sum + c.cost, 0)
  const totalPaiements = paiements.reduce((sum, p) => sum + p.montant, 0)

  const getSubscriptionPrice = () => {
    if (!prices || !selectedStudent) return 0
      if (selectedStudent.custom_subscription_price) return selectedStudent.custom_subscription_price

        const today = new Date().toISOString().split('T')[0];
    const activeSubs = selectedStudent.subscriptions?.filter((s: any) => s.end_date >= today) || [];

    if (activeSubs.length === 0) return 0;

    const isMinor = selectedStudent.is_minor;
    let totalPrice = 0;

    activeSubs.forEach((sub: any) => {
      switch (sub.type) {
        case 'annuel':
          totalPrice += isMinor ? Number(prices.tarif_annuel_enfant) : Number(prices.tarif_annuel_adulte)
          break
        case '1_seance':
          totalPrice += isMinor ? Number(prices.tarif_1_seance_enfant) : Number(prices.tarif_1_seance_adulte)
          break
        case '3_seances':
          totalPrice += isMinor ? Number(prices.tarif_3_seances_enfant) : Number(prices.tarif_3_seances_adulte)
          break
        case '5_seances':
          totalPrice += isMinor ? Number(prices.tarif_5_seances_enfant) : Number(prices.tarif_5_seances_adulte)
          break
        case '10_seances':
          totalPrice += isMinor ? Number(prices.tarif_10_seances_enfant) : Number(prices.tarif_10_seances_adulte)
          break
        case '1_seance_ete':
          totalPrice += Number(prices.tarif_session_ete)
          break
        case '3_seances_ete':
          totalPrice += Number(prices.tarif_session_ete) * 3
          break
        case '5_seances_ete':
          totalPrice += Number(prices.tarif_session_ete) * 5
          break
        case '10_seances_ete':
          totalPrice += Number(prices.tarif_session_ete) * 10
          break
        default:
          break
      }
    });

    return totalPrice;
  }

  const soldeDu = getSubscriptionPrice() + totalCreations - totalPaiements

  if (loading) return <div className="p-8 text-center text-green-800 font-bold">Chargement...</div>

    if (!isAdmin) {
      return (
        <div className="min-h-screen bg-green-50 flex items-center justify-center p-4"><div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-lg border-t-4 border-yellow-400"><div className="flex justify-center mb-6"><Image src="/logo.png" alt="Logo" width={80} height={80} className="rounded-full" /></div><h1 className="text-2xl font-bold text-green-800 mb-6 text-center">Espace Administrateur</h1><form onSubmit={handleLogin} className="space-y-4"><div><label className="block text-sm font-medium text-gray-700 mb-1">Email Admin</label><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-900" required /></div><div><label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe</label><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-900" required /></div>{errorLogin && <p className="text-red-500 text-sm bg-red-50 p-2 rounded">{errorLogin}</p>}<button type="submit" className="w-full bg-green-700 text-white py-3 px-4 rounded-lg hover:bg-green-800 transition font-bold text-lg">Se connecter</button></form></div></div>
      )
    }

    return (
      <div className="min-h-screen bg-gray-100 flex flex-col md:flex-row">

      {/* COLONNE GAUCHE */}
      <div className="w-full md:w-1/3 bg-green-800 text-white p-4 flex flex-col h-screen">
      <div className="flex justify-between items-center mb-4">
      <h2 className="text-xl font-bold">Mes élèves ({profiles.length})</h2>
      <button onClick={handleLogout} className="text-xs bg-red-500 hover:bg-red-600 px-3 py-1 rounded font-bold transition">Déconnexion</button>
      </div>
      <div className="mb-4">
      <input type="text" placeholder="Rechercher un élève..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full p-2 rounded-lg bg-green-700 text-white placeholder-green-300 border border-green-600 focus:outline-none focus:ring-2 focus:ring-yellow-400" />
      </div>
      <div className="flex-1 overflow-y-auto space-y-2 pr-1">
      {profiles.filter(p => { if (!searchTerm) return true; const term = searchTerm.toLowerCase(); return p.first_name.toLowerCase().includes(term) || p.last_name.toLowerCase().includes(term); }).map(p => {
        const today = new Date().toISOString().split('T')[0];
        const activeSubs = p.subscriptions?.filter((s: any) => s.end_date >= today) || [];
        const totalSessions = activeSubs.reduce((sum: number, s: any) => sum + (s.type === 'annuel' ? 0 : (s.sessions_left || 0)), 0);
        return (
          <div key={p.id} onClick={() => selectStudent(p)} className={`p-3 rounded-lg cursor-pointer transition ${selectedStudent?.id === p.id ? 'bg-yellow-400 text-green-900 font-bold shadow-lg' : 'bg-green-700 hover:bg-green-600'}`}>
          <div className="flex justify-between items-center">
          <div className="flex flex-col">
          <p className="font-medium">{p.first_name} {p.last_name}</p>
          <div className="flex flex-wrap gap-1 mt-1">
          {activeSubs.length === 0 && <span className={`text-xs ${selectedStudent?.id === p.id ? 'text-green-800' : 'text-green-200'}`}>Aucun</span>}
          {activeSubs.map(sub => (<span key={sub.id} className={`text-xs px-1.5 py-0.5 rounded ${selectedStudent?.id === p.id ? 'bg-green-800 text-yellow-300' : 'bg-green-600 text-green-100'}`}>{sub.type === 'annuel' ? 'Annuel' : sub.type.replaceAll('_', ' ').replaceAll('ete', 'Été')}</span>))}
          </div>
          </div>
          <div className="text-right"><span className="text-sm font-bold">{activeSubs.some((s: any) => s.type === 'annuel') ? 'Illimité' : `${totalSessions} séances`}</span></div>
          </div>
          </div>
        )
      })}
      </div>
      </div>

      {/* COLONNE DROITE */}
      <div className="w-full md:w-2/3 p-6 overflow-y-auto h-screen">
      <div className="flex space-x-4 mb-6 border-b border-green-200 pb-2">
      <button onClick={() => setActiveTab('eleves')} className={`px-4 py-2 font-bold rounded-t-lg transition ${activeTab === 'eleves' ? 'bg-white text-green-800 border border-b-white -mb-[1px]' : 'text-green-600 hover:text-green-800'}`}>Gestion Élève</button>
      <button onClick={() => setActiveTab('planning')} className={`px-4 py-2 font-bold rounded-t-lg transition ${activeTab === 'planning' ? 'bg-white text-green-800 border border-b-white -mb-[1px]' : 'text-green-600 hover:text-green-800'}`}>Planning & Sessions</button>
      <button onClick={() => { setActiveTab('bilan'); fetchYearSummary(); }} className={`px-4 py-2 font-bold rounded-t-lg transition ${activeTab === 'bilan' ? 'bg-white text-green-800 border border-b-white -mb-[1px]' : 'text-green-600 hover:text-green-800'}`}>📊 Bilan Annuel</button>
      <button onClick={() => setActiveTab('com')} className={`px-4 py-2 font-bold rounded-t-lg transition ${activeTab === 'com' ? 'bg-white text-green-800 border border-b-white -mb-[1px]' : 'text-green-600 hover:text-green-800'}`}>📧 Communication</button>
      </div>

      {/* ONGLET ELEVE */}
      {activeTab === 'eleves' && (
        <>
        {!selectedStudent ? (
          <div className="flex flex-col items-center justify-center h-2/3 text-green-700 opacity-50"><p className="text-xl font-bold">Sélectionnez un élève</p></div>
        ) : (
          <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-md border border-green-100">
          <div className="flex justify-between items-start mb-4"><div><h2 className="text-2xl font-bold text-green-800">{selectedStudent.first_name} {selectedStudent.last_name}</h2><p className="text-sm text-gray-500">{selectedStudent.email} {selectedStudent.is_minor && <span className="bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full text-xs ml-2">Mineur</span>}</p></div><button onClick={handleResetPassword} className="text-xs bg-blue-50 text-blue-700 px-3 py-1 rounded hover:bg-blue-100 transition">Réinitialiser MDP</button></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Forfait</label><select value={editSubscription} onChange={(e) => { const newType = e.target.value; setEditSubscription(newType); if (newType === 'annuel') setEditSessionsLeft(33); else if (newType.includes('1_seance')) setEditSessionsLeft(1); else if (newType.includes('3_seances')) setEditSessionsLeft(3); else if (newType.includes('5_seances')) setEditSessionsLeft(5); else if (newType.includes('10_seances')) setEditSessionsLeft(10); else setEditSessionsLeft(0); }} className="w-full p-2 border border-gray-300 rounded-lg bg-white text-gray-900"><option value="aucun">Aucun forfait actif</option><option value="annuel">Annuel</option><option value="1_seance">1 Séance</option><option value="3_seances">3 Séances</option><option value="5_seances">5 Séances</option><option value="10_seances">10 Séances</option><option value="1_seance_ete">1 Séance (Été)</option><option value="3_seances_ete">3 Séances (Été)</option><option value="5_seances_ete">5 Séances (Été)</option><option value="10_seances_ete">10 Séances (Été)</option></select></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Séances restantes</label><input type="number" value={editSessionsLeft} onChange={(e) => setEditSessionsLeft(parseInt(e.target.value) || 0)} className="w-full p-2 border border-gray-300 rounded-lg bg-white text-gray-900" disabled={editSubscription === 'annuel'} /></div>
          <button onClick={handleUpdateSubscription} disabled={saving} className="bg-green-700 text-white px-4 py-2 rounded-lg hover:bg-green-800 transition font-bold disabled:opacity-50">{saving ? 'Sauvegarde...' : 'Mettre à jour forfait'}</button>
          </div>
          <div className="mt-4 pt-4 border-t"><div className="flex items-center gap-2 mt-2"><input type="number" value={editCustomPrice} onChange={(e) => setEditCustomPrice(e.target.value)} className="w-full p-2 border border-gray-300 rounded-lg bg-white text-gray-900" placeholder="Prix personnalisé (Geste commercial)" /><span className="text-sm text-gray-500">€</span></div></div>
          </div>

          {studentSubscriptions.length > 0 && (
            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
            <h4 className="text-sm font-bold text-blue-800 mb-3">Forfaits actifs de l'élève</h4>
            <div className="space-y-2">
            {studentSubscriptions.map(sub => (
              <div key={sub.id} className="flex justify-between items-center bg-white p-2 rounded shadow-sm text-sm">
              <div><span className="font-semibold text-gray-800">{sub.type === 'annuel' ? 'Annuel' : sub.type.includes('ete') ? sub.type.replace('_ete', ' Été').replace('_', ' ') : sub.type.replace('_', ' ')}</span><span className="text-xs text-gray-400 ml-2">(du {new Date(sub.start_date).toLocaleDateString('fr-FR')} au {new Date(sub.end_date).toLocaleDateString('fr-FR')})</span></div>
              <span className="font-bold text-blue-600">{sub.type === 'annuel' ? 'Illimité' : `${sub.sessions_left} rest.`}</span>
              </div>
            ))}
            </div>
            </div>
          )}

          <div className={`p-4 rounded-xl shadow-sm border ${(soldeDu || 0) > 0 ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
          <div className="flex justify-between items-center"><div><p className="text-sm font-medium text-gray-700">Solde dû par l'élève</p><p className="text-xs text-gray-500 mt-1">Forfait ({(getSubscriptionPrice() || 0).toFixed(2)}€) + Créations ({(totalCreations || 0).toFixed(2)}€) - Paiements ({(totalPaiements || 0).toFixed(2)}€)</p></div><p className={`text-2xl font-bold ${(soldeDu || 0) > 0 ? 'text-red-700' : 'text-green-700'}`}>{(soldeDu || 0) > 0 ? `${(soldeDu || 0).toFixed(2)}€` : 'Soldé ✓'}</p></div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-2xl shadow-md border border-green-100">
          <h3 className="text-lg font-bold text-green-800 mb-4">Créations ({creations.length})</h3>
          <form onSubmit={handleAddCreation} className="space-y-2 mb-4 bg-gray-50 p-3 rounded-lg"><input type="text" placeholder="Nom de la pièce (opt.)" value={newCreation.piece_name} onChange={(e) => setNewCreation({...newCreation, piece_name: e.target.value})} className="w-full p-2 border border-gray-300 rounded bg-white text-gray-900 text-sm" /><div className="flex space-x-2"><input type="number" step="1" placeholder="Poids (en g)" value={newCreation.weight_kg} onChange={(e) => setNewCreation({...newCreation, weight_kg: e.target.value})} className="w-1/2 p-2 border border-gray-300 rounded bg-white text-gray-900 text-sm" required /><select value={newCreation.firing_passes} onChange={(e) => setNewCreation({...newCreation, firing_passes: parseInt(e.target.value)})} className="w-1/2 p-2 border border-gray-300 rounded bg-white text-gray-900 text-sm"><option value={1}>1 cuisson</option><option value={2}>2 cuissons</option></select></div><button type="submit" disabled={saving} className="w-full bg-green-600 text-white p-2 rounded hover:bg-green-700 text-sm font-bold disabled:opacity-50">Ajouter</button></form>
          <div className="space-y-2 max-h-60 overflow-y-auto">
          {creations.map(c => (
            <div key={c.id} className="text-sm p-2 bg-gray-50 rounded border">
            {editingCreationId === c.id ? (
              <div className="space-y-2"><input type="text" value={editCreationName} onChange={(e) => setEditCreationName(e.target.value)} className="w-full p-1 border border-gray-300 rounded bg-white text-gray-900" /><div className="flex gap-2"><input type="number" step="1" value={editCreationWeight} onChange={(e) => setEditCreationWeight(e.target.value)} className="w-1/2 p-1 border border-gray-300 rounded bg-white text-gray-900" /><select value={editCreationPasses} onChange={(e) => setEditCreationPasses(parseInt(e.target.value))} className="w-1/2 p-1 border border-gray-300 rounded bg-white text-gray-900"><option value={1}>1 cuisson</option><option value={2}>2 cuissons</option></select></div><div className="flex gap-2"><button onClick={() => handleUpdateCreation(c.id)} disabled={saving} className="w-full bg-green-600 text-white p-1 rounded text-xs font-bold hover:bg-green-700 disabled:opacity-50">{saving ? 'Sauvegarde...' : 'Valider'}</button><button onClick={() => setEditingCreationId(null)} className="w-full bg-gray-300 text-gray-800 p-1 rounded text-xs font-bold hover:bg-gray-400">Annuler</button></div></div>
            ) : (
              <div className="flex justify-between items-center"><span className="text-gray-800 font-medium">{c.piece_name || 'Sans nom'} <span className="text-gray-500 font-normal">({Math.round(c.weight_kg * 1000)}g, {c.firing_passes} cuis.)</span></span><div className="flex items-center gap-2"><span className="font-bold text-green-700">{c.cost.toFixed(2)}€</span><button onClick={() => startEditingCreation(c)} className="text-blue-500 hover:text-blue-700 text-base" title="Modifier">✏️</button><button onClick={() => handleDeleteCreation(c.id)} className="text-red-500 hover:text-red-700 text-base" title="Supprimer">🗑️</button></div></div>
            )}
            </div>
          ))}
          </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-md border border-green-100">
          <h3 className="text-lg font-bold text-green-800 mb-4">Paiements ({paiements.length})</h3>
          <form onSubmit={handleAddPaiement} className="space-y-2 mb-4 bg-gray-50 p-3 rounded-lg">
          <div className="flex space-x-2"><input type="number" step="0.01" placeholder="Montant (€)" value={newPaiement.montant} onChange={(e) => setNewPaiement({...newPaiement, montant: e.target.value})} className="w-1/2 p-2 border border-gray-300 rounded bg-white text-gray-900 text-sm" required /><select value={newPaiement.mode} onChange={(e) => setNewPaiement({...newPaiement, mode: e.target.value})} className="w-1/2 p-2 border border-gray-300 rounded bg-white text-gray-900 text-sm"><option value="especes">Espèces</option><option value="cb">CB</option><option value="cheque">Chèque</option><option value="wero">Wero</option></select></div>
          <div className="flex space-x-2"><input type="date" value={newPaiement.date_paiement} onChange={(e) => setNewPaiement({...newPaiement, date_paiement: e.target.value})} className="w-1/2 p-2 border border-gray-300 rounded bg-white text-gray-900 text-sm" required /><input type="text" placeholder="Note (opt.)" value={newPaiement.note} onChange={(e) => setNewPaiement({...newPaiement, note: e.target.value})} className="w-1/2 p-2 border border-gray-300 rounded bg-white text-gray-900 text-sm" /></div>
          <button type="submit" disabled={saving} className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 text-sm font-bold disabled:opacity-50">Enregistrer paiement</button>
          </form>
          <div className="space-y-2 max-h-60 overflow-y-auto">
          {paiements.map(p => (
            <div key={p.id} className="flex justify-between items-center text-sm p-2 bg-gray-50 rounded border"><div><span className="font-bold text-blue-700">{(p.montant || 0).toFixed(2)}€</span><span className="text-gray-500 ml-2">({p.mode})</span></div><div className="flex items-center gap-2"><div className="text-right"><span className="text-gray-800">{new Date(p.date_paiement).toLocaleDateString('fr-FR')}</span>{p.note && <p className="text-xs text-gray-400 italic">{p.note}</p>}</div><button onClick={() => handleDeletePaiement(p.id)} className="text-red-500 hover:text-red-700 text-base" title="Annuler ce paiement">🗑️</button></div></div>
          ))}
          </div>
          </div>
          </div>
          </div>
        )}
        </>
      )}

      {/* ONGLET PLANNING */}
      {activeTab === 'planning' && (
        <div className="space-y-6">
        <div className="bg-white p-6 rounded-2xl shadow-md border border-green-100 flex flex-col md:flex-row justify-between items-center gap-4"><div><h2 className="text-xl font-bold text-green-800">Gestion du Planning</h2><p className="text-sm text-gray-500">Générer les sessions pour l'année scolaire (hors vacances scolaires et hors été).</p></div><button onClick={handleGenerateYear} disabled={generating} className="bg-yellow-500 text-green-900 px-6 py-3 rounded-lg font-bold hover:bg-yellow-400 transition disabled:opacity-50 shadow-md">{generating ? 'Génération en cours...' : "✨ Générer l'année"}</button></div>
        <div className="bg-white p-6 rounded-2xl shadow-md border border-green-100"><h3 className="text-lg font-bold text-green-800 mb-4">Prochaines sessions</h3><div className="space-y-4">
        {planningSessions.map(session => (
          <div key={session.id} className={`p-4 rounded-lg border ${session.annulee ? 'bg-red-50 border-red-200 opacity-60' : 'bg-gray-50 border-gray-200'}`}>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-2 gap-2"><div><span className="font-bold text-green-800">{new Date(session.session_date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}</span><span className="ml-2 text-gray-600">({session.creneaux.jour} {session.creneaux.heure_debut?.substring(0,5)} - {session.creneaux.heure_fin?.substring(0,5)})</span>{session.creneaux.public_cible && <span className="ml-2 bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs">{session.creneaux.public_cible}</span>}</div><div className="flex items-center gap-2"><span className={`text-sm px-2 py-1 rounded ${session.annulee ? 'bg-red-200 text-red-800' : 'bg-green-200 text-green-800'}`}>{session.annulee ? 'Annulée' : 'Active'}</span>{!session.annulee && (<button onClick={async () => { if(confirm("Envoyer un email d'absence à tous les élèves inscrits ?")) { const res = await fetch('/api/notify-absence', { method: 'POST', body: JSON.stringify({ sessionId: session.id }) }); const data = await res.json(); if(data.success) alert(data.message); else alert("Erreur: " + data.error) } }} className="bg-red-500 text-white px-3 py-1 rounded text-xs font-bold hover:bg-red-600 transition">📧 Prévenir d'absence</button>)}</div></div>

          {(() => {
            const sessionDate = session.session_date; // On vérifie la validité du forfait À LA DATE DE LA SÉANCE

            // 1. Élèves annuels inscrits à ce créneau
            const annualAttendees = profiles.filter(p => {
              if (p.creneau_id !== session.creneau_id) return false;
              return p.subscriptions?.some((s: any) => s.type === 'annuel' && s.start_date <= sessionDate && s.end_date >= sessionDate);
            }).map(p => ({
              id: p.id,
              first_name: p.first_name,
              last_name: p.last_name,
              isAbsent: session.bookings.some((b: any) => b.profile_id === p.id && b.status === 'absent_annuel')
            }));

            // 2. Élèves à la carte (bookings avec booked_card)
            const cardAttendees = session.bookings
            .filter((b: any) => b.status === 'booked_card')
            .map((b: any) => ({
              id: b.profile_id,
              first_name: b.profiles.first_name,
              last_name: b.profiles.last_name,
              isAbsent: false
            }));

            // 3. On fusionne les deux listes
            const allAttendees = [...annualAttendees, ...cardAttendees];
            const presentCount = allAttendees.filter(a => !a.isAbsent).length;

            return (
              <div className="text-sm text-gray-600">
              <p className="font-medium mb-1">Inscrits ({presentCount}/{session.creneaux.capacite_max}) :</p>
              <div className="flex flex-wrap gap-2">
              {allAttendees.map(a => (
                <span key={a.id} className={`px-2 py-1 rounded border shadow-sm text-xs ${a.isAbsent ? 'bg-gray-200 text-gray-400 line-through' : 'bg-white text-gray-800'}`}>
                {a.first_name} {a.last_name}
                {annualAttendees.some(an => an.id === a.id) && !a.isAbsent && ' (Annuel)'}
                {a.isAbsent && ' (Absent)'}
                </span>
              ))}
              {allAttendees.length === 0 && <span className="text-xs text-gray-400 italic">Aucun inscrit</span>}
              </div>
              </div>
            );
          })()}

          </div>
        ))}
        {planningSessions.length === 0 && (<div className="text-center py-8 text-gray-400"><p>Aucune session future trouvée.</p></div>)}
        </div></div>
        </div>
      )}

      {/* ONGLET BILAN */}
      {activeTab === 'bilan' && (
        <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {(() => {
          const { start: syStart, end: syEnd } = getSchoolYearDates();

          const totalInscriptions = profiles.reduce((sum, p) => {
            if (!prices) return sum;
            // On récupère TOUS les forfaits actifs pour l'année en cours
            const today = new Date().toISOString().split('T')[0];
            const activeSubs = p.subscriptions?.filter((s: any) => s.end_date >= today) || [];
            if (activeSubs.length === 0) return sum;

            const isMinor = p.is_minor;

            // On additionne le prix de CHAQUE forfait actif
            const studentTotal = activeSubs.reduce((subSum, sub) => {
              let price = 0;
              switch (sub.type) {
                case 'annuel': price = isMinor ? Number(prices.tarif_annuel_enfant) : Number(prices.tarif_annuel_adulte); break;
                case '1_seance': price = isMinor ? Number(prices.tarif_1_seance_enfant) : Number(prices.tarif_1_seance_adulte); break;
                case '3_seances': price = isMinor ? Number(prices.tarif_3_seances_enfant) : Number(prices.tarif_3_seances_adulte); break;
                case '5_seances': price = isMinor ? Number(prices.tarif_5_seances_enfant) : Number(prices.tarif_5_seances_adulte); break;
                case '10_seances': price = isMinor ? Number(prices.tarif_10_seances_enfant) : Number(prices.tarif_10_seances_adulte); break;
                case '1_seance_ete': price = Number(prices.tarif_session_ete); break;
                case '3_seances_ete': price = Number(prices.tarif_session_ete) * 3; break;
                case '5_seances_ete': price = Number(prices.tarif_session_ete) * 5; break;
                case '10_seances_ete': price = Number(prices.tarif_session_ete) * 10; break;
                default: price = 0;
              }
              return subSum + (price || 0);
            }, 0);

            return sum + studentTotal;
          }, 0);

          const totalCuis = yearCreations.reduce((sum: number, c: any) => sum + (c.cost || 0), 0);
          const totalPay = yearPaiements.reduce((sum: number, p: any) => sum + (p.montant || 0), 0);
          const solde = totalInscriptions + totalCuis - totalPay;
          const totalKg = yearCreations.reduce((sum: number, c: any) => sum + (c.weight_kg || 0), 0);
          return (<><div className="bg-white p-4 rounded-xl shadow-sm border text-center"><p className="text-xs text-gray-500 uppercase font-bold">Inscriptions</p><p className="text-2xl font-bold text-green-700 mt-1">{totalInscriptions.toFixed(2)}€</p></div><div className="bg-white p-4 rounded-xl shadow-sm border text-center"><p className="text-xs text-gray-500 uppercase font-bold">Cuissons</p><p className="text-2xl font-bold text-blue-700 mt-1">{totalCuis.toFixed(2)}€</p><p className="text-xs text-gray-400 mt-1">{totalKg.toFixed(1)} kg</p></div><div className="bg-white p-4 rounded-xl shadow-sm border text-center"><p className="text-xs text-gray-500 uppercase font-bold">Encaissé</p><p className="text-2xl font-bold text-green-500 mt-1">{totalPay.toFixed(2)}€</p></div><div className={`p-4 rounded-xl shadow-sm border text-center ${solde > 0 ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}><p className="text-xs text-gray-500 uppercase font-bold">Solde dû total</p><p className={`text-2xl font-bold mt-1 ${solde > 0 ? 'text-red-600' : 'text-green-600'}`}>{solde.toFixed(2)}€</p></div></>)
        })()}
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100"><h3 className="font-bold text-lg text-green-800 mb-4">Solde des élèves ({profiles.length})</h3><div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
        <thead className="text-xs text-gray-500 uppercase border-b">
        <tr>
        <th className="py-3 px-2">Nom</th>
        <th className="py-3 px-2">Forfait</th>
        <th className="py-3 px-2">Séances rest.</th>
        <th className="py-3 px-2">Solde dû</th>
        </tr>
        </thead>
        <tbody>
        {(() => {
          const { start: syStart, end: syEnd } = getSchoolYearDates();

          // On regroupe les créations et paiements par élève pour optimiser le calcul
          const creationsByProfile = yearCreations.reduce((acc, c) => {
            acc[c.profile_id] = (acc[c.profile_id] || 0) + (c.cost || 0);
            return acc;
          }, {} as Record<string, number>);

          const paiementsByProfile = yearPaiements.reduce((acc, p) => {
            acc[p.profile_id] = (acc[p.profile_id] || 0) + (p.montant || 0);
            return acc;
          }, {} as Record<string, number>);

          return profiles.map(p => {
            const today = new Date().toISOString().split('T')[0];
            const activeSubs = p.subscriptions?.filter((s: any) => s.end_date >= today) || [];
            const totalSessions = activeSubs.reduce((sum: number, s: any) => sum + (s.type === 'annuel' ? 0 : (s.sessions_left || 0)), 0);
            let mainType = 'Aucun';
          if (activeSubs.some((s: any) => s.type === 'annuel')) { mainType = 'Annuel'; } else if (activeSubs.length > 0) { mainType = activeSubs[0].type.replaceAll('_', ' ').replaceAll('ete', 'Été'); }

          // Calcul du prix des forfaits de l'élève
          const studentSubPrice = activeSubs.reduce((subSum: number, sub: any) => {
            if (!prices) return subSum;
            let price = 0;
            const isMinor = p.is_minor;
            switch (sub.type) {
              case 'annuel': price = isMinor ? Number(prices.tarif_annuel_enfant) : Number(prices.tarif_annuel_adulte); break;
              case '1_seance': price = isMinor ? Number(prices.tarif_1_seance_enfant) : Number(prices.tarif_1_seance_adulte); break;
              case '3_seances': price = isMinor ? Number(prices.tarif_3_seances_enfant) : Number(prices.tarif_3_seances_adulte); break;
              case '5_seances': price = isMinor ? Number(prices.tarif_5_seances_enfant) : Number(prices.tarif_5_seances_adulte); break;
              case '10_seances': price = isMinor ? Number(prices.tarif_10_seances_enfant) : Number(prices.tarif_10_seances_adulte); break;
              case '1_seance_ete': price = Number(prices.tarif_session_ete); break;
              case '3_seances_ete': price = Number(prices.tarif_session_ete) * 3; break;
              case '5_seances_ete': price = Number(prices.tarif_session_ete) * 5; break;
              case '10_seances_ete': price = Number(prices.tarif_session_ete) * 10; break;
              default: price = 0;
            }
            return subSum + (price || 0);
          }, 0);

          // Calcul du vrai solde dû pour l'année : Forfaits + Créations - Paiements
          const studentCout = creationsByProfile[p.id] || 0;
          const studentPaye = paiementsByProfile[p.id] || 0;
          const studentSolde = studentSubPrice + studentCout - studentPaye;

          return (
            <tr key={p.id} className="border-b hover:bg-gray-50">
            <td className="py-3 px-2 font-medium text-gray-900">{p.last_name} {p.first_name}</td>
            <td className="py-3 px-2 text-gray-600 capitalize">{mainType}</td>
            <td className="py-3 px-2 text-gray-600">{mainType === 'Annuel' ? 'Illimité' : totalSessions}</td>
            <td className={`py-3 px-2 font-bold ${studentSolde > 0 ? 'text-red-600' : 'text-green-600'}`}>
            {studentSolde > 0 ? `${studentSolde.toFixed(2)}€` : 'Soldé ✓'}
            </td>
            </tr>
          )
          })
        })()}
        </tbody>
        </table>
        </div></div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100"><h3 className="font-bold text-lg text-green-800 mb-4">Créations de l'année ({yearCreations.length} pièces)</h3>{yearCreations.length === 0 ? <p className="text-sm text-gray-400">Aucune création.</p> : (<div className="max-h-96 overflow-y-auto space-y-2">{yearCreations.map((c: any) => (<div key={c.id} className="flex justify-between items-center text-sm bg-gray-50 p-2 rounded border"><div><span className="font-medium text-gray-800">{c.piece_name || 'Sans nom'}</span><span className="text-gray-400 ml-2">par {c.profiles?.first_name} {c.profiles?.last_name}</span></div><div className="text-right"><span className="text-gray-600 mr-4">{Math.round(c.weight_kg * 1000)}g / {c.firing_passes} cuis.</span><span className="font-bold text-blue-700">{(c.cost || 0).toFixed(2)}€</span></div></div>))}</div>)}</div>
        </div>
      )}

      {/* ONGLET COMMUNICATION */}
      {activeTab === 'com' && (
        <div className="space-y-6">
        <div className="bg-white p-6 rounded-2xl shadow-md border border-green-100">
        <h2 className="text-xl font-bold text-green-800 mb-4">Envoyer un e-mail groupé</h2>

        <div className="space-y-4">
        <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Destinataires</label>
        <select value={groupTarget} onChange={(e) => setGroupTarget(e.target.value)} className="w-full p-2 border border-gray-300 rounded-lg bg-white text-gray-900">
        <option value="all">Tous les élèves</option>
        <option value="annuel">Forfait Annuel</option>
        <option value="ete">Forfaits Été</option>
        <option value="carte">Forfaits à la carte (3, 5, 10 séances)</option>
        </select>
        </div>

        <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Sujet</label>
        <input type="text" value={groupSubject} onChange={(e) => setGroupSubject(e.target.value)} placeholder="Ex: Invitation vernissage, Informations rentrée..." className="w-full p-2 border border-gray-300 rounded-lg bg-white text-gray-900" />
        </div>

        <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
        <textarea value={groupMessage} onChange={(e) => setGroupMessage(e.target.value)} rows={6} placeholder="Écrivez votre message ici..." className="w-full p-2 border border-gray-300 rounded-lg bg-white text-gray-900" />
        </div>

        <button
        onClick={async () => {
          if (!groupSubject || !groupMessage) { alert('Remplissez le sujet et le message'); return; }
          if (!confirm(`Envoyer cet e-mail aux élèves sélectionnés ?`)) return;

          setSendingGroupEmail(true);
          const res = await fetch('/api/send-group-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ target: groupTarget, subject: groupSubject, message: groupMessage })
          });
          const data = await res.json();

          if (data.success || data.message) {
            alert(data.message || 'E-mails envoyés !');
            setGroupSubject('');
            setGroupMessage('');
          } else {
            alert('Erreur: ' + data.error);
          }
          setSendingGroupEmail(false);
        }}
        disabled={sendingGroupEmail}
        className="bg-green-700 text-white px-4 py-2 rounded-lg hover:bg-green-800 transition font-bold disabled:opacity-50"
        >
        {sendingGroupEmail ? 'Envoi en cours...' : '📧 Envoyer'}
        </button>
        </div>
        </div>
        </div>
      )}

      </div>
      </div>
    )
}
