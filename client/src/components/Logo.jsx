const Logo = ({ className = '' }) => (
  <img
    src="https://bouderka.ma/storage/2023/06/logo.png"
    alt="Bouderka SARL"
    className={`w-auto object-contain invert ${className}`}
    loading="eager"
  />
);

export default Logo;
