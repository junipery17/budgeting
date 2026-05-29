import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from "react-router-dom";
import axios from 'axios';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import ModeEditIcon from '@mui/icons-material/ModeEdit';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import "cally";

const API_BASE = "http://localhost:8000";

interface AccountData {
    account_id: number;
    name: string;
}

interface TotalData {
    account_id: number;
    month: number;
    year: number;
    monthly_budget: number;
    total_id: number;
}

interface BudgetData {
    total_id: number;
    category_id: number;
    budget_id: number;
    amount: number;
}

interface ExpenseData {
    description: string;
    expense_id: number;
    budget_id: number;
    cost: number;
    date: Date;
}

export default function Main_Page() {
    const [account, setAccount] = useState<AccountData>({ "account_id": -1, "name": "" });
    const [totalInfo, setTotal] = useState<TotalData>({ "account_id": -1, "month": 0, "year": 0, "monthly_budget": 0, "total_id": -1 });
    const [currentAllocated, setCurrentAllocated] = useState(0);
    const [allTotals, setAllTotals] = useState<TotalData[]>([]);
    const [categories, setCategories] = useState<BudgetData[]>([]);
    const [expenses, setExpenses] = useState<ExpenseData[]>([]);
    const [expenseCatConnection, setExpenseCatConnection] = useState<{ [key: number]: [string, number] }>({});
    const [categoryNames, setCategoryNames] = useState<{ [key: number]: string }>({});
    const [currentMonthYear, setMonthYear] = useState({ "year": new Date().getFullYear(), "month": new Date().getMonth() + 1 });
    const today = new Date().toISOString().slice(0, 10);
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
    const dateOptions: Intl.DateTimeFormatOptions = {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric"
    };

    const [makeBudgetOpen, setOpen] = useState(false);
    const [makeBudgetCategoryOpen, setBudgetCategoryOpen] = useState(false);
    const [newExpenseOpen, setNewExpenseOpen] = useState(false);
    const [editCategoryNames, setEditCategoryNames] = useState(false);
    const [editCategoryDisplayOpen, setEditCategoryDisplay] = useState(false);
    const [editCategoryInfo, setEditCategoryInfo] = useState<BudgetData>({ "category_id": -1, "budget_id": -1, "amount": -1, "total_id": -1 });
    const [editExpenseOpen, setEditExpenseOpen] = useState(false);
    const [currentEditingExpense, setCurrentEditingExpense] = useState<ExpenseData>({ "budget_id": -1, "expense_id": -1, "cost": 0, "description": "", "date": new Date() });
    const [remaining, setRemaining] = useState(0);
    const [spent, setSpent] = useState(0);

    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        if (location.state.month && location.state.year) {
            fetchAll(location.state.month, location.state.year);
        } else {
            fetchAll(currentMonthYear.month, currentMonthYear.year);
        }
        fetchAccount();
    }, []);

    const fetchAll = async (month: number, year: number, type?: string) => {
        try {
            setMonthYear({ "month": month, "year": year });
            var response = await axios.get(`${API_BASE}/api/mainpage/${location.state.accountId}/?year=${year}&month=${month}&type=${type}`);
            setTotal(response.data.current_total);
            var total_spent = await axios.get(`${API_BASE}/api/calculate/?accountId=${location.state.accountId}&year=${year}&month=${month}&type=${type}`);
            var left: number = + ((response.data.current_total.monthly_budget - total_spent.data.total).toFixed(2));
            setSpent(total_spent.data.total);
            setRemaining(left);
            setAllTotals(response.data.all_totals);
            setCategories(response.data.categories);
            setExpenses(response.data.expenses);
            setExpenseCatConnection(response.data.expense_relations);
            setCurrentAllocated(response.data.currently_allocated);
            setCategoryNames(response.data.category_names);
            console.log(response.data.category_names);
        } catch (error) {
            console.error("Error fetching account totals data, ", error);
        }
    };

    const fetchAccount = async () => {
        try {
            var response = await axios.get(`${API_BASE}/api/accounts/${location.state.accountId}`);
            setAccount(response.data.account);
        } catch (error) {
            console.error("Error fetching accounts: ", error);
        }
    };

    const displayThisWeek = () => {
        fetchAll(currentMonthYear.month, currentMonthYear.year, "week");
        changeMenuButtonColor("week");
    };

    const displayThisMonth = () => {
        fetchAll(currentMonthYear.month, currentMonthYear.year);
        changeMenuButtonColor("month");
    }

    const displayThisYear = async () => {
        fetchAll(currentMonthYear.month, currentMonthYear.year, "year");
        changeMenuButtonColor("year");
    };

    function changeMenuButtonColor(type: string) {
        var week = document.getElementById("week") as HTMLButtonElement;
        var year = document.getElementById("year") as HTMLButtonElement;
        var month = document.getElementById("month") as HTMLButtonElement;
        var selected = document.getElementById(type) as HTMLButtonElement;
        week.style.backgroundColor = "oklch(85.39% 0.201 100.73)";
        week.style.color = "oklch(17.078% 0.04 100.73)";
        year.style.backgroundColor = "oklch(85.39% 0.201 100.73)";
        year.style.color = "oklch(17.078% 0.04 100.73)";
        month.style.backgroundColor = "oklch(85.39% 0.201 100.73)";
        month.style.color = "oklch(17.078% 0.04 100.73)";
        if (selected) {
            selected.style.color = "oklch(85.39% 0.201 100.73)";
            selected.style.backgroundColor = "oklch(17.078% 0.04 100.73)";
        }
    }

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const handleCatNamesOpen = () => {
        setEditCategoryNames(true);
    };

    const handleCatNamesClose = () => {
        setEditCategoryNames(false);
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

    const handleEditCatOpen = (budget_id: number, category: number, total: number) => {
        setEditCategoryInfo({ "budget_id": budget_id, "category_id": category, "amount": total, "total_id": totalInfo.total_id });
        setEditCategoryDisplay(true);
    };

    const handleEditCatClose = () => {
        setEditCategoryDisplay(false);
    };

    const handleOpenEdit = (id: number, description: string, cost: number, budget_id: number, date: Date) => {
        setCurrentEditingExpense({ "expense_id": id, "description": description, "cost": cost, "budget_id": budget_id, "date": date });
        setEditExpenseOpen(true);
    };

    const handleCloseEdit = () => {
        setEditExpenseOpen(false);
    };

    function checkCategoryAmountLimit(test_amount: number, editing: boolean = false) {
        var remaining = totalInfo.monthly_budget - currentAllocated;
        if (editing) {
            remaining += editCategoryInfo.total_id;
        }
        if (test_amount > remaining) {
            return false;
        } else {
            return true;
        }
    }

    function checkNameDoesNotExists(name: string) {

        var nameId = Object.keys(categoryNames).find(key => categoryNames[parseInt(key)] === name);
        if (nameId) {
            return false;
        }
        return true;
    }

    function handleDelete(id: number, name: string, isCat: boolean) {
        if (window.confirm(`Are you sure you would like to delete "${name}" forever?`) === true) {
            var endpoint = "expenses"
            try {
                if (isCat) {
                    endpoint = "budgets"
                }
                axios.delete(`${API_BASE}/api/${endpoint}/${id}`).then(_ => {
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

    function goToBudgetPage(budgetId: number, category: number) {
        navigate(`/budgets/${budgetId}`, {
            state: {
                account_id: totalInfo.account_id,
                budget_id: budgetId,
                category_id: category,
                totalId: totalInfo.total_id,
                month: months[currentMonthYear.month],
                year: currentMonthYear.year
            }
        });
    };

    function goToVisualizations() {
        navigate(`/visualizations/${location.state.accountId}`, {
            state: {
                accountId: location.state.accountId,
                month: totalInfo.month,
                year: totalInfo.year,
                monthlyTotalId: totalInfo.total_id
            }
        });
    };

    function makeNewMonthBudget(event: React.SubmitEvent) {
        event.preventDefault();
        handleClose();
        var form = event.target;
        var formData = new FormData(form);
        var formJson = Object.fromEntries(formData.entries());
        try {
            axios.post(`${API_BASE}/api/monthlyTotals`, {
                "account_id": location.state.accountId,
                "month": parseInt(String(formJson.month).slice(5)),
                "year": parseInt(String(formJson.month).slice(0, 4)),
                "total_expenses": 0,
                "monthly_budget": formJson.amount
            }).then(_ => {
                fetchAll(totalInfo.month, totalInfo.year);
            });

        } catch (error) {
            console.log("Error making new monthly budget, ", error);
        }

        handleClose();
    };

    function makeNewBudgetCategory(event: React.SubmitEvent) {
        event.preventDefault();
        handleBudgetCategoryClose();
        var form = event.target;
        var formData = new FormData(form);
        var formJson = Object.fromEntries(formData.entries());
        var true_category_name = formJson.category_names;

        if (checkCategoryAmountLimit(Number(formJson.amount_allocated))) {
            // NEED TO CHECK IF CATEGORY ALREADY EXISTS, IF SO GO TO BUDGET ENDPOINT
            if (!true_category_name) {
                true_category_name = formJson.category_name;
                if (checkNameDoesNotExists(true_category_name.toString())) {
                    try {
                        axios.post(`${API_BASE}/api/mainpage/${totalInfo.account_id}/${true_category_name}`, {
                            "total_id": totalInfo.total_id,
                            "category_id": 0,
                            "amount": formJson.amount_allocated,
                            "spent": 0
                        }).then(_ => {
                            fetchAll(totalInfo.month, totalInfo.year);
                        });
                    } catch (error) {
                        console.log("error making new budget category", error);
                    }
                }

            } else {
                if (checkNameDoesNotExists(true_category_name.toString())) {
                    try {
                        axios.post(`${API_BASE}/api/budgets`, {
                            "total_id": totalInfo.total_id,
                            "category_id": true_category_name,
                            "amount": formJson.amount_allocated,
                            "spent": 0
                        }).then(_ => {
                            fetchAll(totalInfo.month, totalInfo.year);
                        })
                    } catch (error) {
                        console.log("error making new budget category", error);
                    }
                }
            }

        } else {
            alert("You cannot allocate more than what remains");
        }

    };

    function makeNewExpense(event: React.SubmitEvent) {
        event.preventDefault();
        handleNewExpenseClose();
        var form = event.target;
        var formData = new FormData(form);
        var formJson = Object.fromEntries(formData.entries());
        console.log(formJson);
        try {
            axios.post(`${API_BASE}/api/expenses`, {
                "budget_id": formJson.budgetId,
                "description": formJson.expense_description,
                "cost": formJson.cost,
                "date": formJson.date
            }).then(_ => {
                fetchAll(totalInfo.month, totalInfo.year);
            });
        } catch (error) {
            console.log("error making new expense: ", error);
        }
    };

    function editCategoryName(event: React.SubmitEvent) {
        event.preventDefault();
        var form = event.target;
        var formData = new FormData(form);
        var formJson = Object.fromEntries(formData.entries());

        for (var item in Object.entries(categoryNames).keys()) {
            if (formJson[`${item}Name`] != categoryNames[parseInt(item)]) {
                try {
                    axios.patch(`${API_BASE}/api/categories/${item}`, {
                        'account_id': totalInfo.account_id,
                        'category_id': item,
                        'category_name': formJson[`${item}Name`]
                    })
                } catch (error) {
                    console.log("Error editing Category Names: ", error);
                }
            }
        }
    };

    function editCategory(event: React.SubmitEvent) {
        event.preventDefault();
        handleEditCatClose();
        var form = event.target;
        var formData = new FormData(form);
        var formJson = Object.fromEntries(formData.entries());

        if ((Number(formJson.amount) === editCategoryInfo["amount"]) && (formJson.category_name === categoryNames[editCategoryInfo["category_id"]])) {
            return;
        }
        if (checkCategoryAmountLimit(Number(formJson.amount))) {
            try {
                axios.patch(`${API_BASE}/api/budgets/${editCategoryInfo["budget_id"]}`, {
                    "budget_id": editCategoryInfo["budget_id"],
                    "category_id": formJson.category_name, //NEED TO GRAB ID FROM NAME
                    "amount": formJson.amount
                });
                handleSelectNewBudgetInfo(totalInfo.month, totalInfo.year);
            } catch (error) {
                console.log("error editing budget type: ", error);
            }
        } else {
            alert("You cannot allocate more than what remains");
        }

    };

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
            fetchAll(currentMonthYear.month, currentMonthYear.year);
        } catch (error) {
            console.log("error editing expense: ", error);
        }
    };

    function handleSelectNewBudgetInfo(month: number, year: number) {
        changeMenuButtonColor("");
        fetchAll(month, year);
    };

    function deleteCategoryName(id: number, name: string) {
        if (window.confirm(`Are you sure you would like to delete "${name}" forever? This will delete all related categories and expenses under this Category Name.`) === true) {
            try {
                axios.delete(`${API_BASE}/api/categories/${id}`);
            } catch (error) {
                console.error("Unable to delete category name: ", error);
            }
        }
    }

    function editCategoryNamesDisplay() {
        return (
            <Dialog open={editCategoryNames} onClose={handleCatNamesClose}>
                <form onSubmit={editCategoryName} id="edit-category-names" className="bg-base-200">
                    <fieldset className="fieldset bg-base-200 border-base-300 rounded-box w-xs border p-4">
                        <legend className="fieldset-legend">Edit Category Names</legend>
                        <table className="table">
                            <thead>
                                <tr>
                                    <td>Category</td>
                                    <td></td>
                                </tr>
                            </thead>
                            <tbody>
                                {Object.entries(categoryNames).map(([catId, catName]) => (
                                    <tr>
                                        <td>
                                            <input className="input" id={`${catId}Name`} name={`${catId}Name`} required defaultValue={catName} />
                                        </td>
                                        <td id={catId}>
                                            <button onClick={() => deleteCategoryName(parseInt(catId), catName)}><DeleteRoundedIcon /></button>
                                        </td>
                                    </tr>
                                ))}

                            </tbody>
                        </table>
                        <DialogActions>
                            <button className="btn btn-neutral mt-4" onClick={handleCatNamesClose}>Cancel</button>
                            <button className="btn btn-neutral mt-4" type="submit" form="edit-category-names">Edit</button>
                        </DialogActions>
                    </fieldset>
                </form>
            </Dialog>
        );
    };

    function editCategoryDisplay() {
        return (
            <Dialog open={editCategoryDisplayOpen} onClose={handleEditCatClose} >
                <form onSubmit={editCategory} id="edit-existing-cat" className='bg-base-200'>
                    <fieldset className="fieldset bg-base-200 border-base-300 rounded-box w-xs border p-4">
                        <legend className="fieldset-legend">Edit Category</legend>
                        <label className="label">Category Name</label>
                        <input className="input" id="category_name" name="category_name" required defaultValue={categoryNames[editCategoryInfo.category_id]} />

                        <label className="label">Budget Limit</label>
                        <input className="input" id="amount" name="amount" required defaultValue={editCategoryInfo.amount} />
                        <DialogActions>
                            <button className="btn btn-neutral mt-4" onClick={handleEditCatClose}>Cancel</button>
                            <button className="btn btn-neutral mt-4" type="submit" form="edit-existing-cat">Edit</button>
                        </DialogActions>
                    </fieldset>
                </form>
            </Dialog>
        );
    };

    function editExpenseDisplay() {
        var currentCat = (categories.find(category => category.budget_id == currentEditingExpense.budget_id));
        var currentDay = new Date();
        var monthsDifference = ((totalInfo.year - currentDay.getFullYear()) * 12) + (totalInfo.month - (currentDay.getMonth() + 1));
        return (
            <Dialog open={editExpenseOpen} onClose={handleCloseEdit}>
                <form onSubmit={editSelectedExpense} id="edit-expense-form" className="bg-base-200">
                    <fieldset className="fieldset bg-base-200 border-base-300 rounded-box w-xs border p-4">
                        <legend className="fieldset-legend">Edit Expense</legend>

                        <label className="label">Category</label>
                        <select className="select" name="budgetId">
                            {currentCat == null ? (
                                <></>
                            ) : (
                                <option key={currentCat?.budget_id} value={currentCat?.budget_id} selected>{categoryNames[currentCat!.category_id]}</option>
                            )}
                            {categories.map(category => (
                                <option key={category.budget_id} value={category.budget_id}>{categoryNames[category.category_id]}</option>
                            ))}
                        </select>

                        <label className="label">Date</label>
                        <input className="input bg-base-100" name="date" id="expense_date_input" required defaultValue={new Date(currentEditingExpense.date).toISOString().slice(0, 10)}></input>
                        <div id="cally-popover1" className="dropdown bg-base-100 rounded-box shadow-lg">
                            <calendar-date className="cally" onchange={(date) => changeDateInput(date)} value={new Date(currentEditingExpense.date).toISOString().slice(0, 10)}>
                                <svg aria-label="Previous" className="fill-current size-4" slot="previous" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M15.75 19.5 8.25 12l7.5-7.5"></path></svg>
                                <svg aria-label="Next" className="fill-current size-4" slot="next" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="m8.25 4.5 7.5 7.5-7.5 7.5"></path></svg>
                                <calendar-month offset={monthsDifference}></calendar-month>
                            </calendar-date>
                        </div>

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

    function newBudgetDisplay() {
        return (
            <Dialog open={makeBudgetOpen} onClose={handleClose}>
                <form onSubmit={makeNewMonthBudget} id="make-new-budget-form" className="bg-base-200">
                    <fieldset className="fieldset bg-base-200 border-base-300 rounded-box w-xs border p-4">
                        <legend className="fieldset-legend">New Month's Budget</legend>
                        <label className="label">Month/Year</label>
                        <input className="input" id="month" name="month" required type="month" />

                        <label className="label">Budget Limit</label>
                        <label className="input">
                            $
                            <input id="amount" name="amount" required type="number" />
                        </label>

                        <DialogActions>
                            <button className="btn btn-neutral mt-4" onClick={handleClose}>Cancel</button>
                            <button className="btn btn-neutral mt-4" type="submit" form="make-new-budget-form">Create</button>
                        </DialogActions>
                    </fieldset>
                </form>
            </Dialog>
        );
    };

    function newCategoryDisplay() {
        return (
            <Dialog open={makeBudgetCategoryOpen} onClose={handleBudgetCategoryClose}>
                <form onSubmit={makeNewBudgetCategory} id="make-new-category-form" className="bg-base-200">
                    <fieldset className="fieldset bg-base-200 border-base-300 rounded-box w-xs border p-4">
                        <legend className="fieldset-legend">New Budget Category in {months[totalInfo.month]}</legend>
                        <label className="label">Category Title</label>
                        <select className="select" name="category_names">
                            <option key="default-select" value="" selected>Select Category Name</option>
                            {Object.entries(categoryNames).map(([catNameId, catName]) => (
                                <option key={catNameId} value={catNameId}>{catName}</option>
                            ))}
                        </select>
                        <label className="label">Make New Category Title (if none applicable above)</label>
                        <input className="input" id="category_name" name="category_name" />

                        <label className="label">Budget Allocation</label>
                        <label className="input">
                            $
                            <input id="amount_allocated" name="amount_allocated" required type="number" />
                        </label>

                        <DialogActions>
                            <button className="btn btn-neutral mt-4" onClick={handleBudgetCategoryClose}>Cancel</button>
                            <button className="btn btn-neutral mt-4" type="submit" form="make-new-category-form">Create</button>
                        </DialogActions>
                    </fieldset>
                </form>
            </Dialog>
        );
    };

    function changeDateInput(event: any) {
        event.preventDefault();
        const inputElement = document.getElementById("expense_date_input") as HTMLInputElement;
        inputElement.value = event.target!.value;
    };

    function newExpenseDisplay() {
        var currentDay = new Date();
        var monthsDifference = ((totalInfo.year - currentDay.getFullYear()) * 12) + (totalInfo.month - (currentDay.getMonth() + 1));
        return (
            <Dialog open={newExpenseOpen} onClose={handleNewExpenseClose}>
                <form onSubmit={makeNewExpense} id="new-expense-form" className="bg-base-200">
                    <fieldset className="fieldset bg-base-200 border-base-300 rounded-box w-xs border p-4">
                        <legend className="fieldset-legend">Add New Expense</legend>
                        <label className="label">Budget Category</label>
                        <select className="select" name="budgetId">
                            {categories.map(category => (
                                <option key={category.budget_id} value={category.budget_id}>{categoryNames[category.category_id]}</option>
                            ))}
                        </select>

                        <label className="label">Date</label>
                        <input className="input bg-base-100" name="date" id="expense_date_input" required defaultValue={today}></input>
                        <div id="cally-popover1" className="dropdown bg-base-100 rounded-box shadow-lg">
                            <calendar-date className="cally" onchange={(date) => changeDateInput(date)} value="" defaultValue={`${totalInfo.year}-${totalInfo.month}-01`}
                                min={new Date(totalInfo.year, totalInfo.month - 1, 1).toISOString().slice(0, 10)}
                                max={new Date(totalInfo.year, totalInfo.month, 0).toISOString().slice(0, 10)}>
                                <svg aria-label="Previous" className="fill-current size-4" slot="previous" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M15.75 19.5 8.25 12l7.5-7.5"></path></svg>
                                <svg aria-label="Next" className="fill-current size-4" slot="next" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="m8.25 4.5 7.5 7.5-7.5 7.5"></path></svg>
                                <calendar-month offset={monthsDifference}></calendar-month>
                            </calendar-date>
                        </div>

                        <label className="label">Description</label>
                        <input className="input" id="expense_description" name="expense_description" required />

                        <label className="label">Cost</label>
                        <label className="input">
                            $
                            <input id="cost" name="cost" required />
                        </label>
                        <DialogActions>
                            <button className="btn btn-neutral mt-4" onClick={handleNewExpenseClose}>Cancel</button>
                            <button className="btn btn-neutral mt-4" type="submit" form="new-expense-form">Create</button>
                        </DialogActions>
                    </fieldset>
                </form>
            </Dialog>
        );
    };


    return (
        <div className="flex">
            <div className="flex-none w-75 min-h-screen bg-base-200 relative">
                <div className="flex flex-col grow border-r border-gray-200 pt-5 pb-4">
                    <div className="px-4">
                        <span className="text-base-200-content font-bold text-4xl">{account.name}</span>
                    </div>
                    <div className="mt-5 grow flex flex-col">
                        <ul className="menu bg-base-200 rounded-box my-5">
                            <li><h1 className="menu-title text-base-content">Navigation</h1></li>
                            <li>
                                <button className="font-bold" onClick={handleBackClick}>Back to Accounts</button>
                            </li>
                            <li>
                                <h2 className="menu-title">Add New Info</h2>
                                <ul>
                                    <li><button className="font-bold" onClick={handleClickOpen}>New Month's Budget</button></li>
                                    <li><button className="font-bold" onClick={handleBudgetCategoryOpen}>Make Budget Category</button></li>
                                    <li><button className="font-bold" onClick={handleNewExpenseOpen}>Add Expense</button></li>
                                </ul>
                            </li>
                            <li>
                                <h2 className="menu-title">Other Data</h2>
                                <ul>
                                    <li><button className="font-bold" onClick={() => goToVisualizations()}>Visualize Your Expenses</button></li>
                                    <li><button className="font-bold" onClick={handleCatNamesOpen}>Edit Existing Categories</button></li>
                                </ul>
                            </li>
                        </ul>
                    </div>
                    {newBudgetDisplay()}
                    {newCategoryDisplay()}
                    {newExpenseDisplay()}
                    {editCategoryNamesDisplay()}
                </div>
            </div>
            <div className="flex flex-col min-w-0 min-h-0">
                <div>
                    <h1 className="font-bold text-4xl m-7">Dashboard</h1>
                    <ul className="menu menu-vertical lg:menu-horizontal bg-accent items-center rounded-box mx-5">
                        <li ><button id="week" onClick={displayThisWeek}>this week</button></li>
                        <li ><button id="month" onClick={displayThisMonth}>this month</button></li>
                        <li ><button id="year" onClick={displayThisYear}>this year</button></li>
                        <li>
                            <select className="select select-accent-content bg-accent text-accent-content" defaultValue="Select Period">
                                <option key="default" disabled>Select Period</option>
                                {allTotals.map(total => (
                                    <option key={total.total_id} onClick={() => handleSelectNewBudgetInfo(total.month, total.year)}>
                                        {months[total.month]}/{total.year}
                                    </option>
                                ))}
                            </select>
                        </li>
                    </ul>
                </div>
                <div className="flex flex-row h-46 min-w-0 min-h-0">
                    <div className="card card-border bg-base-200 my-3 mx-5 p-2 w-lg flex-1 border-secondary border-4">
                        <div className="card-body">
                            <h2 className="card-title text-base-content">Remaining this Month</h2>
                            <p className="text-3xl text-base-content">${remaining}/${totalInfo.monthly_budget}</p>
                            <div className="card-actions justify-end">
                                <h2 className="text-base-content">{(totalInfo.monthly_budget - remaining) >= 0 ? (
                                    "within budget"
                                ) : (
                                    "over budget :("
                                )}
                                </h2>
                            </div>
                        </div>
                    </div>

                    <div className="card card-border bg-base-200 border-secondary border-4 m-2 text-center align-middle my-3 mx-5 p-2 w-lg flex-1">
                        <div className="card-body">
                            <h3 className="card-title text-base-content">Amount Allocated this Month</h3>
                            <h3 className="text-3xl text-base-content">${currentAllocated}/${totalInfo.monthly_budget}</h3>
                        </div>
                    </div>

                    <div className="card card-border bg-base-200 border-secondary border-4 m-2 text-center align-middle my-3 mx-5 p-2 w-lg flex-1">
                        <div className="card-body">
                            <h3 className="card-title text-base-content">Total Spent</h3>
                            <h3 className="text-3xl text-base-content">${spent.toFixed(2)}</h3>
                        </div>
                    </div>
                </div>
                <div className=" grid grid-cols-2">
                    <div className="flex flex-col col-start-1">
                        <div className="bg-primary text-primary-content font-bold rounded-md p-5 mx-5 mt-5 h-16 text-center glass">
                            Categories for this Month
                        </div>
                        <div className=" h-124 rounded-xl bg- m-2 mx-5 overflow-y-scroll border border-secondary">
                            {categories.length === 0 ? (
                                <div>
                                    <p>no categories found yet</p>
                                </div>
                            ) : (

                                <table className="table table-zebra block">
                                    <thead className="text-neutral bg-base-200">
                                        <tr>
                                            <th className=" rounded-tl-lg sticky top-0 z-1">View</th>
                                            <th className="text-center sticky top-0 z-1">Name</th>
                                            <th className="text-right sticky top-0 z-1">Budget</th>
                                            <th className=" rounded-tr-lg sticky top-0 z-1"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="">
                                        {categories.map(category => (
                                            <tr key={category.budget_id}>
                                                <td>
                                                    <button className="btn bg-base-300" onClick={() => goToBudgetPage(category.budget_id, category.category_id)}> {">"} </button>
                                                </td>
                                                <td className="text-center">
                                                    <p className={` badge pill-${category.category_id % 20}`} >
                                                        {categoryNames[category.category_id]}
                                                    </p>
                                                </td>
                                                <td className="text-right">${category.amount.toFixed(0)}</td>
                                                <td className="text-right">
                                                    <div className="dropdown">
                                                        <div tabIndex={0} role="button" className="btn m-1 bg-inherit border-none"><MoreVertIcon className='text-neutral' /></div>
                                                        <ul tabIndex={-1} className="dropdown-content menu bg-base-100 rounded-box shadow-sm text-base-content">
                                                            <li><button onClick={() => handleEditCatOpen(category.budget_id, category.category_id, category.amount)}><ModeEditIcon /></button></li>
                                                            <li><button onClick={() => handleDelete(category.budget_id, categoryNames[category.category_id], true)}><DeleteRoundedIcon /></button></li>
                                                        </ul>
                                                    </div>
                                                </td>
                                            </tr>))}
                                    </tbody>
                                </table>

                            )}
                            {editCategoryDisplay()}
                        </div>
                    </div>
                    <div className="col-start-2">
                        <div className="items-center text-center align-middle">
                            <h1 className="bg-primary text-primary-content font-bold rounded-md p-5 mx-5 mt-5 glass">Recently Added Expenses</h1>
                        </div>
                        <div className="h-124 rounded-xl m-2 mx-5 bg-base-200 overflow-y-scroll">
                            {expenses.length === 0 ? (
                                <p>No Expenses Found</p>
                            ) : (
                                <table className="table block">
                                    <thead className=" text-base-200-content ">
                                        <tr>
                                            <th className=" bg-base-300 rounded-tl-lg text-center sticky top-0 z-1">Description</th>
                                            <th className=" bg-base-300 text-center sticky top-0 z-1">Date</th>
                                            <th className=" bg-base-300 text-center sticky top-0 z-1">Category</th>
                                            <th className=" bg-base-300 text-right sticky top-0 z-1">Cost</th>
                                            <th className=" bg-base-300 text-center rounded-tr-lg sticky top-0 z-1"> </th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-base-200-content overflow-y-scroll">
                                        {expenses.map(expense => (
                                            <tr key={expense.expense_id}>
                                                <td>{expense.description}</td>
                                                <td className="text-center">{new Date(expense.date).toLocaleDateString(undefined, dateOptions)}</td>
                                                <td className="justify-center text-center">
                                                    <p className={` badge pill-${expenseCatConnection[expense.budget_id][1] % 20}`}>
                                                        {expenseCatConnection[expense.budget_id][0]}
                                                    </p>
                                                </td>
                                                <td className="text-right">${expense.cost.toFixed(2)}</td>
                                                <td className="text-right">
                                                    <div className="dropdown">
                                                        <div tabIndex={0} role="button" className="btn m-1"><MoreVertIcon /></div>
                                                        <ul tabIndex={-1} className="dropdown-content menu bg-base-100 rounded-box shadow-sm">
                                                            <li><button onClick={() => handleOpenEdit(expense.expense_id, expense.description, expense.cost, expense.budget_id, expense.date)}><ModeEditIcon /></button></li>
                                                            <li><button onClick={() => handleDelete(expense.expense_id, expense.description, false)}><DeleteRoundedIcon /></button></li>
                                                        </ul>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            {editExpenseDisplay()}
        </div>

    );
}
