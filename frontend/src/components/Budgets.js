import React, { useState, useEffect } from 'react';
import flowbite, { initDropdowns } from "flowbite";
import { useNavigate, useLocation } from "react-router-dom";
import axios from 'axios';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import InputLabel from '@mui/material/InputLabel';
import InputAdornment from '@mui/material/InputAdornment';
import Input from '@mui/material/Input';

const API_BASE = "http://localhost:8000";

function Budgets() {
    const [budget, setBudget] = useState([]);
    const [allCategories, setAllCategories] = useState([]);
    const [expenses, setExpenses] = useState([]);
    const [showMakeBudget, setShowMakeBudget] = useState(false);
    const [newExpenseOpen, setNewExpenseOpen] = useState(false);
    const [month, setMonth] = useState('');
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        fetchBudget(location.state.budget_id);
        fetchExpenses(location.state.budget_id);
        fetchAllCategories();
        initDropdowns();
    }, []);

    const fetchBudget = async (budget_id) => {
        try {
            const response = await axios.get(`${API_BASE}/api/budgets/${location.state.totalId}/${budget_id}`);
            console.log(response);
            setBudget(response.data.budgets);
        } catch (error) {
            console.error("Error fetching budgets: ", error);
        }
    };

    const fetchExpenses = async (budget_id) => {
        try {
            const response = await axios.get(`${API_BASE}/api/expenses/${budget_id}`);
            setExpenses(response.data.expenses);
        } catch (error) {
            console.error("Error finding expenses: ", error);
        }
    };

    const fetchAllCategories = async () => {
        try {
            const response = await axios.get(`${API_BASE}/api/budgets/${location.state.totalId}`);
            setAllCategories(response.data.budgets);
        } catch (error) {
            console.error("error fetching all budgets", error);
        }
    };

    const handleNewExpenseOpen = () => {
        setNewExpenseOpen(true);
    };

    const handleNewExpenseClose = () => {
        setNewExpenseOpen(false);
    };

    function goBackToAccounts() {
        navigate(-1);
    };

    async function changeCat(budget_id) {
        fetchBudget(budget_id);
        fetchExpenses(budget_id);
    };

    function handleDelete(e) {
        if (window.confirm(`Are you sure you would like to delete "${e.description}" forever?`) === true) {
            try {
                axios.delete(`${API_BASE}/api/expenses/${e.expense_id}`).then(response => {
                    window.location.reload();
                });
            } catch (error) {
                console.error("Unable to delete expense: ", error);
            }
        }
    }

    function makeNewExpense(event) {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const formJson = Object.fromEntries(formData.entries());
        try {
            axios.post(`${API_BASE}/api/expenses`, {
                "budget_id": budget.budget_id,
                "description": formJson.expense_description,
                "cost": formJson.cost
            }).then(response => {
                window.location.reload();
            });
        } catch (error) {
            console.log("error making new expense: ", error);
        }
    };

    function handleClick(id, name) {
        navigate(`/expenses/${id}`, {
            state: {
                budgetId: id,
                budgetName: name,
            }
        });
    };

    function newExpenseDisplay() {
        return (
            <Dialog open={newExpenseOpen} onClose={handleNewExpenseClose}>
                <DialogTitle>Add a New Expense</DialogTitle>
                <DialogContent>
                    <form onSubmit={makeNewExpense} id="new-expense-form">
                        <p>Budget Category: {budget.budget_type}</p>
                        Description
                        <TextField
                            autoFocus
                            required
                            margin="dense"
                            name="expense_description"
                            fullWidth
                            variant='standard'
                        />
                        <InputLabel htmlFor="standard-adornment-amount">Amount</InputLabel>
                        <Input
                            name="cost"
                            startAdornment={<InputAdornment position="start">$</InputAdornment>}
                        />
                    </form>
                </DialogContent>
                <DialogActions>
                    <button onClick={handleNewExpenseClose}>Cancel</button>
                    <button type="submit" form="new-expense-form">
                        Create
                    </button>
                </DialogActions>
            </Dialog>
        );
    }

    return (
        <div className="SubBudget">
            <button class="rounded-full bg-white mx-5 my-5 w-24" onClick={goBackToAccounts}>Back</button>

            <h1 class="title">{budget.budget_type}</h1>
            <div class="grid grid-cols-2">
                <div>
                    <button class="text-center items-center p-3 ml-5 bg-[#1e643c] text-white" onClick={handleNewExpenseOpen}>Add expense</button>
                </div>
                {newExpenseDisplay()}
                <div class="col-start-6 dropdown" data-placement="bottom-start">

                    <button id="chooseCategory" data-dropdown-toggle="dropdown" class="inline-flex items-center justify-center text-white bg-[#1e643c] box-border border border-transparent hover:bg-brand-strong focus:ring-4 focus:ring-brand-medium shadow-xs font-medium leading-5 rounded-base text-sm px-4 py-2.5 focus:outline-none" type="button">
                        Select Category
                        <svg class="w-4 h-4 ms-1.5 -me-0.5 bg-inherit" aria-hidden="true" width="24" height="24" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m19 9-7 7-7-7" /></svg>
                    </button>
                    <div id="dropdown" class="z-10 hidden bg-neutral-primary-medium border border-default-medium rounded-base shadow-lg w-44">
                        <ul class="p-2 text-sm text-body font-medium" aria-labelledby="dropdownDefaultButton">
                            {allCategories.map(category => (
                                <li key={category.budget_id}>
                                    <button onClick={() => changeCat(category.budget_id)} class="inline-flex items-center w-full p-2 hover:bg-neutral-tertiary-medium hover:text-heading rounded">{category.budget_type}</button>
                                </li>
                            ))}
                        </ul>
                    </div>

                </div>
            </div>


            <div class="m-10 rounded-3xl bg-[#efece0] p-6">
                <h2 className="subtitle">Expenses</h2>
                {expenses.length === 0 ? (
                    <p>No Expenses found yet</p>
                ) : (
                    <ul class="grid grid-cols-7">
                        <li className="budget-headers">
                            <h3 class="col-span-4 text-left">Description</h3>
                            <h3 class="content-center">Cost</h3>
                            <h3 class="content-center">Delete</h3>
                        </li>
                        {expenses.map(expense => (
                            <li key={expense.expense_id} className="budget-headers">
                                <p class="col-span-4 text-left">{expense.description}</p>
                                <p class="content-center">${expense.cost}</p>
                                <div class="items-center text-center p-9 bg-[#bebbab]">
                                    <button onClick={() => handleDelete(expense)}><DeleteRoundedIcon className="icon" /></button>
                                </div>
                            </li>
                        ))}

                    </ul>
                )}
            </div>
            <div>
                edit Category
            </div>
        </div>
    );
}

export default Budgets;
