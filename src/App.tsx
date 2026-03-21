/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LanguageSelection } from './components/LanguageSelection';
import { Onboarding } from './components/Onboarding';
import { Dashboard } from './components/Dashboard';
import { Login } from './components/Login';
import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import './i18n';

function AppContent() {
  const { isLanguageSelected } = useLanguage();
  const { user, loading, userProfile } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-stone-800 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  if (!isLanguageSelected) {
    return <LanguageSelection />;
  }

  if (userProfile && !userProfile.onboardingCompleted) {
    return <Onboarding onComplete={() => {}} />;
  }

  return <Dashboard />;
}

export default function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <AppContent />
      </LanguageProvider>
    </AuthProvider>
  );
}

