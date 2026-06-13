import Image from 'next/image'
import Link from 'next/link'

export default function SummerCoursePage() {
    return (
        <div className="min-h-screen bg-green-50 flex flex-col">

        {/* HEADER */}
        <header className="bg-green-900 text-white py-20 md:py-32 overflow-hidden">
        <div className="relative z-10 max-w-4xl mx-auto text-center px-4 space-y-6">
        <div className="flex justify-center mb-6">
        <Image src="/logo.png" alt="Logo Rêve de Porcelaine" width={100} height={100} className="rounded-full shadow-lg border-4 border-yellow-400" />
        </div>
        <h1 className="text-4xl md:text-6xl font-bold text-yellow-300 tracking-tight">
        Cours d'Été
        </h1>
        <p className="text-xl md:text-2xl font-light text-green-100">
        100% Déconnexion sur Prades-le-Lez
        </p>
        <div className="w-24 h-1 bg-yellow-400 mx-auto"></div>
        </div>
        </header>

        {/* PHILOSOPHIE */}
        <section className="py-16 md:py-24 bg-white">
        <div className="max-w-3xl mx-auto text-center px-4 space-y-6">
        <h2 className="text-3xl md:text-4xl font-bold text-green-800">
        Les mains dans la terre, l'esprit au repos.
        </h2>
        <p className="text-lg text-gray-600 leading-relaxed">
        Découvrez le plaisir de partager un moment de convivialité en apprenant des techniques accessibles à tous.
        </p>
        </div>
        </section>

        {/* DETAIL DES COURS D'ÉTÉ */}
        <section className="py-16 md:py-24 bg-green-50">
        <div className="max-w-6xl mx-auto px-4">
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden md:flex border border-green-100">

        {/* Visuel */}
        <div className="md:w-1/2 relative min-h-[300px] md:min-h-0">
        <Image
        src="/summer.jpg"
        alt="Cours d'été céramique"
        layout="fill"
        objectFit="cover"
        className="absolute inset-0"
        />
        </div>

        {/* Texte et Tarifs - Réduits et espacés */}
        <div className="md:w-1/2 p-6 md:p-8 flex flex-col space-y-4">
        <div className="inline-block bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-bold w-fit">
        Ouvert à tous
        </div>
        <h3 className="text-2xl font-bold text-green-800">
        Envie d'une pause créative cet été ?
        </h3>
        <p className="text-gray-700 text-base leading-relaxed mb-6">
        Venez découvrir la faïence <strong>Ivoire, Rouge et Noire</strong>. Des moments de partage et de création accessibles à tous, pour un été 100% fait main.
        </p>

        {/* GRILLE TARIFAIRE ÉTÉ - Plus compacte */}
        <div className="bg-green-50 p-4 rounded-xl border border-green-200">
        <h4 className="font-bold text-green-800 text-base mb-3 text-center">Tarifs Cours d'Été</h4>
        <div className="space-y-1">
        <div className="flex justify-between py-1.5 border-b border-green-200 text-gray-700 text-sm"><span>1 séance</span><span className="font-bold text-green-800">40 €</span></div>
        <div className="flex justify-between py-1.5 border-b border-green-200 text-gray-700 text-sm"><span>3 séances</span><span className="font-bold text-green-800">110 €</span></div>
        <div className="flex justify-between py-1.5 border-b border-green-200 text-gray-700 text-sm"><span>5 séances</span><span className="font-bold text-green-800">150 €</span></div>
        <div className="flex justify-between py-1.5 text-gray-700 text-sm"><span>10 séances</span><span className="font-bold text-green-800">230 €</span></div>
        </div>
        </div>

        <Link href="/dashboard" className="inline-block bg-green-700 text-white font-bold py-2.5 px-5 rounded-lg hover:bg-green-800 transition text-center text-base shadow-md mt-2">
        Réserver mes cours d'été
        </Link>
        </div>
        </div>
        </div>
        </section>

        {/* FOOTER */}
        <footer className="bg-green-900 text-white py-12 mt-auto">
        <div className="max-w-4xl mx-auto text-center px-4 space-y-6">
        <Link href="/" className="text-yellow-300 hover:text-yellow-400 transition font-bold text-lg">
        ← Retour à l'accueil
        </Link>
        <div className="border-t border-green-800 pt-6 mt-6 text-sm text-green-400">
        © 2024 Rêve de Porcelaine - MisterHur & Z.AI
        </div>
        </div>
        </footer>

        </div>
    )
}
