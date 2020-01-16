import React, { Component } from "react";
import { Page, Card, TextContainer, CalloutCard, Heading, DisplayText, Link } from "@shopify/polaris";
import { IDashboardProps } from "../../../interfaces/dashboard.interfaces";
import { RouteComponentProps } from "react-router";

type IDashboardPropsWithRouter = RouteComponentProps & IDashboardProps;

class Overview extends Component<IDashboardPropsWithRouter> {
    private detailsReady = false;

    render() {
        return (
            <>
                <img src="/images/HC-HackerHeader-bg.png" style={{ position: "absolute", width: "100%", marginTop: "-30px", zIndex: -1000 }} />
                <Page title={""}>
                    <img id="hacker-header-fg" src="/images/HC-HackerHeader-fg.png" />
                    {this.renderStartApplicationBanner()}
                    {this.renderMoreComingSoonBanner()}
                </Page>
            </>
        );
    }

    private renderStartApplicationBanner() {
        if(!this.props.canApply || this.props.user.type != "hacker") {
            return <></>;
        }
        return (
            <Card>
                <Link url={`${this.props.baseUrl}/apply/individual`}>
                    <div id="apply-banner"><img src="/images/apply-text-overlay.png" /></div>
                </Link>
            </Card>
        );
    }

    private renderMoreComingSoonBanner() {
        if(this.detailsReady) {
            return <></>;
        }
        return (
            <Card sectioned title={``}>
                <div style={{ textAlign: "center", padding: "1rem", color: "#8e8e8e" }}>
                    <DisplayText size="medium">More Coming Soon...</DisplayText>
                    <br />
                    <TextContainer>Hey {this.props.user.name.split(" ")[0]}, we'll be adding more information here closer to the event. Stay tuned!</TextContainer>
                </div>
            </Card>
        );
    }
}

export default Overview;