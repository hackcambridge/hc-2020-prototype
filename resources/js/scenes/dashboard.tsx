import React from 'react';
import ReactDOM from "react-dom";
import axios from "axios";
<<<<<<< HEAD
import { IDashboardProps } from "../interfaces/dashboard.interfaces";
import Dashboard from '../components/dashboard/Dashboard';
import { BrowserRouter } from 'react-router-dom';
=======

>>>>>>> 759e76b9e137282ef50957041ae449faf92efbc2

if (document.getElementById('dashboard-root')) {
    const element = document.getElementById('dashboard-root')
    if(element) initialise(element);
}


function initialise(root: HTMLElement) {
    console.log("Initialising Dashboard...");
<<<<<<< HEAD
    axios.get(`/dashboard-api/init.json`).then(res => {
        const status = res.status;
        if(status == 200) {
            const obj = res.data;
            if ("success" in obj && obj["success"]) {
                const payload : IDashboardProps = obj["payload"];
                ReactDOM.render(
                    <BrowserRouter>
                        <Dashboard {...payload}/>
                    </BrowserRouter>, 
                root);

                const loadingElement = document.getElementById('loading');
                if(loadingElement) {
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
=======
    // axios.get(`/dashboard-api/init.json`).then(res => {
    //     const status = res.status;
    //     if(status == 200) {
    //         const obj = res.data;
    //         if ("success" in obj && obj["success"]) {
    //             // const payload : ISponsorDashboardProps = obj["payload"];
    //             // ReactDOM.render(<SponsorFrame {...payload}/>, root);

    //             const loadingElement = document.getElementById('loading');
    //             if(loadingElement) {
    //                 loadingElement.remove();
    //             }
    //         }
    //     } else {
    //         console.log(`Status: ${status}`);
    //         console.log(res.data);
    //     }
    // })
}
>>>>>>> 759e76b9e137282ef50957041ae449faf92efbc2
