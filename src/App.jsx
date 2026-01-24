import { Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import MangaList from './pages/manga/MangaList';
import MangaDetail from './pages/manga/MangaDetail';
import SuggestionList from './pages/interactions/SuggestionList';
import RequestList from './pages/interactions/RequestList';
import { useContext } from 'react';
import AuthContext from './context/AuthContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  
  if (loading) return null; 
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

function App() {
  return (
    <>
      <Header />
      <main>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          {/* Main Dashboard */}
          <Route path="/" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />

          {/* Manga Module */}
          <Route path="/manga" element={
            <ProtectedRoute>
              <MangaList />
            </ProtectedRoute>
          } />
           <Route path="/manga/:id" element={
            <ProtectedRoute>
              <MangaDetail />
            </ProtectedRoute>
          } />

          {/* Interaction Module */}
          <Route path="/suggestions" element={
            <ProtectedRoute>
              <SuggestionList />
            </ProtectedRoute>
          } />
          <Route path="/requests" element={
            <ProtectedRoute>
              <RequestList />
            </ProtectedRoute>
          } />
        </Routes>
      </main>
      <ToastContainer position="top-right" autoClose={3000} />
    </>
  );
}

export default App;