import bouderkaLogo from '../assets/logos/bouderka.png'
import volkswagenLogo from '../assets/logos/volkswagen.svg'
import audiLogo from '../assets/logos/audi.svg'
import skodaLogo from '../assets/logos/skoda.svg'
import porscheLogo from '../assets/logos/porsche.svg'

const brandLogos = {
  bouderka: bouderkaLogo,
  volkswagen: volkswagenLogo,
  audi: audiLogo,
  skoda: skodaLogo,
  porsche: porscheLogo,
}

const Logo = ({ type = 'bouderka', className = '' }) => {
  const src = brandLogos[type]
  if (!src) return null
  return <img src={src} alt={type} className={`w-auto object-contain ${className}`} loading="eager" />
}

export default Logo
