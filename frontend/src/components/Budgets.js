import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from "react-router-dom";
import axios from 'axios';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormHelperText from '@mui/material/FormHelperText';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';

const API_BASE = "http://localhost:8000";

function Budgets() {
    const [budgets, setBudgets] = useState([]);
    const [showMakeBudget, setShowMakeBudget] = useState(false);
    const [month, setMonth] = useState('');
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
            console.error("Error fetching budgets: ", error);
        }
    };

    const handleMonthChange = (event) => {
        setMonth(event.target.value);
        console.log(event.target.value);
    };

    function goBackToAccounts() {
        navigate(-1);
    };

    function handleSubmit(e) {
        e.preventDefault();
        const form = e.target;
        const formData = new FormData(form);
        const formJson = Object.fromEntries(formData.entries());
        console.log(formJson);
        // try {
        //     axios.post(`${API_BASE}/api/accounts`, {
        //         "name": formJson.newAccountName,
        //     }).then(response => {
        //         alert(`Made new account with name: ${formJson.newAccountName}`);
        //         window.location.reload();
        //     });
        // } catch (error) {
        //     alert("Owie noo couldn't make new account :(");
        //     console.error("Cannot make new account: ", error);
        // }
    };

    function handleClick(id, name) {
        navigate(`/expenses/${id}`, {
            state: {
                budgetId: id,
                budgetName: name,
            }
        });
    };

    function handleMoreClick() {
        setShowMakeBudget(!showMakeBudget);
    };

    return (
        <div className="App">
            <button onClick={goBackToAccounts}>Back to Accounts</button>
            <h1 className="title">{location.state.accountName}</h1>
            <button>Add expense (with option to put in what category and a date so it auto puts in the right month hopefully)</button>
            <div className="accounts-list">
                <h2 className="subtitle">Budgets</h2>
                {budgets.length === 0 ? (
                    <p>No Budgets found</p>
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
                        {budgets.map(budget => (
                            <li className="account-names" key={budget.budget_id}>
                                <h3>{budget.budget_type}</h3>
                                <p>{budget.amount}</p>
                                <p>{budget.monthly ? "Monthly" : "Annual"}</p>
                                <p>money left</p>
                                <button onClick={() => handleClick(budget.budget_id, budget.budget_type)}>Expenses</button>
                                <button>Delete button</button>
                            </li>

                        ))}
                    </ul>
                )}
            </div>
            <p>
                probably should make diff table for totals
            </p>
            {showMakeBudget &&
                <form method="post" onSubmit={handleSubmit}>
                    <label>
                        Budget Category: <input name='budgetCategory' ></input>
                    </label>
                    <h2></h2>
                    <label>
                        <Select
                            value={month}
                            onChange={handleMonthChange}>
                            <MenuItem value="">
                                <em>Month</em>
                            </MenuItem>
                            <MenuItem value={"January"}>January</MenuItem>
                            <MenuItem value={"February"}>February</MenuItem>
                            <MenuItem value={"March"}>March</MenuItem>
                        </Select>
                    </label>
                    <button type="submit"> Create </button>
                </form>
            }
            <button onClick={handleMoreClick}>{showMakeBudget ? "Close" : "Make New Budget"}</button>
        </div>
    );
}

export default Budgets;
