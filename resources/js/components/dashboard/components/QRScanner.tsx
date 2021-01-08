
import React, { Component, RefObject } from "react";
import { Card, Page, Heading, VisuallyHidden, Subheading } from "@shopify/polaris";
import axios from 'axios';
import { toast } from "react-toastify";
import { IDashboardProps } from "../../../interfaces/dashboard.interfaces";
import QrReader from "react-qr-scanner";

interface QRScannerState {
    loaded: boolean,
    busy: boolean,
    delay: number,
    legacyRef: React.RefObject<QrReader> | null,
}

class QRScanner extends Component<IDashboardProps, QRScannerState> {

    state = {
        loaded: false,
        busy: false,
        delay: 1000,
        legacyRef: null
    }

    private handleScan = (data: string) => {
        if (data != null) {
            console.log("Data:", data);
            let decoded = window.atob(data);
            console.log("Decoded:", decoded);
            const regex = new RegExp("^[a-zA-Z0-9]+\/[a-zA-Z0-9]+$");
            if (regex.test(decoded)) {
                toast.success("Code found sending to server...");
                this.sendCode(data);
            } else {
                toast.error("Invalid code!");
            }
        }
    }

    private handleError = (err: string) => {
        console.error("Error:" + err)
    }

    render() {
        const { loaded, busy } = this.state;

        return (
            <>
                <div id={"qrscanner"}>
                    <Page title={"QR Code Scanner"}>
                        {loaded
                            ? busy ? <Card sectioned><Heading>Scanner is busy.</Heading></Card> : ""
                            : <Card sectioned><Heading>Loading QR Code Scanner</Heading></Card>
                        }
                        {this.renderQRScanner()}
                    </Page>
                </div>
            </>
        )
    }

    private isLoaded = () => {
        this.setState({ loaded: true });
    }

    private setLegacyRef = (element: any) => {
        this.setState({ legacyRef: element});
    }

    private openImageDialog = () => {
        const { legacyRef } = this.state;
        if (legacyRef != null) {
            legacyRef.openImageDialog();
        }
    }

    private renderQRScanner() {
        const previewStyle = {
            height: 370,
            width: 640,
        }

        const legacyStyle = {
            display: "none",
        }

        const { delay } = this.state;

        return (<><QrReader
            delay={delay}
            style={previewStyle}
            onError={this.handleError}
            onScan={this.handleScan}
            onLoad={this.isLoaded}
            facingMode={"rear"}
        /><br /><Subheading>Or:</Subheading><br />
            <QrReader
                ref={this.setLegacyRef}
                delay={delay}
                style={legacyStyle}
                onError={this.handleError}
                onScan={this.handleScan}
                legacyMode
            />
            <input type="button" value="Submit QR Code" onClick={this.openImageDialog} /></>);
    }

    private sendCode(code: string) {
        this.setState({ busy: true });
        axios.post(`/dashboard-api/event-code.json`, {
            qrcode: code,
        }).then(res => {
            const status = res.status;
            if (status == 200 || status == 201) {
                const payload = res.data;
                if ("success" in payload && payload["success"]) {
                    toast.success("Code submitted successfully");
                    this.setState({ busy: false });
                    return;
                } else {
                    toast.error(payload["message"]);
                    this.setState({ busy: false });
                    return;
                }
            }
            toast.error("Failed to send code.");
            this.setState({ busy: false });
            console.log(status, res.data);
        });
    }
}

export default QRScanner;
