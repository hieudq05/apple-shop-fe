import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { decodeToken } from '../utils/jwt';
import { isAdmin as checkIsAdmin } from '../utils/roleChecker';

const AdminTestPage: React.FC = () => {
  const { user, token, isAuthenticated, isAdmin, login, logout } = useAuth();
  const [testResults, setTestResults] = useState<string[]>([]);
  const navigate = useNavigate();

  const addResult = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const createTestAdminToken = () => {
    const payload = {
      sub: 'admin@test.com',
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60), // 24 hours
      roles: [
        { authority: 'ROLE_ADMIN' },
        { authority: 'ROLE_STAFF' }
      ],
      firstName: 'Test',
      lastName: 'Admin',
      imageUrl: ''
    };

    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const payloadStr = btoa(JSON.stringify(payload));
    const signature = 'test-signature';

    return `Bearer ${header}.${payloadStr}.${signature}`;
  };

  const testAdminLogin = () => {
    addResult('Starting admin login test...');
    
    const testToken = createTestAdminToken();
    const refreshToken = 'test-refresh-token';
    
    addResult(`Created test token: ${testToken.substring(0, 50)}...`);
    
    // Decode token to verify
    const decoded = decodeToken(testToken);
    addResult(`Decoded token roles: ${JSON.stringify(decoded?.roles)}`);
    
    // Login
    login(testToken, refreshToken);
    addResult('Login function called');
    
    // Check results after a short delay
    setTimeout(() => {
      addResult(`Auth state - isAuthenticated: ${isAuthenticated}, isAdmin: ${isAdmin}`);
      addResult(`User roles: ${JSON.stringify(user?.roles)}`);
      
      if (user) {
        const adminCheck = checkIsAdmin(user);
        addResult(`Role checker result: ${adminCheck}`);
      }
    }, 100);
  };

  const testAdminAccess = () => {
    addResult('Testing admin access...');
    try {
      navigate('/admin/dashboard');
      addResult('Navigation to admin dashboard attempted');
    } catch (error) {
      addResult(`Navigation error: ${error}`);
    }
  };

  const clearResults = () => {
    setTestResults([]);
  };

  const handleLogout = async () => {
    await logout();
    addResult('Logged out');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            Admin Authentication Test
          </h1>

          {/* Current Auth Status */}
          <div className="mb-6 p-4 bg-gray-100 rounded-lg">
            <h2 className="text-xl font-semibold mb-3">Current Auth Status</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p><strong>Authenticated:</strong> {isAuthenticated ? '✅ Yes' : '❌ No'}</p>
                <p><strong>Is Admin:</strong> {isAdmin ? '✅ Yes' : '❌ No'}</p>
                <p><strong>Email:</strong> {user?.email || 'N/A'}</p>
              </div>
              <div>
                <p><strong>Token:</strong> {token ? '✅ Present' : '❌ Missing'}</p>
                <p><strong>Roles:</strong> {user?.roles?.map(r => r.authority).join(', ') || 'N/A'}</p>
                <p><strong>User ID:</strong> {user?.id || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Test Actions */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4">Test Actions</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <button
                onClick={testAdminLogin}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                🔑 Test Admin Login
              </button>
              
              <button
                onClick={testAdminAccess}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                🚪 Test Admin Access
              </button>
              
              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                🚪 Logout
              </button>
              
              <button
                onClick={clearResults}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                🗑️ Clear Results
              </button>
            </div>
          </div>

          {/* Test Results */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4">Test Results</h2>
            <div className="bg-black text-green-400 p-4 rounded-lg h-64 overflow-y-auto font-mono text-sm">
              {testResults.length === 0 ? (
                <p>No test results yet. Click a test button to start.</p>
              ) : (
                testResults.map((result, index) => (
                  <div key={index}>{result}</div>
                ))
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div className="border-t pt-4">
            <h3 className="font-semibold mb-2">Quick Links</h3>
            <div className="space-x-4">
              <a href="/admin/login" className="text-blue-600 hover:underline">Admin Login</a>
              <a href="/admin/dashboard" className="text-blue-600 hover:underline">Admin Dashboard</a>
              <a href="/" className="text-blue-600 hover:underline">Home</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminTestPage;
