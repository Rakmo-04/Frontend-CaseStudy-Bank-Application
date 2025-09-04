import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Toaster } from './components/ui/sonner';
import LandingPage from './components/LandingPage';
import CustomerLogin from './components/auth/CustomerLogin';
import CustomerRegister from './components/auth/CustomerRegister';
import AdminLogin from './components/auth/AdminLogin';
import CustomerDashboard from './components/customer/CustomerDashboard';
import AdminDashboard from './components/admin/AdminDashboard';
import { enhancedApiService as apiService } from './services/enhanced-api';
import { ENV } from './utils/environment';

type AppView = 'landing' | 'customer-login' | 'customer-register' | 'admin-login' | 'customer-dashboard' | 'admin-dashboard';

export default function App() {
  const [currentView, setCurrentView] = useState<AppView>('landing');
  const [user, setUser] = useState<any>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  // Check for existing authentication on app start
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        if (apiService.isAuthenticated()) {
          const authType = apiService.getAuthType();
          
          if (authType === 'customer') {
            try {
              const customerProfile = await apiService.getCurrentCustomer();
              console.log('Customer Profile on Init:', customerProfile);
              const userData = {
                id: customerProfile.customerId,
                name: `${customerProfile.firstName} ${customerProfile.lastName}`,
                // email: customerProfile.email,
                type: 'customer',
                // kycStatus: customerProfile.kycStatus,
                ...customerProfile
              };
              setUser(userData);
              setCurrentView('customer-dashboard');
            } catch (error) {
              // Token might be expired, clear it
              apiService.getTokenManager().clearToken();
            }
          } else if (authType === 'admin') {
            // For admin, we'll just set a basic user object since we don't have a getCurrentAdmin endpoint
            const userData = {
              type: 'admin',
              name: 'Admin User',
              permissions: ['kyc_management', 'support_management', 'analytics']
            };
            setUser(userData);
            setCurrentView('admin-dashboard');
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        apiService.getTokenManager().clearToken();
      } finally {
        setIsInitializing(false);
      }
    };

    initializeAuth();
  }, []);

  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    in: { opacity: 1, y: 0 },
    out: { opacity: 0, y: -20 }
  };

  const pageTransition = {
    type: 'tween',
    ease: 'anticipate',
    duration: 0.3
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'landing':
        return <LandingPage onNavigate={setCurrentView} />;
      case 'customer-login':
        return <CustomerLogin onNavigate={setCurrentView} onLogin={setUser} />;
      case 'customer-register':
        return <CustomerRegister onNavigate={setCurrentView} onRegister={setUser} />;
      case 'admin-login':
        return <AdminLogin onNavigate={setCurrentView} onLogin={setUser} />;
      case 'customer-dashboard':
        return <CustomerDashboard user={user} onLogout={async () => { 
          try {
            await apiService.logout();
          } catch (error) {
            console.error('Logout error:', error);
          }
          setUser(null); 
          setCurrentView('landing'); 
        }} />;
      case 'admin-dashboard':
        return <AdminDashboard user={user} onLogout={async () => { 
          try {
            await apiService.logout();
          } catch (error) {
            console.error('Logout error:', error);
          }
          setUser(null); 
          setCurrentView('landing'); 
        }} />;
      default:
        return <LandingPage onNavigate={setCurrentView} />;
    }
  };

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto">
            <span className="text-accent font-bold text-2xl">W</span>
          </div>
          <div className="w-8 h-8 border-4 border-accent/30 border-t-accent rounded-full animate-spin mx-auto"></div>
          <p className="text-muted-foreground">Loading WTF Bank...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentView}
          initial="initial"
          animate="in"
          exit="out"
          variants={pageVariants}
          transition={pageTransition}
          className="min-h-screen"
        >
          {renderCurrentView()}
        </motion.div>
      </AnimatePresence>
      <Toaster />
      {/* Development Status Indicator - only show in development */}
      {ENV.IS_DEVELOPMENT && (
        <div className="fixed bottom-4 right-4 z-50">
          <div className="bg-card border border-border rounded-lg p-2 shadow-lg">
            <div className="text-xs text-muted-foreground space-y-1">
              <div>🛠️ Development Mode</div>
              <div>API: {ENV.API_URL}</div>
              <div>Auth: {user ? `${user.type} logged in` : 'Not logged in'}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}