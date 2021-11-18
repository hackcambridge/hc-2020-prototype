import { TextContainer, TextField, TextStyle, Button, Card, Heading, Page, ResourceList, Thumbnail } from "@shopify/polaris";
import { AddMajor, AttachmentMajor } from "@shopify/polaris-icons";
import axios from "axios";
import React, { Component } from "react";
import { RouteComponentProps } from "react-router-dom";
import {
    IResourceDefinition,
    ISponsorData,
    ISpecialReqDefinition
} from "../../../../interfaces/sponsors.interfaces";
import DestructiveConfirmation from "../common/DestructiveConfirmation";
import UploadForm from "../common/UploadForm";
import { toast } from "react-toastify";

interface ISponsorSpecialReqProps extends RouteComponentProps {
    baseSponsorPath: string,
    sponsor: ISponsorData,
    title: string,
    detailType: string,
}

interface ISponsorSpecialReqState {
    detail_id: number,
    resources: IResourceDefinition[],
    uploadFormShowing: boolean,
    fields: ISpecialReqDefinition,
    isLoading: boolean,
    showDestructiveForm: JSX.Element | undefined
}

class SponsorSpecialReq extends Component<ISponsorSpecialReqProps, ISponsorSpecialReqState> {

    state = {
        detail_id: -1,
        resources: [],
        uploadFormShowing: false,
        fields: {
            powerSupply: "",
            network: "",
            other: ""
        },
        isLoading: true,
        showDestructiveForm: undefined
    }

    componentDidMount() {
        this.loadContent();
    }

    render() {
        const {
            fields,
            isLoading,
        } = this.state;
        return (
            <Page
                breadcrumbs={[{
                    content: this.props.sponsor.name,
                    url: this.props.baseSponsorPath
                }]}
                title={this.props.title}
            >
                <Card sectioned>
                    <TextContainer>
                        <Heading>Please specify any special requirement you have regarding the actual event booth setup (power supply  and network), or any extra information that we should know.</Heading>
                    </TextContainer>
                    <br />
                    <>
                        <div>
                                <TextField key={"powerSupply"} label={"Power Supply"} placeholder={"Do you have any special requirement regarding the power supply at your booth? (e.g. Large number of socket, etc.)"}
                                    value={fields["powerSupply"]} onChange={(e) => this.handleChange("powerSupply", e)} multiline={4} disabled={isLoading} />
                                <TextField key={"network"} label={"Network"} placeholder="Do you have any special requirement regarding the network connection at your booth? (e.g. Dedicated wire etc.)"
                                value={fields["network"]} onChange={(e) => this.handleChange("network", e)} multiline={4} disabled={isLoading} />
                                <TextField key={"other"} label={"Other requirements"} placeholder={"Anything else that we should know? (e.g. When do you plan to arrive for booth setup?)"}
                                value={fields["other"]} onChange={(e) => this.handleChange("other", e)} multiline={4} disabled={isLoading} />
                        </div>
                    </>

                    <hr style={{ borderStyle: "solid", borderColor: "#dedede94", margin: "20px 0" }} />
                    <div style={{ textAlign: "right" }}>
                        <Button
                            primary
                            loading={isLoading}
                            onClick={() => this.saveContent(false)}
                        >
                            Save
                        </Button>
                    </div>
                </Card>
            </Page>
        );
    }

    private capitalizeFirstLetter(string: string) {
        return string.length == 0 ? string : string[0].toUpperCase() + string.slice(1);
    }

    private handleChange(key: string, value: string) {
        const newFields: ISpecialReqDefinition = this.state.fields;
        newFields[key] = value;
        this.setState({ fields: newFields });
    }

    private loadContent() {
        const { isLoading, fields } = this.state;
        if (!isLoading) {
            this.setState({ isLoading: true });
        }
        axios.post(`/sponsors/dashboard-api/load-resources.json`, {
            sponsor_id: this.props.sponsor.id,
            sponsor_slug: this.props.sponsor.slug,
            detail_type: this.props.detailType
        }).then(res => {
            const status = res.status;
            if (status == 200) {
                const payload = res.data;
                if ("success" in payload && payload["success"]) {
                    const detail = payload["details"];
                    if (Array.isArray(detail) && detail.length > 0) {
                        const requirements = JSON.parse(detail[0]["payload"]);

                        this.setState({
                            isLoading: false,
                            detail_id: detail[0]["id"],
                            fields: Object.assign({}, requirements)
                        });
                        return;
                    }
                }
            }
        }).finally(() => this.setState({ isLoading: false }));
    }

    private saveContent = (silent: boolean = false, then: () => void = () => { }) => {
        const { isLoading, fields, detail_id } = this.state;

        if (!isLoading) {
            this.setState({ isLoading: true });
        }

        const payload = fields;
        axios.post(`/sponsors/dashboard-api/add-resource.json`, {
            sponsor_id: this.props.sponsor.id,
            sponsor_slug: this.props.sponsor.slug,
            detail_type: this.props.detailType,
            detail_id: detail_id,
            complete: "yes",
            payload: JSON.stringify(payload),
        }).then(res => {
            const status = res.status;
            if (status == 200 || status == 201) {
                const payload = res.data;
                if ("success" in payload && payload["success"]) {
                    const detailData = payload["detail"];
                    const requirements = JSON.parse(detailData["payload"]);

                    this.setState({
                        isLoading: false,
                        fields: requirements
                    });
                    if (!silent) {
                        toast.success("Information saved");
                    }
                    then();
                    return;
                }
                toast.error(payload["message"]);
            } else {
                toast.error("An error occurred");
            }
        }).finally(() => this.setState({ isLoading: false }));
    }
}

export default SponsorSpecialReq;
