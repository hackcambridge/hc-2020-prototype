
import React, { Component } from "react";
import { Layout, Card, Page, Heading } from "@shopify/polaris";
import axios from 'axios';
import { toast } from "react-toastify";
import { IDashboardProps } from "../../../interfaces/dashboard.interfaces";
import QrReader from "react-qr-scanner";


interface QRScannerState {
    loaded: boolean,
    delay: number,
}

class QRScanner extends Component<IDashboardProps, QRScannerState> {

    state = {
        loaded: true,
        delay: 100,
    }

    private handleScan(data) {
        if(data != null) {
            toast.success("Code found and sent to server")
            console.log(data);
        }
    }

    private handleError(err) {
        console.error("Error:" + err)
    }

    render() {
        const { loaded } = this.state;

        return (
            <>
                <div id={"qrscanner"}>
                    <Page title={"QR Code Scanner"}>
                        {loaded
                            ? this.renderQRScanner()
                            : <Card sectioned><Heading>Loading QR Code Scanner</Heading></Card>
                        }
                    </Page>
                </div>
            </>
        )
    }

    private renderQRScanner() {
        const previewStyle = {
            height: 240,
            width: 320,
        }

        return (<><QrReader
            delay={this.state.delay}
            style={previewStyle}
            onError={this.handleError}
            onScan={this.handleScan}
            onLoad={() => {this.state.loaded = true}}
            facingMode={"rear"}
            // legacyMode={true}
        /></>);


    }
}

export default QRScanner;
