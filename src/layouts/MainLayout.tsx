import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/layout/Navbar'; // Adjusted path

const MainLayout: React.FC = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <>
            <Navbar onMenuToggle={setIsMenuOpen} />
            {isMenuOpen && (
                <div
                    className="fixed inset-0 z-20"
                    aria-hidden="true"
                    onClick={() => setIsMenuOpen(false)} // Close menu by clicking backdrop
                />
            )}
            <main>
                <Outlet /> {/* Child routes will render here */}
            </main>
            {/* You can add a Footer component here later */}
            {/* <Footer /> */}
        </>
    );
};

export default MainLayout;
