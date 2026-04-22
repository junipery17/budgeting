import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from "react-router-dom";
import axios from 'axios';

const API_BASE = "http://localhost:8000";

function Expenses() {
    const [expenses, setExpenses] = useState([]);
    const [showMakeExpense, setShowMakeExpense] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        fetchExpenses();
    }, []);

    const fetchExpenses = async () => {
        try {
            const response = await axios.get(`${API_BASE}/api/expenses/${location.state.budgetId}`);
            setExpenses(response.data.expenses);
        } catch (error) {
            console.error("Error fetching expenses: ", error);
        }
    };

    return (

        <div>
            {expenses.length === 0 ? (
                <p>No expenses found</p>
            ) : (
                <ul className="grid">
                    <li className="budget-headers">
                        <h3>Budget Name</h3>
                        <h3>Amount</h3>
                        <h3>Type (maybe change to month)</h3>
                        <h3>Remaining</h3>
                        <h3>View Expenses</h3>
                        <h3>Delete</h3>
                    </li>
                    {expenses.map(expense => (
                        <li className="account-names" key={expense.expense_id}>
                            <h3>{expense.budget_type}</h3>
                            <p>{expense.cost}</p>
                        </li>

                    ))}
                </ul>
            )}
        </div >
    );
}

export default Expenses;
