
import React, { Component } from "react";
import { Card, Page, Heading, TextField, Button } from "@shopify/polaris";
// @ts-ignore
import QRCode from "qrcode.react";
import {ICommitteeProps} from "../../interfaces/committee.interfaces";
import axios from "axios";

interface QRGenerateState {
    description: string;
    value: string;
    error: string;
}

class QRGenerate extends Component<ICommitteeProps, QRGenerateState> {

    state = {
        description: "",
        value: "",
        error: ""
    }

    private encode(value: string) {
        return window.location.host + "/dashboard/qrcode/" + value;
    }

    private handleValueChange = (newValue: string) => {
        this.setState({ description: newValue });
    }

    private downloadImage = () => {
        const { description } = this.state;
        const canvas: any = document.querySelector('#qrcode > canvas');
        const a = document.createElement("a");
        a.download = "qrcode.png";
        a.href = canvas.toDataURL("image/png");
        a.click();
    }

    private handleSubmitClick = async () => {
        const res = await axios.post("/committee/admin-api/get-qr-code.json", {"description": this.state.description});
        if (res.data) {
            this.setState({error: "", value: res.data.message});
        } else {
            this.setState({error: "Failed to get QR Code"});
        }
    }

    render() {
        const { value, description, error } = this.state;

        return (
            <>
                <div id={"qrgenerator"}>
                    <Page title={"QR Code Generator"}>
                        <TextField label="Description of event" value={description} onChange={this.handleValueChange} />
                        <Button onClick={this.handleSubmitClick}>Get QR Code</Button>
                        <br/>
                        {error && <p>Error: {error}</p>}
                        <br />
                        <Card sectioned>
                            <Heading>QR Code</Heading>
                            {this.renderQRGenerator()}
                            <br />
                            <Button disabled={value.length === 0} onClick={this.downloadImage}>Save image</Button>
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
