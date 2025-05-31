import type {RouteObject} from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import HomePage from '../pages/HomePage';
import LoginPage from '../pages/LoginPage';
import ProductsPage from "../pages/ProductsPage.tsx";

export const routesConfig: RouteObject[] = [
    {
        path: '/',
        element: <MainLayout />,
        children: [
            { index: true, element: <HomePage /> },
            // Add other pages that use MainLayout here
            // { path: 'products', element: <ProductsPage /> },
            {
                path: 'products/:categoryId',
                element: <ProductsPage />, // Example for a products page
            }
        ],
    },
    {
        path: '/login',
        element: <LoginPage />, // LoginPage might not use MainLayout or use a different one
    },
    // {
    //     path: '*',
    //     element: <NotFoundPage /> // A catch-all 404 page
    // }
];
