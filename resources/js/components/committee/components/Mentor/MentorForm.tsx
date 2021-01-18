import { Modal, Stack, TextField } from "@shopify/polaris";
import axios from "axios";
import React, { Component } from "react";
import { IMentor } from "../../../../interfaces/committee.interfaces";

interface IMentorFormProps {
    editing?: IMentor,
    active: boolean,
    onCreate: () => void,
    onFail: (error_text: string) => void,
    onClose: () => void,
}
interface IMentorFormState {
    isActive: boolean;
    name: string;
    email: string;
    loading: boolean;
}

class MentorForm extends Component<IMentorFormProps, IMentorFormState> {

    node = null;
    state = {
        isActive: this.props.active,
        name: this.props.editing ? this.props.editing.name : "",
        email: this.props.editing ? this.props.editing.email : "",
        loading: false,
    }

    render() {
        const { loading } = this.state;
        return (
            <Modal
                open={this.state.isActive}
                onClose={this.toggleModal}
                loading={loading}
                title={this.props.editing ? `Edit mentor` : `Add a new mentor`}
                primaryAction={{
                    content: this.props.editing ? "Amend" : "Add",
                    onAction: this.createMentor,
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

    createMentor = () => {
        const name = this.state.name;
        const email = this.state.email;
        this.setState({ loading: true });
        if (name.length > 0 && email.length > 0) {
            axios.post(`/committee/admin-api/add-mentor.json`, {
                name: name,
                email: email,
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

export default MentorForm;
