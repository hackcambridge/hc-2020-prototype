import { Avatar, Button, Card, Heading, Page, ResourceList } from "@shopify/polaris";
import { AddMajor } from "@shopify/polaris-icons";
import axios from "axios";
import React, { Component } from "react";
import { RouteComponentProps } from "react-router-dom";
import { ISwagItemDefinition, ISponsorData } from "../../../../interfaces/sponsors.interfaces";
import DestructiveConfirmation from "../common/DestructiveConfirmation";
import SponsorSwagForm from "./SponsorSwagForm";
import { toast } from "react-toastify";

interface ISponsorSwagProps extends RouteComponentProps {
    baseSponsorPath: string,
    sponsor: ISponsorData,
    title: string,
    detailType: string,
    resourceNames: {
        singular: string,
        plural: string,
    }
    types?: { label: string, value: string }[]
}

interface ISponsorSwagState {
    resources: ISwagItemDefinition[],
    editingResource: ISwagItemDefinition | undefined,
    resourceFormShowing: boolean,
    loadingDefinitions: boolean,
    showDestructiveForm: JSX.Element | undefined
}

class SponsorSwag extends Component<ISponsorSwagProps, ISponsorSwagState> {

    state = {
        resources: [],
        resourceFormShowing: false,
        editingResource: undefined,
        loadingDefinitions: true,
        showDestructiveForm: undefined
    }

    componentDidMount() {
        this.loadResources();
    }

    render() {
        const {
            resources,
            resourceFormShowing,
            editingResource,
            loadingDefinitions,
            showDestructiveForm
        } = this.state;
        return (
            <Page
                breadcrumbs={[{
                    content: this.props.sponsor.name,
                    url: this.props.baseSponsorPath
                }]}
                title={this.props.title}
            >
                <Card>
                    {resources.length > 0 ?
                        <ResourceList
                            items={resources}
                            renderItem={this.renderRow}
                            showHeader={true}
                            loading={loadingDefinitions}
                            resourceName={this.props.resourceNames}
                            alternateTool={
                                <Button
                                    plain icon={AddMajor}
                                    onClick={() => this.setState({ resourceFormShowing: true })}>
                                </Button>
                            }
                        />
                        :
                        <Card.Section>
                            <Button
                                loading={loadingDefinitions}
                                icon={AddMajor}
                                onClick={() => this.setState({ resourceFormShowing: true })}
                            >
                                &nbsp;Add {this.props.resourceNames["singular"]}
                            </Button>
                        </Card.Section>
                    }
                </Card>
                {resourceFormShowing ?
                    <SponsorSwagForm
                        onClose={() => this.setState({ resourceFormShowing: false, editingResource: undefined })}
                        onCreate={() => this.loadResources()}
                        item={editingResource}
                        sponsor={this.props.sponsor}
                        types={this.props.types}
                        detailType={this.props.detailType}
                    />
                    : <></>
                }
                {showDestructiveForm || <></>}
            </Page>
        );
    }

    renderRow = (item: ISwagItemDefinition) => {
        const { id, quantity, name, description } = item;

        return (
            <ResourceList.Item
                id={`${id}`}
                onClick={() => this.setState({ editingResource: item, resourceFormShowing: true })}
                // media={media}
                accessibilityLabel={`View details for ${name}`}
                shortcutActions={[
                    {
                        content: 'Edit',
                        onAction: () => this.setState({ editingResource: item, resourceFormShowing: true })
                    },
                    {
                        content: 'Delete',
                        onAction: () => this.handleResourceDeletion(item)
                    },
                ]}
            >
                <div style={{ padding: "10px" }}>
                    <div style={{ marginBottom: "10px" }}>
                        <Heading>{name}</Heading>
                    </div>
                    <div style={{ marginBottom: "10px" }}>{description}</div>
                    <div style={{ marginBottom: "10px" }}>Amount: {quantity}</div>
                </div>
            </ResourceList.Item>
        );
    };

    loadResources() {
        if (!this.state.loadingDefinitions) {
            this.setState({ loadingDefinitions: true });
        }

        axios.post(`/sponsors/dashboard-api/load-resources.json`, {
            sponsor_id: this.props.sponsor.id,
            sponsor_slug: this.props.sponsor.slug,
            detail_type: this.props.detailType
        }).then(res => {
            const status = res.status;
            if (status >= 200 && status < 300) {
                const data = res.data;
                if ("success" in data && data["success"]) {
                    const resources = data["details"];
                    if (Array.isArray(resources)) {
                        const definitions = resources.map(r => {
                            const id: number = r["id"];
                            const payload = r["payload"];
                            const payloadObj = JSON.parse(payload);
                            const spec: ISwagItemDefinition = {
                                id: id,
                                quantity: (payloadObj["quantity"] as string) || "0",
                                name: (payloadObj["name"] as string) || "",
                                type: (payloadObj["type"] as string) || "",
                                description: payloadObj["description"] as string || "",
                            }
                            return spec;
                        });

                        this.setState({ resources: definitions, loadingDefinitions: false });
                        return;
                    }
                }
            }

            this.setState({ loadingDefinitions: false });
        });
    }

    handleResourceDeletion = (resource: ISwagItemDefinition) => {
        const destructor: JSX.Element = (
            <DestructiveConfirmation
                onConfirm={() => this.actuallyDeleteResource(resource)}
                onClose={() => this.setState({ showDestructiveForm: undefined })}
            />
        );

        this.setState({ showDestructiveForm: destructor });
    }

    private actuallyDeleteResource(resource: ISwagItemDefinition) {
        if (!this.state.loadingDefinitions) {
            this.setState({ loadingDefinitions: true });
        }
        axios.post(`/sponsors/dashboard-api/delete-resource.json`, {
            sponsor_id: this.props.sponsor.id,
            sponsor_slug: this.props.sponsor.slug,
            detail_id: resource.id,
            detail_type: this.props.detailType,
        }).then(res => {
            const status = res.status;
            if (status >= 200 && status < 300) {
                const data = res.data;
                if ("success" in data && data["success"]) {
                    toast.success("Resource deleted");
                    this.loadResources();
                }
            }
        });
    }
}

export default SponsorSwag;
