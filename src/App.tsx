import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import HomePage from './pages/HomePage';
import CosmetovigillancePage from './pages/CosmetovigillancePage';
import Test1Page from './pages/Test1Page';
import Test2Page from './pages/Test2Page';
import Test3Page from './pages/Test3Page';
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
            <Route path="/test1" element={<Test1Page />} />
            <Route path="/test2" element={<Test2Page />} />
            <Route path="/test3" element={<Test3Page />} />
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
