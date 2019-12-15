import React, { Component, ReactNode} from 'react';
import { Page, Card, Tabs, Button, Modal, TextField, Layout, Stack, Select } from "@shopify/polaris";
import AceEditor from "react-ace";

import "ace-builds/src-noconflict/mode-php";
import "ace-builds/src-noconflict/theme-twilight";
import "ace-builds/src-noconflict/ext-language_tools.js";


interface ISelectionProps {

}

interface ISelectionState {
    selectedTab: number
    newFileModal: boolean
    confirmDeleteModal: boolean
    newFileName: string
    files: {id: string, content: string, file_content: string}[]
}

class Selection extends Component<ISelectionProps, ISelectionState> {

    state = {
        selectedTab: 0,
        newFileModal: false,
        newFileName: "",
        confirmDeleteModal: false,
        files: [
            {
                id: 'overview',
                content: 'Overview',
                file_content: "",
            },
            {
                id: 'test.php',
                content: 'test.php',
                file_content: "This is a test poo",
            }
        ]
    };

    render() {

        return (
            <Page title="Selection">
                <Card>
                    <Tabs tabs={this.state.files} selected={this.state.selectedTab} onSelect={this.handleTabChange} fitted>
                        <Card.Section title={this.state.files[this.state.selectedTab].content}>
                            {this.renderPage()}
                        </Card.Section>
                    </Tabs>
                </Card>

                <Modal
                    open={this.state.newFileModal}
                    onClose={() => this.setState({ newFileModal: false, newFileName:"" })}
                    title="New File"
                    primaryAction={{
                        content: 'Create',
                        onAction: this.addNewFile
                    }}
                >
                    <Modal.Section>
                        <TextField label="File name" value={this.state.newFileName} onChange={this.handleFileNameChange} />
                    </Modal.Section>
                </Modal>

                <Modal
                    open={this.state.confirmDeleteModal}
                    onClose={() => this.setState({ confirmDeleteModal: false})}
                    title="Are you sure?"
                    primaryAction={{
                        content: 'Delete',
                        onAction: this.handleDelete
                    }}
                    secondaryActions={[
                        {
                            content: 'Cancel',
                            onAction: () => this.setState({ confirmDeleteModal: false}),
                        }
                    ]}
                >
                    <Modal.Section>
                        <p>This operation cannot be undone! Delete at your own risk!</p>
                    </Modal.Section>
                </Modal>
            </Page>
        );
    }

    private renderPage() : ReactNode {
        if (this.state.selectedTab == 0) {
            return this.renderOverview();
        }
        return this.renderEditor();
    }

    private renderEditor(): ReactNode {
        return (
            <Layout>
                <Layout.Section>
                <AceEditor
                    mode="php"
                    theme="twilight"
                    name={this.state.files[this.state.selectedTab].id + 'EDITOR'}
                    onChange={this.onChange}
                    width="100%"
                    enableBasicAutocompletion={true}
                    enableLiveAutocompletion={true}
                    enableSnippets={true}
                    value={this.state.files[this.state.selectedTab].file_content}
                />
                </Layout.Section>
                <Layout.Section>
                    <Stack distribution="equalSpacing">
                        <Button onClick={() => {
                            this.setState({newFileModal: true});
                        }} monochrome outline> Save</Button>
                        <Button onClick={() => this.setState({confirmDeleteModal: true})} monochrome destructive> Delete</Button>
                    </Stack>
                </Layout.Section>
            </Layout>
          );
    }
      
    private renderOverview() : ReactNode {
        return (
            <Button onClick={() => {
                this.setState({newFileModal: true});
            }} monochrome outline> Create new file</Button>
        );
    }

    private onChange = (newValue:string) => {
        this.state.files[this.state.selectedTab].file_content = newValue;
    }

    private handleTabChange = (index:number) => {
        this.setState({selectedTab: index});
    }

    private handleDelete = () => {
        
        var newfiles = this.state.files;
        newfiles.splice(this.state.selectedTab, 1)

        this.setState({files: newfiles, selectedTab: this.state.selectedTab - 1, confirmDeleteModal: false})
    }

    private handleFileNameChange = (name:string) => {
        this.setState({newFileName: name});
    }

    private addNewFile = () => {
        this.setState({newFileName: ""});
        this.setState({newFileModal: false});

        this.state.files.push({
            id: this.state.newFileName,
            content: this.state.newFileName,
            file_content: ""
        });
        this.setState({selectedTab: (this.state.files.length - 1)})

        // Loading stuff and call endpoint to save state
    }
}

export default Selection;