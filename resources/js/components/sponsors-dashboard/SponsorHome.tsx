import React, { Component } from "react";
import { Page } from "@shopify/polaris";

class SponsorHome extends Component {
    render() {
        return (
            <Page
                fullWidth
                title="Orders"
                primaryAction={{content: 'Create order'}}
                secondaryActions={[{content: 'Export'}]}
                pagination={{
                    hasNext: true,
                }}
            >
                <p>Wide page content</p>
            </Page>
        );
    }
}

export default SponsorHome;