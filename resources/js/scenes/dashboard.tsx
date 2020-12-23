import React from 'react';
import ReactDOM from "react-dom";
import axios from "axios";
import { IDashboardProps } from "../interfaces/dashboard.interfaces";
import Dashboard from '../components/dashboard/Dashboard';
import { BrowserRouter } from 'react-router-dom';

if (document.getElementById('dashboard-root')) {
    const element = document.getElementById('dashboard-root')
    if (element) initialise(element);
}


function initialise(root: HTMLElement) {
    console.log("Initialising Dashboard...");
    axios.get(`/dashboard-api/init.json`).then(res => {
        const status = res.status;
        if (status == 200) {
            const obj = res.data;
            if ("success" in obj && obj["success"]) {
                const payload: IDashboardProps = obj["payload"];
                ReactDOM.render(
                    <BrowserRouter>
                        <Dashboard {...payload} />
                    </BrowserRouter>,
                    root);

                const loadingElement = document.getElementById('loading');
                if (loadingElement) {
                    loadingElement.remove();
                }
            }
        } else {
            console.log(`Status: ${status}`);
            console.log(res.data);
        }
    })
}

/**
 * / => root
 * /profile => see all data we have on person
 * /apply => form and pending text
 * /apply/team => team deets
 */
