import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/api/notifications');
      setNotifications(res.data.data.notifications || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchNotifications(); }, []);

  const marquerLue = async (id) => {
    try {
      await api.put(`/api/notifications/${id}/lue`);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, lue: true } : n));
    } catch (err) {
      console.error(err);
    }
  };

  const marquerToutesLues = async () => {
    try {
      await api.put('/api/notifications/lire-toutes');
      setNotifications(prev => prev.map(n => ({ ...n, lue: true })));
      toast.success('Toutes les notifications marquées comme lues');
    } catch (err) {
      toast.error('Erreur');
    }
  };

  const nonLues = notifications.filter(n => !n.lue).length;

  if (loading) return <div className="text-center py-10 text-gray-500">Chargement...</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Notifications</h1>
        {nonLues > 0 && (
          <button onClick={marquerToutesLues} className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700">
            Marquer tout comme lu ({nonLues})
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <p className="text-gray-400">Aucune notification.</p>
      ) : (
        <div className="space-y-2">
          {notifications.map(n => (
            <div key={n.id} onClick={() => !n.lue && marquerLue(n.id)}
              className={`p-4 rounded-lg cursor-pointer transition ${
                n.lue ? 'bg-white border' : 'bg-blue-50 border border-blue-200'
              }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {!n.lue && <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />}
                  <div>
                    <p className={`font-medium ${n.lue ? 'text-gray-700' : 'text-gray-900'}`}>{n.titre}</p>
                    <p className="text-sm text-gray-500">{n.message}</p>
                  </div>
                </div>
                <span className="text-xs text-gray-400 flex-shrink-0 ml-4">{new Date(n.createdAt).toLocaleString('fr-FR')}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;
