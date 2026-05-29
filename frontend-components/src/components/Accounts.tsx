import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import ModeEditIcon from '@mui/icons-material/ModeEdit';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import '../App.css';

const API_BASE = "http://localhost:8000";

interface AccountData {
    account_id: number;
    name: string;
}

export default function Accounts() {
    const [accounts, setAccounts] = useState<AccountData[]>([]);
    const [makeAccountOpen, setMakeAccountOpen] = useState<boolean>(false);
    const [editAccountOpen, setEditAccountOpen] = useState<boolean>(false);
    const [currentAccountEdit, setCurrentAccountEdit] = useState<{ "id": number, "name": string }>({ "id": -1, "name": "" });
    const navigate = useNavigate();

    useEffect(() => {
        fetchAccounts();
    }, []);

    const fetchAccounts = async () => {
        try {
            var response = await axios.get(`${API_BASE}/api/accounts`);
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

    const handleEditAccountOpen = (id: number, name: string) => {
        setCurrentAccountEdit({ "id": id, "name": name });
        setEditAccountOpen(true);
    };

    function handleClick(id: number, name: string) {
        navigate(`/main/${id}`,
            {
                state: {
                    accountId: id,
                    accountName: name,
                }
            }
        );
    };

    function handleEdit(event: React.SubmitEvent) {
        event.preventDefault();
        handleEditAccountClose();
        var form = event.target;
        var formData = new FormData(form);
        var formJson = Object.fromEntries(formData.entries());
        if (formJson.name === currentAccountEdit["name"]) {
            return;
        }
        try {
            axios.patch(`${API_BASE}/api/accounts/${currentAccountEdit["id"]}`, {
                "account_id": currentAccountEdit["id"],
                "name": formJson.name,
            }).then(_ => {
                alert(`Edited account with new name: ${formJson.name}`);
                window.location.reload();
            })
        } catch (error) {
            console.error("Error editing Account: ", error)
        }
    }

    function handleDelete(id: number, name: string) {
        if (window.confirm(`Are you sure you would like to delete "${name}" forever?`) === true) {
            try {
                axios.delete(`${API_BASE}/api/accounts/${id}`).then(_ => {
                    window.location.reload();
                });
            } catch (error) {
                console.error("Unable to delete account: ", error);
            }
        }

    };

    function handleSubmit(e: React.SubmitEvent) {
        e.preventDefault();
        var form = e.target;
        var formData = new FormData(form);
        var formJson = Object.fromEntries(formData.entries());
        try {
            axios.post(`${API_BASE}/api/accounts`, {
                "name": formJson.name,
            }).then(_ => {
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
            <Dialog open={makeAccountOpen} onClose={handleMakeAccountClose}>
                <form onSubmit={handleSubmit} id="make-new-account-form" className="bg-base-200">
                    <fieldset className="fieldset bg-base-200 border-base-300 rounded-box w-xs border p-4">
                        <legend className="fieldset-legend">Make New Account</legend>
                        <label className="label">Account Name</label>
                        <input className='input' id="name" name="name" required />

                        <DialogActions>
                            <button className="btn btn-neutral mt-4" onClick={handleMakeAccountClose}>Cancel</button>
                            <button className="btn btn-neutral mt-4" type="submit" form="make-new-account-form">Create</button>
                        </DialogActions>
                    </fieldset>
                </form>
            </Dialog>
        );
    };

    function editAccountDisplay() {
        return (
            <Dialog open={editAccountOpen} onClose={handleEditAccountClose}>
                <form onSubmit={handleEdit} id='edit-account-form' className="bg-base-200">
                    <fieldset className="fieldset bg-base-200 border-base-300 rounded-box w-xs border p-4">
                        <legend className="fieldset-legend">Edit Account</legend>
                        <label className="label">Account Name</label>
                        <input className="input" id="name" name="name" required defaultValue={currentAccountEdit.name} />

                        <DialogActions>
                            <button className="btn btn-neutral mt-4" onClick={handleEditAccountClose}>Cancel</button>
                            <button className="btn btn-neutral mt-4" type="submit" form="edit-account-form">Edit</button>
                        </DialogActions>
                    </fieldset>
                </form>
            </Dialog>
        );
    };

    function displayAccounts() {
        if (!accounts) {
            return "<p> No Accounts Found</p>";
        } else {
            return (
                <div className="overflow-y-scroll overflow-x-hidden rounded-box border border-base-content/5 ">
                    <table className="table m-10">
                        <thead>
                            <tr>
                                <th className="text-lg font-bold">Name</th>
                                <th className="text-lg font-bold">View</th>
                                <th className="text-lg font-bold">Edit</th>
                                <th className="text-lg font-bold">Delete</th>
                            </tr>
                        </thead>
                        <tbody>
                            {accounts.map(account => (
                                <tr key={account?.account_id}>
                                    <td className="mt-2 mb-2 items-center self-stretch p-10 text-lg font-bold">{account?.name}</td>
                                    <td><button className="glass btn mt-2 mb-2 rounded-2xl bg-primary color-primary-content text-primary-content items-center self-stretch p-10" onClick={() => handleClick(account!.account_id, account!.name)}>View {account!.name}</button></td>
                                    <td><button className="glass btn mt-2 mb-2 rounded-2xl bg-primary color-primary-content text-primary-content items-center self-stretch p-10" onClick={() => handleEditAccountOpen(account!.account_id, account!.name)}><ModeEditIcon className="icon" /></button></td>
                                    <td><button className="glass btn mt-2 mb-2 rounded-2xl bg-primary color-primary-content text-primary-content items-center self-stretch p-10" onClick={() => handleDelete(account!.account_id, account!.name)}><DeleteRoundedIcon className="icon" /></button></td>

                                </tr>
                            ))}
                        </tbody>

                    </table>
                </div>
            );
        }

    }

    return (

        <div className="App">
            <h1 className="glass rounded-md bg-primary text-primary-content mx-88 my-5 p-5 font-title text-2xl md:text-3xl lg:text-4xl font-bold text-center">BUDGETING APP</h1>

            <button className="glass bg-secondary text-secondary-content px-2 py-2 inline-block rounded-xl m-2 ml-20" onClick={handleMakeAccountOpen}>Make New Account</button>
            {newAccountDisplay()}
            <div className="bg-base-300 m-5 rounded-lg glass">
                < h2 className="text-2xl bg-inherit rounded-lg text-center font-bold pt-5 glass" > Accounts</h2 >
                {displayAccounts()}
            </div>
            {editAccountDisplay()}

        </div >
    );
}
