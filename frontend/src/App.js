import React from 'react';
import { Routes, Route, renderMatches } from "react-router-dom";

import './Budget.css';
import Budgets from './components/Budgets';
import Accounts from './components/Accounts';
import Expenses from './components/Expenses';
import Main_Totals from './components/Main_Totals';
import Visualizations from './components/Visualizations';


function App() {

  return (
    <Routes>
      <Route exact path="/" element={<Accounts />} />
      <Route exact path='/main/:accountId' element={<Main_Totals />} />
      <Route path="/budgets/:totalId" element={<Budgets />} />
      <Route path="/expenses/:budgetId" element={<Expenses />} />
      <Route path="/visualizations/:accountId" element={<Visualizations />} />
    </Routes>

  );
}

export default App;
