import React, { useState, useEffect } from 'react';
import { useNavigate, Routes, Route } from "react-router-dom";
import axios from 'axios';
import './App.css';
import './Budget.css';
import Budgets from './components/Budgets';
import Accounts from './components/Accounts';
import Expenses from './components/Expenses';
import Main_Totals from './components/Main_Totals';

const API_BASE = "http://localhost:8000";


function App() {

  return (
    <Routes>
      <Route exact path="/" element={<Accounts />} />
      <Route exact path='/main/:accountId' element={<Main_Totals />} />
      <Route path="/budgets/:accountId" element={<Budgets />} />
      <Route path="/expenses/:budgetId" element={<Expenses />} />

    </Routes>

  );
}

export default App;
