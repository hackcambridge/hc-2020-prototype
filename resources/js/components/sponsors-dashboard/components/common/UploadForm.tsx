import React, { Component } from "react";
import { Button, DropZone, Stack, Thumbnail, Caption, Modal } from "@shopify/polaris";
import axios from "axios";
import { throws } from "assert";

interface IUploadFormProps {
    onClose: () => void,
    onSubmit: (urls: string[]) => void
}

interface IUploadFormState {
    files: File[],
    isActive: boolean,
    isSaving: boolean
}

class UploadForm extends Component<IUploadFormProps, IUploadFormState> {
    
    state = {
        files: [],
        isActive: true,
        isSaving: false
    }

    render() {
        const { files, isActive, isSaving } = this.state;
        const validImageTypes = ['image/gif', 'image/jpeg', 'image/png', 'image/svg+xml'];
        const fileUpload = !files.length && <DropZone.FileUpload />;
        const uploadedFiles = files.length > 0 && (
            <Stack vertical>
                {files.map((file: File, index) => (
                <Stack alignment="center" key={index}>
                    <Thumbnail
                        size="small"
                        alt={file.name}
                        source={
                            validImageTypes.indexOf(file.type) > 0
                            ? window.URL.createObjectURL(file)
                            : 'https://cdn.shopify.com/s/files/1/0757/9955/files/New_Post.png?12678548500147524304'
                        }
                    />
                    <div>
                    {file.name} <Caption>{file.size} bytes</Caption>
                    </div>
                </Stack>
                ))}
            </Stack>
        );


        return (
            <Modal
                open={isActive}
                onClose={this.toggleModal}
                title={"Upload assets"}
                footer={<Button primary onClick={this.handleFormSubmit} loading={isSaving}>Save</Button> }
            >
                <Modal.Section>
                    <DropZone
                        onDrop={(files, acceptedFiles, rejectedFiles) => {
                            this.setState({
                                files: [...this.state.files, ...acceptedFiles]
                            });
                        }}
                    >
                        {uploadedFiles}
                        {fileUpload}
                    </DropZone>
                </Modal.Section>
            </Modal>
        );
    }

    toggleModal = () => {
        this.setState({ isActive: !this.state.isActive });
        this.props.onClose();
    }

    handleFormSubmit = () => {
        this.setState({ isSaving: true });
        console.log(this.state.files)
        if(this.state.files.length > 0) {
            const first = this.state.files[0];
            let formData = new FormData();
            formData.append('asset', first);
            formData.append('sponsor_slug', "palantir");
            axios.post(`/sponsors/dashboard-api/store-asset.json`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            }).then(res => {
                if(res.status == 200) {
                    const response = res.data;
                    if("success" in response && response["success"]) {
                        const url = response["message"];
                        this.props.onSubmit([url]);
                    } else {
                        console.log(res);
                    }
                }
                this.toggleModal();
            });
        }
    }
}

export default UploadForm;