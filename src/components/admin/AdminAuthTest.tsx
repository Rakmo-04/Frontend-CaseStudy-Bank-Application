import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { apiService } from '../../services/api';

export default function AdminAuthTest() {
  const [testResults, setTestResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const addResult = (test: string, success: boolean, data: any) => {
    setTestResults(prev => [...prev, { test, success, data, timestamp: new Date().toLocaleTimeString() }]);
  };

  const runAuthTests = async () => {
    setIsLoading(true);
    setTestResults([]);
    
    try {
      // Test 1: Check localStorage directly
      const lsToken = localStorage.getItem('auth_token');
      const lsType = localStorage.getItem('auth_type');
      
      addResult('LocalStorage Check', !!lsToken, {
        hasToken: !!lsToken,
        tokenType: lsType,
        tokenPreview: lsToken ? `${lsToken.substring(0, 30)}...` : null
      });

      // Test 2: Check TokenManager
      const tokenManager = apiService.getTokenManager();
      const token = tokenManager.getToken();
      const tokenType = tokenManager.getTokenType();
      
      addResult('TokenManager Check', !!token, { 
        hasToken: !!token, 
        tokenType, 
        tokenPreview: token ? `${token.substring(0, 30)}...` : null,
        matchesLocalStorage: token === lsToken && tokenType === lsType
      });

      if (!token) {
        addResult('Error', false, { message: 'No admin token found. Please login first.' });
        return;
      }

      // Test 3: Decode JWT token
      try {
        const tokenParts = token.split('.');
        if (tokenParts.length === 3) {
          const payload = JSON.parse(atob(tokenParts[1]));
          const now = Date.now();
          const expTime = payload.exp * 1000;
          
          addResult('JWT Decode', true, {
            sub: payload.sub,
            role: payload.role,
            roles: payload.roles,
            authorities: payload.authorities,
            iat: new Date(payload.iat * 1000).toLocaleString(),
            exp: new Date(expTime).toLocaleString(),
            isExpired: now >= expTime,
            timeToExpiry: expTime > now ? `${Math.floor((expTime - now) / 60000)} minutes` : 'EXPIRED',
            fullPayload: payload
          });
        }
      } catch (e: any) {
        addResult('JWT Decode', false, { error: e.message });
      }

      // Test 4: Test multiple admin endpoints
      const endpoints = [
        '/admin/kyc/pending-documents',
        '/admin/support/tickets?page=0&size=1',
        '/admin/customers?page=0&size=1'
      ];

      for (const endpoint of endpoints) {
        try {
          const response = await fetch(`http://localhost:8080${endpoint}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            }
          });

          let responseData;
          const responseText = await response.text();
          
          try {
            responseData = JSON.parse(responseText);
          } catch {
            responseData = responseText;
          }

          addResult(`Direct Fetch: ${endpoint}`, response.ok, {
            status: response.status,
            statusText: response.statusText,
            headers: Object.fromEntries(response.headers.entries()),
            bodyPreview: typeof responseData === 'string' ? 
              responseData.substring(0, 200) + (responseData.length > 200 ? '...' : '') :
              responseData
          });
        } catch (e: any) {
          addResult(`Direct Fetch: ${endpoint}`, false, { error: e.message });
        }
      }

      // Test 5: Test via API service
      try {
        const result = await apiService.getKYCStatistics();
        addResult('API Service Test', true, result);
      } catch (e: any) {
        addResult('API Service Test', false, {
          status: e.status,
          message: e.message,
          response: e.response
        });
      }

      // Test 6: Test different admin users (from Postman collection)
      const adminUsers = [
        { username: 'kyc.officer', password: 'admin123' },
        { username: 'super.admin', password: 'admin123' },
        { username: 'compliance.officer', password: 'admin123' },
        { username: 'branch.manager', password: 'admin123' }
      ];

      for (const admin of adminUsers) {
        try {
          const loginResponse = await fetch('http://localhost:8080/admin/auth/login', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(admin)
          });

          const loginText = await loginResponse.text();
          let loginData;
          try {
            loginData = JSON.parse(loginText);
          } catch {
            loginData = loginText;
          }

          // If login successful, decode the token to see the role
          let decodedToken = null;
          if (loginData?.token) {
            try {
              const tokenParts = loginData.token.split('.');
              if (tokenParts.length === 3) {
                decodedToken = JSON.parse(atob(tokenParts[1]));
              }
            } catch (e) {
              console.error('Failed to decode token:', e);
            }
          }

          addResult(`Test Login: ${admin.username}`, loginResponse.ok, {
            status: loginResponse.status,
            statusText: loginResponse.statusText,
            hasNewToken: loginData?.token ? true : false,
            tokenRole: decodedToken?.role || 'unknown',
            tokenAuthorities: decodedToken?.authorities || [],
            newTokenPreview: loginData?.token ? `${loginData.token.substring(0, 30)}...` : null,
            response: loginData
          });
        } catch (e: any) {
          addResult(`Test Login: ${admin.username}`, false, { error: e.message });
        }
      }

    } catch (error: any) {
      addResult('Test Error', false, { error: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>🔍 Admin Authentication Diagnostic</CardTitle>
        <p className="text-sm text-muted-foreground">
          This will help diagnose the 403 Forbidden error with admin endpoints
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={runAuthTests} disabled={isLoading} className="w-full">
          {isLoading ? 'Running Tests...' : 'Run Authentication Tests'}
        </Button>

        {testResults.length > 0 && (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {testResults.map((result, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg border ${
                  result.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">
                    {result.success ? '✅' : '❌'} {result.test}
                  </span>
                  <span className="text-xs text-muted-foreground">{result.timestamp}</span>
                </div>
                <pre className="text-xs mt-2 bg-gray-100 p-2 rounded overflow-x-auto">
                  {JSON.stringify(result.data, null, 2)}
                </pre>
              </div>
            ))}
          </div>
        )}

        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-semibold text-blue-900 mb-2">🔧 Common Solutions:</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• <strong>Token expired:</strong> Re-login as admin</li>
            <li>• <strong>Wrong role:</strong> Ensure JWT contains ROLE_KYC_OFFICER or similar</li>
            <li>• <strong>Backend config:</strong> Check Spring Security @PreAuthorize annotations</li>
            <li>• <strong>CORS issue:</strong> Verify CORS settings for admin endpoints</li>
            <li>• <strong>Endpoint missing:</strong> Verify controller mapping in backend</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
