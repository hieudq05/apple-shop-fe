import React from 'react';
import {Outlet} from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Footer from "../components/Footer.tsx"; // Adjusted path

const MainLayout: React.FC = () => {

    return (
        <>
            <Navbar/>
            <main>
                <Outlet/> {/* Child routes will render here */}
            </main>
            <Footer/>
        </>
    );
};

export default MainLayout;
