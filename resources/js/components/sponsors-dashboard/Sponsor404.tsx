import React, { Component } from "react";
import { EmptyState } from "@shopify/polaris";


class Sponsor404 extends Component {
    render() {
        return (
            <EmptyState
                heading="Well this is awkward..."
                action={{ content: 'Back Home', url: "/sponsors/dashboard/" }}
                // secondaryAction={{content: 'Learn more', url: 'https://help.shopify.com'}}
                image="https://cdn.shopify.com/s/files/1/0757/9955/files/empty-state.svg"
            >
                <p>404, Page Not Found.</p>
                <br />
            </EmptyState>
        );
    }
}

export default Sponsor404;
