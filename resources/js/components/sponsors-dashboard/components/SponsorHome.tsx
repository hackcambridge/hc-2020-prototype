import React, { Component } from "react";
import { Page, Layout } from "@shopify/polaris";
import { Link, RouteComponentProps, withRouter } from "react-router-dom";

class SponsorHome extends Component<RouteComponentProps> {
    render() {
        return (
            <div style={{ marginTop: "30px" }}>
                <Page title={`${this.props.match.params["sponsor"].toLowerCase()
                    .split(' ')
                    .map((s) => s.charAt(0).toUpperCase() + s.substring(1))
                    .join(' ')}`} separator>
                    <Layout>
                        <Layout.AnnotatedSection title="Store details">
                        <p>Annotated section content</p>
                        </Layout.AnnotatedSection>
                    </Layout>
                </Page>
            </div>
        );
    }
}

export default withRouter(SponsorHome);