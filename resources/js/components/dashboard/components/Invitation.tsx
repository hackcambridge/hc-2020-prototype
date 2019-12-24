import React, { Component, ReactNode } from "react";
import { IApplicationRecord } from "../../../interfaces/dashboard.interfaces";
import { Page, Heading, Card } from "@shopify/polaris";

interface IInvitationProps {
    application: IApplicationRecord | undefined
}

class Invitation extends Component<IInvitationProps> {
    
    render() {
        const app = this.props.application;
        return (
            <Page title={"Your Invitation"}>
                {app && app.invited
                    ? this.renderContent()
                    : <Card sectioned><Heading>An error occurred.</Heading></Card>
                }
            </Page>
        );
    }

    renderContent(): ReactNode {
        return (<>
            <h1>Yay!</h1>
        </>);
    }
}

export default Invitation;