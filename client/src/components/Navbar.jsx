import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Logo from './Logo'

const dashboards = {
  CLIENT: '/client/dashboard',
  COMMERCIAL: '/commercial/dashboard',
  CHEF_ATELIER: '/atelier/dashboard',
  ADMIN: '/admin/dashboard',
}

const brands = [
  { name: 'Volkswagen', slug: 'volkswagen' },
  { name: 'Škoda', slug: 'skoda' },
  { name: 'Audi', slug: 'audi' },
  { name: 'Porsche', slug: 'porsche' },
]

const navLinks = [
  { label: 'Accueil', href: '#hero' },
  { label: 'Services', href: '#services' },
  { label: 'Qui sommes-nous ?', href: '#vehicules' },
  { label: 'Contact', href: '#contact' },
]

export default function Navbar() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [vehiculesOpen, setVehiculesOpen] = useState(false)
  const [desktopDropdown, setDesktopDropdown] = useState(false)
  const dropdownRef = useRef(null)
  const timeoutRef = useRef(null)

  useEffect(() => {
    if (location.state?.scrollTo) {
      const scrollId = location.state.scrollTo
      const doScroll = () => {
        const el = document.querySelector(scrollId)
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' })
          return true
        }
        return false
      }
      if (!doScroll()) {
        const timer = setInterval(() => {
          if (doScroll()) clearInterval(timer)
        }, 100)
        setTimeout(() => clearInterval(timer), 3000)
      }
      window.history.replaceState({}, document.title)
    }
  }, [location.state])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  useEffect(() => {
    return () => { if (timeoutRef.current) clearTimeout(timeoutRef.current) }
  }, [])

  const handleNav = (e, href) => {
    e.preventDefault()
    setMobileOpen(false)
    setVehiculesOpen(false)
    const el = document.querySelector(href)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' })
    } else {
      navigate('/', { state: { scrollTo: href }, replace: true })
    }
  }

  const handleDesktopEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    setDesktopDropdown(true)
  }

  const handleDesktopLeave = () => {
    timeoutRef.current = setTimeout(() => setDesktopDropdown(false), 150)
  }

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/90 backdrop-blur-xl shadow-sm border-b border-gray-100'
          : 'bg-transparent'
      }`}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-[4.5rem] lg:h-[5.5rem]">

          {/* Logo */}
          <a href="#hero" onClick={(e) => handleNav(e, '#hero')} className="flex-shrink-0 flex items-center">
            <Logo className="h-12 lg:h-16" />
          </a>

          {/* Desktop nav */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => handleNav(e, link.href)}
                className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-primary rounded-lg hover:bg-primary/5 transition-colors"
              >
                {link.label}
              </a>
            ))}

            {/* Véhicules dropdown - Desktop */}
            <div
              className="relative"
              ref={dropdownRef}
              onMouseEnter={handleDesktopEnter}
              onMouseLeave={handleDesktopLeave}
            >
              <a
                href="#vehicules"
                onClick={(e) => handleNav(e, '#vehicules')}
                className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-primary rounded-lg hover:bg-primary/5 transition-colors inline-flex items-center gap-1"
              >
                Véhicules
                <svg
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${desktopDropdown ? 'rotate-180' : ''}`}
                  fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </a>

              {desktopDropdown && (
                <div className="absolute top-full left-0 pt-2 w-56">
                  <div className="bg-white rounded-xl shadow-xl shadow-black/8 border border-gray-100 py-2 overflow-hidden">
                    {brands.map((brand) => (
                      <Link
                        key={brand.slug}
                        to={`/catalogue/${brand.slug}`}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-primary/5 hover:text-primary transition-colors"
                        onClick={() => setDesktopDropdown(false)}
                      >
                        <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center flex-shrink-0">
                          <Logo type={brand.slug} className="h-5 w-5" />
                        </div>
                        <span className="font-medium">{brand.name}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <a
              href="#temoignages"
              onClick={(e) => handleNav(e, '#temoignages')}
              className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-primary rounded-lg hover:bg-primary/5 transition-colors"
            >
              Avis
            </a>
          </div>

          {/* Desktop CTA */}
          <div className="hidden lg:flex items-center gap-3">
            <Link
              to={user ? '/client/rdv' : '/login'}
              state={!user ? { from: { pathname: '/client/rdv' } } : undefined}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white text-sm font-semibold rounded-full hover:bg-blue-800 transition-colors shadow-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Prendre un RDV
            </Link>
            {user ? (
              <Link
                to={dashboards[user.role] || '/login'}
                className="inline-flex items-center gap-2 px-5 py-2.5 border-2 border-gray-200 text-gray-700 text-sm font-semibold rounded-full hover:border-primary hover:text-primary transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Mon espace
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-primary transition-colors"
                >
                  Connexion
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center px-5 py-2.5 border-2 border-gray-200 text-gray-700 text-sm font-semibold rounded-full hover:border-primary hover:text-primary transition-colors"
                >
                  Inscription
                </Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden relative w-10 h-10 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Menu"
          >
            <div className="w-5 h-4 flex flex-col justify-between">
              <span
                className={`block h-0.5 bg-gray-700 rounded-full transition-all duration-300 origin-center ${
                  mobileOpen ? 'rotate-45 translate-y-[7px]' : ''
                }`}
              />
              <span
                className={`block h-0.5 bg-gray-700 rounded-full transition-all duration-200 ${
                  mobileOpen ? 'opacity-0 scale-0' : ''
                }`}
              />
              <span
                className={`block h-0.5 bg-gray-700 rounded-full transition-all duration-300 origin-center ${
                  mobileOpen ? '-rotate-45 -translate-y-[7px]' : ''
                }`}
              />
            </div>
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      <div
        className={`lg:hidden fixed inset-x-0 top-[4.5rem] bottom-0 bg-white transition-all duration-300 ${
          mobileOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 py-6 flex flex-col h-full overflow-y-auto">
          <div className="flex-1 space-y-1">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => handleNav(e, link.href)}
                className="block px-4 py-3 text-base font-medium text-gray-700 hover:text-primary hover:bg-primary/5 rounded-xl transition-colors"
              >
                {link.label}
              </a>
            ))}

            {/* Véhicules accordion - Mobile */}
            <div>
              <button
                onClick={() => setVehiculesOpen(!vehiculesOpen)}
                className="w-full flex items-center justify-between px-4 py-3 text-base font-medium text-gray-700 hover:text-primary hover:bg-primary/5 rounded-xl transition-colors"
              >
                <span>Véhicules</span>
                <svg
                  className={`w-4 h-4 transition-transform duration-200 ${vehiculesOpen ? 'rotate-180' : ''}`}
                  fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div
                className={`overflow-hidden transition-all duration-300 ${
                  vehiculesOpen ? 'max-h-60 opacity-100' : 'max-h-0 opacity-0'
                }`}
              >
                <div className="pl-6 pb-1">
                  {brands.map((brand) => (
                    <Link
                      key={brand.slug}
                      to={`/catalogue/${brand.slug}`}
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-600 hover:text-primary hover:bg-primary/5 rounded-lg transition-colors"
                    >
                      <div className="w-7 h-7 rounded-lg bg-gray-50 flex items-center justify-center flex-shrink-0">
                        <Logo type={brand.slug} className="h-4 w-4" />
                      </div>
                      {brand.name}
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            <a
              href="#temoignages"
              onClick={(e) => handleNav(e, '#temoignages')}
              className="block px-4 py-3 text-base font-medium text-gray-700 hover:text-primary hover:bg-primary/5 rounded-xl transition-colors"
            >
              Avis
            </a>
          </div>

          <div className="pt-4 border-t border-gray-100 space-y-3">
            <Link
              to={user ? '/client/rdv' : '/login'}
              state={!user ? { from: { pathname: '/client/rdv' } } : undefined}
              onClick={() => setMobileOpen(false)}
              className="flex items-center justify-center gap-2 w-full py-3 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-blue-800 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Prendre un RDV
            </Link>
            {user ? (
              <Link
                to={dashboards[user.role] || '/login'}
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-center gap-2 w-full py-3 border-2 border-gray-200 text-gray-700 text-sm font-semibold rounded-xl hover:border-primary hover:text-primary transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Mon espace
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-center w-full py-3 border-2 border-gray-200 text-gray-700 text-sm font-semibold rounded-xl hover:border-primary hover:text-primary transition-colors"
                >
                  Connexion
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-center w-full py-3 border-2 border-gray-200 text-gray-700 text-sm font-semibold rounded-xl hover:border-primary hover:text-primary transition-colors"
                >
                  Inscription
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
