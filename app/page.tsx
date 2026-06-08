import Image from 'next/image'
import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-green-50 text-gray-800">

    {/* 1. HERO SECTION - Accroche visuelle */}
    <div className="bg-green-900 text-white py-12 px-4 md:px-8 overflow-hidden">
    <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-8 md:gap-12">

    {/* L'image à gauche - SANS ROGNAGE */}
    <div className="w-full md:w-3/5 flex justify-center">
    <Image
    src="/8.jpg"
    alt="Créations de l'atelier Rêve de Porcelaine"
    width={600}
    height={800}
    className="w-full h-auto max-w-xl rounded-2xl shadow-2xl border-4 border-yellow-400"
    priority
    />
    </div>

    {/* Le texte et le logo à droite */}
    <div className="w-full md:w-2/5 text-center md:text-left z-10">
    <div className="mb-6 flex justify-center md:justify-start">
    <Image
    src="/logo.png"
    alt="Logo"
    width={90}
    height={90}
    className="rounded-full shadow-lg border-4 border-yellow-400"
    />
    </div>
    <h1 className="text-3xl md:text-4xl font-bold text-yellow-300 mb-4">
    Rêve de Porcelaine
    </h1>
    <p className="text-lg text-green-100 mb-8 italic">
    "Élargis ton champ des possibles"
    </p>
    <Link
    href="/dashboard"
    className="inline-block bg-yellow-400 text-green-900 font-bold py-4 px-8 rounded-full text-lg shadow-lg hover:bg-yellow-300 transition-colors"
    >
    Inscription & Espace Élève
    </Link>
    </div>

    </div>
    </div>

    {/* 2. FONCTIONNEMENT */}
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
    <p className="text-center text-sm text-gray-500 mt-4">Les cours sont limités à <strong>8 personnes</strong> par créneau. (Les absences des forfaits annuels libèrent des places pour les élèves à la carte).</p>
    </div>

    {/* 3. PLANNING */}
    <div className="bg-white py-12 px-4">
    <div className="max-w-3xl mx-auto">
    <h2 className="text-3xl font-bold text-green-800 text-center mb-8">Planning 2025 - 2026</h2>
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
    <tr className="border-b bg-green-50">
    <td className="p-3 font-semibold">Mardi</td>
    <td className="p-3">Adultes</td>
    <td className="p-3">19h - 21h</td>
    </tr>
    <tr className="border-b">
    <td className="p-3 font-semibold" rowSpan={2}>Mercredi</td>
    <td className="p-3">Enfants 5-7 ans</td>
    <td className="p-3">10h30 - 12h</td>
    </tr>
    <tr className="border-b bg-green-50">
    <td className="p-3">Enfants 8 ans +</td>
    <td className="p-3">15h30 - 17h</td>
    </tr>
    <tr className="border-b">
    <td className="p-3 font-semibold" rowSpan={2}>Jeudi</td>
    <td className="p-3">Adultes</td>
    <td className="p-3">14h - 16h</td>
    </tr>
    <tr className="border-b bg-green-50">
    <td className="p-3">Adultes</td>
    <td className="p-3">19h - 21h</td>
    </tr>
    <tr>
    <td className="p-3 font-semibold">Samedi</td>
    <td className="p-3">Adultes</td>
    <td className="p-3">10h - 12h</td>
    </tr>
    </tbody>
    </table>
    </div>
    </div>
    </div>

    {/* 4. TARIFS */}
    <div className="max-w-4xl mx-auto py-12 px-4">
    <h2 className="text-3xl font-bold text-green-800 text-center mb-8">Formules et Tarifs</h2>
    <div className="grid md:grid-cols-2 gap-6">
    {/* Tarifs Enfants */}
    <div className="bg-yellow-50 p-6 rounded-xl border border-yellow-200">
    <h3 className="font-bold text-xl text-yellow-800 mb-4 text-center">Enfants / Ados</h3>
    <div className="space-y-2">
    <div className="flex justify-between py-2 border-b border-yellow-200"><span>1 séance</span><span className="font-bold">30 €</span></div>
    <div className="flex justify-between py-2 border-b border-yellow-200"><span>3 séances</span><span className="font-bold">80 €</span></div>
    <div className="flex justify-between py-2 border-b border-yellow-200"><span>5 séances</span><span className="font-bold">120 €</span></div>
    <div className="flex justify-between py-2 border-b border-yellow-200"><span>10 séances</span><span className="font-bold">210 €</span></div>
    <div className="flex justify-between py-2 text-green-800 font-bold bg-green-100 p-2 rounded mt-2"><span>Annuel (33 séances)</span><span>400 €</span></div>
    </div>
    </div>
    {/* Tarifs Adultes */}
    <div className="bg-green-50 p-6 rounded-xl border border-green-200">
    <h3 className="font-bold text-xl text-green-800 mb-4 text-center">Adultes</h3>
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

    {/* 5. MATÉRIAUX & CUISSONS */}
    <div className="bg-white py-12 px-4">
    <div className="max-w-2xl mx-auto text-center">
    <h2 className="text-3xl font-bold text-green-800 mb-4">Matériaux & Cuissons</h2>
    <p className="text-gray-600 mb-6">Travail de la porcelainne blanche, brune ou noire. Décoration aux engobes et émaillage pour la food-safe.</p>
    <div className="flex flex-col md:flex-row justify-center gap-4">
    <div className="bg-green-50 p-4 rounded-lg border border-green-200 flex-1">
    <h4 className="font-bold text-green-800">1 Cuisson</h4>
    <p className="text-2xl font-bold text-yellow-600">6 € / kg</p>
    </div>
    <div className="bg-green-50 p-4 rounded-lg border border-green-200 flex-1">
    <h4 className="font-bold text-green-800">2 Cuissons + Émaillage</h4>
    <p className="text-2xl font-bold text-yellow-600">10 € / kg</p>
    </div>
    </div>
    </div>
    </div>

    {/* 6. FOOTER / CONTACT */}
    <div className="bg-green-900 text-white py-8 px-4 text-center">
    <div className="flex justify-center mb-4">
    <Image src="/1.jpg" alt="Cécile Garou" width={80} height={80} className="rounded-full border-2 border-yellow-400" />
    </div>
    <h3 className="text-xl font-bold text-yellow-300">Cécile GRASSET</h3>
    <p className="text-green-200 mb-2">Atelier Rêve de Porcelaine</p>
    <p className="text-sm text-green-300">30 impasse de Coste Rousse, 34730 Prades-le-Lez</p>
    <p className="text-sm text-green-300 font-semibold mt-1">06 83 89 52 48</p>
    </div>

    </div>
  )
}
