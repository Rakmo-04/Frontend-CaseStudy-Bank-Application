import React, { useState, useEffect } from 'react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Settings, Wifi, WifiOff, Database, TestTube } from 'lucide-react';
import { enhancedApiService } from '../services/enhanced-api';

export default function DevStatusIndicator() {
  const [modeInfo, setModeInfo] = useState(enhancedApiService.getModeInfo());
  
  useEffect(() => {
    // Update mode info every 5 seconds
    const interval = setInterval(() => {
      setModeInfo(enhancedApiService.getModeInfo());
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);

  const handleToggleMock = () => {
    const newMockMode = !modeInfo.mockMode;
    enhancedApiService.setMockMode(newMockMode);
    setModeInfo(enhancedApiService.getModeInfo());
  };

  const handleRefreshStatus = async () => {
    await enhancedApiService.refreshBackendStatus();
    setModeInfo(enhancedApiService.getModeInfo());
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            {modeInfo.currentMode === 'mock' ? (
              <TestTube className="w-4 h-4" />
            ) : (
              <Database className="w-4 h-4" />
            )}
            <Badge 
              variant={modeInfo.currentMode === 'mock' ? 'secondary' : 'default'}
              className="text-xs"
            >
              {modeInfo.currentMode === 'mock' ? 'MOCK' : 'API'}
            </Badge>
          </Button>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-80">
          <Card>
            <CardContent className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  Development Status
                </h3>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Current Mode:</span>
                  <Badge variant={modeInfo.currentMode === 'mock' ? 'secondary' : 'default'}>
                    {modeInfo.currentMode === 'mock' ? 'Mock Data' : 'Real API'}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Backend Status:</span>
                  <div className="flex items-center gap-2">
                    {modeInfo.backendAvailable ? (
                      <Wifi className="w-4 h-4 text-green-500" />
                    ) : (
                      <WifiOff className="w-4 h-4 text-red-500" />
                    )}
                    <span className="text-sm">
                      {modeInfo.backendAvailable === null ? 'Unknown' : 
                       modeInfo.backendAvailable ? 'Connected' : 'Disconnected'}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Mock Mode:</span>
                  <Badge variant={modeInfo.mockMode ? 'destructive' : 'outline'}>
                    {modeInfo.mockMode ? 'Enabled' : 'Disabled'}
                  </Badge>
                </div>
              </div>
              
              <div className="flex gap-2 pt-2">
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={handleToggleMock}
                  className="flex-1"
                >
                  {modeInfo.mockMode ? 'Disable Mock' : 'Enable Mock'}
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={handleRefreshStatus}
                  className="flex-1"
                >
                  Refresh Status
                </Button>
              </div>
              
              {modeInfo.currentMode === 'mock' && (
                <div className="text-xs text-muted-foreground bg-yellow-50 dark:bg-yellow-900/20 p-2 rounded border border-yellow-200 dark:border-yellow-800">
                  <strong>Mock Mode Active:</strong> Using sample data for development. 
                  Login credentials are in the demo sections.
                </div>
              )}
              
              {!modeInfo.backendAvailable && !modeInfo.mockMode && (
                <div className="text-xs text-muted-foreground bg-red-50 dark:bg-red-900/20 p-2 rounded border border-red-200 dark:border-red-800">
                  <strong>Backend Unavailable:</strong> Cannot connect to API server. 
                  Enable mock mode or start your backend server.
                </div>
              )}
            </CardContent>
          </Card>
        </PopoverContent>
      </Popover>
    </div>
  );
}