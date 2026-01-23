import { createContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Use environment variable or fallback to localhost
  const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/p/manga';

  useEffect(() => {
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      setUser(JSON.parse(userInfo));
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    try {
        // Construct the full URL using the base variable
        // Remove '/p/manga' from BASE_URL if it's already there to avoid duplication if we weren't careful, 
        // but here our BASE_URL includes /p/manga, so we append /auth/login relative to that structure?
        // Wait, the routes are:
        // App: /p/manga/auth/login
        // Base: http://localhost:5000/p/manga
        // So we need: BASE_URL + '/auth/login'
        
        const { data } = await axios.post(`${BASE_URL}/auth/login`, {
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