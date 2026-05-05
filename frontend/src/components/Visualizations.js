import { useNavigate, useLocation } from "react-router-dom";
import React, { useEffect, useState } from 'react';
import axios from "axios";
import Plot from 'react-plotly.js';

const API_BASE = "http://localhost:8000";

function Visualizations() {
    const [budget_expense_dict, setDict] = useState({});
    const [total_budget_expense_dict, setTotalDict] = useState({});
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        fetchBudgetToExpense();
    }, []);

    const fetchBudgetToExpense = async () => {
        const response = await axios.get(`${API_BASE}/api/charts/${location.state.accountId}/?month=${location.state.month}&year=${location.state.year}`);
        setDict(response.data.budget_dict);
        const totalsResponse = await axios.get(`${API_BASE}/api/charts/${location.state.accountId}`);
        setTotalDict(totalsResponse.data.budget_dict);
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
                <span class="col-start-3 col-end-5 text-center align-middle">
                    <h1 class="text-2xl rounded-md font-bold m-2 mx-5 py-4 bg-[#1e643c] text-white">Budget Data Breakdown</h1>
                </span>
                <span class="col-start-6 mx-16 my-5 text-[#c6ecce]">Back</span>
            </div>
            <div class="m-5">
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
                            width: 575,
                            height: 475,
                            title: { text: `${location.state.month}/${location.state.year} Break down` },
                        }}

                    />
                )}

            </div>
            <div class="m-5">
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
                            width: 575,
                            height: 475,
                            title: { text: `Total Spending Break down` },
                        }}

                    />
                )}

            </div>
        </div>
    );
}

export default Visualizations;
