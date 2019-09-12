import React from 'react';
import ReactDOM from "react-dom";
import axios from "axios";


if (document.getElementById('dashboard-root')) {
    const element = document.getElementById('dashboard-root')
    if(element) initialise(element);
}


function initialise(root: HTMLElement) {
    console.log("Initialising Dashboard...");
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