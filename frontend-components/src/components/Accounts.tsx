import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import '../App.css';
import { GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google';

const API_BASE = "http://localhost:8000";

export default function Accounts() {

    const [makeAccountOpen, setMakeAccountOpen] = useState<boolean>(false);

    const navigate = useNavigate();

    const handleMakeAccountClose = () => {
        setMakeAccountOpen(false);
    };

    const handleMakeAccountOpen = () => {
        setMakeAccountOpen(true);
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

    async function handleSubmit(e: React.SubmitEvent) {
        e.preventDefault();
        var form = e.target;
        var formData = new FormData(form);
        var formJson = Object.fromEntries(formData.entries());
        try {
            axios.post(`${API_BASE}/api/accounts`, {
                "name": formJson.name,
                "username": formJson.username,
                "password": formJson.password,
                "email": formJson.email
            }).then(response => {
                if (response.data.status == "success") {
                    alert(`Made new account with name: ${formJson.name}`);
                    window.location.reload();
                } else {
                    alert("Username is already in use. Please choose another username");
                }

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

                        <label className="label">Email</label>
                        <input className='input' id="email" name="email" required />

                        <label className="label">Username</label>
                        <input className='input' id="username" name="username" required />

                        <label className="label">Password</label>
                        <input className='input' type="password" id="password" name="password" required />

                        <DialogActions>
                            <button className="btn btn-neutral mt-4" onClick={handleMakeAccountClose}>Cancel</button>
                            <button className="btn btn-neutral mt-4" type="submit" form="make-new-account-form">Create</button>
                        </DialogActions>
                    </fieldset>
                </form>
            </Dialog>
        );
    };

    // function displayAccounts() {
    //     if (!accounts) {
    //         return "<p> No Accounts Found</p>";
    //     } else {
    //         return (
    //             <div className="overflow-y-scroll overflow-x-hidden rounded-box border border-base-content/5 ">
    //                 <table className="table m-10">
    //                     <thead>
    //                         <tr>
    //                             <th className="text-lg font-bold">Name</th>
    //                             <th className="text-lg font-bold">View</th>
    //                             <th className="text-lg font-bold">Edit</th>
    //                             <th className="text-lg font-bold">Delete</th>
    //                         </tr>
    //                     </thead>
    //                     <tbody>
    //                         {accounts.map(account => (
    //                             <tr key={account?.account_id}>
    //                                 <td className="mt-2 mb-2 items-center self-stretch p-10 text-lg font-bold">{account?.name}</td>
    //                                 <td><button className="glass btn mt-2 mb-2 rounded-2xl bg-primary color-primary-content text-primary-content items-center self-stretch p-10" onClick={() => handleClick(account!.account_id, account!.name)}>View {account!.name}</button></td>
    //                                 <td><button className="glass btn mt-2 mb-2 rounded-2xl bg-primary color-primary-content text-primary-content items-center self-stretch p-10" onClick={() => handleEditAccountOpen(account!.account_id, account!.name)}><ModeEditIcon className="icon" /></button></td>
    //                                 <td><button className="glass btn mt-2 mb-2 rounded-2xl bg-primary color-primary-content text-primary-content items-center self-stretch p-10" onClick={() => handleDelete(account!.account_id, account!.name)}><DeleteRoundedIcon className="icon" /></button></td>

    //                             </tr>
    //                         ))}
    //                     </tbody>
    //                 </table>
    //             </div>
    //         );
    //     }
    // }

    async function loginSubmit(event: React.SubmitEvent) {
        event.preventDefault();
        var form = event.target;
        var formData = new FormData(form);
        var formJson = Object.fromEntries(formData.entries());
        try {
            var validity = await axios.get(`${API_BASE}/api/accounts/pass/${formJson.username}/?input_password=${formJson.password}`);
            if (validity.data.status == "success") {
                handleClick(validity.data.id, validity.data.name);
            } else {
                alert("Wrong username or password!");
            }
        } catch (error) {
            console.log("error logging in: ", error);
        }
    }

    function googleResponse(response: any) {
        console.log(response);
    }

    return (

        <div className="App">
            <h1 className="glass rounded-md bg-primary text-primary-content mx-88 my-5 p-5 font-title text-2xl md:text-3xl lg:text-4xl font-bold text-center">BUDGETING APP</h1>
            {newAccountDisplay()}
            {/* <div className="bg-base-300 m-5 rounded-lg glass">
                < h2 className="text-2xl bg-inherit rounded-lg text-center font-bold pt-5 glass" > Accounts</h2 >
                {displayAccounts()}
            </div>
            {editAccountDisplay()} */}
            <div className="flex justify-center mt-30">
                <form className="" onSubmit={loginSubmit}>

                    <fieldset className="fieldset bg-base-200 border-base-300 rounded-box w-xs border p-4">
                        <legend>Log In</legend>
                        <label className="label">Username</label>
                        <input name="username" type="text" className="input" required />
                        <label className="label">Password</label>
                        <input name="password" type="password" className="input" required />

                        <button className="btn bg-base-300" type="submit">Log In</button>
                    </fieldset>

                </form>

            </div>
            <div className="flex justify-center">
                <button className="text-sm ml-40 mt-2" onClick={handleMakeAccountOpen}>Make New Account</button>
            </div>

            <div className="flex justify-center mt-10">
                <GoogleOAuthProvider clientId='861413183276-o6092b0v2u47n4gi4atqb2lb7683u1ne.apps.googleusercontent.com'>
                    <GoogleLogin onSuccess={(response) => googleResponse(response)} onError={() => console.log("error")} />
                </GoogleOAuthProvider>
            </div>

        </div >
    );
}
