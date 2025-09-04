import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Sidebar, SidebarContent, SidebarProvider, SidebarTrigger } from '../ui/sidebar';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { Shield, FileCheck, MessageSquare, BarChart3, Users, LogOut, Bell } from 'lucide-react';
import AdminOverview from './AdminOverview';
import KYCManagement from './KYCManagement';
import SupportManagement from './SupportManagement';
import AdminAnalytics from './AdminAnalytics';

interface AdminDashboardProps {
  user: any;
  onLogout: () => void;
}

export default function AdminDashboard({ user, onLogout }: AdminDashboardProps) {
  const [activeView, setActiveView] = useState('overview');

  const sidebarItems = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'kyc', label: 'KYC Management', icon: FileCheck },
    { id: 'support', label: 'Support Tickets', icon: MessageSquare },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'users', label: 'User Management', icon: Users }
  ];

  const renderActiveView = () => {
    switch (activeView) {
      case 'overview':
        return <AdminOverview user={user} />;
      case 'kyc':
        return <KYCManagement user={user} />;
      case 'support':
        return <SupportManagement user={user} />;
      case 'analytics':
        return <AdminAnalytics user={user} />;
      case 'users':
        return <div className="p-8 text-center text-muted-foreground">User Management coming soon...</div>;
      default:
        return <AdminOverview user={user} />;
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
                <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
                  <Shield className="w-5 h-5 text-accent-foreground" />
                </div>
                <div>
                  <h2 className="font-bold text-sidebar-foreground">WTF Bank Admin</h2>
                  <p className="text-xs text-sidebar-foreground/70">Administrative Portal</p>
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
                            ? 'bg-accent text-accent-foreground shadow-lg' 
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

            {/* Admin Info */}
            <div className="p-4 border-t border-sidebar-border">
              <div className="flex items-center space-x-3 p-3 rounded-xl bg-sidebar-accent">
                <Avatar>
                  <AvatarFallback className="bg-accent text-accent-foreground">
                    <Shield className="w-4 h-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sidebar-accent-foreground truncate">{user.name}</p>
                  <p className="text-xs text-sidebar-accent-foreground/70 truncate">Administrator</p>
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
                {activeView === 'overview' ? 'Admin Dashboard' : activeView.replace(/([A-Z])/g, ' $1').trim()}
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center space-x-2">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback>
                        <Shield className="w-4 h-4" />
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden md:block">{user.name}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
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