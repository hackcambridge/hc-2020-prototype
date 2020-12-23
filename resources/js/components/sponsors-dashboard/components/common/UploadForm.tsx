import React, { Component } from "react";
import { Button, DropZone, Stack, Thumbnail, Caption, Modal } from "@shopify/polaris";
import axios from "axios";
import { ISponsorData, IAssetInformation } from "../../../../interfaces/sponsors.interfaces";
import { toast } from "react-toastify";

interface IUploadFormProps {
    onClose: () => void,
    onSubmit: (urls: IAssetInformation[]) => void,
    sponsor: ISponsorData
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

    private maxFileSize = 20000000; // 20mb

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
                title={"Upload assets (20MB max.)"}
                footer={<Button primary onClick={this.handleFormSubmit} loading={isSaving}>Save</Button>}
            >
                <Modal.Section>
                    <DropZone
                        customValidator={(f: File) => {
                            return (f.size <= this.maxFileSize);
                        }}
                        onDrop={(files, acceptedFiles, rejectedFiles) => {
                            this.setState({
                                files: [...this.state.files, ...acceptedFiles]
                            });
                            if (rejectedFiles.length > 0) {
                                toast.error(`${rejectedFiles.length} file(s) too large`);
                            }
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
        this.uploadFiles(this.state.files, []);
    }

    private uploadFiles(files: File[], urls: IAssetInformation[]) {
        if (files.length > 0) {
            let formData = new FormData();
            formData.append('asset', files[0]);
            formData.append('sponsor_id', this.props.sponsor.id);
            formData.append('sponsor_slug', this.props.sponsor.slug);
            axios.post(`/sponsors/dashboard-api/store-asset.json`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            }).then(res => {
                const currentURLs = urls;
                if (res.status == 200) {
                    const response = res.data;
                    if ("success" in response && response["success"]) {
                        currentURLs.push({
                            name: response["originalName"],
                            url: response["data"]
                        } as IAssetInformation);
                        // currentURLs.push(response["message"]);
                    } else {
                        console.log(res.data);
                    }
                } else {
                    console.log(res.status, res.data);
                }

                if (files.length > 1) {
                    this.uploadFiles(files.splice(1), urls);
                } else {
                    this.props.onSubmit(urls);
                    this.toggleModal();
                }
            });
        } else {
            this.props.onSubmit(urls);
            this.toggleModal();
        }
    }
}

export default UploadForm;
