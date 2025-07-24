import React from "react";
import { useRoutes } from "react-router-dom";
import { routesConfig } from "./routes";
import { CartProvider } from "./contexts/CartContext";
import { AuthProvider } from "./contexts/AuthContext";
import { Toaster } from "@/components/ui/sonner";
import {ThemeProvider} from "@/components/theme-provider.tsx";

const App: React.FC = () => {
    const routes = useRoutes(routesConfig);

    return (
        <AuthProvider>
            <ThemeProvider>
                <CartProvider>
                    {routes}
                    <Toaster position="top-right" richColors />
                </CartProvider>
            </ThemeProvider>
        </AuthProvider>
    );
};

export default App;
