import React, { Component } from "react";
import { Page, Card, ProgressBar, Layout, DisplayText } from "@shopify/polaris";
import { Link } from "react-router-dom";

class SponsorOverview extends Component {
    render() {
        return (
            <Page title={"Overview"}>
                <Layout>
                    <Layout.Section>
                        <Card title="Statuses">
                            <Card.Section>
                                <ProgressBar progress={Math.floor(Math.random() * 100) + 1} size="medium" />
                                <br style={{padding: "20px"}} />
                                <ProgressBar progress={Math.floor(Math.random() * 100) + 1} size="medium" />
                                <br style={{padding: "20px"}} />
                                <ProgressBar progress={Math.floor(Math.random() * 100) + 1} size="medium" />
                                <br style={{padding: "20px"}} />
                                <ProgressBar progress={Math.floor(Math.random() * 100) + 1} size="medium" />
                                <br style={{padding: "20px"}} />
                                <ProgressBar progress={Math.floor(Math.random() * 100) + 1} size="medium" />
                                <br style={{padding: "20px"}} />
                                <ProgressBar progress={Math.floor(Math.random() * 100) + 1} size="medium" />
                                <br style={{padding: "20px"}} />
                                <ProgressBar progress={Math.floor(Math.random() * 100) + 1} size="medium" />
                                <br style={{padding: "20px"}} />
                                <ProgressBar progress={Math.floor(Math.random() * 100) + 1} size="medium" />
                                <br style={{padding: "20px"}} />
                                <Link to={"/"}>
                                    {/* <p style={{ textDecoration: "none" }}><strong>Facebook</strong></p> */}
                                    <ProgressBar progress={Math.floor(Math.random() * 100) + 1} size="medium" />
                                </Link>
                            </Card.Section>
                        </Card>
                    </Layout.Section>
                </Layout>
            </Page>
        );
    }
}

export default SponsorOverview;