import React, { Component } from "react";
import SponsorLoading from "./SponsorLoading";
import { Switch, Route, RouteComponentProps } from "react-router";
import { ISponsorDashboardProps, ISponsorData } from "../../interfaces/sponsors.interfaces";
import SponsorHome from "./components/SponsorHome";
import Sponsor404 from "./Sponsor404";
import SponsorAdmin from "./components/SponsorAdmin";
import SponsorPeople from "./components/SponsorPeople";
import SponsorOverview from "./components/SponsorOverview";

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
        const sponsorBaseUrl = `${this.props.baseUrl}/${sponsorSlug}/`;
        console.log(sponsorSlug, sponsorBaseUrl);
        return (
            <div style={{ marginTop: "30px" }}>
                <Switch>
                    <Route exact path={`${this.props.baseUrl}/overview`} component={SponsorOverview} />
                    <Route exact path={`${sponsorBaseUrl}overview`} render={(props) => 
                        <SponsorHome baseSponsorPath={sponsorBaseUrl} sponsor={this.props.sponsor} {...this.props} {...props}/>} 
                    />
                    <Route exact path={`${sponsorBaseUrl}admin`} render={(props) => 
                        <SponsorAdmin baseSponsorPath={sponsorBaseUrl} sponsor={this.props.sponsor} onUpdate={this.props.onUpdate} {...this.props} {...props}/>} 
                    />
                    <Route exact path={`${sponsorBaseUrl}people`} render={(props) => 
                        <SponsorPeople baseSponsorPath={sponsorBaseUrl} sponsor={this.props.sponsor} {...this.props} {...props}/>} 
                    />
                    <Route component={SponsorLoading} />
                </Switch>
            </div>
        );
    }
}

export default SponsorContext;