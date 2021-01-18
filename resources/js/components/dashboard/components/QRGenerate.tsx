
import React, { Component } from "react";
import { Card, Page, Heading, TextField, Button } from "@shopify/polaris";
import { IDashboardProps } from "../../../interfaces/dashboard.interfaces";
import QRCode from "qrcode.react";

interface QRGenerateState {
    value: string,
}

class QRGenerate extends Component<IDashboardProps, QRGenerateState> {

    state = {
        value: "",
    }

    private encode(value: string) {
        return window.btoa("hexcambridge/" + value);
    }

    private handleValueChange = (newValue: string) => {
        this.setState({ value: newValue });
    }

    private downloadImage = () => {
        const { value } = this.state;
        const canvas: any = document.querySelector('#qrcode > canvas');
        const a = document.createElement("a");
        a.download = value + ".png";
        a.href = canvas.toDataURL("image/png");
        a.click();
    }

    render() {
        const { value } = this.state;

        return (
            <>
                <div id={"qrgenerator"}>
                    <Page title={"QR Code Generator"}>
                        <TextField label="Code value" value={value} onChange={this.handleValueChange} />
                        <br />
                        <Card sectioned>
                            <Heading>QR Code</Heading>
                            {this.renderQRGenerator()}
                            <br />
                            <Button disabled={value.length == 0} onClick={this.downloadImage}>Save image</Button>
                        </Card>
                    </Page>
                </div>
            </>
        );
    }

    private renderQRGenerator() {
        const { value } = this.state;
        
        return (
            <>
                <div id="qrcode">
                    {value.length ? <QRCode
                        value={this.encode(value)}
                        size={128}
                        bgColor={"#ffffff"}
                        fgColor={"#000000"}
                        level={"L"}
                        renderAs={"canvas"}
                        includeMargin={true}
                    /> : <></>}
                </div>
            </>
        );
    }


}

export default QRGenerate;
