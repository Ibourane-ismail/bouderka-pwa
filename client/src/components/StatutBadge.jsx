const statutConfig = {
  DISPONIBLE: { className: 'statut-badge-disponible', label: 'Disponible' },
  CONFIRME: { className: 'statut-badge-confirme', label: 'Confirmé' },
  EN_ATTENTE: { className: 'statut-badge-en-attente', label: 'En attente' },
  REFUSE: { className: 'statut-badge-refuse', label: 'Refusé' },
  ANNULE: { className: 'statut-badge-refuse', label: 'Annulé' },
  TERMINE: { className: 'statut-badge-termine', label: 'Terminé' },
  VENDU: { className: 'statut-badge-vendu', label: 'Vendu' },
  EFFECTUE: { className: 'statut-badge-termine', label: 'Effectué' },
  APPROUVE: { className: 'statut-badge-confirme', label: 'Approuvé' },
  EN_REVISION: { className: 'statut-badge-en-attente', label: 'En révision' },
  EN_COMMANDE: { className: 'statut-badge-en-attente', label: 'En commande' },
  RUPTURE_DE_STOCK: { className: 'statut-badge-refuse', label: 'Rupture de stock' },
  BIENTOT_DISPONIBLE: { className: 'statut-badge-en-attente', label: 'Bientôt disponible' },
}

const StatutBadge = ({ statut, className = '' }) => {
  const config = statutConfig[statut] || { className: 'statut-badge bg-gray-50 text-gray-600', label: statut?.replace(/_/g, ' ') || 'Inconnu' }

  return (
    <span className={`${config.className} ${className}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${
        config.className.includes('emerald') ? 'bg-emerald-500' :
        config.className.includes('amber') ? 'bg-amber-500' :
        config.className.includes('red') ? 'bg-red-500' :
        'bg-gray-400'
      }`} />
      {config.label}
    </span>
  )
}

export default StatutBadge
