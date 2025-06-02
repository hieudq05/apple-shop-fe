import React from 'react';
import {useRoutes} from 'react-router-dom';
import {routesConfig} from "./routes";
import { CartProvider } from './contexts/CartContext';

const App: React.FC = () => {
    const routes = useRoutes(routesConfig);
    
    return (
        <CartProvider>
            {routes}
        </CartProvider>
    );
};

export default App;
