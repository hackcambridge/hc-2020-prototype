import React, { Component } from "react";
import SponsorLoading from "./SponsorLoading";
import { Switch, Route, RouteComponentProps } from "react-router";
import { ISponsorDashboardProps, ISponsorData } from "../../interfaces/sponsors.interfaces";
import SponsorHome from "./components/SponsorHome";
import Sponsor404 from "./Sponsor404";
import SponsorAdmin from "./components/SponsorAdmin";

interface ISponsorContextProps extends RouteComponentProps, ISponsorDashboardProps {
    sponsor: ISponsorData,
    onUpdate: () => void
}

interface ISponsorContextState {
    access: boolean,
}

class SponsorContext extends Component<ISponsorContextProps, ISponsorContextState> {

    state = {
        access: false
    }

    render() {
        const sponsorSlug = this.props.match.params["sponsor"] || "";
        const sponsorBaseUrl = `${this.props.baseUrl}/${sponsorSlug}`;
        console.log(sponsorSlug, sponsorBaseUrl);
        return (
            <div style={{ marginTop: "30px" }}>
                <Switch>
                    <Route exact path={`${sponsorBaseUrl}/overview`} component={SponsorHome} />
                    <Route exact path={`${sponsorBaseUrl}/admin`} render={(props) => 
                        <SponsorAdmin baseSponsorPath={sponsorBaseUrl} sponsor={this.props.sponsor} onUpdate={this.props.onUpdate} {...this.props} {...props}/>} 
                    />
                    <Route component={SponsorLoading} />
                </Switch>
            </div>
        );
    }
}

export default SponsorContext;