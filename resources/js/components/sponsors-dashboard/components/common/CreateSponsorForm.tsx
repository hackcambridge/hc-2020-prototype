import { Modal, Stack, TextField } from "@shopify/polaris";
import axios from "axios";
import React, { Component } from "react";
import { toast } from "react-toastify";

interface ICreateSponsorFormProps {
    active: boolean;
    onCreateSponsor: (sponsor: string) => void;
    onClose: () => void;
}
interface ICreateSponsorFormState {
    isActive: boolean;
    value: string;
}

class CreateSponsorForm extends Component<ICreateSponsorFormProps, ICreateSponsorFormState> {

    node = null;
    state = {
        isActive: this.props.active,
        value: ""
    }

    render() {
        return (
            <Modal
                open={this.state.isActive}
                onClose={this.toggleModal}
                title="Create a new sponsor"
                primaryAction={{
                    content: 'Create',
                    onAction: this.createSponsor,
                }}
            >
                <Modal.Section>
                    <Stack>
                        <Stack.Item fill>
                            <TextField
                                label="Sponsor Name"
                                value={this.state.value}
                                onChange={this.handleChange}
                                placeholder="e.g. HackCambridge"
                            />
                        </Stack.Item>
                    </Stack>
                </Modal.Section>
            </Modal>
        );
    }

    createSponsor = () => {
        const value = this.state.value;
        axios.post(`/sponsors/dashboard-api/add-sponsor.json`, {
            name: value
        }).then(res => {
            const status = res.status;
            if (status >= 200 && status < 300) {
                const data = res.data;
                if ("success" in data && data["success"]) {
                    toast.success(`New sponsor: ${value}`);
                    const sponsorSlug = data["data"]["slug"];
                    this.props.onCreateSponsor(sponsorSlug);
                    return;
                }
            }
            console.log(`Status: ${status}`);
            console.log(res.data);
        })
        this.toggleModal();
    }

    toggleModal = () => {
        this.setState(({ isActive }) => ({ isActive: !isActive }));
        this.props.onClose();
    };

    handleChange = (value: string) => {
        this.setState({ value });
    };
}

export default CreateSponsorForm;
