import { Button, Modal } from "@shopify/polaris";
import React, { Component } from "react";

interface IDestructiveConfirmationProps {
    show?: boolean,
    title?: string,
    confirmText?: string,
    onConfirm: () => void,
    onClose: () => void
}

interface IDestructiveConfirmationState {
    isActive: boolean
}

class DestructiveConfirmation extends Component<IDestructiveConfirmationProps, IDestructiveConfirmationState> {

    state = {
        isActive: this.props.show || true
    }

    render() {
        return (
            <Modal
                open={this.state.isActive}
                onClose={this.toggleModal}
                title={this.props.title || "Are you sure?"}
                footer={
                    <Button
                        onClick={this.handleConfirm}
                        destructive
                    >
                        {this.props.confirmText || "Yes, I'm sure"}
                    </Button>
                }
            // primaryAction={{
            //     content: this.props.confirmText || "Delete",
            //     onAction: this.handleConfirm,
            //     destructive: true
            // }}
            >
            </Modal>
        );
    }

    toggleModal = () => {
        this.setState(({ isActive }) => ({ isActive: !isActive }));
        this.props.onClose();
    };

    handleConfirm = () => {
        this.props.onConfirm();
        this.toggleModal();
    }
}

export default DestructiveConfirmation;
