import React, { Component } from "react";
import { BrowserRouter, Switch, Route } from "react-router-dom";
import SponsorDashboard from "./SponsorDashboard";
import { ISponsorDashboardProps } from "../../interfaces/sponsors.interfaces";
import SponsorHome from "./components/SponsorHome";
import SponsorContext from "./SponsorContext";
import Sponsor404 from "./Sponsor404";

class SponsorFrame extends Component<ISponsorDashboardProps> {
    render() {
        return (
            <BrowserRouter>
                <Switch>
                    <Route exact path={`${this.props.baseUrl}/`} render={ (props) => <SponsorDashboard validRoute={true} {...props} {...this.props}/> } />
                    <Route exact path={`${this.props.baseUrl}/:sponsor/:uri?`} render={ (props) => <SponsorDashboard validRoute={true} {...props} {...this.props}/> } />
                    <Route path={""} render={ (props) => <SponsorDashboard validRoute={false} {...props} {...this.props}/>} />
                </Switch>
            </BrowserRouter>
        );
    }
}

export default SponsorFrame;