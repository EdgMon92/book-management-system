import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Books from './pages/Books';
import Loans from './pages/Loans';
import Reservations from './pages/Reservations';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();

  return (
    <nav className="navbar">
      <div>
        <Link to="/books">📚 Libros</Link>
        {isAuthenticated && (
          <>
            <Link to="/loans">📖 Préstamos</Link>
            <Link to="/reservations">🔖 Reservas</Link>
          </>
        )}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {isAuthenticated ? (
          <>
            <span style={{ fontSize: 14 }}>Hola, {user?.name}</span>
            <button onClick={logout}>Cerrar Sesión</button>
          </>
        ) : (
          <>
            <Link to="/login">Iniciar Sesión</Link>
            <Link to="/register">Registrarse</Link>
          </>
        )}
      </div>
    </nav>
  );
};

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" />;
  return <>{children}</>;
};

const AppContent = () => {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        {/* Rutas públicas */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/books" element={<Books />} />

        {/* Rutas protegidas */}
        <Route path="/loans" element={
          <ProtectedRoute><Loans /></ProtectedRoute>
        } />
        <Route path="/reservations" element={
          <ProtectedRoute><Reservations /></ProtectedRoute>
        } />

        {/* Redirigir la raíz a libros */}
        <Route path="/" element={<Navigate to="/books" />} />
        <Route path="*" element={<Navigate to="/books" />} />
      </Routes>
    </BrowserRouter>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;