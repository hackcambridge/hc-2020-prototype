import React, { Component } from "react";
import SponsorLoading from "./SponsorLoading";
import { Switch, Route, RouteComponentProps } from "react-router";
import { ISponsorDashboardProps } from "../../scenes/sponsors";
import SponsorHome from "./components/SponsorHome";
import Sponsor404 from "./Sponsor404";

interface ISponsorContextProps extends RouteComponentProps, ISponsorDashboardProps {}
interface ISponsorContextState {
    access: boolean
}

class SponsorContext extends Component<ISponsorContextProps, ISponsorContextState> {

    state = {
        access: false
    }

    render() {
        console.log(this.state.access);
        if(!this.state.access) {
            return <SponsorLoading />;
        } else {
            const sponsorSlug = this.props.match.params["sponsor"] || "";
            const sponsorBaseUrl = `${this.props.baseUrl}/${sponsorSlug}`;
            return (
                <Switch>
                    <Route exact path={`${sponsorBaseUrl}/`} component={SponsorHome} />
                    <Route component={Sponsor404} />
                </Switch>
            );
        }
    }
}

export default SponsorContext;