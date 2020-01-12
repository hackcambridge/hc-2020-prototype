import React, { Component } from "react";
import { Page, Card } from "@shopify/polaris";
import { MapInteractionCSS } from "react-map-interaction";
import { IDashboardProps } from "../../../interfaces/dashboard.interfaces";
import { RouteComponentProps } from "react-router";


class MapView extends Component {

    render() {

        // console.log(this.props);

        return (
            <Page title={"Map"}>
                <Card>
                    <MapInteractionCSS>
                        <img src="https://www.nasa.gov/sites/default/files/thumbnails/image/stsci-h-p1917b-q-5198x4801.jpg" alt="test" />
                    </MapInteractionCSS>
                </Card>
            </Page>
        );
    }
}

export default MapView;