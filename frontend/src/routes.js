import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Budgets from "./components/Budgets"

const createRoutes = (
    <Routes>
        <Route exact path="/components/budgets" element={<Budgets />} />
    </Routes>
);

export default createRoutes

