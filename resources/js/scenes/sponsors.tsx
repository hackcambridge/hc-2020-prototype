import React from 'react';
import ReactDOM from "react-dom";
import { ISponsorDashboardProps } from "../interfaces/sponsors.interfaces";
import SponsorFrame from "../components/sponsors-dashboard/SponsorFrame";
import axios from "axios";


if (document.getElementById('sponsors-root')) {
    const element = document.getElementById('sponsors-root')
    if(element) initialise(element);
}


function initialise(root: HTMLElement) {
    axios.get(`/sponsors/dashboard-api/init.json`).then(res => {
        const status = res.status;
        if(status == 200) {
            const obj = res.data;
            if ("success" in obj && obj["success"]) {
                const payload : ISponsorDashboardProps = obj["payload"];
                console.log(payload);
                ReactDOM.render(<SponsorFrame {...payload}/>, root);
                if(document.getElementById('loading')) {
                    document.getElementById('loading').remove();
                }
            }
        } else {
            console.log(`Status: ${status}`);
            console.log(res.data);
        }
    })
}