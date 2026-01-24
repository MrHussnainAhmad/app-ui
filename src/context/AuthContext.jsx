import { createContext, useState } from 'react';
import api from '../utils/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const userInfo = localStorage.getItem('userInfo');
      return userInfo ? JSON.parse(userInfo) : null;
    } catch {
      return null;
    }
  });

  // localStorage is synchronous, so we don't need an effect-driven loading phase.
  const [loading] = useState(false);

  const login = async (username, password) => {
    try {
        // Use the centralized 'api' instance. 
        // It already has the baseURL (/p/manga), so we just add '/auth/login'.
        // Route in backend: /p/manga/auth/login
        const { data } = await api.post('/manga/auth/login', {
          username,
          password,
        });
        
        setUser(data);
        localStorage.setItem('userInfo', JSON.stringify(data));
        return { success: true };
    } catch (error) {
        return { 
            success: false, 
            message: error.response?.data?.message || error.message 
        };
    }
  };

  const logout = () => {
    localStorage.removeItem('userInfo');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
