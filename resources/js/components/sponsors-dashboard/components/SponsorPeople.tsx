import React, { Component } from "react";
import { Page, Badge, Card, DisplayText } from "@shopify/polaris";
import { ResourceListExample } from "./ExampleResourceList";

class SponsorPeople extends Component {

    render() {
        return (
            <Page
                breadcrumbs={[{content: 'Palantir', url: '/sponsors/dashboard/'}]}
                title="People"
                icon="SmileyJoyMajor"
                titleMetadata={<Badge status="attention">Outstanding</Badge>}
                primaryAction={{content: 'Save', disabled: false}}
                // secondaryActions={[{content: 'Duplicate'}, {content: 'View on your store'}]}
            >
                <Card>
                    <div style={{ padding: "2rem" }}>
                        <DisplayText size="small">This is where we explain what the f*ck is going on.</DisplayText>
                    </div>
                </Card>
                <ResourceListExample />
            </Page>
        );
    }
}

export default SponsorPeople;