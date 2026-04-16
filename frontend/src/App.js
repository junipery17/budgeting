import React, { useState, useEffect } from 'react';
import { useNavigate, Routes, Route } from "react-router-dom";
import axios from 'axios';
import './App.css';
import './Budget.css';
import Budgets from './components/Budgets';
import Accounts from './components/Accounts'

const API_BASE = "http://localhost:8000";


function App() {

  return (
    <Routes>
      <Route exact path="/" element={<Accounts />} />
      <Route path="/budgets/:accountId" element={<Budgets />} />
    </Routes>

  );
}

export default App;
