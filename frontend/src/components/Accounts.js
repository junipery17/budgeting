import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';

const API_BASE = "http://localhost:8000";

function Accounts() {
    const [accounts, setAccounts] = useState([]);
    const [showMakeAccount, setShowMakeAccount] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        fetchAccounts();
    }, []);

    const fetchAccounts = async () => {
        try {
            const response = await axios.get(`${API_BASE}/api/accounts`);
            setAccounts(response.data.accounts);
        } catch (error) {
            console.error("Error fetching accounts: ", error);
        }
    };

    function handleClick(id, name) {
        navigate(`/main/${id}`,
            {
                state: {
                    accountId: id,
                    accountName: name,
                }
            }
        );
    };

    function handleDelete(id, name) {
        if (window.confirm(`Are you sure you would like to delete "${name}" forever?`) == true) {
            try {
                axios.delete(`${API_BASE}/api/accounts/${id}`).then(response => {
                    window.location.reload();
                });
            } catch (error) {
                console.error("Unable to delete account: ", error);
            }
        }

    };

    function handleSubmit(e) {
        e.preventDefault();
        const form = e.target;
        const formData = new FormData(form);
        const formJson = Object.fromEntries(formData.entries());
        console.log(formJson);
        try {
            axios.post(`${API_BASE}/api/accounts`, {
                "name": formJson.newAccountName,
            }).then(response => {
                alert(`Made new account with name: ${formJson.newAccountName}`);
                window.location.reload();
            });
        } catch (error) {
            alert("Owie noo couldn't make new account :(");
            console.error("Cannot make new account: ", error);
        }


    };

    function handleMoreClick() {
        setShowMakeAccount(!showMakeAccount);
    };


    return (

        <div className="App">
            <h1 className="title">BUDGETING APP</h1>
            <div className="accounts-list">
                <h2 className="subtitle" class="text-2xl bg-inherit">Accounts</h2>
                {accounts.length === 0 ? (
                    <p>No Accounts found</p>
                ) : (
                    <ul className="account-list-grid">
                        <li className="account-headers">
                            <h3 class="font-bold">NAME</h3>
                            <h3 class="font-bold">View/Edit</h3>
                            <h3 class="font-bold">Delete</h3>
                        </li>
                        {accounts.map(account => (
                            <li className="account-names" key={account.account_id}>
                                <p className="left-end">{account.name}</p>
                                <div className="wrapper">
                                    <button className="editButton" onClick={() => handleClick(account.account_id, account.name)}>Edit {account.name}</button>
                                </div>
                                <div className="wrapper right-end">
                                    <button className="iconButton" onClick={() => handleDelete(account.account_id, account.name)}><DeleteRoundedIcon className="icon" /></button>
                                </div>
                            </li>

                        ))}
                    </ul>
                )}
            </div>
            {
                showMakeAccount &&
                <form method="post" onSubmit={handleSubmit}>
                    <label>
                        Name of New Account: <input name='newAccountName' ></input>
                    </label>
                    <h2></h2>
                    <button type="submit"> Create </button>
                </form>
            }

            <button className="newAccountButton" onClick={handleMoreClick}>{showMakeAccount ? 'Cancel' : 'Make New Account'}</button>

        </div >
    );
}

export default Accounts;
