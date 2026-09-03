import Image from 'next/image'
import Link from 'next/link'
import { Caveat } from 'next/font/google'

// Importation de la police manuscrite
const caveat = Caveat({ subsets: ['latin'], weight: ['400', '700'] })

export default function Home() {
  return (
    <div className="min-h-screen bg-green-50 text-gray-800">

    {/* 1. HERO SECTION */}
    <div className="bg-green-900 text-white py-12 px-4 md:px-8 overflow-hidden">
    <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-8 md:gap-12">
    <div className="w-full md:w-3/5 flex justify-center">
    <Image src="/8.jpg" alt="Créations de l'atelier Rêve de Porcelaine" width={600} height={800} className="w-full h-auto max-w-xl rounded-2xl shadow-2xl border-4 border-yellow-400" priority />
    </div>
    <div className="w-full md:w-2/5 text-center md:text-left z-10">
    <div className="mb-6 flex justify-center md:justify-start">
    <Image src="/logo.png" alt="Logo" width={90} height={90} className="rounded-full shadow-lg border-4 border-yellow-400" />
    </div>
    <h1 className="text-3xl md:text-4xl font-bold text-yellow-300 mb-4">Rêve de Porcelaine</h1>
    <p className="text-lg text-green-100 mb-8 italic">"Élargis ton champ des possibles"</p>
    <Link href="/dashboard" className="inline-block bg-yellow-400 text-green-900 font-bold py-4 px-8 rounded-full text-lg shadow-lg hover:bg-yellow-300 transition-colors">
    Inscription & Espace Élève
    </Link>

    {/* Réseaux sociaux dans l'en-tête */}
    <div className="flex justify-center md:justify-start gap-8 mt-8">
    <a href="https://www.facebook.com/profile.php?id=100073503703378&locale=fr_FR" target="_blank" rel="noopener noreferrer" className="text-white hover:text-yellow-300 transition flex items-center gap-2">
    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
    <span>Facebook</span>
    </a>
    <a href="https://www.instagram.com/cecilegrassetceramiste/" target="_blank" rel="noopener noreferrer" className="text-white hover:text-yellow-300 transition flex items-center gap-2">
    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
    <span>Instagram</span>
    </a>
    </div>

    </div>
    </div>
    </div>

    {/* 2. PHILOSOPHIE */}
    <div className="bg-white py-16 px-4">
    <div className="max-w-3xl mx-auto text-center space-y-4">
    <h2 className="text-3xl md:text-4xl font-bold text-green-800">100% Déconnexion sur Prades-le-Lez</h2>
    <p className="text-xl md:text-2xl text-gray-700 font-medium italic">Les mains dans la terre, l'esprit au repos.</p>
    <p className="text-lg text-gray-600 leading-relaxed">Découvrez le plaisir de partager un moment de convivialité en apprenant des techniques accessibles à tous.</p>
    </div>
    </div>

    {/* 3. COURS D'ÉTÉ */}
    <div className="max-w-4xl mx-auto py-8 px-4">
    <div className="bg-green-50 rounded-2xl shadow-lg overflow-hidden border-2 border-yellow-400 flex flex-col md:flex-row">
    <div className="md:w-1/3 bg-yellow-100 flex items-center justify-center p-8">
    <div className="text-center">
    <p className="text-6xl">☀️</p>
    <p className="text-2xl font-bold text-green-800 mt-4">Cours d'Été</p>
    </div>
    </div>
    <div className="md:w-2/3 p-6 md:p-8 flex flex-col justify-center">
    <h3 className="text-2xl font-bold text-green-800 mb-2">Envie d'une pause créative cet été ?</h3>
    <p className="text-gray-700 mb-4">Venez découvrir la <strong>Faïence Ivoire, Rouge et Noire</strong>. Des sessions ouvertes à tous (adultes et enfants) pour un été 100% fait main !</p>
    <Link href="/stages/ete" className="inline-block bg-green-700 text-white font-bold py-3 px-6 rounded-lg hover:bg-green-800 transition w-fit">
    Voir le programme d'été →
    </Link>
    </div>
    </div>
    </div>

    {/* 4. FONCTIONNEMENT */}
    <div className="max-w-4xl mx-auto py-12 px-4">
    <h2 className="text-3xl font-bold text-green-800 text-center mb-8">Fonctionnement</h2>
    <div className="grid md:grid-cols-2 gap-6">
    <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-yellow-400">
    <h3 className="font-bold text-xl text-green-700 mb-2">Formule Annuelle</h3>
    <p className="text-gray-600 mb-4">Un créneau fixe garanti toute l'année pour une progression régulière.</p>
    <ul className="list-disc list-inside text-sm text-gray-500 space-y-1">
    <li>33 séances de septembre à juin</li>
    <li>Créativité soutenue par la dynamique de groupe</li>
    <li>Priorité sur le choix des places</li>
    </ul>
    </div>
    <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-green-400">
    <h3 className="font-bold text-xl text-green-700 mb-2">Formules à la Carte</h3>
    <p className="text-gray-600 mb-4">La liberté de venir selon vos envies et les places disponibles.</p>
    <ul className="list-disc list-inside text-sm text-gray-500 space-y-1">
    <li>Cartes de 3, 5 ou 10 séances</li>
    <li>Validité d'un an à partir de l'achat</li>
    <li>Réservation des places restantes</li>
    </ul>
    </div>
    </div>
    <p className="text-center text-sm text-gray-500 mt-4">Les cours sont limités à <strong>8 personnes</strong> par créneau.</p>
    </div>

    {/* 5. PLANNING */}
    <div className="bg-white py-12 px-4">
    <div className="max-w-3xl mx-auto">
    <h2 className="text-3xl font-bold text-green-800 text-center mb-8">Planning 2026 - 2027</h2>
    <div className="overflow-x-auto shadow-md rounded-lg">
    <table className="w-full text-left border-collapse">
    <thead>
    <tr className="bg-green-800 text-yellow-300">
    <th className="p-3">Jour</th>
    <th className="p-3">Public</th>
    <th className="p-3">Horaires</th>
    </tr>
    </thead>
    <tbody>
    <tr className="border-b bg-green-50"><td className="p-3 font-semibold">Mardi</td><td className="p-3">Ado et adultes</td><td className="p-3">19h - 21h</td></tr>
    <tr className="border-b"><td className="p-3 font-semibold" rowSpan={2}>Mercredi</td><td className="p-3">Enfants 5-10 ans</td><td className="p-3">10h30 - 12h</td></tr>
    <tr className="border-b bg-green-50"><td className="p-3">Ado et adultes</td><td className="p-3">17h - 19h</td></tr>
    <tr className="border-b"><td className="p-3 font-semibold" rowSpan={2}>Jeudi</td><td className="p-3">Ado et adultes</td><td className="p-3">14h - 16h</td></tr>
    <tr className="border-b bg-green-50"><td className="p-3">Ado et adultes</td><td className="p-3">19h - 21h</td></tr>
    <tr><td className="p-3 font-semibold">Samedi</td><td className="p-3">Ado et adultes</td><td className="p-3">10h - 12h</td></tr>
    </tbody>
    </table>
    </div>
    </div>
    </div>

    {/* 6. TARIFS */}
    <div className="max-w-4xl mx-auto py-12 px-4">
    <h2 className="text-3xl font-bold text-green-800 text-center mb-8">Formules et Tarifs</h2>
    <div className="grid md:grid-cols-2 gap-6">
    <div className="bg-yellow-50 p-6 rounded-xl border border-yellow-200">
    <h3 className="font-bold text-xl text-yellow-800 mb-4 text-center">Mercredi Matin Enfants</h3>
    <div className="space-y-2">
    <div className="flex justify-between py-2 border-b border-yellow-200"><span>1 séance</span><span className="font-bold">30 €</span></div>
    <div className="flex justify-between py-2 border-b border-yellow-200"><span>3 séances</span><span className="font-bold">80 €</span></div>
    <div className="flex justify-between py-2 border-b border-yellow-200"><span>5 séances</span><span className="font-bold">120 €</span></div>
    <div className="flex justify-between py-2 border-b border-yellow-200"><span>10 séances</span><span className="font-bold">210 €</span></div>
    <div className="flex justify-between py-2 text-green-800 font-bold bg-green-100 p-2 rounded mt-2"><span>Annuel (33 séances)</span><span>400 €</span></div>
    </div>
    </div>
    <div className="bg-green-50 p-6 rounded-xl border border-green-200">
    <h3 className="font-bold text-xl text-green-800 mb-4 text-center">Ados / Adultes</h3>
    <div className="space-y-2">
    <div className="flex justify-between py-2 border-b border-green-200"><span>1 séance</span><span className="font-bold">40 €</span></div>
    <div className="flex justify-between py-2 border-b border-green-200"><span>3 séances</span><span className="font-bold">110 €</span></div>
    <div className="flex justify-between py-2 border-b border-green-200"><span>5 séances</span><span className="font-bold">150 €</span></div>
    <div className="flex justify-between py-2 border-b border-green-200"><span>10 séances</span><span className="font-bold">230 €</span></div>
    <div className="flex justify-between py-2 text-green-800 font-bold bg-green-100 p-2 rounded mt-2"><span>Annuel (33 séances)</span><span>500 €</span></div>
    </div>
    </div>
    </div>
    </div>

    {/* 7. MATÉRIAUX & CUISSONS (TEXTE POETIQUE MANUSCRIT) */}
    <div className="bg-white py-16 px-4">
    <div className="max-w-3xl mx-auto text-center">
    <h2 className="text-3xl font-bold text-green-800 mb-10"> Coût Matériaux & Cuissons</h2>

    <div className={`text-2xl md:text-3xl text-gray-900 leading-snug space-y-1 ${caveat.className}`}>
    <p>Les argiles utilisées sont des faïences de couleurs différentes : <strong>Ivoire, Rouge ou Noire</strong>.</p>
    <p>Les pièces sont décorées avec une peinture spéciale pour céramique (engobes).</p>
    <p>Après la première cuisson, les pièces peuvent être émaillées et cuite une seconde fois afin de les rendres imperméables et utilisables à des fins alimentaires.</p>

    <div className="pt-6 mt-6 border-t border-green-100">
    <p className="mb-4 font-bold text-green-800 text-3xl md:text-4xl">Coût Cuisson:</p>
    <p><span className="text-red-600 font-bold text-3xl md:text-4xl">6 €</span> le kg de terre pour 1 cuisson (décoration aux engobes)</p>
    <p><span className="text-red-600 font-bold text-3xl md:text-4xl">10 €</span> le kg de terre pour 2 cuissons + émaillage</p>
    </div>
    </div>

    </div>
    </div>

    {/* 8. FOOTER / CONTACT (IMAGE A GAUCHE, TEXTE A DROITE) */}
    <div className="bg-green-900 text-white py-12 px-4 md:px-8">
    <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-8 md:gap-16">

    {/* Image à gauche */}
    <div className="w-full md:w-1/3 flex justify-center">
    <Image src="/1.jpg" alt="Cécile Grasset" width={300} height={300} className="rounded-2xl shadow-2xl border-4 border-yellow-400" />
    </div>

    {/* Texte à droite */}
    <div className="w-full md:w-2/3 text-center md:text-left">
    <h3 className="text-2xl font-bold text-yellow-300 mb-2">Cécile GRASSET</h3>
    <p className="text-green-200 mb-4 text-lg">Atelier Rêve de Porcelaine</p>
    <p className="text-green-300">30 impasse de Coste Rousse, 34730 Prades-le-Lez</p>
    <p className="text-green-100 font-bold text-xl mt-2 mb-6">06 83 89 52 48</p>

    <div className="border-t border-green-800 pt-4 text-sm text-green-400">
    © 2024 Rêve de Porcelaine - MisterHur & Z.AI
    </div>
    </div>

    </div>
    </div>

    </div>
  )
}
