import { createContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      setUser(JSON.parse(userInfo));
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    try {
        // Assume API URL, we'll set it in utils/api.js later or env
        // Using hardcoded for now or relative
        const { data } = await axios.post('https://app-backend-alpha.vercel.app/p/manga/auth/login', {
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
