import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import ModeEditIcon from '@mui/icons-material/ModeEdit';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import '../App.css';

const API_BASE = "http://localhost:8000";

function Accounts() {
    const [accounts, setAccounts] = useState([]);
    const [showMakeAccount, setShowMakeAccount] = useState(false);
    const [makeAccountOpen, setMakeAccountOpen] = useState(false);
    const [editAccountOpen, setEditAccountOpen] = useState(false);
    const [currentAccountEdit, setCurrentAccountEdit] = useState({});
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

    const handleMakeAccountClose = () => {
        setMakeAccountOpen(false);
    };

    const handleMakeAccountOpen = () => {
        setMakeAccountOpen(true);
    };

    const handleEditAccountClose = () => {
        setEditAccountOpen(false);
    };

    const handleEditAccountOpen = (id, name) => {
        setCurrentAccountEdit({ "id": id, "name": name });
        setEditAccountOpen(true);
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

    function handleEdit(event) {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const formJson = Object.fromEntries(formData.entries());
        if (formJson.name == currentAccountEdit["name"]) {
            return;
        }
        try {
            axios.patch(`${API_BASE}/api/accounts/${currentAccountEdit["id"]}`, {
                "account_id": currentAccountEdit["id"],
                "name": formJson.name,
            }).then(response => {
                alert(`Edited account with new name: ${formJson.name}`);
                window.location.reload();
            })
        } catch (error) {
            console.error("Error editing Account: ", error)
        }
    }

    function handleDelete(id, name) {
        if (window.confirm(`Are you sure you would like to delete "${name}" forever?`) === true) {
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
        try {
            axios.post(`${API_BASE}/api/accounts`, {
                "name": formJson.name,
            }).then(response => {
                alert(`Made new account with name: ${formJson.name}`);
                window.location.reload();
            });
        } catch (error) {
            alert("Owie noo couldn't make new account :(");
            console.error("Cannot make new account: ", error);
        }


    };

    function newAccountDisplay() {
        return (
            <Dialog open={makeAccountOpen} onClose={(handleMakeAccountClose)}>
                <DialogTitle>Make a New Account</DialogTitle>
                <DialogContent>
                    <form onSubmit={handleSubmit} id="make-new-account-form">
                        Name for Account
                        <TextField
                            autoFocus
                            required
                            margin="dense"
                            name="name"
                            fullWidth
                            variant='standard'
                        />
                    </form>
                </DialogContent>
                <DialogActions>
                    <button onClick={handleMakeAccountClose}>Cancel</button>
                    <button type="submit" form="make-new-account-form">
                        Create
                    </button>
                </DialogActions>
            </Dialog>
        );
    };

    function editAccountDisplay() {
        return (
            <Dialog open={editAccountOpen} onClose={(handleEditAccountClose)}>
                <DialogTitle>Make a New Account</DialogTitle>
                <DialogContent>
                    <form onSubmit={handleEdit} id="edit-account-form">
                        Name for Account
                        <TextField
                            autoFocus
                            required
                            margin="dense"
                            name="name"
                            defaultValue={currentAccountEdit.name}
                            fullWidth
                            variant='standard'
                        />
                    </form>
                </DialogContent>
                <DialogActions>
                    <button onClick={handleEditAccountClose}>Cancel</button>
                    <button type="submit" form="edit-account-form">
                        Edit
                    </button>
                </DialogActions>
            </Dialog>
        );
    };

    return (

        <div className="App">
            <h1 className="title">BUDGETING APP</h1>
            <button class="bg-[#5b976c] px-2 py-2 inline-block rounded-xl m-2 ml-20" onClick={handleMakeAccountOpen}>{showMakeAccount ? 'Cancel' : 'Make New Account'}</button>
            {newAccountDisplay()}
            <div className="accounts-list">
                <h2 className="subtitle" class="text-2xl bg-inherit">Accounts</h2>
                {accounts.length === 0 ? (
                    <p>No Accounts found</p>
                ) : (
                    <ul className="account-list-grid">
                        <li className="account-headers">
                            <h3 class="font-bold">NAME</h3>
                            <h3 class="font-bold">View</h3>
                            <h3 class="font-bold">Edit</h3>
                            <h3 class="font-bold">Delete</h3>
                        </li>
                        {accounts.map(account => (
                            <li className="account-names" key={account.account_id}>
                                <p className="left-end">{account.name}</p>
                                <div className="wrapper">
                                    <button className="editButton" onClick={() => handleClick(account.account_id, account.name)}>Edit {account.name}</button>
                                </div>
                                <div className="wrapper" class="p-[40px] bg-inherit">
                                    <button className="iconButton" onClick={() => handleEditAccountOpen(account.account_id, account.name)}><ModeEditIcon className="icon" /></button>
                                </div>
                                <div className="wrapper right-end">
                                    <button className="iconButton" onClick={() => handleDelete(account.account_id, account.name)}><DeleteRoundedIcon className="icon" /></button>
                                </div>
                            </li>

                        ))}
                    </ul>
                )}
                {editAccountDisplay()}
            </div>
        </div >
    );
}

export default Accounts;
