import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from "react-router-dom";
import axios from 'axios';

const API_BASE = "http://localhost:8000";

function Budgets() {
    const [budgets, setBudgets] = useState([]);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        fetchBudgets();
    }, []);

    const fetchBudgets = async () => {
        try {
            const response = await axios.get(`${API_BASE}/api/budgets/${location.state.accountid}`);
            setBudgets(response.data.budgets);
        } catch (error) {
            console.error("Error fetching accounts: ", error);
        }
    };
    return (
        <div className="App">
            <h1 className="title">{ }</h1>
            <div className="accounts-list">
                <h2 className="subtitle">Budgets</h2>
                {budgets.length === 0 ? (
                    <p>No Budgets found</p>
                ) : (
                    <ul className="grid">
                        {budgets.map(budget => (
                            <li className="account-names" key={budget.budget_id}>
                                <h3>{budget.budget_type}</h3>
                                <p>{budget.amount}</p>
                            </li>

                        ))}
                    </ul>
                )}
            </div>
            <button>Make New Budget</button>
        </div>
    );
}

export default Budgets;
