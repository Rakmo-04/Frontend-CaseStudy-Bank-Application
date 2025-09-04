import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Sidebar, SidebarContent, SidebarProvider, SidebarTrigger } from '../ui/sidebar';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { Home, CreditCard, Receipt, FileCheck, MessageSquare, Settings, LogOut, Bell, Zap } from 'lucide-react';
import AccountsView from './AccountsView';
import TransactionsView from './TransactionsView';
import KYCView from './KYCView';
import SupportView from './SupportView';
import ProfileView from './ProfileView';
import DashboardOverview from './DashboardOverview';
import EnhancedFeatures from './EnhancedFeatures';

interface CustomerDashboardProps {
  user: any;
  onLogout: () => void;
}

export default function CustomerDashboard({ user, onLogout }: CustomerDashboardProps) {
  const [activeView, setActiveView] = useState('overview');

  const sidebarItems = [
    { id: 'overview', label: 'Overview', icon: Home },
    { id: 'accounts', label: 'Accounts', icon: CreditCard },
    { id: 'transactions', label: 'Transactions', icon: Receipt },
    { id: 'enhanced', label: 'Quick Actions', icon: Zap },
    { id: 'kyc', label: 'KYC Status', icon: FileCheck },
    { id: 'support', label: 'Support', icon: MessageSquare },
    { id: 'profile', label: 'Profile', icon: Settings }
  ];

  const renderActiveView = () => {
    switch (activeView) {
      case 'overview':
        return <DashboardOverview user={user} />;
      case 'accounts':
        return <AccountsView user={user} />;
      case 'transactions':
        return <TransactionsView user={user} />;
      case 'enhanced':
        return <EnhancedFeatures user={user} />;
      case 'kyc':
        return <KYCView user={user} />;
      case 'support':
        return <SupportView user={user} />;
      case 'profile':
        return <ProfileView user={user} />;
      default:
        return <DashboardOverview user={user} />;
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        {/* Sidebar */}
        <Sidebar className="border-r border-border">
          <SidebarContent className="p-0">
            {/* Logo */}
            <div className="p-6 border-b border-sidebar-border">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-sidebar-primary rounded-lg flex items-center justify-center">
                  <span className="text-sidebar-primary-foreground font-bold">W</span>
                </div>
                <div>
                  <h2 className="font-bold text-sidebar-foreground">WTF Bank</h2>
                  <p className="text-xs text-sidebar-foreground/70">Where's The Funds?</p>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4">
              <ul className="space-y-2">
                {sidebarItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeView === item.id;
                  
                  return (
                    <li key={item.id}>
                      <Button
                        variant={isActive ? "default" : "ghost"}
                        className={`w-full justify-start h-12 rounded-xl transition-all ${
                          isActive 
                            ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-lg' 
                            : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                        }`}
                        onClick={() => setActiveView(item.id)}
                      >
                        <Icon className="w-5 h-5 mr-3" />
                        {item.label}
                      </Button>
                    </li>
                  );
                })}
              </ul>
            </nav>

            {/* User Info */}
            <div className="p-4 border-t border-sidebar-border">
              <div className="flex items-center space-x-3 p-3 rounded-xl bg-sidebar-accent">
                <Avatar>
                  <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground">
                    {user.name.split(' ').map((n: string) => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sidebar-accent-foreground truncate">{user.name}</p>
                  <p className="text-xs text-sidebar-accent-foreground/70 truncate">{user.email}</p>
                </div>
              </div>
            </div>
          </SidebarContent>
        </Sidebar>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Top Navigation */}
          <header className="h-16 border-b border-border bg-card px-6 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <SidebarTrigger />
              <h1 className="text-xl font-semibold text-card-foreground capitalize">
                {activeView === 'overview' ? 'Dashboard' : activeView}
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-accent rounded-full"></span>
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center space-x-2">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback>
                        {user.name.split(' ').map((n: string) => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden md:block">{user.name}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem onClick={() => setActiveView('profile')}>
                    <Settings className="w-4 h-4 mr-2" />
                    Profile Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={onLogout}>
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 p-6 overflow-auto">
            <motion.div
              key={activeView}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              {renderActiveView()}
            </motion.div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}