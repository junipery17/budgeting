import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from "react-router-dom";
import axios from 'axios';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import ModeEditIcon from '@mui/icons-material/ModeEdit';
import PlotlyComponent from 'react-plotly.js';

const Plot = (PlotlyComponent as any).default || PlotlyComponent;
const API_BASE = "http://localhost:8000";

interface BudgetData {
    category_id: number;
    budget_id: number;
    amount: number;
    month: number;
    year: number;
};

interface ExpenseData {
    expense_id: number;
    budget_id: number;
    cost: number;
    description: string;
};

const months: { [key: number]: string } = {
    1: "January",
    2: "February",
    3: "March",
    4: "April",
    5: "May",
    6: "June",
    7: "July",
    8: "August",
    9: "September",
    10: "October",
    11: "November",
    12: "December"
};

export default function Budgets() {
    const [budget, setBudget] = useState<BudgetData>({ "category_id": -1, "budget_id": -1, "amount": 0, "month": 0, "year": 0 });
    const [allBudgets, setAllBudgets] = useState<BudgetData[]>([]);
    const [allCategories, setAllCategories] = useState<{ [key: number]: string }>({});
    const [expenses, setExpenses] = useState<ExpenseData[]>([]);
    const [expenseSum, setExpenseSum] = useState(0);
    const [newExpenseOpen, setNewExpenseOpen] = useState(false);
    const [editExpenseOpen, setEditExpenseOpen] = useState(false);
    const [currentEditingExpense, setCurrentEditingExpense] = useState<ExpenseData>({ "budget_id": -1, "expense_id": -1, "cost": 0, "description": "" });
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        fetchBudget(location.state.budget_id);
        fetchExpenses(location.state.budget_id);
        fetchAllBudgets();
        fetchAllCategories(location.state.account_id);
        fetchSumExpenses(location.state.budget_id);
    }, []);

    const fetchBudget = async (budget_id: number) => {
        try {
            var response = await axios.get(`${API_BASE}/api/budgets/${budget_id}`);
            setBudget(response.data.budgets);
        } catch (error) {
            console.error("Error fetching budgets: ", error);
        }
    };

    const fetchExpenses = async (budget_id: number) => {
        try {
            var response = await axios.get(`${API_BASE}/api/expenses/${budget_id}`);
            setExpenses(response.data.expenses);
        } catch (error) {
            console.error("Error finding expenses: ", error);
        }
    };

    const fetchSumExpenses = async (budget_id: number) => {
        try {
            var response = await axios.get(`${API_BASE}/api/calculate/${budget_id}`);
            setExpenseSum(response.data.total);
        } catch (error) {
            console.error("Error fetching expenses sum: ", error);
        }
    };

    const fetchAllBudgets = async () => {
        try {
            var response = await axios.get(`${API_BASE}/api/budgets/${location.state.month}/${location.state.year}`);
            setAllBudgets(response.data.budgets);
        } catch (error) {
            console.error("error fetching all budgets", error);
        }
    };

    const fetchAllCategories = async (account_id: number) => {
        try {
            var response = await axios.get(`${API_BASE}/api/categories/${account_id}`);
            setAllCategories(response.data.categories);
        } catch (error) {
            console.error("Error finding all categories: ", error);
        }
    };

    const handleNewExpenseOpen = () => {
        setNewExpenseOpen(true);
    };

    const handleNewExpenseClose = () => {
        setNewExpenseOpen(false);
    };

    const handleOpenEdit = (id: number, description: string, cost: number, budget_id: number) => {
        setCurrentEditingExpense({ "expense_id": id, "description": description, "cost": cost, "budget_id": budget_id });
        setEditExpenseOpen(true);
    };

    const handleCloseEdit = () => {
        setEditExpenseOpen(false);
    };

    function goBackToAccounts() {
        navigate(-1);
    };

    async function changeCat(budget_id: number) {
        fetchBudget(budget_id);
        fetchExpenses(budget_id);
        fetchSumExpenses(budget_id);
    };

    function handleDelete(expense: ExpenseData) {
        if (window.confirm(`Are you sure you would like to delete "${expense.description}" forever?`) === true) {
            try {
                axios.delete(`${API_BASE}/api/expenses/${expense.expense_id}`).then(_ => {
                    window.location.reload();
                });
            } catch (error) {
                console.error("Unable to delete expense: ", error);
            }
        }
    }

    function editSelectedExpense(event: React.SubmitEvent) {
        event.preventDefault();
        handleCloseEdit();
        var form = event.target;
        var formData = new FormData(form);
        var formJson = Object.fromEntries(formData.entries());
        if ((formJson.expense_description === currentEditingExpense.description) && (Number(formJson.cost) === currentEditingExpense.cost)) {
            return;
        }
        try {
            axios.patch(`${API_BASE}/api/expenses/${currentEditingExpense.expense_id}`, {
                "expense_id": currentEditingExpense.expense_id,
                "budget_id": currentEditingExpense["budget_id"],
                "description": formJson.expense_description,
                "cost": formJson.cost
            });
            fetchExpenses(location.state.budget_id);
        } catch (error) {
            console.log("error editing expense: ", error);
        }
    };

    function makeNewExpense(event: React.SubmitEvent) {
        event.preventDefault();
        var form = event.target;
        var formData = new FormData(form);
        var formJson = Object.fromEntries(formData.entries());
        try {
            axios.post(`${API_BASE}/api/expenses`, {
                "budget_id": budget.budget_id,
                "description": formJson.expense_description,
                "cost": formJson.cost
            }).then(_ => {
                window.location.reload();
            });
        } catch (error) {
            console.log("error making new expense: ", error);
        }
    };

    function editExpenseDisplay() {
        return (
            <Dialog open={editExpenseOpen} onClose={handleCloseEdit}>
                <form onSubmit={editSelectedExpense} id="edit-expense-form" className="bg-base-200">
                    <fieldset className="fieldset bg-base-200 border-base-300 rounded-box w-xs border p-4">
                        <legend className="fieldset-legend">Edit Expense</legend>

                        <label className="label">Description</label>
                        <input className="input" id="expense_description" name="expense_description" required defaultValue={currentEditingExpense.description} />

                        <label className="label">Cost</label>
                        <label className="input">
                            $
                            <input id="cost" name="cost" required defaultValue={currentEditingExpense.cost} />
                        </label>
                        <DialogActions>
                            <button className="btn btn-neutral mt-4" onClick={handleCloseEdit}>Cancel</button>
                            <button className="btn btn-neutral mt-4" type="submit" form="edit-expense-form">Edit</button>
                        </DialogActions>
                    </fieldset>
                </form>
            </Dialog>
        );
    };

    function newExpenseDisplay() {
        return (
            <Dialog open={newExpenseOpen} onClose={handleNewExpenseClose}>
                <form onSubmit={makeNewExpense} id="new-expense-form" className="bg-base-200">
                    <fieldset className="fieldset bg-base-200 border-base-300 rounded-box w-xs border p-4">
                        <legend className="fieldset-legend">New Expense in {allCategories[budget.category_id]}</legend>

                        <label className="label">Description</label>
                        <input className="input" id="expense_description" name="expense_description" required />

                        <label className="label">Cost</label>
                        <input className="input" id="cost" name="cost" required />
                    </fieldset>
                    <DialogActions>
                        <button className="btn btn-neutral mt-4" onClick={handleNewExpenseClose}>Cancel</button>
                        <button className="btn btn-neutral mt-4" type="submit" form="new-expense-form">Add</button>
                    </DialogActions>
                </form>
            </Dialog>
        );
    };

    return (
        <div className="flex">
            <div className="flex-none w-75 min-h-screen bg-base-200 relative">
                <div className="flex flex-col grow border-r border-gray-200 pt-5 pb-4">
                    <div className="px-4">
                        <span className="text-base-200-content font-bold text-4xl">{allCategories[budget.category_id]}</span>
                    </div>
                    <div className='px-4'>
                        <span className="text-base-200-content italic text-2xl">{months[location.state.month]}, {location.state.year}</span>
                    </div>
                    <div className="mt-5 grow flex flex-col">
                        <ul className="menu bg-base-200 rounded-box my-5">
                            <li><h1 className="menu-title text-base-content">Navigation</h1></li>
                            <li>
                                <button className="font-bold" onClick={goBackToAccounts}>Back to MainPage</button>
                            </li>
                            <li>
                                <h2 className="menu-title">Add New Info</h2>
                                <ul>
                                    <li><button className="font-bold" onClick={handleNewExpenseOpen}>Add Expense</button></li>
                                </ul>
                            </li>
                        </ul>
                    </div>
                </div>
                {newExpenseDisplay()}
            </div>
            <div className="flex flex-row min-w-0 min-h-0 ml-10">
                <div>
                    <h1 className="font-bold text-4xl m-7">Budget Breakdown</h1>
                    <div className="m-5">
                        <select className="select select-secondary" defaultValue={"Select a Category"}>
                            <option disabled>Select a Category</option>
                            {allBudgets.map(category => (
                                <option key={category.budget_id} onClick={() => changeCat(category.budget_id)}>
                                    {allCategories[category.category_id]}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="flex flex-col h-46">
                        <div className="card card-border bg-base-200 my-3 mx-5 p-2 w-lg flex-1 border-primary border-4">
                            <div className="card-body">
                                <h2 className="card-title text-base-content">Allocated</h2>
                                <p className="text-3xl text-base-content text-center">${budget.amount.toFixed(2)}</p>
                                <div className="card-actions justify-end">
                                    <h2 className="text-base-content">{(1) >= 0 ? (
                                        "within budget"
                                    ) : (
                                        "over budget :("
                                    )}
                                    </h2>
                                </div>
                            </div>
                        </div>

                        <div className="card card-border bg-base-200 border-primary border-4 m-2 text-center align-middle my-3 mx-5 p-2 w-lg flex-1">
                            <div className="card-body">
                                <h3 className="card-title text-base-content">Spent </h3>

                                <h3 className="text-3xl text-base-content">
                                    <Plot
                                        data={[
                                            {
                                                type: "indicator",
                                                mode: "gauge",
                                                gauge: { shape: "bullet", axis: { range: [0, budget.amount] } },
                                                value: expenseSum,
                                                domain: { x: [0, 1], y: [0, 1] }
                                            }
                                        ]}
                                        layout={{
                                            width: 425,
                                            height: 75,
                                            margin: {
                                                l: 20,
                                                r: 20,
                                                b: 20,
                                                t: 20,
                                                pad: 4
                                            },
                                            paper_bgcolor: "rgba(0,0,0,0)",
                                        }}
                                    />
                                </h3>
                                <div className="card-actions justify-end">
                                    <h2>${expenseSum.toFixed(2)} currently spent</h2>
                                </div>
                            </div>
                        </div>

                        <div className="card card-border bg-base-200 border-primary border-4 m-2 text-center align-middle my-3 mx-5 p-2 w-lg flex-1">
                            <div className="card-body">
                                <h3 className="card-title text-base-content">Monthly Amount</h3>
                                <h3 className="text-3xl text-base-content">
                                    <Plot
                                        data={[
                                            {
                                                values: [expenseSum, (budget.amount - expenseSum)],
                                                labels: ["spent", "rest"],
                                                type: "pie",
                                                hole: 0.4,
                                                texttemplate: "$%{value}",
                                            }
                                        ]}
                                        layout={{
                                            width: 250,
                                            height: 200,
                                            margin: {
                                                l: 30,
                                                r: 30,
                                                b: 10,
                                                t: 10,
                                                pad: 4
                                            },
                                            paper_bgcolor: "rgba(0,0,0,0)",
                                            showlegend: false,
                                        }}
                                    />
                                </h3>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col m-5 mt-42 ml-10 min-w-0 min-h-0 grow w-4xl">
                    <div className="items-center text-center align-middle">
                        <h1 className="bg-primary text-primary-content font-bold rounded-md p-5 mx-5 mb-5 glass">Expenses</h1>
                    </div>
                    <div className="h-164 rounded-xl m-2 mx-5 bg-base-200 border border-primary overflow-y-scroll">
                        <table className="table block">
                            <thead className="bg-base-300">
                                <tr>
                                    <th className="sticky top-0 z-1">Description</th>
                                    <th className="sticky top-0 z-1">Cost</th>
                                    <th className="sticky top-0 z-1">Edit</th>
                                    <th className="sticky top-0 z-1">Delete</th>
                                </tr>
                            </thead>
                            <tbody>
                                {expenses.map(expense => (
                                    <tr key={expense.expense_id}>
                                        <td>{expense.description}</td>
                                        <td>${expense.cost.toFixed(2)}</td>
                                        <td>
                                            <button className="btn" onClick={() => handleOpenEdit(expense.expense_id, expense.description, expense.cost, expense.budget_id)}><ModeEditIcon /></button>
                                        </td>
                                        <td>
                                            <button className="btn" onClick={() => handleDelete(expense)}><DeleteRoundedIcon /></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>


            {editExpenseDisplay()}
        </div>
    );
};
