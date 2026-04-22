import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from "react-router-dom";
import axios from 'axios';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

const API_BASE = "http://localhost:8000";

function Main_Totals() {
    const [totalInfo, setTotal] = useState([]);
    const [allTotals, setAllTotals] = useState([]);
    const [categories, setCategories] = useState([]);
    const [expenses, setExpenses] = useState([]);


    const [makeBudgetOpen, setOpen] = useState(false);
    const [makeBudgetCategoryOpen, setBudgetCategoryOpen] = useState(false);
    const [newExpenseOpen, setNewExpenseOpen] = useState(false);
    const [remaining, setRemaining] = useState(0);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        fetchAll();
    }, []);

    const fetchAll = async () => {
        try {
            const year = new Date().getFullYear();
            const month = new Date().getMonth() + 1;
            const response = await axios.get(`${API_BASE}/api/mainpage/${location.state.accountId}/?year=${year}&month=${month}`);
            setTotal(response.data.current_total);
            const left = response.data.current_total.monthly_budget - response.data.current_total.total_expenses;
            setRemaining(left);
            setAllTotals(response.data.all_totals);
            setCategories(response.data.categories);
            setExpenses(response.data.expenses);
            console.log(response);
        } catch (error) {
            console.error("Error fetching account totals data, ", error);
        }
    };

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const handleBudgetCategoryOpen = () => {
        setBudgetCategoryOpen(true);
    };

    const handleBudgetCategoryClose = () => {
        setBudgetCategoryOpen(false);
    };

    const handleNewExpenseOpen = () => {
        setNewExpenseOpen(true);
    };

    const handleNewExpenseClose = () => {
        setNewExpenseOpen(false);
    };

    function handleBackClick() {
        navigate(-1)
    };

    function makeNewMonthBudget(event) {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const formJson = Object.fromEntries(formData.entries());
        try {
            axios.post(`${API_BASE}/api/monthlyTotals`, {
                "account_id": location.state.accountId,
                "month": parseInt(formJson.month.slice(5)),
                "year": parseInt(formJson.month.slice(0, 4)),
                "total_expenses": 0,
                "monthly_budget": formJson.amount
            }).then(response => {
                window.location.reload();
            });

        } catch (error) {
            console.log("Error making new monthly budget, ", error);
        }

        handleClose();
    };

    function makeNewBudgetCategory(event) {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const formJson = Object.fromEntries(formData.entries());
        try {
            axios.post(`${API_BASE}/api/budgets`, {
                "total_id": totalInfo.total_id,
                "budget_type": formJson.category_name,
                "amount": formJson.amount,
                "spent": "0.0"
            }).then(response => {
                window.location.reload();
            })
        } catch (error) {
            console.log("error making new budget category", error);
        }
    }

    function makeNewExpense(event) {
        event.preventDefault();
    }

    function handleSelectNewBudgetInfo(e) {

    };

    function newBudgetDisplay() {
        return (
            <Dialog open={makeBudgetOpen} onClose={handleClose}>
                <DialogTitle>Make a new Month's Budget</DialogTitle>
                <DialogContent>
                    <form onSubmit={makeNewMonthBudget} id="make-new-budget-form">
                        Month/Year of Budget
                        <TextField
                            autoFocus
                            required
                            margin="dense"
                            name="month"
                            type="month"
                            fullWidth
                            variant="standard"
                        />
                        Budget Limit for the Month (Total)
                        <TextField
                            autoFocus
                            required
                            margin="dense"
                            name="amount"
                            type="number"
                            fullWidth
                            variant="standard"
                        />
                    </form>
                </DialogContent>
                <DialogActions>
                    <button onClick={handleClose}>Cancel</button>
                    <button type="submit" form="make-new-budget-form">
                        Create
                    </button>
                </DialogActions>
            </Dialog>
        );
    };

    function newCategoryDisplay() {
        // CHECK IF TOTALINFO HAS INFO AND IF NOT, ALERT AND SAY THERE IS NO EXISTING BUEDGET SELECTED
        return (
            <Dialog open={makeBudgetCategoryOpen} onClose={(handleBudgetCategoryClose)}>
                <DialogTitle>Make a Budget Category for this Month</DialogTitle>
                <DialogContent>
                    <form onSubmit={makeNewBudgetCategory} id="make-new-category-form">
                        Budget Category
                        <TextField
                            autoFocus
                            required
                            margin="dense"
                            name="category_name"
                            fullWidth
                            variant='standard'
                        />
                        Budget Allocation
                        <TextField
                            autoFocus
                            required
                            margin="dense"
                            name="amount_allocated"
                            type="number"
                            fullWidth
                            variant='standard'
                        />
                    </form>
                </DialogContent>
                <DialogActions>
                    <button onClick={handleBudgetCategoryClose}>Cancel</button>
                    <button type="submit" form="make-new-category-form">
                        Create
                    </button>
                </DialogActions>
            </Dialog>
        );
    };

    function newExpenseDisplay() {
        return (
            <Dialog open={newExpenseOpen} onClose={handleNewExpenseClose}>
                <DialogTitle>Add a New Expense</DialogTitle>
                <DialogContent>
                    <form onSubmit={makeNewExpense} id="new-expense-form">

                    </form>
                </DialogContent>
            </Dialog>
        );
    };

    return (
        <div >
            <div class="grid grid-cols-7 grid-rows-1 my-10">
                <button class="rounded-full bg-white mx-9 my-5 " onClick={handleBackClick}>Back</button>
                <span class="col-start-3 col-end-5 text-center rounded-md bg-lime-950 align-middle">
                    <h1 class="text-2xl font-bold m-2 mx-5 bg-inherit text-stone-400">Welcome, {location.state.accountName}!</h1>
                </span>
            </div>
            <div class=" inline-grid auto-cols-[minmax(0,_2fr)] auto-rows-[minmax(0,_2fr)] m-7 h-max mb-0">
                <div class="rounded-md bg-white row-start-1 row-end-11 col-start-1 col-end-4 my-3 mx-5 p-10">
                    <button class="rounded-sm bg-green-700" onClick={handleClickOpen}>New Month's Budget</button>
                    {newBudgetDisplay()}
                    <button onClick={handleBudgetCategoryOpen}>Make Budget Category</button>
                    {newCategoryDisplay()}
                    <button onClick={handleNewExpenseOpen}>Add Expense</button>
                    {newExpenseDisplay()}
                </div>
                <div class="rounded-md bg-white row-start-1 row-end-3 col-start-4 col-end-7 my-3 mx-5 p-10">
                    {remaining}/{totalInfo.monthly_budget}
                </div>
                <div class="rounded-md bg-white row-start-3 row-end-4 col-start-4 col-end-7 m-2 mx-5">
                    <select>
                        {allTotals.map(total => (
                            <option key={total.total_id} value={total.total_id} onClick={handleSelectNewBudgetInfo}>{total.month}/{total.year}</option>
                        ))}
                    </select>
                </div>
                <div class="rounded-md bg-white col-start-4 col-end-7 row-start-5 row-end-11 m-2 mx-5">
                    {categories.length === 0 ? (
                        <div>
                            <p>no categories found yet</p>
                            <button>click here to make a category</button>
                        </div>
                    ) : (
                        <ul>
                            {categories.map(category => (
                                <li class="bg-inherit" key={category.budget_id}>
                                    <button class="rounded-md bg-green-700">{category.budget_type}</button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
                <div class="rounded-md bg-white col-start-8 col-end-11 row-start-1 row-end-10">
                    {expenses.length === 0 ? (
                        <p>No Expenses Found</p>
                    ) : (
                        <ul>
                            {expenses.map(expense => (
                                <li class="bg-inherit" key={expense.expense_id}>
                                    <button class="rounded-md bg-green-700">{expense.description}</button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
                <button class="rounded-md bg-white col-start-9 col-end-10 row-start-10 row-end-11">
                    Visualize Expenses Button
                </button>

            </div>
        </div>
    );
}

export default Main_Totals;
