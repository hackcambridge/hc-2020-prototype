import React, { Component } from "react";
import { Page, Card } from "@shopify/polaris";
import { MapInteractionCSS } from "react-map-interaction";
import { IDashboardProps } from "../../../interfaces/dashboard.interfaces";
import { RouteComponentProps } from "react-router";


class MapView extends Component {

    private mapUrl = "https://hc-upload-production.s3.eu-west-2.amazonaws.com/map.png";
    render() {

        // console.log(this.props);

        return (
            <Page fullWidth title={"Event Map"}>
                <Card>
                    <div style={{ height: "100%" }}>
                        <MapInteractionCSS
                            showControls
                            defaultScale={0.3}
                        >
                            <img src={this.mapUrl} alt="Hack Cambridge Venue Map" />
                        </MapInteractionCSS>
                    </div>
                </Card>
            </Page>
        );
    }
}

export default MapView;