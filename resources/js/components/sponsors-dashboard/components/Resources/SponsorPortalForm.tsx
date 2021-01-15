import { Modal, Select, Stack, TextField } from "@shopify/polaris";
import axios from "axios";
import React, { Component } from "react";
import { IResourceDefinition, ISponsorData } from "../../../../interfaces/sponsors.interfaces";
import { toast } from "react-toastify";

interface ISponsorPortalFormProps {
    onClose: () => void,
    onCreate: () => void,
    item?: IResourceDefinition | undefined,
    sponsor: ISponsorData,
    detailType: string
}

interface ISponsorPortalFormState {
    isActive: boolean,
    title: string,
    type: string,
    description: string,
    quantity: string,
    titleError: string,
    loading: boolean,
}

class SponsorPortalForm extends Component<ISponsorPortalFormProps, ISponsorPortalFormState> {
    
    state = {
        isActive: true,
        title: this.props.item ? this.props.item.name : "",
        type: this.props.item ? this.props.item.type : "",
        description: this.props.item ? this.props.item.description : "",
        titleError: "",
        loading: false,
    }    

    render() {
        const { 
            isActive, 
            title, 
            type, 
            description, 
            titleError,
            loading
        } = this.state;

        return (
            <Modal
                open={isActive}
                onClose={this.toggleModal}
                title={this.props.item ? "Editing Portal item" : "Add Portal item"}
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
                                placeholder="e.g. T-shirt"
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
                        placeholder="e.g. A branded company T-shirt"
                        multiline={4}
                    />
                    <br />
                    <TextField
                        label="Quantity"
                        type="number"
                        value={quantity}
                        onChange={this.handleQuantityChange}
                        helpText="We will be having around 500 hackers participating, so please send quantities that can be distributed evenly among them."
                    />
                    <br />
                </Modal.Section>
            </Modal>
        );
    }

    toggleModal = () => {
        this.setState({ isActive: !this.state.isActive, titleError: ""});
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

    handleQuantityChange = (value: string) => {
        this.setState({ quantity: value });
    }

    handleFormSubmit = () => {
        this.setState({ loading: true });
        if(this.state.title.trim().length == 0) {
            this.setState({ titleError: "Title can't be blank", loading: false });
            return;
        }


        const payload = {
            name: this.state.title, 
            type: this.state.type,
            description: this.state.description,
            quantity: this.state.quantity,
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
            if(status >= 200 && status < 300) {
                const data = res.data;
                if("success" in data && data["success"]) {
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
}

export default SponsorPortalForm;
