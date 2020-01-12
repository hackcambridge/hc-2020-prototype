import React, { Component } from "react";
import { Page, Card, TextContainer, CalloutCard, Heading, DisplayText, Link } from "@shopify/polaris";
import { IDashboardProps } from "../../../interfaces/dashboard.interfaces";
import { RouteComponentProps } from "react-router";

type IDashboardPropsWithRouter = RouteComponentProps & IDashboardProps;

class Overview extends Component<IDashboardPropsWithRouter> {
    render() {
        // console.log(this.props);
        return (
            <>
                <img src="/images/HC-HackerHeader-bg.png" style={{ position: "absolute", width: "100%", marginTop: "-30px", zIndex: -1000 }} />
                <Page title={""}>
                    <img id="hacker-header-fg" src="/images/HC-HackerHeader-fg.png" />

                    <Card>
                        <Link url={`${this.props.baseUrl}/apply/individual`}>
                            <div id="apply-banner"><img src="/images/apply-text-overlay.png" /></div>
                        </Link>
                    </Card>

                    <Card sectioned title={``}>
                        <div style={{ textAlign: "center", padding: "1rem", color: "#8e8e8e" }}>
                            <DisplayText size="medium">More Coming Soon...</DisplayText>
                            <br />
                            <TextContainer>Hey {this.props.user.name.split(" ")[0]}, we'll be adding more information here closer to the event. Stay tuned!</TextContainer>
                        </div>
                    </Card>
                </Page>
            </>
        );
    }
}

export default Overview;