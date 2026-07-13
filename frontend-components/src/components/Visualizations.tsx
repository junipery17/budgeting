import { useEffect, useState } from 'react';
import PlotlyComponent from 'react-plotly.js';
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

const Plot = (PlotlyComponent as any).default || PlotlyComponent;


const API_BASE = "http://localhost:8000";

export default function Visualizations() {
    const [budget_expense_dict, setDict] = useState<{ [key: string]: number }>({});
    const [total_budget_expense_dict, setTotalDict] = useState<{ [key: string]: number }>({});
    const [budgets_to_spent, setBudgetsToSpent] = useState<{ [key: string]: number }>({});
    const [monthlySpent, setMonthlySpent] = useState<{ "current_monthly_total": number, "spent": number }>({ "current_monthly_total": 0, "spent": 0 });
    const [allTime, setAllTime] = useState<{ "alltime_budget": number, "alltime_spent": number }>({ "alltime_budget": 0, "alltime_spent": 0 });
    const [topCat, setTopCat] = useState({ "account_id": 0, "category_id": 0, "name": "" });
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        fetchBudgetToExpense();
        fetchMonthlyTotalSpent();
    }, []);

    const fetchBudgetToExpense = async () => {
        let response = await axios.get(`${API_BASE}/api/charts/${location.state.accountId}/?month=${location.state.month}&year=${location.state.year}`);
        setDict(response.data.budget_dict);
        setBudgetsToSpent(response.data.categories);
        let totalsResponse = await axios.get(`${API_BASE}/api/charts/${location.state.accountId}`);
        setTotalDict(totalsResponse.data.budget_dict);
    };

    const fetchMonthlyTotalSpent = async () => {
        let response = await axios.get(`${API_BASE}/api/charts/${location.state.accountId}/${location.state.month}/${location.state.year}`);
        console.log(response.data);
        setMonthlySpent({ "current_monthly_total": response.data.monthly_total, "spent": response.data.expenses_sum });
        setAllTime({ "alltime_budget": response.data.all_budgets_total, "alltime_spent": response.data.all_expense_sum });
        response = await axios.get(`${API_BASE}/api/top_category/${location.state.accountId}/${location.state.year}/?month=${location.state.month}`);
        setTopCat(response.data);
    };

    function handleBackClick() {
        navigate(`/main/${location.state.accountId}`, {
            state: {
                "month": location.state.month,
                "year": location.state.year,
                "accountId": location.state.accountId
            }
        });
    };

    return (
        <div className="bg-transparent text-center">
            <div className="grid grid-cols-7 grid-rows-1 mt-8 mb-2">
                <button className="rounded-full bg-base-200 mx-16 my-5" onClick={handleBackClick}>Back</button>
                <span className="col-start-3 col-end-6 text-center align-middle ">
                    <h1 className="text-2xl rounded-md font-bold m-2 mx-5 py-4 bg-primary text-primary-content glass">Budget Data Breakdown</h1>
                </span>
            </div>
            <div className="grid grid-cols-8 text-center">
                <div className="card my-5 mx-12 row-start-1 col-start-1 col-end-4 h-87.5 bg-base-200 rounded-2xl align-middle items-center">
                    <div className="card-body">
                        <h2 className="card-title text-xl">Budget Use</h2>
                        {(!monthlySpent) || (Object.keys(monthlySpent).length === 0) ? (
                            <h1> no data yet</h1>
                        ) : (
                            <Plot
                                data={[
                                    {
                                        domain: { x: [0, 1], y: [0, 1] },
                                        value: monthlySpent["spent"],
                                        type: "indicator",
                                        number: { valueformat: ".2f", prefix: "$" },
                                        mode: "gauge+number",
                                        gauge: { axis: { range: [null, monthlySpent["current_monthly_total"]] } }
                                    }
                                ]}
                                layout={{
                                    width: 550,
                                    height: 200,
                                    margin: {
                                        l: 40,
                                        r: 40,
                                        b: 20,
                                        t: 40,
                                        pad: 4
                                    },
                                    paper_bgcolor: "rgba(0,0,0,0)"
                                }}
                            />
                        )}
                        <div className="card-actions justify-end">
                            <h2 className="text-lg">${(monthlySpent["current_monthly_total"] - monthlySpent["spent"]).toFixed(2)} left to spend</h2>
                        </div>
                    </div>

                </div>
                <div className="card my-5 mx-12 row-start-2 col-start-1 col-end-4 h-93.75 bg-base-200 rounded-3xl">
                    <div className="card-body">
                        <h2 className="card-title text-xl">{location.state.month}/{location.state.year} Budget vs. Spent</h2>
                        {(!budget_expense_dict) || !budgets_to_spent || (Object.keys(budget_expense_dict).length === 0 || (Object.keys(budgets_to_spent).length === 0)) ? (
                            <h1> no data yet</h1>
                        ) : (
                            <Plot
                                data={[
                                    {
                                        x: Object.values(budget_expense_dict),
                                        y: Object.keys(budget_expense_dict),
                                        name: "Actually Spent",
                                        type: "bar",
                                        orientation: "h"
                                    },
                                    {
                                        x: Object.values(budgets_to_spent),
                                        y: Object.keys(budgets_to_spent),
                                        name: "Projected Budgets",
                                        type: "bar",
                                        orientation: "h"
                                    }
                                ]}
                                layout={{
                                    barmode: "group",
                                    showlegend: true,
                                    legend: {
                                        x: 1.15,
                                        xanchor: "auto",
                                        y: 1.25
                                    },
                                    height: 300,
                                    width: 550,
                                    margin: {
                                        l: 40,
                                        r: 40,
                                        b: 20,
                                        t: 40,
                                        pad: 4
                                    },
                                    paper_bgcolor: "rgba(0,0,0,0)",
                                    plot_bgcolor: "rgba(0,0,0,0)",
                                    yaxis: { automargin: true }
                                }}
                            />
                        )}
                    </div>
                </div>
                <div className="card my-5 mx-12 row-start-1 col-start-4 col-end-7 h-87.5 bg-base-200 rounded-3xl">
                    <div className="card-body">
                        <div className="card-title text-xl">{location.state.month}/{location.state.year} Breakdown</div>
                        {(!budget_expense_dict) || (Object.keys(budget_expense_dict).length === 0) ? (
                            <h1>no data yet</h1>
                        ) : (
                            <Plot
                                data={[
                                    {
                                        values: Object.values(budget_expense_dict),
                                        labels: Object.keys(budget_expense_dict),
                                        type: 'pie',
                                        textinfo: "label+percent",
                                    },
                                ]}
                                layout={{
                                    width: 550,
                                    height: 250,
                                    margin: {
                                        l: 40,
                                        r: 40,
                                        b: 20,
                                        t: 40,
                                        pad: 4
                                    },
                                    paper_bgcolor: "rgba(0,0,0,0)",
                                }}

                            />
                        )}
                    </div>

                </div>
                <div className="card mx-12 my-5 row-start-2 col-start-4 col-end-7 h-93.75 bg-base-200 rounded-3xl">
                    <div className="card-body">
                        <h2 className="card-title text-xl">Total Spending Breakdown</h2>
                        {(!total_budget_expense_dict) || (Object.keys(total_budget_expense_dict).length === 0) ? (
                            <h1> no data yet</h1>
                        ) : (
                            <Plot
                                data={[
                                    {
                                        values: Object.values(total_budget_expense_dict),
                                        labels: Object.keys(total_budget_expense_dict),
                                        type: 'pie',
                                        textinfo: "label+percent",
                                    },
                                ]}
                                layout={{
                                    width: 550,
                                    height: 250,
                                    margin: {
                                        l: 40,
                                        r: 40,
                                        b: 20,
                                        t: 40,
                                        pad: 4
                                    },
                                    paper_bgcolor: "rgba(0,0,0,0)",

                                }}

                            />
                        )}
                    </div>
                </div>
                <div className="p-5 row-start-1 row-end-3 col-start-7 col-end-9 mr-5 rounded-3xl">
                    <div className="bg-base-300 rounded-box h-190 place-items-center">
                        <h1 className="card-title pt-5">Month Stats</h1>
                        <div>
                            <div className="card items-center">
                                Top Spent Category
                                <p className={`card-body font-bold text-xl my-5 badge pill-${topCat.category_id % 20}`}>{topCat.name}</p>
                            </div>
                            <div className="card">
                                Percent of budget used so far
                                <p className="card-body font-bold text-xl">{((monthlySpent.spent / monthlySpent.current_monthly_total) * 100).toFixed(2)}%</p>
                            </div>
                        </div>

                        <h1 className="card-title">Lifetime Stats</h1>
                        <div className="card">
                            Percent of Lifetime Budget Used
                            <p className="card-body font-bold text-xl">{((allTime.alltime_spent / allTime.alltime_budget) * 100).toFixed(2)}%</p>
                        </div>
                    </div>

                </div>
            </div>

        </div>
    );
};
