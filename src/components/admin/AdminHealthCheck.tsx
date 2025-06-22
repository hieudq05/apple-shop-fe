// Admin health check component to monitor system status and potential issues
import React, { useState, useEffect } from 'react';
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
  ClockIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';
import { isTokenExpired, willExpireSoon } from '../../utils/jwt';
import AdminService from '../../services/adminService';

interface HealthCheckItem {
  id: string;
  name: string;
  status: 'healthy' | 'warning' | 'error' | 'checking';
  message: string;
  lastChecked?: Date;
}

const AdminHealthCheck: React.FC = () => {
  const { token, user, isAuthenticated, isAdmin } = useAuth();
  const [healthChecks, setHealthChecks] = useState<HealthCheckItem[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const initialChecks: HealthCheckItem[] = [
    {
      id: 'auth',
      name: 'Authentication Status',
      status: 'checking',
      message: 'Checking authentication...'
    },
    {
      id: 'token',
      name: 'Token Validity',
      status: 'checking',
      message: 'Checking token status...'
    },
    {
      id: 'permissions',
      name: 'Admin Permissions',
      status: 'checking',
      message: 'Checking admin permissions...'
    },
    {
      id: 'api',
      name: 'API Connectivity',
      status: 'checking',
      message: 'Testing API connection...'
    },
    {
      id: 'dashboard',
      name: 'Dashboard Data',
      status: 'checking',
      message: 'Loading dashboard stats...'
    }
  ];

  const updateCheck = (id: string, updates: Partial<HealthCheckItem>) => {
    setHealthChecks(prev => prev.map(check => 
      check.id === id 
        ? { ...check, ...updates, lastChecked: new Date() }
        : check
    ));
  };

  const runHealthChecks = async () => {
    setIsRunning(true);
    setHealthChecks(initialChecks);

    // Check 1: Authentication Status
    try {
      if (isAuthenticated && user) {
        updateCheck('auth', {
          status: 'healthy',
          message: `✅ Authenticated as ${user.firstName} ${user.lastName} (${user.email})`
        });
      } else {
        updateCheck('auth', {
          status: 'error',
          message: '❌ Not authenticated - Please login'
        });
      }
    } catch (error) {
      updateCheck('auth', {
        status: 'error',
        message: `❌ Authentication check failed: ${error}`
      });
    }

    // Check 2: Token Validity
    try {
      if (token) {
        if (isTokenExpired(token)) {
          updateCheck('token', {
            status: 'error',
            message: 'Token has expired'
          });
        } else if (willExpireSoon(token, 10)) {
          updateCheck('token', {
            status: 'warning',
            message: 'Token expires soon (within 10 minutes)'
          });
        } else {
          updateCheck('token', {
            status: 'healthy',
            message: 'Token is valid'
          });
        }
      } else {
        updateCheck('token', {
          status: 'error',
          message: 'No token found'
        });
      }
    } catch (error) {
      updateCheck('token', {
        status: 'error',
        message: 'Token validation failed'
      });
    }

    // Check 3: Admin Permissions
    try {
      if (isAdmin) {
        updateCheck('permissions', {
          status: 'healthy',
          message: 'Admin permissions confirmed'
        });
      } else {
        updateCheck('permissions', {
          status: 'error',
          message: 'Missing admin permissions'
        });
      }
    } catch (error) {
      updateCheck('permissions', {
        status: 'error',
        message: 'Permission check failed'
      });
    }

    // Check 4: API Connectivity
    try {
      const response = await AdminService.getDashboardStats();
      if (response.success) {
        updateCheck('api', {
          status: 'healthy',
          message: 'API connection successful'
        });
      } else {
        updateCheck('api', {
          status: 'warning',
          message: `API returned error: ${response.message}`
        });
      }
    } catch (error: any) {
      updateCheck('api', {
        status: 'error',
        message: `API connection failed: ${error.message}`
      });
    }

    // Check 5: Dashboard Data
    try {
      const response = await AdminService.getDashboardStats();
      if (response.success && response.data) {
        updateCheck('dashboard', {
          status: 'healthy',
          message: 'Dashboard data loaded successfully'
        });
      } else {
        updateCheck('dashboard', {
          status: 'warning',
          message: 'Dashboard data unavailable, using mock data'
        });
      }
    } catch (error: any) {
      updateCheck('dashboard', {
        status: 'error',
        message: `Dashboard data failed: ${error.message}`
      });
    }

    setIsRunning(false);
  };

  useEffect(() => {
    runHealthChecks();
  }, []);

  const getStatusIcon = (status: HealthCheckItem['status']) => {
    switch (status) {
      case 'healthy':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />;
      case 'error':
        return <XCircleIcon className="h-5 w-5 text-red-500" />;
      case 'checking':
        return <ClockIcon className="h-5 w-5 text-blue-500 animate-pulse" />;
    }
  };

  const getStatusColor = (status: HealthCheckItem['status']) => {
    switch (status) {
      case 'healthy':
        return 'border-green-200 bg-green-50';
      case 'warning':
        return 'border-yellow-200 bg-yellow-50';
      case 'error':
        return 'border-red-200 bg-red-50';
      case 'checking':
        return 'border-blue-200 bg-blue-50';
    }
  };

  const overallStatus = healthChecks.length > 0 ? (
    healthChecks.some(check => check.status === 'error') ? 'error' :
    healthChecks.some(check => check.status === 'warning') ? 'warning' :
    healthChecks.every(check => check.status === 'healthy') ? 'healthy' : 'checking'
  ) : 'checking';

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          {getStatusIcon(overallStatus)}
          <h2 className="text-lg font-semibold text-gray-900">System Health Check</h2>
        </div>
        <button
          onClick={runHealthChecks}
          disabled={isRunning}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          <ArrowPathIcon className={`h-4 w-4 ${isRunning ? 'animate-spin' : ''}`} />
          {isRunning ? 'Checking...' : 'Run Check'}
        </button>
      </div>

      <div className="space-y-3">
        {healthChecks.map((check) => (
          <div
            key={check.id}
            className={`p-4 rounded-lg border ${getStatusColor(check.status)}`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {getStatusIcon(check.status)}
                <div>
                  <h3 className="font-medium text-gray-900">{check.name}</h3>
                  <p className="text-sm text-gray-600">{check.message}</p>
                </div>
              </div>
              {check.lastChecked && (
                <span className="text-xs text-gray-500">
                  {check.lastChecked.toLocaleTimeString()}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {overallStatus === 'error' && (
        <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <h3 className="font-medium text-red-900 mb-2">Critical Issues Detected</h3>
          <p className="text-sm text-red-700">
            Some critical issues were found that may affect admin functionality. 
            Please address these issues or contact support.
          </p>
        </div>
      )}
    </div>
  );
};

export default AdminHealthCheck;
