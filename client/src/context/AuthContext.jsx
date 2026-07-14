import React, { useState, useEffect, createContext } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get('/api/auth/me');
        setUser(res.data.data.user);
      } catch (err) {
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUser();
  }, []);

  const login = async (email, motDePasse) => {
    const res = await api.post('/api/auth/login', { email, motDePasse });
    setUser(res.data.data.user);
    return res.data;
  };

  const logout = async () => {
    await api.post('/api/auth/logout');
    setUser(null);
  };

  const register = async (nom, prenom, email, telephone, motDePasse) => {
    const res = await api.post('/api/auth/register', { nom, prenom, email, telephone, motDePasse });
    return res.data;
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => React.useContext(AuthContext);
