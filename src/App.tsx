import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Layout } from './components/layout/Layout';
import { HomePage } from './pages/HomePage';
import { NotFoundPage } from './pages/NotFoundPage';
import { AuthModal } from './components/auth/AuthModal';
import { ProfileEditModal } from './components/auth/ProfileEditModal';
import { UpdatePasswordModal } from './components/auth/UpdatePasswordModal';

export const App: React.FC = () => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'signup' | 'forgot'>('login');
  const [isProfileEditModalOpen, setIsProfileEditModalOpen] = useState(false);

  const handleOpenAuth = (mode: 'login' | 'signup' | 'forgot' = 'login') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const handleCloseAuth = () => {
    setIsAuthModalOpen(false);
  };

  const handleOpenProfileEdit = () => {
    setIsProfileEditModalOpen(true);
  };

  const handleCloseProfileEdit = () => {
    setIsProfileEditModalOpen(false);
  };

  return (
    <AuthProvider>
      <BrowserRouter>
        <Layout
          onOpenAuth={() => handleOpenAuth('login')}
          onOpenProfileEdit={handleOpenProfileEdit}
        >
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Layout>

        {/* Global Modals */}
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={handleCloseAuth}
          initialMode={authModalMode}
        />
        <ProfileEditModal
          isOpen={isProfileEditModalOpen}
          onClose={handleCloseProfileEdit}
        />
        <UpdatePasswordModal />
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
