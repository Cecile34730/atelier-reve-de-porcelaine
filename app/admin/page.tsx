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
  role: string
  is_minor: boolean
  creneau_id?: string | null
  custom_subscription_price?: number | null
  summer_access?: boolean | null
}

type Creation = { id: string; piece_name: string | null; weight_kg: number; firing_passes: number; cost: number; created_at: string }
type Paiement = { id: string; montant: number; date_paiement: string; mode: string; note: string | null }
type Prices = { tarif_annuelle_adulte: number; tarif_annuel_enfant: number; tarif_3_seances_adulte: number; tarif_3_seances_enfant: number; tarif_5_seances_adulte: number; tarif_5_seances_enfant: number; tarif_10_seances_adulte: number; tarif_10_seances_enfant: number; tarif_seance_unique_adulte: number; tarif_seance_unique_enfant: number; tarif_session_ete: number }

export default function AdminPage() {
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [prices, setPrices] = useState<Prices | null>(null)
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)

  const [selectedStudent, setSelectedStudent] = useState<Profile | null>(null)
  const [creations, setCreations] = useState<Creation[]>([])
  const [paiements, setPaiements] = useState<Paiement[]>([])

  const [newCreation, setNewCreation] = useState({ piece_name: '', weight_kg: '', firing_passes: 1 })
  const [newPaiement, setNewPaiement] = useState({ montant: '', date_paiement: new Date().toISOString().split('T')[0], mode: 'especes', note: '' })
  const [editSubscription, setEditSubscription] = useState<string>('')
  const [editSessionsLeft, setEditSessionsLeft] = useState<number>(0)
  const [saving, setSaving] = useState(false)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errorLogin, setErrorLogin] = useState('')

  const [activeTab, setActiveTab] = useState<'eleves' | 'planning' | 'bilan'>('eleves')
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
    const { data } = await supabase.from('profiles').select('*').eq('role', 'eleve').order('first_name')
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
    const now = new Date(); const currentYear = now.getFullYear(); const currentMonth = now.getMonth();
    let startYear = currentYear; if (currentMonth < 6) { startYear = currentYear - 1; }
    return { start: `${startYear}-09-01`, end: `${startYear + 1}-06-30` };
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
    setSelectedStudent(student); setEditSubscription(student.subscription_type); setEditSessionsLeft(student.sessions_left); setEditCustomPrice(student.custom_subscription_price?.toString() || '')
    const { data: cData } = await supabase.from('creations').select('*').eq('profile_id', student.id).order('created_at', { ascending: false }); if (cData) setCreations(cData)
    const { data: pData } = await supabase.from('paiements').select('*').eq('profile_id', student.id).order('date_paiement', { ascending: false }); if (pData) setPaiements(pData)
    const { data: freshProfile } = await supabase.from('profiles').select('*').eq('id', student.id).single()
    if (freshProfile) { setSelectedStudent(freshProfile as Profile); setEditSubscription(freshProfile.subscription_type); setEditSessionsLeft(freshProfile.sessions_left); setEditCustomPrice(freshProfile.custom_subscription_price?.toString() || '') }
  }

  const handleLogin = async (e: React.FormEvent) => { e.preventDefault(); setErrorLogin(''); const { error } = await supabase.auth.signInWithPassword({ email, password }); if (error) { setErrorLogin(error.message) } else { setLoading(true); window.location.reload() } }
  const handleLogout = async () => { await supabase.auth.signOut(); window.location.href = '/dashboard' }

  const handleUpdateSubscription = async () => {
    if (!selectedStudent) return; setSaving(true)
      const customPrice = editCustomPrice ? parseFloat(editCustomPrice) : null;
    const creneauId = editSubscription === 'annuel' ? selectedStudent.creneau_id : null;
    const { error } = await supabase.rpc('update_student_subscription', { target_user_id: selectedStudent.id, new_sub_type: editSubscription, new_sessions: editSessionsLeft, p_creneau_id: creneauId, p_custom_price: customPrice, p_summer_access: selectedStudent.summer_access || false })
    if (!error) {
      const updatedStudentData = { ...selectedStudent, subscription_type: editSubscription, sessions_left: editSessionsLeft, creneau_id: creneauId, custom_subscription_price: customPrice, summer_access: selectedStudent.summer_access || false };
      setSelectedStudent(updatedStudentData); setProfiles(profiles.map(p => p.id === selectedStudent.id ? updatedStudentData : p)); alert('Forfait mis à jour !')
    } else { alert('Erreur: ' + error.message) }
    setSaving(false)
  }

  const handleAddCreation = async (e: React.FormEvent) => {
    e.preventDefault(); if (!selectedStudent || !newCreation.weight_kg) return; setSaving(true)
    const { data, error } = await supabase.from('creations').insert({ profile_id: selectedStudent.id, piece_name: newCreation.piece_name || null, weight_kg: parseFloat(newCreation.weight_kg) / 1000, firing_passes: newCreation.firing_passes }).select().single()
    if (!error && data) { setCreations([data, ...creations]); setNewCreation({ piece_name: '', weight_kg: '', firing_passes: 1 }) } else { alert('Erreur: ' + error?.message) }
    setSaving(false)
  }

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
        const isMinor = selectedStudent.is_minor

        // Gestion des forfaits été (prix adultes fixes pour l'été)
        if (selectedStudent.subscription_type === '1_seance_ete') return prices.tarif_seance_unique_adulte
          if (selectedStudent.subscription_type === '3_seances_ete') return prices.tarif_3_seances_adulte
            if (selectedStudent.subscription_type === '5_seances_ete') return prices.tarif_5_seances_adulte
              if (selectedStudent.subscription_type === '10_seances_ete') return prices.tarif_10_seances_adulte

                // Gestion des forfaits classique année
                switch (selectedStudent.subscription_type) {
                  case 'annuel': return isMinor ? prices.tarif_annuel_enfant : prices.tarif_annuelle_adulte
                  case '1_seance': return isMinor ? prices.tarif_seance_unique_enfant : prices.tarif_seance_unique_adulte
                  case '3_seances': return isMinor ? prices.tarif_3_seances_enfant : prices.tarif_3_seances_adulte
                  case '5_seances': return isMinor ? prices.tarif_5_seances_enfant : prices.tarif_5_seances_adulte
                  case '10_seances': return isMinor ? prices.tarif_10_seances_enfant : prices.tarif_10_seances_adulte
                  default: return 0
                }
  }

  const soldeDu = getSubscriptionPrice() + totalCreations - totalPaiements

  if (loading) return <div className="p-8 text-center text-green-800 font-bold">Chargement...</div>

    if (!isAdmin) {
      return (
        <div className="min-h-screen bg-green-50 flex items-center justify-center p-4"><div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-lg border-t-4 border-yellow-400"><div className="flex justify-center mb-6"><Image src="/logo.png" alt="Logo" width={80} height={80} className="rounded-full" /></div><h1 className="text-2xl font-bold text-green-800 mb-6 text-center">Espace Administrateur</h1><form onSubmit={handleLogin} className="space-y-4"><div><label className="block text-sm font-medium text-gray-700 mb-1">Email Admin</label><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-900" required /></div><div><label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe</label><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-900" required /></div>{errorLogin && <p className="text-red-500 text-sm bg-red-50 p-2 rounded">{errorLogin}</p>}<button type="submit" className="w-full bg-green-700 text-white py-3 px-4 rounded-lg hover:bg-green-800 transition font-bold text-lg">Se connecter</button></form></div></div>
      )
    }

    return (
      <div className="min-h-screen bg-green-50 flex flex-col md:flex-row">

      <div className="w-full md:w-1/3 bg-green-900 p-4 border-r overflow-y-auto h-screen text-white shadow-xl">
      <div className="flex justify-between items-center mb-6"><div className="flex items-center gap-3"><Image src="/logo.png" alt="Logo" width={40} height={40} className="rounded-full" /><h1 className="text-xl font-bold text-yellow-300">Rêve de Porcelaine</h1></div><button onClick={handleLogout} className="text-xs bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600">Déconnexion</button></div>
      <div className="mb-4">
      <label className="text-xs text-green-300 block mb-1">Mes élèves ({profiles.length})</label>
      <input type="text" placeholder="Rechercher..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full p-2 border border-green-700 rounded bg-green-800 text-white placeholder-green-400 text-sm" />
      </div>
      <div className="space-y-2">
      {profiles.filter(student => `${student.first_name} ${student.last_name}`.toLowerCase().includes(searchTerm.toLowerCase())).map(student => (
        <button key={student.id} onClick={() => selectStudent(student)} className={`w-full text-left p-3 rounded-lg transition ${selectedStudent?.id === student.id ? 'bg-yellow-400 text-green-900 font-bold shadow-md' : 'bg-green-800 hover:bg-green-700 text-white border border-green-700'}`}>
        <div className="font-semibold">{student.last_name} {student.first_name}</div>
        <div className="text-xs flex justify-between mt-1 opacity-80"><span>{student.subscription_type.replace('_', ' ')}</span><span>{student.subscription_type !== 'annuel' ? `${student.sessions_left} rest.` : 'Annuel'} {student.subscription_type === 'annuel' ? getCreneauName(student.creneau_id) : ''}</span></div>
        </button>
      ))}
      </div>
      </div>

      <div className="w-full md:w-2/3 p-6 overflow-y-auto h-screen">

      <div className="flex space-x-4 mb-6 border-b border-green-200 pb-2">
      <button onClick={() => setActiveTab('eleves')} className={`px-4 py-2 font-bold rounded-t-lg transition ${activeTab === 'eleves' ? 'bg-white text-green-800 border border-b-white -mb-[1px]' : 'text-green-600 hover:text-green-800'}`}>Gestion Élève</button>
      <button onClick={() => setActiveTab('planning')} className={`px-4 py-2 font-bold rounded-t-lg transition ${activeTab === 'planning' ? 'bg-white text-green-800 border border-b-white -mb-[1px]' : 'text-green-600 hover:text-green-800'}`}>Planning & Sessions</button>
      <button onClick={() => { setActiveTab('bilan'); fetchYearSummary(); }} className={`px-4 py-2 font-bold rounded-t-lg transition ${activeTab === 'bilan' ? 'bg-white text-green-800 border border-b-white -mb-[1px]' : 'text-green-600 hover:text-green-800'}`}>📊 Bilan Annuel</button>
      </div>

      {/* ONGLET GESTION ÉLÈVE */}
      {activeTab === 'eleves' && (
        <>
        {!selectedStudent ? (
          <div className="flex flex-col items-center justify-center h-2/3 text-green-700 opacity-50"><p className="text-xl font-bold">Sélectionnez un élève</p></div>
        ) : (
          <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-md border border-green-100">
          <div className="flex justify-between items-start mb-4"><div><h2 className="text-2xl font-bold text-green-800">{selectedStudent.first_name} {selectedStudent.last_name}</h2><p className="text-sm text-gray-500">{selectedStudent.email} {selectedStudent.is_minor && <span className="bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full text-xs ml-2">Mineur</span>}</p></div><button onClick={handleResetPassword} className="text-xs bg-blue-50 text-blue-700 px-3 py-1 rounded hover:bg-blue-100 transition">Réinitialiser MDP</button></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Forfait</label><select value={editSubscription} onChange={(e) => setEditSubscription(e.target.value)} className="w-full p-2 border border-gray-300 rounded-lg bg-white text-gray-900"><option value="annuel">Annuel</option><option value="3_seances">3 Séances</option><option value="5_seances">5 Séances</option><option value="10_seances">10 Séances</option></select></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Séances restantes</label><input type="number" value={editSessionsLeft} onChange={(e) => setEditSessionsLeft(parseInt(e.target.value) || 0)} className="w-full p-2 border border-gray-300 rounded-lg bg-white text-gray-900" disabled={editSubscription === 'annuel'} /></div>
          <button onClick={handleUpdateSubscription} disabled={saving} className="bg-green-700 text-white px-4 py-2 rounded-lg hover:bg-green-800 transition font-bold disabled:opacity-50">{saving ? 'Sauvegarde...' : 'Mettre à jour forfait'}</button>
          </div>
          <div className="mt-4 pt-4 border-t">
          <div className="flex items-center gap-2 mt-2"><input type="checkbox" checked={selectedStudent.summer_access || false} onChange={(e) => setSelectedStudent({...selectedStudent, summer_access: e.target.checked})} className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500" /><label className="text-sm font-medium text-gray-700">Accès Cours d'Été autorisé</label></div>
          <div className="flex items-center gap-2 mt-2"><input type="number" value={editCustomPrice} onChange={(e) => setEditCustomPrice(e.target.value)} className="w-full p-2 border border-gray-300 rounded-lg bg-white text-gray-900" placeholder="Prix personnalisé (Geste commercial)" /><span className="text-sm text-gray-500">€</span></div>
          </div>
          </div>

          <div className={`p-4 rounded-xl shadow-sm border ${soldeDu > 0 ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}><div className="flex justify-between items-center"><div><p className="text-sm font-medium text-gray-700">Solde dû par l'élève</p><p className="text-xs text-gray-500 mt-1">Forfait ({getSubscriptionPrice().toFixed(2)}€) + Créations ({totalCreations.toFixed(2)}€) - Paiements ({totalPaiements.toFixed(2)}€)</p></div><p className={`text-2xl font-bold ${soldeDu > 0 ? 'text-red-700' : 'text-green-700'}`}>{soldeDu > 0 ? `${soldeDu.toFixed(2)}€` : 'Soldé ✓'}</p></div></div>

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
              <div className="flex justify-between items-center"><span className="text-gray-800 font-medium">{c.piece_name || 'Sans nom'} <span className="text-gray-500 font-normal">({Math.round(c.weight_kg * 1000)}g, {c.firing_passes} cuis.)</span></span><div className="flex items-center gap-2"><span className="font-bold text-green-700">{c.cost.toFixed(2)}€</span><button onClick={() => startEditingCreation(c)} className="text-blue-500 hover:text-blue-700 text-base" title="Modifier">✏️</button></div></div>
            )}
            </div>
          ))}
          </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-md border border-green-100">
          <h3 className="text-lg font-bold text-green-800 mb-4">Paiements ({paiements.length})</h3>
          <form onSubmit={handleAddPaiement} className="space-y-2 mb-4 bg-gray-50 p-3 rounded-lg"><div className="flex space-x-2"><input type="number" step="0.01" placeholder="Montant (€)" value={newPaiement.montant} onChange={(e) => setNewPaiement({...newPaiement, montant: e.target.value})} className="w-1/2 p-2 border border-gray-300 rounded bg-white text-gray-900 text-sm" required /><select value={newPaiement.mode} onChange={(e) => setNewPaiement({...newPaiement, mode: e.target.value})} className="w-1/2 p-2 border border-gray-300 rounded bg-white text-gray-900 text-sm"><option value="especes">Espèces</option><option value="cb">CB</option><option value="cheque">Chèque</option><option value="wero">Wero</option></select></div><div className="flex space-x-2"><input type="date" value={newPaiement.date_paiement} onChange={(e) => setNewPaiement({...newPaiement, date_paiement: e.target.value})} className="w-1/2 p-2 border border-gray-300 rounded bg-white text-gray-900 text-sm" required /><input type="text" placeholder="Note (opt.)" value={newPaiement.note} onChange={(e) => setNewPaiement({...newPaiement, note: e.target.value})} className="w-1/2 p-2 border border-gray-300 rounded bg-white text-gray-900 text-sm" /></div><button type="submit" disabled={saving} className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 text-sm font-bold disabled:opacity-50">Enregistrer paiement</button></form>
          <div className="space-y-2 max-h-60 overflow-y-auto">
          {paiements.map(p => (
            <div key={p.id} className="flex justify-between items-center text-sm p-2 bg-gray-50 rounded border"><div><span className="font-bold text-blue-700">{p.montant.toFixed(2)}€</span><span className="text-gray-500 ml-2">({p.mode})</span></div><div className="text-right"><span className="text-gray-800">{new Date(p.date_paiement).toLocaleDateString('fr-FR')}</span>{p.note && <p className="text-xs text-gray-400 italic">{p.note}</p>}</div></div>
          ))}
          </div>
          </div>
          </div>
          </div>
        )}
        </>
      )}

      {/* ONGLET PLANNING & SESSIONS */}
      {activeTab === 'planning' && (
        <div className="space-y-6">
        <div className="bg-white p-6 rounded-2xl shadow-md border border-green-100 flex flex-col md:flex-row justify-between items-center gap-4"><div><h2 className="text-xl font-bold text-green-800">Gestion du Planning</h2><p className="text-sm text-gray-500">Générer les sessions pour l'année scolaire (hors vacances scolaires et hors été).</p></div><button onClick={handleGenerateYear} disabled={generating} className="bg-yellow-500 text-green-900 px-6 py-3 rounded-lg font-bold hover:bg-yellow-400 transition disabled:opacity-50 shadow-md">{generating ? 'Génération en cours...' : "✨ Générer l'année"}</button></div>
        <div className="bg-white p-6 rounded-2xl shadow-md border border-green-100"><h3 className="text-lg font-bold text-green-800 mb-4">Prochaines sessions</h3><div className="space-y-4">
        {planningSessions.map(session => (
          <div key={session.id} className={`p-4 rounded-lg border ${session.annulee ? 'bg-red-50 border-red-200 opacity-60' : 'bg-gray-50 border-gray-200'}`}>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-2 gap-2"><div><span className="font-bold text-green-800">{new Date(session.session_date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}</span><span className="ml-2 text-gray-600">({session.creneaux.jour} {session.creneaux.heure_debut?.substring(0,5)} - {session.creneaux.heure_fin?.substring(0,5)})</span>{session.creneaux.public_cible && <span className="ml-2 bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs">{session.creneaux.public_cible}</span>}</div><div className="flex items-center gap-2"><span className={`text-sm px-2 py-1 rounded ${session.annulee ? 'bg-red-200 text-red-800' : 'bg-green-200 text-green-800'}`}>{session.annulee ? 'Annulée' : 'Active'}</span>{!session.annulee && (<button onClick={async () => { if(confirm("Envoyer un email d'absence à tous les élèves inscrits ?")) { const res = await fetch('/api/notify-absence', { method: 'POST', body: JSON.stringify({ sessionId: session.id }) }); const data = await res.json(); if(data.success) alert(data.message); else alert("Erreur: " + data.error) } }} className="bg-red-500 text-white px-3 py-1 rounded text-xs font-bold hover:bg-red-600 transition">📧 Prévenir d'absence</button>)}</div></div>
          <div className="text-sm text-gray-600"><p className="font-medium mb-1">Inscrits ({session.bookings.length}/{session.creneaux.capacite_max}) :</p><div className="flex flex-wrap gap-2">{session.bookings.map((b: any) => (<span key={b.profile_id} className="bg-white px-2 py-1 rounded border shadow-sm text-xs">{b.profiles.first_name} {b.profiles.last_name}</span>))}{session.bookings.length === 0 && <span className="text-xs text-gray-400 italic">Aucun inscrit</span>}</div></div>
          </div>
        ))}
        {planningSessions.length === 0 && (<div className="text-center py-8 text-gray-400"><p>Aucune session future trouvée.</p></div>)}
        </div></div>
        </div>
      )}

      {/* ONGLET BILAN ANNUEL */}
      {activeTab === 'bilan' && (
        <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {(() => {
          const totalInscriptions = profiles.reduce((sum, p) => { if (!prices) return sum; const isMinor = p.is_minor; switch (p.subscription_type) { case 'annuel': return sum + (isMinor ? prices.tarif_annuel_enfant : prices.tarif_annuelle_adulte); case '3_seances': return sum + (isMinor ? prices.tarif_3_seances_enfant : prices.tarif_3_seances_adulte); case '5_seances': return sum + (isMinor ? prices.tarif_5_seances_enfant : prices.tarif_5_seances_adulte); case '10_seances': return sum + (isMinor ? prices.tarif_10_seances_enfant : prices.tarif_10_seances_adulte); default: return sum; } }, 0);
          const totalCuis = yearCreations.reduce((sum: number, c: any) => sum + c.cost, 0);
          const totalPay = yearPaiements.reduce((sum: number, p: any) => sum + p.montant, 0);
          const solde = totalInscriptions + totalCuis - totalPay;
          const totalKg = yearCreations.reduce((sum: number, c: any) => sum + c.weight_kg, 0);
          return (<><div className="bg-white p-4 rounded-xl shadow-sm border text-center"><p className="text-xs text-gray-500 uppercase font-bold">Inscriptions</p><p className="text-2xl font-bold text-green-700 mt-1">{totalInscriptions.toFixed(2)}€</p></div><div className="bg-white p-4 rounded-xl shadow-sm border text-center"><p className="text-xs text-gray-500 uppercase font-bold">Cuissons</p><p className="text-2xl font-bold text-blue-700 mt-1">{totalCuis.toFixed(2)}€</p><p className="text-xs text-gray-400 mt-1">{totalKg.toFixed(1)} kg</p></div><div className="bg-white p-4 rounded-xl shadow-sm border text-center"><p className="text-xs text-gray-500 uppercase font-bold">Encaissé</p><p className="text-2xl font-bold text-green-500 mt-1">{totalPay.toFixed(2)}€</p></div><div className={`p-4 rounded-xl shadow-sm border text-center ${solde > 0 ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}><p className="text-xs text-gray-500 uppercase font-bold">Solde dû total</p><p className={`text-2xl font-bold mt-1 ${solde > 0 ? 'text-red-600' : 'text-green-600'}`}>{solde.toFixed(2)}€</p></div></>)
        })()}
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100"><h3 className="font-bold text-lg text-green-800 mb-4">Solde des élèves ({profiles.length})</h3><div className="overflow-x-auto"><table className="w-full text-sm text-left"><thead className="text-xs text-gray-500 uppercase border-b"><tr><th className="py-3 px-2">Nom</th><th className="py-3 px-2">Forfait</th><th className="py-3 px-2">Séances rest.</th></tr></thead><tbody>{profiles.map(p => (<tr key={p.id} className="border-b hover:bg-gray-50"><td className="py-3 px-2 font-medium text-gray-900">{p.last_name} {p.first_name}</td><td className="py-3 px-2 text-gray-600">{p.subscription_type.replace('_', ' ')}</td><td className="py-3 px-2 text-gray-600">{p.subscription_type === 'annuel' ? 'Illimité' : p.sessions_left}</td></tr>))}</tbody></table></div></div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100"><h3 className="font-bold text-lg text-green-800 mb-4">Créations de l'année ({yearCreations.length} pièces)</h3>{yearCreations.length === 0 ? <p className="text-sm text-gray-400">Aucune création.</p> : (<div className="max-h-96 overflow-y-auto space-y-2">{yearCreations.map((c: any) => (<div key={c.id} className="flex justify-between items-center text-sm bg-gray-50 p-2 rounded border"><div><span className="font-medium text-gray-800">{c.piece_name || 'Sans nom'}</span><span className="text-gray-400 ml-2">par {c.profiles?.first_name} {c.profiles?.last_name}</span></div><div className="text-right"><span className="text-gray-600 mr-4">{Math.round(c.weight_kg * 1000)}g / {c.firing_passes} cuis.</span><span className="font-bold text-blue-700">{c.cost.toFixed(2)}€</span></div></div>))}</div>)}</div>
        </div>
      )}

      </div>
      </div>
    )
}
