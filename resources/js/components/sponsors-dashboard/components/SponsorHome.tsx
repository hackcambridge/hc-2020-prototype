import React, { Component } from "react";
import { Page, Layout } from "@shopify/polaris";
import { Link, RouteComponentProps, withRouter } from "react-router-dom";

class SponsorHome extends Component<RouteComponentProps> {
    render() {
        return (
            <Page title={`${this.props.match.params["sponsor"]}`} separator>
                <Layout>
                    <Layout.AnnotatedSection title="Store details">
                    <p>Annotated section content</p>
                    </Layout.AnnotatedSection>
                </Layout>
            </Page>
        );
    }
}

export default withRouter(SponsorHome);