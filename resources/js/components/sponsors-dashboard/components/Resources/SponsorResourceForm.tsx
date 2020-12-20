import { Button, Modal, Select, Stack, Tag, TextField } from "@shopify/polaris";
import { AddMajor } from "@shopify/polaris-icons";
import axios from "axios";
import React, { Component } from "react";
import { IResourceDefinition, ISponsorData } from "../../../../interfaces/sponsors.interfaces";
import { validURL } from "../common/url_helpers";
import { toast } from "react-toastify";

interface ISponsorResourceFormProps {
    onClose: () => void,
    onCreate: () => void,
    item?: IResourceDefinition | undefined,
    sponsor: ISponsorData,
    types?: { label: string, value: string }[]
    detailType: string
}

interface ISponsorResourceFormState {
    isActive: boolean,
    title: string,
    type: string,
    description: string,
    urls: string[],
    newURL: string,
    newURLError: string,
    titleError: string,
    loading: boolean,
}

class SponsorResourceForm extends Component<ISponsorResourceFormProps, ISponsorResourceFormState> {

    state = {
        isActive: true,
        title: this.props.item ? this.props.item.name : "",
        type: this.props.item ? this.props.item.type : "",
        description: this.props.item ? this.props.item.description : "",
        newURL: "",
        urls: this.props.item ? this.props.item.urls : [],
        newURLError: "",
        titleError: "",
        loading: false,
    }

    render() {
        const {
            isActive,
            title,
            type,
            description,
            urls,
            newURL,
            newURLError,
            titleError,
            loading
        } = this.state;

        return (
            <Modal
                open={isActive}
                onClose={this.toggleModal}
                title={this.props.item ? "Editing resource" : "Add resource"}
                primaryAction={{
                    content: this.props.item ? "Amend" : "Add",
                    onAction: this.handleFormSubmit,
                }}
                loading={loading}
            // secondaryActions={this.props.item ? [{
            //     content: "Delete",
            //     onAction: () => console.log("deleting"),
            // }] : []}
            >
                <Modal.Section>
                    <Stack distribution={"fillEvenly"}>
                        <Stack.Item>
                            <TextField
                                label="Name"
                                value={title}
                                onChange={this.handleTitleChange}
                                placeholder="e.g. My API"
                                error={titleError}
                            />
                        </Stack.Item>
                        {this.props.types ?
                            <Stack.Item>
                                <Select
                                    label="Type"
                                    options={this.props.types}
                                    onChange={this.handleTypeChange}
                                    value={type}
                                />
                            </Stack.Item>
                            : <></>}
                    </Stack>
                    <br />
                    <TextField
                        label="Description"
                        value={description}
                        onChange={this.handleDescriptionChange}
                        placeholder="e.g. My API"
                        multiline={4}
                    />
                    <br />
                    <TextField
                        label="Add a URL"
                        value={newURL}
                        onChange={this.handleNewURLChange}
                        placeholder={"https://api.hackcambridge.com/..."}
                        error={newURLError}
                        connectedRight={
                            <Button icon={AddMajor} onClick={this.testAndAddNewURL}></Button>
                        }
                    />
                    <br />
                    <Stack>
                        {urls.map(item => <Tag key={item} onRemove={this.handleURLRemoval(item)}>{item}</Tag>)}
                    </Stack>
                </Modal.Section>
            </Modal>
        );
    }

    toggleModal = () => {
        this.setState({ isActive: !this.state.isActive, titleError: "", newURLError: "" });
        this.props.onClose();
    }

    handleTitleChange = (value: string) => {
        this.setState({ title: value })
    }

    handleTypeChange = (value: string) => {
        this.setState({ type: value });
    }

    handleDescriptionChange = (value: string) => {
        this.setState({ description: value });
    }

    handleNewURLChange = (value: string) => {
        this.setState({ newURL: value });
    }

    handleFormSubmit = () => {
        this.setState({ loading: true });
        if (this.state.title.trim().length == 0) {
            this.setState({ titleError: "Title can't be blank", loading: false });
            return;
        }


        const payload = {
            urls: this.state.urls,
            name: this.state.title,
            type: this.state.type,
            description: this.state.description,
        }

        axios.post(`/sponsors/dashboard-api/add-resource.json`, {
            sponsor_id: this.props.sponsor.id,
            sponsor_slug: this.props.sponsor.slug,
            payload: JSON.stringify(payload),
            detail_type: this.props.detailType,
            detail_id: this.props.item ? this.props.item.id : -1,
            complete: "unknown",
        }).then(res => {
            const status = res.status;
            if (status >= 200 && status < 300) {
                const data = res.data;
                if ("success" in data && data["success"]) {
                    this.toggleModal();
                    this.setState({ loading: false });
                    toast.success(`Successfully saved ${this.props.detailType}`);
                    this.props.onCreate();
                    return;
                }
            }
            toast.error("An error occurred");
            this.setState({ loading: false });
            console.log(`Status: ${status}`);
            console.log(res.data);
        })
    }

    testAndAddNewURL = () => {
        const currentURL = this.state.newURL;
        if (validURL(currentURL)) {
            this.setState({
                newURL: "",
                newURLError: "",
                urls: [currentURL, ...this.state.urls]
            });
        } else {
            this.setState({ newURLError: "Invalid URL" })
        }
    }

    handleURLRemoval = (value: string) => {
        return () => {
            const newURLs = this.state.urls.filter(url => url !== value);
            this.setState({ urls: newURLs });
        }
    }
}

export default SponsorResourceForm;
