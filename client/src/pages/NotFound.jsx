import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-800">404</h1>
        <p className="text-xl text-gray-600 mt-4">Page non trouvée</p>
        <Link to="/" className="inline-block mt-6 text-blue-600 hover:underline">
          Retour à l'accueil
        </Link>
      </div>
    </div>
  );
};

export default NotFound;