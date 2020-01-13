import React, { Component } from "react";
import PinchZoomPan from "react-responsive-pinch-zoom-pan";


class MapView extends Component {

    private mapUrl = "https://assets.hackcambridge.com/map.png";

    componentDidMount() {
        document.body.style.overflow = "hidden";
        window.scrollTo(0, 0);
    }

    componentWillUnmount() {
        document.body.style.overflow = "scroll";
    }

    render() {
        return (
            <div id={"mapViewContainer"} style={{ height: window.innerHeight - 62 }}>
                <PinchZoomPan initialScale={0.20} minScale={0.15} maxScale={0.5}>
                    <img alt='Hack Cambridge Venue Map' src={this.mapUrl} />
                </PinchZoomPan>
            </div>
        );
    }
}

export default MapView;