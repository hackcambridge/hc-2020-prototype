import React from 'react';
import ReactDOM from "react-dom";
import SponsorsDashboard from "../components/sponsors-dashboard/SponsorsDashboard";

if (document.getElementById('sponsors-root')) {
    ReactDOM.render(<SponsorsDashboard />, document.getElementById('sponsors-root'));
}
