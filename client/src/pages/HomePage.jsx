import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'

const slides = [
  {
    image: 'https://bouderka.ma/storage/2023/11/BOUDRKA-FACADE-scaled.jpg',
    alt: 'Bouderka Concessionnaire',
  },
  {
    image: 'https://bouderka.ma/storage/2023/11/GAL4-1-scaled.jpg',
    alt: 'Showroom Bouderka',
  },
  {
    image: 'https://www.decoactuelle.ma/wp-content/uploads/2024/02/PME24_0026_fine.jpg',
    alt: 'Espace Premium Bouderka',
  },
]

export default function HomePage() {
  const [current, setCurrent] = useState(0)
  const [paused, setPaused] = useState(false)

  const next = useCallback(() => {
    setCurrent((c) => (c + 1) % slides.length)
  }, [])

  const prev = useCallback(() => {
    setCurrent((c) => (c - 1 + slides.length) % slides.length)
  }, [])

  useEffect(() => {
    if (paused) return
    const timer = setInterval(next, 5000)
    return () => clearInterval(timer)
  }, [next, paused])

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans">
      <Navbar />

      {/* ─── HERO ─── */}
      <section id="hero" className="relative overflow-hidden pt-20 lg:pt-24">
        {/* ── Carousel ── */}
        <div
          className="relative w-full h-[60vh] sm:h-[70vh] lg:h-[85vh]"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          {slides.map((slide, i) => (
            <div
              key={i}
              className="absolute inset-0 transition-opacity duration-1000 ease-in-out"
              style={{ opacity: i === current ? 1 : 0, zIndex: i === current ? 1 : 0 }}
            >
              <img
                src={slide.image}
                alt={slide.alt}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
            </div>
          ))}

          {/* ── Flèche gauche ── */}
          <button
            onClick={prev}
            className="absolute left-4 sm:left-6 lg:left-8 top-1/2 -translate-y-1/2 z-20 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white hover:bg-white/40 transition-all duration-300"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* ── Flèche droite ── */}
          <button
            onClick={next}
            className="absolute right-4 sm:right-6 lg:right-8 top-1/2 -translate-y-1/2 z-20 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white hover:bg-white/40 transition-all duration-300"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* ── Texte superposé ── */}
          <div className="absolute inset-0 z-10 flex items-center">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
              <div className="max-w-xl">
                <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/15 backdrop-blur-sm border border-white/20 text-white text-sm font-semibold mb-6">
                  <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                  Concessionnaire officiel à Marrakech
                </span>
                <h1 className="text-4xl sm:text-5xl lg:text-[3.5rem] xl:text-7xl font-extrabold leading-[1.1] tracking-tight text-white drop-shadow-lg">
                  Trouvez le{" "}
                  <span className="text-blue-300">véhicule idéal</span>{" "}
                  en toute confiance
                </h1>
                <p className="mt-6 text-lg sm:text-xl text-white/80 max-w-xl leading-relaxed drop-shadow">
                  Vente, entretien et services automobiles. Bouderka SARL vous
                  accompagne à chaque étape avec expertise et transparence.
                </p>
                <div className="mt-10 flex flex-wrap gap-4">
                  <Link
                    to="/catalogue/volkswagen"
                    className="inline-flex items-center px-7 py-3.5 rounded-full bg-white text-gray-900 font-semibold hover:bg-gray-100 transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                  >
                    Voir le catalogue
                  </Link>
                  <a
                    href="#contact"
                    className="inline-flex items-center px-7 py-3.5 rounded-full border-2 border-white/40 text-white font-semibold hover:bg-white/10 transition-all duration-300 hover:-translate-y-0.5"
                  >
                    Nous contacter
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* ── Indicateurs (dots) ── */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2.5">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`h-2 rounded-full transition-all duration-500 ${
                  i === current
                    ? 'w-8 bg-white'
                    : 'w-2 bg-white/40 hover:bg-white/60'
                }`}
              />
            ))}
          </div>

          {/* ── Cartes flottantes ── */}
          {/* Garantie */}
          <div className="hidden sm:block absolute bottom-20 left-8 lg:left-16 z-20 bg-white rounded-2xl shadow-xl shadow-black/10 border border-gray-100 px-4 py-3 flex items-center gap-3 animate-[float_4s_ease-in-out_infinite]">
            <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <div className="text-xs font-bold text-gray-900">Garantie</div>
              <div className="text-[11px] text-gray-400">Jusqu'à 2 ans</div>
            </div>
          </div>

          {/* Livraison */}
          <div className="hidden sm:block absolute top-8 right-8 lg:right-16 z-20 bg-white rounded-2xl shadow-xl shadow-black/10 border border-gray-100 px-4 py-3 flex items-center gap-3 animate-[float_4s_ease-in-out_infinite_1s]">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
              </svg>
            </div>
            <div>
              <div className="text-xs font-bold text-gray-900">Livraison</div>
              <div className="text-[11px] text-gray-400">Gratuite à domicile</div>
            </div>
          </div>

          {/* Test Drive */}
          <div className="hidden sm:block absolute bottom-32 right-8 lg:right-20 z-20 bg-white rounded-2xl shadow-xl shadow-black/10 border border-gray-100 px-4 py-3 flex items-center gap-3 animate-[float_4s_ease-in-out_infinite_2s]">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <div className="text-xs font-bold text-gray-900">Test Drive</div>
              <div className="text-[11px] text-gray-400">Réservation rapide</div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── NOS SERVICES ─── */}
      <section id="services" className="py-20 lg:py-28 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-primary font-semibold text-sm uppercase tracking-wider">
              Ce que nous offrons
            </span>
            <h2 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight">
              Nos Services
            </h2>
            <p className="mt-4 text-gray-500 text-lg max-w-2xl mx-auto">
              Des solutions complètes pour répondre à tous vos besoins automobiles.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: "Vente de véhicules", desc: "Large choix de véhicules neufs et d'occasion, inspectés et garantis." },
              { title: "Entretien & Réparation", desc: "Atelier équipé avec des techniciens certifiés pour l'entretien de votre véhicule." },
              { title: "Garantie étendue", desc: "Options de garantie prolongée pour votre tranquillité d'esprit." },
              { title: "Financement", desc: "Solutions de financement flexibles adaptées à votre budget." },
              { title: "Prise de rendez-vous", desc: "Planifiez vos visites et services en ligne, à tout moment." },
              { title: "Conseil personnalisé", desc: "Une équipe dédiée pour vous guider dans vos choix." },
            ].map((s) => (
              <div
                key={s.title}
                className="p-8 rounded-2xl bg-white border border-gray-100 hover:shadow-lg transition-shadow duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-5">
                  <span className="text-primary text-xl font-bold">
                    {s.title.charAt(0)}
                  </span>
                </div>
                <h3 className="text-lg font-bold mb-2">{s.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── MARQUES ─── */}
      <section id="vehicules" className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-primary font-semibold text-sm uppercase tracking-wider">
              Nos marques
            </span>
            <h2 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight">
              Explorez par marque
            </h2>
            <p className="mt-4 text-gray-500 text-lg max-w-2xl mx-auto">
              Découvrez notre sélection de véhicules pour chaque marque.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { name: 'Volkswagen', slug: 'volkswagen', desc: 'Allemande, fiable et accessible' },
              { name: 'Škoda', slug: 'skoda', desc: 'Design intelligent, prix malin' },
              { name: 'Audi', slug: 'audi', desc: 'Vorsprung durch Technik' },
              { name: 'Porsche', slug: 'porsche', desc: 'Performance et prestige' },
            ].map((brand) => (
              <Link
                key={brand.slug}
                to={`/catalogue/${brand.slug}`}
                className="group p-8 rounded-2xl bg-gray-50 border border-gray-100 hover:bg-primary hover:border-primary transition-all duration-300 text-center"
              >
                <div className="w-16 h-16 mx-auto rounded-2xl bg-white shadow-sm flex items-center justify-center mb-5 group-hover:bg-white/20 transition-colors duration-300">
                  <span className="text-2xl font-extrabold text-gray-900 group-hover:text-white transition-colors duration-300">
                    {brand.name.charAt(0)}
                  </span>
                </div>
                <h3 className="text-lg font-bold mb-1 group-hover:text-white transition-colors duration-300">{brand.name}</h3>
                <p className="text-gray-400 text-sm group-hover:text-white/70 transition-colors duration-300">{brand.desc}</p>
                <div className="mt-4 text-primary font-semibold text-sm group-hover:text-white transition-colors duration-300">
                  Voir le catalogue →
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ─── TÉMOIGNAGES ─── */}
      <section id="temoignages" className="py-20 lg:py-28 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-primary font-semibold text-sm uppercase tracking-wider">
              Avis clients
            </span>
            <h2 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight">
              Témoignages
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { name: "Ismail Ibourane", role: "Particulier", text: "Service impeccable du début à la fin. L'équipe est professionnelle et à l'écoute. Je recommande vivement Bouderka." },
              { name: "Sara Bounqourt", role: "Entreprise", text: "Un partenaire de confiance pour notre flotte de véhicules. Réactivité et qualité au rendez-vous." },
              { name: "Nejma Ait El Fels", role: "Particulier", text: "Très satisfaite de mon achat. Transparence totale sur l'état du véhicule et le prix. Merci !" },
            ].map((t) => (
              <div
                key={t.name}
                className="p-8 rounded-2xl bg-white border border-gray-100 hover:shadow-lg transition-shadow duration-300"
              >
                <div className="flex gap-1 mb-4 text-yellow-400">
                  ★★★★★
                </div>
                <p className="text-gray-600 leading-relaxed mb-6">
                  &ldquo;{t.text}&rdquo;
                </p>
                <div>
                  <div className="font-semibold text-sm">{t.name}</div>
                  <div className="text-gray-400 text-xs">{t.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CONTACT ─── */}
      <section id="contact" className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-primary font-semibold text-sm uppercase tracking-wider">
              Parlons de votre projet
            </span>
            <h2 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight">
              Contactez-nous
            </h2>
          </div>
          <div className="grid lg:grid-cols-2 gap-12">
            <div className="space-y-8">
              <div>
                <h4 className="font-bold mb-1">Adresse</h4>
                <p className="text-gray-500 text-sm">Marrakech, Maroc</p>
              </div>
              <div>
                <h4 className="font-bold mb-1">Téléphone</h4>
                <p className="text-gray-500 text-sm">+212 XXX-XXXXXX</p>
              </div>
              <div>
                <h4 className="font-bold mb-1">Email</h4>
                <p className="text-gray-500 text-sm">contact@bouderka.ma</p>
              </div>
              <div>
                <h4 className="font-bold mb-1">Horaires</h4>
                <p className="text-gray-500 text-sm">Lun - Sam : 9h00 - 19h00</p>
              </div>
            </div>
            <div>
              <form className="space-y-5 p-8 rounded-2xl bg-gray-50 border border-gray-100">
                <div className="grid sm:grid-cols-2 gap-5">
                  <input
                    type="text"
                    placeholder="Nom complet"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                  />
                  <input
                    type="email"
                    placeholder="Email"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                  />
                </div>
                <input
                  type="tel"
                  placeholder="Téléphone"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                />
                <textarea
                  rows={4}
                  placeholder="Votre message..."
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors resize-none"
                />
                <button
                  type="button"
                  className="w-full py-3.5 rounded-xl bg-primary text-white font-semibold hover:bg-blue-800 transition-colors shadow-lg shadow-primary/20"
                >
                  Envoyer le message
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="bg-gray-900 text-gray-400 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10">
            <div>
              <span className="text-2xl font-extrabold text-white tracking-tight">
                Bouderka
              </span>
              <p className="mt-4 text-sm leading-relaxed">
                Votre concessionnaire de confiance à Marrakech.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Navigation</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#services" className="hover:text-white transition-colors">Services</a></li>
                <li><a href="#vehicules" className="hover:text-white transition-colors">Marques</a></li>
                <li><a href="#temoignages" className="hover:text-white transition-colors">Témoignages</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Marques</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/catalogue/volkswagen" className="hover:text-white transition-colors">Volkswagen</Link></li>
                <li><Link to="/catalogue/skoda" className="hover:text-white transition-colors">Škoda</Link></li>
                <li><Link to="/catalogue/audi" className="hover:text-white transition-colors">Audi</Link></li>
                <li><Link to="/catalogue/porsche" className="hover:text-white transition-colors">Porsche</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-sm">
                <li>Marrakech, Maroc</li>
                <li>+212 XXX-XXXXXX</li>
                <li>contact@bouderka.ma</li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-gray-800 text-center text-xs">
            &copy; {new Date().getFullYear()} Bouderka SARL. Tous droits réservés.
          </div>
        </div>
      </footer>
    </div>
  )
}
