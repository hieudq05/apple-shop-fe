import type {RouteObject} from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import AdminLayout from '../layouts/AdminLayout';
import ProtectedRoute from '../components/ProtectedRoute';
import HomePage from '../pages/HomePage';
import UserLoginPage from '../pages/auth/UserLoginPage';
import AdminLoginPage from '../pages/auth/AdminLoginPage';
import OtpVerificationPage from '../pages/auth/OtpVerificationPage';
import RegisterPage from '../pages/RegisterPage';
import CategoriesPage from '../pages/CategoriesPage';
import SearchPage from '../pages/SearchPage';
import AccountPage from '../pages/AccountPage';
import RecentlyViewedPage from '../pages/RecentlyViewedPage';
import ProductComparisonPage from '../pages/ProductComparisonPage';
import NotFoundPage from '../pages/NotFoundPage';
import ProductsPage from "../pages/ProductsPage.tsx";
import ProductPage from "../pages/ProductPage.tsx";
import CartPage from "../pages/CartPage.tsx";
import PaymentPage from "../pages/PaymentPage";
import ProfilePage from "../pages/ProfilePage.tsx";
import OrderHistoryPage from "../pages/OrderHistoryPage.tsx";
import WishlistPage from "../pages/WishlistPage.tsx";
import ReviewsPage from "../pages/ReviewsPage.tsx";
import AdminDashboard from "../pages/admin/AdminDashboard.tsx";
import AdminProducts from "../pages/admin/AdminProducts.tsx";
import AdminOrders from "../pages/admin/AdminOrders.tsx";
import AdminUsers from "../pages/admin/AdminUsers.tsx";
import AdminSettings from "../pages/admin/AdminSettings.tsx";
import AdminAnalytics from "../pages/admin/AdminAnalytics.tsx";
import AdminProductDetail from "../pages/admin/AdminProductDetail.tsx";
import ApiTestPage from "../pages/ApiTestPage.tsx";

export const routesConfig: RouteObject[] = [
    // Guest-only authentication routes (no layout)
    {
        path: '/login',
        element: (
            <ProtectedRoute guestOnly={true} requireAuth={false}>
                <UserLoginPage/>
            </ProtectedRoute>
        ),
    },
    {
        path: '/register',
        element: (
            <ProtectedRoute guestOnly={true} requireAuth={false}>
                <RegisterPage/>
            </ProtectedRoute>
        ),
    },
    {
        path: '/verify-otp',
        element: (
            <ProtectedRoute guestOnly={true} requireAuth={false}>
                <OtpVerificationPage/>
            </ProtectedRoute>
        ),
    },
    {
        path: '/admin/login',
        element: (
            <ProtectedRoute guestOnly={true} requireAuth={false}>
                <AdminLoginPage/>
            </ProtectedRoute>
        ),
    },

    // User routes with MainLayout
    {
        path: '/',
        element: <MainLayout/>,
        children: [
            // Public routes (no authentication required)
            {index: true, element: <HomePage/>},
            {
                path: 'categories',
                element: <CategoriesPage/>,
            },
            {
                path: 'search',
                element: <SearchPage/>,
            },
            {
                path: 'recently-viewed',
                element: <RecentlyViewedPage/>,
            },
            {
                path: 'compare',
                element: <ProductComparisonPage/>,
            },
            {
                path: 'products/:categoryId',
                element: <ProductsPage/>,
            },
            {
                path: 'product/:productId',
                element: <ProductPage/>,
            },

            // Protected user routes (authentication required)
            {
                path: 'cart',
                element: (
                    <ProtectedRoute requireAuth={true}>
                        <CartPage/>
                    </ProtectedRoute>
                ),
            },
            {
                path: 'payment',
                element: (
                    <ProtectedRoute requireAuth={true}>
                        <PaymentPage/>
                    </ProtectedRoute>
                ),
            },
            {
                path: 'account',
                element: (
                    <ProtectedRoute requireAuth={true}>
                        <AccountPage/>
                    </ProtectedRoute>
                )
            },
            {
                path: 'profile',
                element: (
                    <ProtectedRoute requireAuth={true}>
                        <ProfilePage/>
                    </ProtectedRoute>
                )
            },
            {
                path: 'order-history',
                element: (
                    <ProtectedRoute requireAuth={true}>
                        <OrderHistoryPage/>
                    </ProtectedRoute>
                )
            },
            {
                path: 'wishlist',
                element: (
                    <ProtectedRoute requireAuth={true}>
                        <WishlistPage/>
                    </ProtectedRoute>
                )
            },
            {
                path: 'reviews',
                element: (
                    <ProtectedRoute requireAuth={true}>
                        <ReviewsPage/>
                    </ProtectedRoute>
                )
            },
        ],
    },

    // Admin routes with AdminLayout (admin-only access)
    {
        path: '/admin',
        element: (
            <ProtectedRoute requireAuth={true} adminOnly={true}>
                <AdminLayout/>
            </ProtectedRoute>
        ),
        children: [
            {
                index: true,
                element: <AdminDashboard/>,
            },
            {
                path: 'dashboard',
                element: <AdminDashboard/>,
            },
            {
                path: 'products',
                element: <AdminProducts/>,
            },
            {
                path: 'products/:categoryId/:productId',
                element: <AdminProductDetail/>,
            },
            {
                path: 'orders',
                element: <AdminOrders/>,
            },
            {
                path: 'users',
                element: <AdminUsers/>,
            },
            {
                path: 'analytics',
                element: <AdminAnalytics/>,
            },
            {
                path: 'settings',
                element: <AdminSettings/>,
            },
            {
                path: 'api-test',
                element: <ApiTestPage/>,
            },
        ],
    },

    // 404 Not Found - catch all routes
    {
        path: '*',
        element: <NotFoundPage/>,
    },
];
