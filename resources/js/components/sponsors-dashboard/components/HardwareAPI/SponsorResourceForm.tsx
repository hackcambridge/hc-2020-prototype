import React, { Component } from "react";
import { Modal, Stack, TextField, Select, Button, Icon } from "@shopify/polaris";
import { IHardwareAPIDefinition } from "../../../../interfaces/sponsors.interfaces";
import { AddMajorMonotone } from "@shopify/polaris-icons";

interface ISponsorResourceFormProps {
    onClose: () => void,
    item?: IHardwareAPIDefinition | undefined
}
interface ISponsorResourceFormState {
    isActive: boolean,
    title: string,
    type: string,
    urls: string[],
    newURL: string,
    newURLError: string, 
}

class SponsorResourceForm extends Component<ISponsorResourceFormProps, ISponsorResourceFormState> {
    
    state = {
        isActive: true,
        title: this.props.item ? this.props.item.name : "",
        type: "hardware",
        newURL: "", 
        urls: this.props.item ? this.props.item.urls : [],
        newURLError: ""
    }

    render() {
        const { isActive, title, type, urls, newURL, newURLError } = this.state;
        return (
            <Modal
                open={isActive}
                onClose={this.props.onClose}
                title="Create a new sponsor"
                primaryAction={{
                    content: 'Create',
                    onAction: () => console.log("asd"),
                }}
                >
                <Modal.Section>
                    <Stack distribution={"fillEvenly"}>
                        <Stack.Item>
                            <TextField
                                label="Resource Name"
                                value={title}
                                onChange={this.handleTitleChange}
                                placeholder="e.g. My API"
                            />
                        </Stack.Item>
                        <Stack.Item>
                            <Select
                                label="Resource Type"
                                options={[
                                    {label: 'Hardware Item', value: 'hardware'},
                                    {label: 'API', value: 'api'},
                                ]}
                                onChange={this.handleTypeChange}
                                value={type}
                            />
                        </Stack.Item>
                    </Stack>
                    <br />
                    <TextField
                        label="Description"
                        value={title}
                        onChange={this.handleTitleChange}
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
                            <Button icon={AddMajorMonotone} onClick={this.testAndAddNewURL}></Button>
                        }
                    />
                    <br />
                    {urls.map(item => {
                        <Button size="slim" outline url={item}>item</Button>
                    })}
                </Modal.Section>
            </Modal>
        );
    }

    handleTitleChange = (value: string) => {
        this.setState({ title: value })
    }

    handleTypeChange = (value: string) => {
        this.setState({ type: value });
    }

    handleNewURLChange = (value: string) => {
        this.setState({ newURL: value });
    }

    testAndAddNewURL = () => {
        const currentURL = this.state.newURL;
        if(this.validURL(currentURL)) {
            const currentURLs = this.state.urls;
            this.setState({ newURL: "", newURLError: "", urls: [currentURL, ...currentURLs] });
            console.log(this.state.urls);
        } else {
            this.setState({ newURLError: "Invalid URL" })
        }
    }

    private validURL(url: string) {
        const urlTest = /(http[s]?:\/\/)?[^\s(["<,>]*\.[^\s[",><]*/;
        return urlTest.test(url);
    }
}

export default SponsorResourceForm;