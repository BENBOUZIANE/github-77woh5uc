import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import HomePage from './pages/HomePage';
import CosmetovigillancePage from './pages/CosmetovigillancePage';
import ComplementAlimentairePage from './pages/ComplementAlimentairePage';
import DispositifMedicalPage from './pages/DispositifMedicalPage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import MyDeclarationsPage from './pages/MyDeclarationsPage';
import DeclarationDetailPage from './pages/DeclarationDetailPage';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/cosmetovigilance" element={<CosmetovigillancePage />} />
            <Route path="/test3" element={<ComplementAlimentairePage />} />
            <Route path="/materiovigilance" element={<DispositifMedicalPage />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/:type"
              element={
                <ProtectedRoute>
                  <MyDeclarationsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/declaration/:id"
              element={
                <ProtectedRoute>
                  <DeclarationDetailPage />
                </ProtectedRoute>
              }
            />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
