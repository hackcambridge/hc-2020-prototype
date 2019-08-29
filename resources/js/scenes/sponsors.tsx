import React from 'react';
import ReactDOM from "react-dom";
import SponsorDashboard from "../components/sponsors-dashboard/SponsorDashboard";

export interface ISponsorDashboardProps {
    baseUrl: string;
    user: { type: string, name: string }
}

if (document.getElementById('sponsors-root')) {
    const element = document.getElementById('sponsors-root')
    if(element) {
        const propsString = element.dataset.props;
        const props : ISponsorDashboardProps = JSON.parse(propsString ? propsString : "{}");
        delete element.dataset.props;

        ReactDOM.render(<SponsorDashboard {...props}/>, element);
        if(document.getElementById('loading')) {
            document.getElementById('loading').remove();
        }
    }
}
