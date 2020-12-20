import React from 'react';
import ReactDOM from "react-dom";
import axios from "axios";
import { BrowserRouter } from 'react-router-dom';
import { ICommitteeProps } from '../interfaces/committee.interfaces';
import CommitteeDashboard from '../components/committee/CommitteeDashboard';

if (document.getElementById('committee-root')) {
    const element = document.getElementById('committee-root')
    if (element) initialise(element);
}


function initialise(root: HTMLElement) {
    console.log("Initialising Admin...");
    axios.get(`/committee/admin-api/init.json`).then(res => {
        const status = res.status;
        if (status == 200) {
            const obj = res.data;
            if ("success" in obj && obj["success"]) {
                const payload: ICommitteeProps = obj["payload"];
                ReactDOM.render(
                    <BrowserRouter>
                        <CommitteeDashboard {...payload} />
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
