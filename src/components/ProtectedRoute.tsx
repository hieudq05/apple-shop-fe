import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
    children: React.ReactNode;
    requireAdmin?: boolean;
    requireAuth?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
    children, 
    requireAdmin = false, 
    requireAuth = true 
}) => {
    const { isAuthenticated, isAdmin, user } = useAuth();
    const location = useLocation();

    // If authentication is required but user is not authenticated
    if (requireAuth && !isAuthenticated) {
        // Redirect to appropriate login page
        const redirectTo = requireAdmin ? '/admin/login' : '/login';
        return <Navigate to={redirectTo} state={{ from: location }} replace />;
    }

    // If admin access is required but user is not admin
    if (requireAdmin && !isAdmin) {
        // If user is authenticated but not admin, show access denied
        if (isAuthenticated) {
            return (
                <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                    <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6 text-center">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                            </svg>
                        </div>
                        <h2 className="text-xl font-semibold text-gray-900 mb-2">Truy cập bị từ chối</h2>
                        <p className="text-gray-600 mb-4">
                            Bạn không có quyền truy cập vào trang này. Chỉ quản trị viên mới có thể truy cập.
                        </p>
                        <div className="space-y-2">
                            <button
                                onClick={() => window.history.back()}
                                className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                            >
                                Quay lại
                            </button>
                            <a
                                href="/"
                                className="block w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Về trang chủ
                            </a>
                        </div>
                    </div>
                </div>
            );
        }
        // If not authenticated, redirect to admin login
        return <Navigate to="/admin/login" state={{ from: location }} replace />;
    }

    // If all checks pass, render the protected content
    return <>{children}</>;
};

export default ProtectedRoute;
