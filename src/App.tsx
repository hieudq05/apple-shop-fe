import React from 'react';
import {useRoutes} from 'react-router-dom';
import {routesConfig} from './routes';
import './App.css'; // Assuming you have global styles here

const App: React.FC = () => {
    return useRoutes(routesConfig);
};

export default App;
