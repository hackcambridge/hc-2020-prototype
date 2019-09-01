import React, { Component } from "react";
import { Page, Layout, Card, ProgressBar } from "@shopify/polaris";
import { Link, RouteComponentProps, withRouter } from "react-router-dom";
import { ISponsorData } from "../../../interfaces/sponsors.interfaces";

interface ISponsorAdminProps extends RouteComponentProps {
    baseSponsorPath: string,
    sponsor: ISponsorData,
}

class SponsorHome extends Component<ISponsorAdminProps> {
    render() {
        return (
            <Page title={this.props.sponsor.name}>
                <Card sectioned>
                    <ProgressBar progress={40} size="small" />
                </Card>
                <br style={{padding: "20px"}} />
                <Layout>
                    <Layout.Section oneThird><Card title="One"></Card></Layout.Section>
                    <Layout.Section oneThird><Card title="Two"></Card></Layout.Section>
                    <Layout.Section oneThird><Card title="Three"></Card></Layout.Section>
                </Layout>
            </Page>
        );
    }
}

export default withRouter(SponsorHome);