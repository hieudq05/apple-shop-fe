import React from "react";
import { useRoutes } from "react-router-dom";
import { routesConfig } from "./routes";
import { CartProvider } from "./contexts/CartContext";
import { AuthProvider } from "./contexts/AuthContext";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider.tsx";
import { HelmetProvider } from 'react-helmet-async';

const App: React.FC = () => {
    const routes = useRoutes(routesConfig);

    return (
        <HelmetProvider>
            <AuthProvider>
                <ThemeProvider>
                    <CartProvider>
                        {routes}
                        <Toaster position="top-right" richColors />
                    </CartProvider>
                </ThemeProvider>
            </AuthProvider>
        </HelmetProvider>
    );
};

export default App;
