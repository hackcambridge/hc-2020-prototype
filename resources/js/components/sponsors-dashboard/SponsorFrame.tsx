import React, { Component } from "react";
import { BrowserRouter, Switch, Route, Redirect } from "react-router-dom";
import SponsorDashboard from "./SponsorDashboard";
import { ISponsorDashboardProps } from "../../interfaces/sponsors.interfaces";


class SponsorFrame extends Component<ISponsorDashboardProps> {
    render() {
        return (
            <BrowserRouter>
                <Switch>
                    <Redirect exact path={`${this.props.baseUrl}`} to={`${this.props.baseUrl}/overview`} />
                    <Route exact path={`${this.props.baseUrl}/overview`} render={(props) => <SponsorDashboard validRoute={true} {...props} {...this.props} />} />
                    <Route exact path={`${this.props.baseUrl}/:sponsor/:uri?`} render={(props) => <SponsorDashboard validRoute={true} {...props} {...this.props} />} />
                    <Route path={""} render={(props) => <SponsorDashboard validRoute={false} {...props} {...this.props} />} />
                </Switch>
            </BrowserRouter>
        );
    }
}

export default SponsorFrame;
