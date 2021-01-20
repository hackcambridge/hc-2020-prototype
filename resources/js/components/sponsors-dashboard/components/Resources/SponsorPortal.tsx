import { TextContainer, TextField, TextStyle, Button, Card, Heading, Page, ResourceList, Thumbnail } from "@shopify/polaris";
import { AddMajor, AttachmentMajor } from "@shopify/polaris-icons";
import axios from "axios";
import React, { Component } from "react";
import { RouteComponentProps } from "react-router-dom";
import { IResourceDefinition, IPortalDefinition, ISponsorData, IAssetInformation } from "../../../../interfaces/sponsors.interfaces";
import DestructiveConfirmation from "../common/DestructiveConfirmation";
import UploadForm from "../common/UploadForm";
import { toast } from "react-toastify";

interface ISponsorPortalProps extends RouteComponentProps {
    baseSponsorPath: string,
    sponsor: ISponsorData,
    title: string,
    detailType: string,
}

interface ISponsorPortalState {
    detail_id: number,
    resources: IResourceDefinition[],
    uploadFormShowing: boolean,
    fields: IPortalDefinition,
    isLoading: boolean,
    showDestructiveForm: JSX.Element | undefined
}

class SponsorPortal extends Component<ISponsorPortalProps, ISponsorPortalState> {

    state = {
        detail_id: -1,
        resources: [],
        uploadFormShowing: false,
        fields: {
            data: {
                ["description"]: "",
                ["url"]: "",
                ["discord invite link"]: "",
            },
            files: [],
        },
        isLoading: true,
        showDestructiveForm: undefined
    }

    componentDidMount() {
        this.loadContent();
    }

    render() {
        const {
            uploadFormShowing,
            fields,
            isLoading,
            showDestructiveForm
        } = this.state;
        const { data, files } = fields;
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
                        <Heading>Please upload your <strong>company logo, website URL, brief company description, Discord invite link, and any other assets/fields.</strong></Heading>
                        <p>
                            Ensure that the <strong>logo image is named "logo.png"</strong>.
                        </p>
                    </TextContainer>
                    <br />
                    <>
                        <div>
                            {
                                Object.keys(data).map((key) => {
                                    let value = data[key];
                                    return ([
                                        <>
                                            {key === 'url' ?
                                                <TextField key={key} label={"URL"}
                                                    value={value} onChange={(e) => this.handleChange(key, e)} disabled={isLoading} /> :
                                                <TextField key={key} label={this.capitalizeFirstLetter(key)}
                                                    value={value} onChange={(e) => this.handleChange(key, e)} multiline={4} disabled={isLoading} />}

                                            <br />
                                        </>
                                    ])
                                })
                            }
                        </div>
                    </>
                    {files.length > 0 ?
                        <ResourceList
                            resourceName={{ singular: 'asset', plural: 'assets' }}
                            items={files}
                            renderItem={this.renderAssetThumbnail}
                            showHeader={true}
                            loading={isLoading}
                            alternateTool={
                                <Button
                                    plain icon={AddMajor}
                                    onClick={() => this.setState({ uploadFormShowing: true })}>
                                </Button>
                            }
                        />
                        : <Button disabled={isLoading} icon={AttachmentMajor} onClick={() => this.setState({ uploadFormShowing: true })}>Add asset (20MB max.)</Button>}

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
                {uploadFormShowing ? <UploadForm
                    sponsor={this.props.sponsor}
                    onClose={() => this.setState({ uploadFormShowing: false })}
                    onSubmit={(urls: IAssetInformation[]) => {
                        const newURLs: IAssetInformation[] = urls;
                        const oldFiles: IAssetInformation[] = files;
                        const newFields = fields;
                        newFields.files = oldFiles.concat(newURLs);
                        this.setState({ fields: newFields });
                        this.saveContent(true, () => toast.success(`Successfully uploaded ${newURLs.length} file(s)`));
                    }}
                /> : <></>}
                {showDestructiveForm || <></>}
            </Page>
        );
    }

    private capitalizeFirstLetter(string: string) {
        return string.length == 0 ? string : string[0].toUpperCase() + string.slice(1);
    }

    private handleChange(key: string, value: string) {
        const newFields: IPortalDefinition = this.state.fields;
        newFields.data[key] = value;
        this.setState({ fields: newFields });
    }

    renderAssetThumbnail = (item: IAssetInformation) => {
        const { name, url } = item;
        const thumbnail = <Thumbnail source={url} alt={name}></Thumbnail>;
        const actions = [{
            content: 'Delete',
            onAction: () => this.deleteAsset(item)
        }];
        return (
            <ResourceList.Item
                id={name}
                key={name}
                media={thumbnail}
                onClick={() => {
                    var win = window.open(item.url, '_blank');
                    win.focus();
                }}
                accessibilityLabel={`View details for ${name}`}
                shortcutActions={actions}
            >
                <h3>
                    <TextStyle variation="strong">{name}</TextStyle>
                </h3>
            </ResourceList.Item>
        );
    }

    deleteAsset(item: IAssetInformation) {
        const destructor: JSX.Element = (
            <DestructiveConfirmation
                onConfirm={() => this.actuallyDeleteAsset(item)}
                onClose={() => this.setState({ showDestructiveForm: undefined })}
            />
        );

        this.setState({ showDestructiveForm: destructor });
    }

    actuallyDeleteAsset(item: IAssetInformation) {
        if (!this.state.isLoading) {
            this.setState({ isLoading: true });
        }
        axios.post(`/sponsors/dashboard-api/remove-asset.json`, {
            sponsor_id: this.props.sponsor.id,
            sponsor_slug: this.props.sponsor.slug,
            asset_url: item.url
        }).then(res => {
            const status = res.status;
            if (status == 200) {
                const payload = res.data;
                if ("success" in payload && payload["success"]) {
                    const newFields = this.state.fields;
                    newFields.files = newFields.files.filter(f => f.url !== item.url)
                    this.setState({ fields: newFields });
                    this.saveContent(true, () => toast.success("Successfully removed file"));
                } else {
                    toast.error(`Failed to remove file: ${payload["message"]}`);
                }
            } else {
                toast.error("Failed to remove file");
            }
        }).finally(() => {
            this.setState({ isLoading: false });
        });
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
                        const details: {
                            data: { [varName: string]: string },
                            files: IAssetInformation[]
                        } = JSON.parse(detail[0]["payload"]);

                        this.setState({
                            isLoading: false,
                            detail_id: detail[0]["id"],
                            fields: {
                                data: Object.assign({}, fields.data, details.data),
                                files: details.files,
                            }
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
                    const details: {
                        data: { [varName: string]: string },
                        files: IAssetInformation[]
                    } = JSON.parse(detailData["payload"]);

                    this.setState({
                        isLoading: false,
                        fields: {
                            data: details.data,
                            files: details.files,
                        }
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

export default SponsorPortal;
