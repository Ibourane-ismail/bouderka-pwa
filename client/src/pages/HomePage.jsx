import { useState, useEffect, useCallback, useRef } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Logo from '../components/Logo'
import { Car, Wrench, ShieldCheck, CarFront, CalendarCheck, Users } from 'lucide-react'

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
    image: 'https://bouderka.ma/storage/2023/11/GAL5-scaled.jpg',
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

  const aboutRef = useRef(null)

  useEffect(() => {
    const el = aboutRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('is-visible')
          observer.unobserve(el)
        }
      },
      { threshold: 0.15 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

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
              { title: "Vente de véhicules", desc: "Découvrez notre gamme de véhicules neufs des marques Volkswagen, Audi, Škoda et Porsche, garantis constructeur.", icon: Car },
              { title: "Entretien & Réparation", desc: "Atelier équipé avec des techniciens certifiés pour l'entretien de votre véhicule.", icon: Wrench },
              { title: "Garantie étendue", desc: "Options de garantie prolongée pour votre tranquillité d'esprit.", icon: ShieldCheck },
              { title: "Test Drive", desc: "Essayez votre futur véhicule avant de prendre votre décision grâce à une réservation simple et rapide.", icon: CarFront },
              { title: "Prise de rendez-vous", desc: "Planifiez vos visites et services en ligne, à tout moment.", icon: CalendarCheck },
              { title: "Conseil personnalisé", desc: "Une équipe dédiée pour vous guider dans vos choix.", icon: Users },
            ].map((s) => {
              const Icon = s.icon
              return (
              <div
                key={s.title}
                className="group p-8 rounded-2xl bg-white border border-gray-100 hover:shadow-lg hover:scale-[1.02] transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center mb-5 group-hover:bg-primary/10 group-hover:scale-110 transition-all duration-300">
                  <Icon size={24} className="text-gray-900 group-hover:text-primary transition-colors duration-300" />
                </div>
                <h3 className="text-lg font-bold mb-2">{s.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{s.desc}</p>
              </div>
            )})}
          </div>
        </div>
      </section>

      {/* ─── QUI SOMMES-NOUS ? ─── */}
      <section id="vehicules" className="py-24 lg:py-36 bg-white">
        <div
          ref={aboutRef}
          className="about-reveal max-w-[1340px] mx-auto px-5 sm:px-8 lg:px-12"
        >
          <div className="flex flex-col lg:flex-row lg:items-start lg:gap-20">

            {/* ─── Colonne texte ─── */}
            <div className="about-text lg:w-[45%] lg:sticky lg:top-32">
              <span className="inline-block text-primary font-semibold text-[0.7rem] uppercase tracking-[0.25em]">
                Bouderka SARL
              </span>
              <h2 className="mt-5 text-3xl sm:text-4xl lg:text-[2.8rem] font-bold tracking-[-0.025em] leading-[1.1]">
                Qui sommes-nous&nbsp;?
              </h2>
              <p className="mt-4 text-sm font-medium text-gray-400 tracking-wide">
                Plus de 50 ans d'expertise au service de votre mobilité.
              </p>

              <div className="mt-10 space-y-5 text-gray-500 text-[0.975rem] leading-[1.85]">
                <p>
                  Fondée en{' '}
                  <span className="text-primary font-semibold">1973</span>, la Société
                  Bouderka SARL est un concessionnaire automobile exclusif des marques{' '}
                  <span className="text-primary font-semibold">Volkswagen</span>,{' '}
                  <span className="text-primary font-semibold">Audi</span>,{' '}
                  <span className="text-primary font-semibold">Škoda</span> et{' '}
                  <span className="text-primary font-semibold">Porsche</span> à Marrakech.
                </p>
                <p>
                  Forte de plus de{' '}
                  <span className="text-primary font-semibold">50&nbsp;ans d'expérience</span>,
                  l'entreprise est reconnue pour son professionnalisme et son engagement à
                  fournir un service exceptionnel à sa clientèle.
                </p>
                <p>
                  L'équipe de la Société Bouderka SARL est composée d'experts dans leur
                  domaine. Ils sont passionnés par l'automobile et sont toujours à la
                  recherche des dernières innovations. Ils sont également formés aux
                  dernières technologies et méthodes de réparation.
                </p>
                <p>
                  Notre société est fière de ses valeurs. Elle est engagée dans le{' '}
                  <span className="text-primary font-semibold">développement durable</span>{' '}
                  et la{' '}
                  <span className="text-primary font-semibold">
                    responsabilité sociale
                  </span>
                  , et s'engage également à soutenir la communauté locale.
                </p>
              </div>
            </div>

            {/* ─── Galerie ─── */}
            <div className="about-gallery lg:w-[55%] mt-14 lg:mt-0">
              <div className="grid grid-cols-2 grid-rows-2 gap-3.5 h-[420px] sm:h-[520px] lg:h-full lg:min-h-[580px]">
                {/* Image principale — grande, spanning 2 lignes */}
                <div className="col-span-1 row-span-2 rounded-2xl overflow-hidden group shadow-[0_2px_20px_rgba(0,0,0,0.06)]">
                  <img
                    src="https://bouderka.ma/storage/2023/11/meca-scaled.jpg"
                    alt="Atelier Bouderka"
                    className="w-full h-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]"
                    loading="lazy"
                  />
                </div>
                {/* Image secondaire 1 */}
                <div className="col-span-1 row-span-1 rounded-2xl overflow-hidden group shadow-[0_2px_20px_rgba(0,0,0,0.06)]">
                  <img
                    src="https://bouderka.ma/storage/2023/11/GAL1-scaled.jpg"
                    alt="Showroom Bouderka"
                    className="w-full h-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]"
                    loading="lazy"
                  />
                </div>
                {/* Image secondaire 2 */}
                <div className="col-span-1 row-span-1 rounded-2xl overflow-hidden group shadow-[0_2px_20px_rgba(0,0,0,0.06)]">
                  <img
                    src="https://bouderka.ma/storage/2023/11/GAL2-scaled.jpg"
                    alt="Véhicules Bouderka"
                    className="w-full h-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]"
                    loading="lazy"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ─── MARQUES ─── */}
          <div className="mt-28 lg:mt-36">
            <span className="inline-block text-primary font-semibold text-[0.7rem] uppercase tracking-[0.25em]">
              Nos marques
            </span>
            <h3 className="mt-5 text-3xl sm:text-4xl lg:text-[2.8rem] font-bold tracking-[-0.025em] leading-[1.1]">
              Explorez par marque
            </h3>
            <p className="mt-4 text-gray-400 text-[0.975rem] leading-[1.85]">
              Découvrez notre sélection de véhicules pour chaque marque.
            </p>
            <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
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
                    <Logo type={brand.slug} className="h-10 w-10" />
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
                <p className="text-gray-500 text-sm">
                  <a href="tel:+212524296400" className="hover:text-primary transition-colors">+212 5 24 29 64 00</a>
                  <br />
                  <a href="tel:+212661432158" className="hover:text-primary transition-colors">+212 6 61 43 21 58</a>
                </p>
              </div>
              <div>
                <h4 className="font-bold mb-1">Email</h4>
                <p className="text-gray-500 text-sm">
                  <a href="mailto:contact@bouderka.ma" className="hover:text-primary transition-colors">contact@bouderka.ma</a>
                </p>
              </div>
              <div>
                <h4 className="font-bold mb-1">Horaires</h4>
                <div className="text-gray-500 text-sm leading-relaxed">
                  <p>Lundi à Vendredi</p>
                  <p className="font-semibold">08h00 – 13h00 / 14h00 – 17h00</p>
                  <p className="mt-2">Samedi</p>
                  <p className="font-semibold">08h00 – 12h00</p>
                </div>
              </div>
            </div>
            <div className="p-8 rounded-2xl bg-gray-50 border border-gray-100 flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mb-5">
                <svg className="w-7 h-7 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
              </div>
              <h4 className="text-xl font-bold mb-3">Besoin d'informations ?</h4>
              <p className="text-gray-500 text-sm leading-relaxed mb-6">
                Notre équipe est disponible pour répondre à vos questions concernant nos véhicules, les rendez-vous atelier ou les essais.
              </p>
              <a
                href="https://wa.me/212661432158"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-green-600 text-white font-semibold hover:bg-green-700 transition-colors shadow-lg shadow-green-600/20"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                Contacter via WhatsApp
              </a>
              <p className="text-gray-400 text-xs mt-4">
                Réponse généralement en quelques minutes pendant les heures d'ouverture.
              </p>
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
                <li>
                  <a href="tel:+212524296400" className="hover:text-white transition-colors">+212 5 24 29 64 00</a>
                  <br />
                  <a href="tel:+212661432158" className="hover:text-white transition-colors">+212 6 61 43 21 58</a>
                </li>
                <li>
                  <a href="mailto:contact@bouderka.ma" className="hover:text-white transition-colors">contact@bouderka.ma</a>
                </li>
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
