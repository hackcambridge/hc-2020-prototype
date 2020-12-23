import { Modal, Stack, TextField } from "@shopify/polaris";
import axios from "axios";
import React, { Component } from "react";
import { ISponsorAgent, ISponsorData } from "../../../../interfaces/sponsors.interfaces";

interface ISponsorFormProps {
    sponsor: ISponsorData,
    editing?: ISponsorAgent,
    active: boolean,
    type?: string,
    onCreate: () => void,
    onFail: (error_text: string) => void,
    onClose: () => void,
}
interface ISponsorFormState {
    isActive: boolean;
    name: string;
    email: string;
    type: string;
    typeName: string;
    loading: boolean;
}

class SponsorAgentForm extends Component<ISponsorFormProps, ISponsorFormState> {

    node = null;
    state = {
        isActive: this.props.active,
        name: this.props.editing ? this.props.editing.name : "",
        email: this.props.editing ? this.props.editing.email : "",
        type: this.props.type || "access",
        typeName: this.props.editing ? this.props.editing.type : "sponsor agent",
        loading: false,
    }

    render() {
        const { typeName, loading } = this.state;
        return (
            <Modal
                open={this.state.isActive}
                onClose={this.toggleModal}
                loading={loading}
                title={this.props.editing ? `Edit ${typeName}` : `Add a new ${typeName}`}
                primaryAction={{
                    content: this.props.editing ? "Amend" : "Add",
                    onAction: this.createSponsorAgent,
                }}
            >
                <Modal.Section>
                    <Stack>
                        <Stack.Item fill>
                            <TextField
                                label="Name"
                                value={this.state.name}
                                onChange={this.handleNameChange}
                                placeholder="e.g. John Appleseed"
                            />
                        </Stack.Item>
                        <Stack.Item fill>
                            <TextField
                                label="Email"
                                type="email"
                                value={this.state.email}
                                onChange={this.handleEmailChange}
                                placeholder="e.g. john@cam.ac.uk"
                                disabled={typeof (this.props.editing) !== "undefined"}
                            />
                        </Stack.Item>
                    </Stack>
                </Modal.Section>
            </Modal>
        );
    }

    createSponsorAgent = () => {
        const name = this.state.name;
        const email = this.state.email;
        this.setState({ loading: true });
        if (name.length > 0 && email.length > 0) {
            axios.post(`/sponsors/dashboard-api/add-agent-${this.state.type}.json`, {
                name: name,
                email: email,
                sponsor_id: this.props.sponsor.id,
                sponsor_slug: this.props.sponsor.slug
            }).then(res => {
                const status = res.status;
                if (status >= 200 && status < 300) {
                    this.setState({ loading: false });
                    if (!res.data.success) {
                        this.props.onFail(res.data.message || "Unknown error");
                        return;
                    }
                    this.props.onCreate();
                    this.toggleModal();
                    return;
                } else {
                    console.log(`Status: ${status}`);
                    console.log(res.data);
                    this.setState({ loading: false });
                }
            })
        }
    }

    toggleModal = () => {
        this.setState(({ isActive }) => ({ isActive: !isActive }));
        this.props.onClose();
    };

    handleNameChange = (name: string) => {
        this.setState({ name });
    };

    handleEmailChange = (email: string) => {
        this.setState({ email });
    };
}

export default SponsorAgentForm;
