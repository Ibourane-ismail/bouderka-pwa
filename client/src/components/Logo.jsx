const Logo = ({ className = '' }) => (
  <img
    src="https://bouderka.ma/storage/2023/06/logo.png"
    alt="Bouderka SARL"
    className={`max-w-full w-auto ${className}`}
    loading="eager"
  />
);

export default Logo;
