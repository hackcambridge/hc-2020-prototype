import React, { Component } from "react";
import { Page } from "@shopify/polaris";
import { IDashboardProps } from "../../../interfaces/dashboard.interfaces";
import { RouteComponentProps } from "react-router";

type IDashboardPropsWithRouter = RouteComponentProps & IDashboardProps;

class Overview extends Component<IDashboardPropsWithRouter> {
    render() {
        return (
            <Page title={`Hi, ${this.props.user.name}!`}>

            </Page>
        );
    }
}

export default Overview;