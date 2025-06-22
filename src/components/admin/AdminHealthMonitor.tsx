// Compact health monitor for admin dashboard
import React, { useState, useEffect } from 'react';
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
  EyeSlashIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';
import { isTokenExpired, willExpireSoon } from '../../utils/jwt';
import { canAccessAdmin } from '../../utils/roleChecker';

interface HealthStatus {
  auth: 'healthy' | 'warning' | 'error';
  token: 'healthy' | 'warning' | 'error';
  admin: 'healthy' | 'warning' | 'error';
}

const AdminHealthMonitor: React.FC = () => {
  const { token, user, isAuthenticated, isAdmin } = useAuth();
  const [status, setStatus] = useState<HealthStatus>({
    auth: 'healthy',
    token: 'healthy',
    admin: 'healthy'
  });
  const [isVisible, setIsVisible] = useState(false);
  const [lastCheck, setLastCheck] = useState<Date>(new Date());

  const checkHealth = () => {
    const newStatus: HealthStatus = {
      auth: 'healthy',
      token: 'healthy',
      admin: 'healthy'
    };

    // Check authentication
    if (!isAuthenticated || !user) {
      newStatus.auth = 'error';
    }

    // Check token
    if (token) {
      if (isTokenExpired(token)) {
        newStatus.token = 'error';
      } else if (willExpireSoon(token, 30)) { // 30 minutes warning
        newStatus.token = 'warning';
      }
    } else {
      newStatus.token = 'error';
    }

    // Check admin access
    if (!canAccessAdmin(user)) {
      newStatus.admin = 'error';
    } else if (!isAdmin) {
      newStatus.admin = 'warning';
    }

    setStatus(newStatus);
    setLastCheck(new Date());
  };

  useEffect(() => {
    checkHealth();
    const interval = setInterval(checkHealth, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [token, user, isAuthenticated, isAdmin]);

  const getStatusIcon = (statusType: 'healthy' | 'warning' | 'error') => {
    switch (statusType) {
      case 'healthy':
        return <CheckCircleIcon className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <ExclamationTriangleIcon className="h-4 w-4 text-yellow-500" />;
      case 'error':
        return <XCircleIcon className="h-4 w-4 text-red-500" />;
    }
  };

  const overallStatus = Object.values(status).includes('error') ? 'error' :
                       Object.values(status).includes('warning') ? 'warning' : 'healthy';

  const getStatusColor = (statusType: 'healthy' | 'warning' | 'error') => {
    switch (statusType) {
      case 'healthy':
        return 'bg-green-100 border-green-200';
      case 'warning':
        return 'bg-yellow-100 border-yellow-200';
      case 'error':
        return 'bg-red-100 border-red-200';
    }
  };

  if (import.meta.env.MODE !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Toggle Button */}
      <button
        onClick={() => setIsVisible(!isVisible)}
        className={`p-2 rounded-full shadow-lg border-2 transition-colors ${getStatusColor(overallStatus)}`}
        title="System Health Monitor"
      >
        {getStatusIcon(overallStatus)}
      </button>

      {/* Health Panel */}
      {isVisible && (
        <div className="absolute bottom-12 right-0 bg-white rounded-lg shadow-lg border border-gray-200 p-4 w-64">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium text-gray-900">System Health</h3>
            <button
              onClick={() => setIsVisible(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <EyeSlashIcon className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span>Authentication</span>
              {getStatusIcon(status.auth)}
            </div>
            <div className="flex items-center justify-between">
              <span>Token Status</span>
              {getStatusIcon(status.token)}
            </div>
            <div className="flex items-center justify-between">
              <span>Admin Access</span>
              {getStatusIcon(status.admin)}
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-gray-200">
            <div className="text-xs text-gray-500">
              Last check: {lastCheck.toLocaleTimeString()}
            </div>
            {user && (
              <div className="text-xs text-gray-600 mt-1">
                {user.firstName} {user.lastName}
              </div>
            )}
          </div>

          {/* Quick Actions */}
          {overallStatus !== 'healthy' && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <button
                onClick={() => window.location.href = '/auth-fix'}
                className="w-full text-xs bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700"
              >
                🔧 Fix Issues
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminHealthMonitor;
