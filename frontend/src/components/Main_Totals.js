import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from "react-router-dom";
import axios from 'axios';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputLabel from '@mui/material/InputLabel';
import InputAdornment from '@mui/material/InputAdornment';
import Input from '@mui/material/Input';
import ModeEditIcon from '@mui/icons-material/ModeEdit';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import { initDropdowns } from 'flowbite';

const API_BASE = "http://localhost:8000";

function Main_Totals() {
    const [totalInfo, setTotal] = useState([]);
    const [allTotals, setAllTotals] = useState([]);
    const [categories, setCategories] = useState([]);
    const [expenses, setExpenses] = useState([]);
    const [expenseCatConnection, setExpenseCatConnection] = useState({});
    const [currentMonthYear, setMonthYear] = useState({ "year": new Date().getFullYear(), "month": new Date().getMonth() + 1 })
    const months = {
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
    }

    const [makeBudgetOpen, setOpen] = useState(false);
    const [makeBudgetCategoryOpen, setBudgetCategoryOpen] = useState(false);
    const [newExpenseOpen, setNewExpenseOpen] = useState(false);
    const [editCategoryDisplayOpen, setEditCategoryDisplay] = useState(false);
    const [editCategoryInfo, setEditCategoryInfo] = useState({});
    const [remaining, setRemaining] = useState(0);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        if (location.state.month && location.state.year) {
            fetchAll(location.state.month, location.state.year);
        } else {
            fetchAll(currentMonthYear.month, currentMonthYear.year);
        }
        initDropdowns();
    }, []);

    const fetchAll = async (month, year) => {
        try {
            setMonthYear({ "month": month, "year": year });
            const response = await axios.get(`${API_BASE}/api/mainpage/${location.state.accountId}/?year=${year}&month=${month}`);
            setTotal(response.data.current_total);
            const total_spent = await axios.get(`${API_BASE}/api/calculate/?accountId=${location.state.accountId}&year=${year}&month=${month}`);
            const left = (response.data.current_total.monthly_budget - total_spent.data.total).toFixed(2);
            setRemaining(left);
            setAllTotals(response.data.all_totals);
            setCategories(response.data.categories);
            setExpenses(response.data.expenses);
            setExpenseCatConnection(response.data.expense_relations);
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

    const handleEditCatOpen = (budget_id, category, total) => {
        setEditCategoryInfo({ "budget_id": budget_id, "category": category, "total": total });
        setEditCategoryDisplay(true);
    };

    const handleEditCatClose = () => {
        setEditCategoryDisplay(false);
    };

    function handleDeleteCategory(budget_id, budget_name) {
        if (window.confirm(`Are you sure you would like to delete "${budget_name}" forever?`) === true) {
            try {
                axios.delete(`${API_BASE}/api/budgets/${budget_id}`).then(response => {
                    fetchAll(currentMonthYear.month, currentMonthYear.year);
                });
            } catch (error) {
                console.error("Unable to delete account: ", error);
            }
        }
    };

    function handleBackClick() {
        navigate("/")
    };

    function goToBudgetPage(budgetId, category) {
        navigate(`/budgets/${budgetId}`, {
            state: {
                budget_id: budgetId,
                budget_type: category,
                totalId: totalInfo.total_id,
            }
        });
    };

    function goToVisualizations() {
        navigate(`/visualizations/${location.state.accountId}`, {
            state: {
                accountId: location.state.accountId,
                month: totalInfo.month,
                year: totalInfo.year
            }
        });
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
                "amount": formJson.amount_allocated,
                "spent": 0
            }).then(response => {
                window.location.reload();
            });
        } catch (error) {
            console.log("error making new budget category", error);
        }
    };

    function makeNewExpense(event) {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const formJson = Object.fromEntries(formData.entries());
        try {
            axios.post(`${API_BASE}/api/expenses`, {
                "budget_id": formJson.budgetId,
                "description": formJson.expense_description,
                "cost": formJson.cost
            }).then(response => {
                window.location.reload();
            });
        } catch (error) {
            console.log("error making new expense: ", error);
        }
    };

    function editCategory(event) {
        event.preventDefault();
        handleEditCatClose();
        const formData = new FormData(event.currentTarget);
        const formJson = Object.fromEntries(formData.entries());
        if ((formJson.amount == editCategoryInfo["total"]) && (formJson.category_name == editCategoryInfo["category"])) {
            return;
        }
        try {
            axios.patch(`${API_BASE}/api/budgets/${editCategoryInfo["budget_id"]}`, {
                "budget_id": editCategoryInfo["budget_id"],
                "budget_type": formJson.category_name,
                "amount": formJson.amount
            })
            handleSelectNewBudgetInfo(totalInfo.month, totalInfo.year);
        } catch (error) {
            console.log("error editing budget type: ", error);
        }
    };

    function handleSelectNewBudgetInfo(month, year) {
        fetchAll(month, year);
    };

    function editCategoryDisplay() {
        return (
            <Dialog open={editCategoryDisplayOpen} onClose={handleEditCatClose}>
                <DialogTitle>Edit Category</DialogTitle>
                <DialogContent>
                    <form onSubmit={editCategory} id="edit-existing-cat">
                        Category Name
                        <TextField
                            required
                            margin="dense"
                            id="category_name"
                            name="category_name"
                            defaultValue={editCategoryInfo["category"]}
                            fullWidth
                            variant="standard"
                        />
                        Budget Limit
                        <TextField
                            autoFocus
                            required
                            margin="dense"
                            id="amount"
                            name="amount"
                            type="number"
                            defaultValue={editCategoryInfo["total"]}
                            fullWidth
                            variant="standard"
                        />
                    </form>
                </DialogContent>
                <DialogActions>
                    <button onClick={handleEditCatClose}>Cancel</button>
                    <button type="submit" form="edit-existing-cat">
                        Edit
                    </button>
                </DialogActions>
            </Dialog>
        );
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
                        Budget Category
                        <select name="budgetId">
                            {categories.map(category => (
                                <option key={category.budget_id} value={category.budget_id}>{category.budget_type}</option>
                            ))}

                        </select>
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
    };

    return (
        <div class="box-border h-screen m-0 p-0 overflow-hidden">
            <div class="grid grid-cols-7 grid-rows-1 mt-8 mb-2">
                <button class="rounded-full bg-white mx-16 my-5" onClick={handleBackClick}>Back</button>
                <span class="col-start-3 col-end-5 text-center align-middle">
                    <h1 class="text-2xl rounded-md font-bold m-2 mx-5 py-4 bg-[#1e643c] text-white">Welcome, {location.state.accountName}!</h1>
                </span>
                <span class="col-start-6 mx-16 my-5 text-[#c6ecce]">Back</span>
            </div>
            <div class=" inline-grid auto-cols-[minmax(0,_2fr)] grid-rows-6 m-0 p-0 w-full">
                <div class="rounded-md bg-white row-start-1 row-end-7 col-start-1 col-end-4 my-3 mx-5 grid grid-rows-6 grid-cols-1 mb-28">
                    <span class=" bg-[#1e643c] text-white font-bold row-start-1 row-end-2 col-start-1 col-end-7 rounded-tl-md rounded-tr-md mb-20 p-3">label add new info</span>
                    <button class="rounded-lg bg-green-700 row-start-1 row-end-3 col-start-1 col-end-7 m-5 mt-20 mb-20" onClick={handleClickOpen}>New Month's Budget</button>
                    {newBudgetDisplay()}
                    <button class="rounded-lg bg-green-700 row-start-2 row-end-4 col-start-1 col-end-7 m-5 mt-20 mb-20" onClick={handleBudgetCategoryOpen}>Make Budget Category</button>
                    {newCategoryDisplay()}
                    <button class="rounded-lg bg-green-700 row-start-3 row-end-5 col-start-1 col-end-7 m-5 mt-20 mb-20" onClick={handleNewExpenseOpen}>Add Expense</button>
                    {newExpenseDisplay()}
                    <span class=" bg-[#1e643c] text-white font-bold row-start-4 row-end-5 col-start-1 col-end-7 mt-20 p-3">Other Data</span>
                    <button class="rounded-lg bg-green-600 row-start-4 row-end-6 col-start-1 col-end-7 m-5 mt-40" onClick={() => goToVisualizations()}>Visualize Your Expenses</button>
                    <button class="rounded-lg bg-green-600 row-start-5 row-end-7 col-start-1 col-end-7 m-5 mt-40">button for some other purpose</button>
                </div>
                <div class="rounded-md bg-white row-start-1 row-end-2 col-start-4 col-end-8 my-3 mx-20 p-2">
                    <h2 class="font-bold text-lg">Remaining</h2>
                    <p class="bg-inherit text-3xl p-3">${remaining}/${totalInfo.monthly_budget}</p>
                    <h2 class="text-right">
                        {(totalInfo.monthly_budget - remaining) >= 0 ? (
                            "within budget"
                        ) : (
                            "over budget :("
                        )}
                    </h2>
                </div>
                <div class="row-start-2 row-end-3 col-start-4 col-end-6 m-2 mx-5 font-medium text-center align-middle mb-12">
                    <h3 class="h-24">Amount Allocated Here</h3>
                </div>
                <div class="rounded-md bg-white row-start-2 row-end-3 col-start-6 col-end-8 m-2 mx-5 text-center align-middle mb-12">
                    <button id="chooseCategory" data-dropdown-toggle="dropdown" class=" inline-flex items-center justify-center text-white bg-[#1e643c] box-border border border-transparent hover:bg-brand-strong focus:ring-4 focus:ring-brand-medium shadow-xs font-medium leading-5 rounded-base text-lg w-[95%] py-7 focus:outline-none align-middle my-2" type="button">
                        {months[totalInfo.month]}/{totalInfo.year}
                        <svg class="w-4 h-4 ms-1.5 -me-0.5 bg-inherit" aria-hidden="true" width="24" height="24" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" d="m19 9-7 7-7-7" /></svg>
                    </button>
                    <div id="dropdown" class="z-10 hidden bg-neutral-primary-medium border border-default-medium rounded-base shadow-lg w-[20%] max-h-40 overflow-scroll">
                        <ul class="p-2 text-sm text-body font-medium" aria-labelledby="dropdownDefaultButton">
                            {allTotals.map(total => (
                                <li key={total.total_id}>
                                    <button onClick={() => handleSelectNewBudgetInfo(total.month, total.year)} class="inline-flex items-center w-full p-2 hover:bg-neutral-tertiary-medium hover:text-heading rounded">{months[total.month]}/{total.year}</button>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
                <div class="row-start-2 row-end-4 col-start-4 col-end-8 bg-[#1e643c] text-white font-bold rounded-md p-5 m-5 mt-32 h-16 text-center">
                    Categories for this Month
                </div>
                <div class="rounded-md bg-white col-start-4 col-end-8 row-start-3 row-end-7 m-2 mx-5 mt-16 mb-28">
                    {categories.length === 0 ? (
                        <div>
                            <p>no categories found yet</p>
                        </div>
                    ) : (
                        <ul class="overflow-y-scroll grid grid-cols-(auto auto 10% 10%) bg-inherit">
                            <li class="align-middle text-center contents bg-white">
                                <h3 class="font-bold col-start-1 bg-inherit">View</h3>
                                <h3 class="col-start-2 bg-inherit"></h3>
                                <h3 class="font-bold col-start-3 bg-inherit">Budget</h3>
                                <h3 class="col-start-4 bg-inherit"></h3>
                                <h3 class="font-bold col-start-5 bg-inherit">Edit</h3>
                                <h3 class="font-bold col-start-6 bg-inherit">Delete</h3>
                            </li>
                            {categories.map(category => (
                                <li class="bg-inherit align-middle text-center contents" key={category.budget_id}>
                                    <button class="rounded-md bg-green-700 p-5 m-2 col-start-1" onClick={() => goToBudgetPage(category.budget_id, category.budget_type)}>{category.budget_type}</button>
                                    <span class="col-start-3 align-middle py-6">${category.amount}</span>
                                    <span class="col-start-5 py-6">
                                        <button onClick={() => handleEditCatOpen(category.budget_id, category.budget_type, category.amount)}><ModeEditIcon /></button>
                                    </span>
                                    <span class="col-start-6 py-6">
                                        <button onClick={() => handleDeleteCategory(category.budget_id, category.budget_type)}><DeleteRoundedIcon /></button>
                                    </span>
                                </li>
                            ))}
                        </ul>
                    )}
                    {editCategoryDisplay()}
                </div>

                <div class="row-start-1 row-end-2 col-start-8 col-end-11 items-center text-center align-middle">
                    <h1 class="bg-[#1e643c] text-white font-bold rounded-md p-5 m-5">Recently Added Expenses</h1>
                </div>
                <div class="rounded-md bg-white col-start-8 col-end-11 row-start-1 row-end-7 mt-28 mb-28 grid mx-5">
                    <div class="row-start-1 row-end-7 col-start-1 col-end-7 bg-white">
                        {expenses.length === 0 ? (
                            <p>No Expenses Found</p>
                        ) : (
                            <ul class="bg-white items-center px-3 grid grid-cols-3 align-middle">
                                <li class="contents bg-white">
                                    <h3 class="font-bold col-start-1 bg-inherit">Description</h3>
                                    <h3 class="font-bold col-start-4 col-end-6 bg-inherit">Category</h3>
                                    <h3 class="font-bold col-start-6 bg-inherit">Cost</h3>
                                </li>
                                {expenses.map(expense => (
                                    <li class="bg-[#e2dfcd] contents align-middle text-center" key={expense.expense_id}>
                                        <span class="bg-inherit text-left col-start-1 col-end-4 my-1 py-4 px-1">{expense.description}</span>
                                        <span class="bg-inherit text-center col-start-4 col-end-6 my-1 py-4 px-1">{expenseCatConnection[expense.budget_id]}</span>
                                        <span class="bg-inherit text-right col-start-6 my-1 py-4 px-1">${expense.cost}</span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Main_Totals;
