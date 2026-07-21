import React from 'react'

const statutConfig = {
  DISPONIBLE: { className: 'statut-badge-disponible', dotColor: 'bg-emerald-500', label: 'Disponible' },
  CONFIRME: { className: 'statut-badge-confirme', dotColor: 'bg-emerald-500', label: 'Confirmé' },
  EN_ATTENTE: { className: 'statut-badge-en-attente', dotColor: 'bg-amber-500', label: 'En attente' },
  REFUSE: { className: 'statut-badge-refuse', dotColor: 'bg-red-500', label: 'Refusé' },
  ANNULE: { className: 'statut-badge-refuse', dotColor: 'bg-red-500', label: 'Annulé' },
  TERMINE: { className: 'statut-badge-termine', dotColor: 'bg-gray-400', label: 'Terminé' },
  VENDU: { className: 'statut-badge-vendu', dotColor: 'bg-gray-400', label: 'Vendu' },
  EFFECTUE: { className: 'statut-badge-termine', dotColor: 'bg-gray-400', label: 'Effectué' },
  APPROUVE: { className: 'statut-badge-confirme', dotColor: 'bg-emerald-500', label: 'Approuvé' },
  EN_REVISION: { className: 'statut-badge-en-attente', dotColor: 'bg-amber-500', label: 'En révision' },
  EN_COMMANDE: { className: 'statut-badge-en-attente', dotColor: 'bg-amber-500', label: 'En commande' },
  RUPTURE_DE_STOCK: { className: 'statut-badge-refuse', dotColor: 'bg-red-500', label: 'Rupture de stock' },
  BIENTOT_DISPONIBLE: { className: 'statut-badge-en-attente', dotColor: 'bg-amber-500', label: 'Bientôt disponible' },
}

const StatutBadge = ({ statut, className = '' }) => {
  const config = statutConfig[statut] || { className: 'statut-badge bg-gray-50 text-gray-600', dotColor: 'bg-gray-400', label: statut?.replace(/_/g, ' ') || 'Inconnu' }

  return (
    <span className={`${config.className} ${className}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dotColor}`} />
      {config.label}
    </span>
  )
}

export default React.memo(StatutBadge)
