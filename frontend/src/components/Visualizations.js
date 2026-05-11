import { useNavigate, useLocation } from "react-router-dom";
import React, { useEffect, useState } from 'react';
import axios from "axios";
import Plot from 'react-plotly.js';

const API_BASE = "http://localhost:8000";

function Visualizations() {
    const [budget_expense_dict, setDict] = useState({});
    const [total_budget_expense_dict, setTotalDict] = useState({});
    const [budgets_to_spent, setBudgetsToSpent] = useState({});
    const [monthlySpent, setMonthlySpent] = useState({});
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        fetchBudgetToExpense();
        fetchMonthlyTotalSpent();
    }, []);
    //fetch current months budgets vs actual amount used so far
    const fetchBudgetToExpense = async () => {
        let response = await axios.get(`${API_BASE}/api/charts/${location.state.accountId}/?month=${location.state.month}&year=${location.state.year}`);
        setDict(response.data.budget_dict);
        setBudgetsToSpent(response.data.categories);
        let totalsResponse = await axios.get(`${API_BASE}/api/charts/${location.state.accountId}`);
        setTotalDict(totalsResponse.data.budget_dict);
    };

    const fetchMonthlyTotalSpent = async () => {
        let response = await axios.get(`${API_BASE}/api/charts/${location.state.accountId}/${location.state.monthlyTotalId}`);
        setMonthlySpent({ "current_monthly_total": response.data.monthly_total.monthly_budget, "spent": response.data.expenses_sum })
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
        <div class="bg-transparent text-center">
            <div class="grid grid-cols-7 grid-rows-1 mt-8 mb-2">
                <button class="rounded-full bg-white mx-16 my-5" onClick={handleBackClick}>Back</button>
                <span class="col-start-3 col-end-5 text-center align-middle ">
                    <h1 class="text-2xl rounded-md font-bold m-2 mx-5 py-4 bg-[#1e643c] text-white">Budget Data Breakdown</h1>
                </span>
                <span class="col-start-6 mx-16 my-5 text-[#c6ecce]">Back</span>
            </div>
            <div class="grid grid-cols-3 text-center">
                <div class="my-5 mx-12 row-start-1 col-start-1 col-end-3 h-[350px] bg-white rounded-2xl align-middle items-center">
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
                                    gauge: { axis: { range: [null, monthlySpent["current_monthly_total"]] }, valueformat: ".2f" }
                                }
                            ]}
                            layout={{
                                title: { text: "Budget Use" },
                                width: 500,
                                height: 300,
                                paper_bgcolor: "rgba(0,0,0,0)"
                            }}
                        />
                    )}
                    <h2 class="bg-inherit h-[25px] text-right pr-5">this much left to spend</h2>
                </div>
                <div class="my-5 mx-12 row-start-2 col-start-1 col-end-3 h-[375px] bg-white rounded-3xl">
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
                                title: { text: "Budget vs. Spent" },
                                showlegend: true,
                                legend: {
                                    x: 1.15,
                                    xanchor: "auto",
                                    y: 1.25
                                },
                                height: 400,
                                width: 550,
                                paper_bgcolor: "rgba(0,0,0,0)",
                                yaxis: { automargin: true }
                            }}
                        />
                    )}
                </div>
                <div class="my-5 mx-12 row-start-1 col-start-3 col-end-5 h-[350px] bg-white rounded-3xl">
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
                                width: 500,
                                height: 400,
                                title: { text: `${location.state.month}/${location.state.year} Break down` },
                                paper_bgcolor: "rgba(0,0,0,0)",
                            }}

                        />
                    )}

                </div>
                <div class="mx-12 my-5 row-start-2 col-start-3 col-end-5 h-[375px] bg-white rounded-3xl">
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
                                width: 500,
                                height: 400,
                                title: { text: `Total Spending Break down` },
                                paper_bgcolor: "rgba(0,0,0,0)",

                            }}

                        />
                    )}
                </div>
                <div class="p-5 row-start-1 row-end-3 col-start-5 col-end-7 mr-5 bg-white rounded-3xl">
                    <div>
                        Month Stats
                    </div>
                    <div>Top Spent Category</div>
                    <div>
                        Percent of budget used so far
                    </div>
                    <div>within/over budget</div>
                    <div>
                        Lifetime Stats
                    </div>
                    <div><span>Top Spent Category</span></div>
                    <div>
                        total amount saved (could be negative)
                    </div>
                </div>
            </div>

        </div>
    );
}

export default Visualizations;
