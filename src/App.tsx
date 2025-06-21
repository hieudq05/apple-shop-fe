import React from 'react';
import {useRoutes} from 'react-router-dom';
import {routesConfig} from "./routes";
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { ToastProvider } from './contexts/ToastContext';
import { RecentlyViewedProvider } from './contexts/RecentlyViewedContext';
import { ProductComparisonProvider } from './contexts/ProductComparisonContext';
import AuthGuard from './components/AuthGuard';
import ErrorBoundary from './components/ErrorBoundary';
import PWAInstallPrompt from './components/PWAInstallPrompt';
import NetworkStatus from './components/NetworkStatus';
import { ComparisonFloatingButton } from './components/ProductComparison';

const App: React.FC = () => {
    const routes = useRoutes(routesConfig);

    return (
        <HelmetProvider>
            <ErrorBoundary>
                <ToastProvider>
                    <AuthProvider>
                        <AuthGuard>
                            <RecentlyViewedProvider>
                                <ProductComparisonProvider>
                                    <CartProvider>
                                        <NetworkStatus />
                                        {routes}
                                        <PWAInstallPrompt />
                                        <ComparisonFloatingButton />
                                    </CartProvider>
                                </ProductComparisonProvider>
                            </RecentlyViewedProvider>
                        </AuthGuard>
                    </AuthProvider>
                </ToastProvider>
            </ErrorBoundary>
        </HelmetProvider>
    );
};

export default App;
