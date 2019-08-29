import React, { Component } from "react";
import { Link } from "react-router-dom";
import { Page, Badge, Thumbnail } from "@shopify/polaris";

export class X extends Component {
    render() {
        return (
            <>
                <Page
                    breadcrumbs={[{content: 'Products', url: '/products'}]}
                    title="3/4 inch Leather pet collar"
                    titleMetadata={<Badge status="success">Paid</Badge>}
                    subtitle="Perfect for any pet"
                    thumbnail={
                        <Thumbnail
                        source="https://burst.shopifycdn.com/photos/black-leather-choker-necklace_373x@2x.jpg"
                        alt="Black leather pet collar"
                        />
                    }
                    primaryAction={{content: 'Save', disabled: true}}
                    secondaryActions={[
                        {
                        content: 'Duplicate',
                        accessibilityLabel: 'Secondary action label',
                        },
                        {content: 'View on your store'},
                    ]}
                    actionGroups={[
                        {
                        title: 'Promote',
                        accessibilityLabel: 'Action group label',
                        actions: [
                            {
                            content: 'Share on Facebook',
                            accessibilityLabel: 'Individual action label',
                            onAction: () => {},
                            },
                        ],
                        },
                    ]}
                    pagination={{
                        hasPrevious: true,
                        hasNext: true,
                    }}
                    separator
                    >
                    <h1>X</h1>
                    <Link to={"/sponsors/dashboard/xyz"}>Link</Link>
                </Page>
            </>
        );
    }
}

export class Y extends Component {
    render() {
        return (
            <>
                <h1>Y</h1>
                <Link to={"/sponsors/dashboard/"}>Link</Link>
            </>
        );
    }
}