import React, { Component, ReactNode} from 'react';
import { Page, Card, Tabs, Button, Modal, TextField, Layout, Stack, Select, TextContainer, Icon, ButtonGroup } from "@shopify/polaris";
import AceEditor from "react-ace";

import "ace-builds/src-noconflict/mode-php";
import "ace-builds/src-noconflict/theme-twilight";
import "ace-builds/src-noconflict/ext-language_tools.js";
import { AddCodeMajorMonotone, RefreshMajorMonotone, PlayMajorMonotone, SettingsMajorMonotone } from '@shopify/polaris-icons';
import axios from 'axios';
import { toast } from 'react-toastify';


interface ISelectionProps {

}

interface ISelectionState {
    selectedTab: number
    selectedFile: number
    newFileModal: boolean
    confirmDeleteModal: boolean
    newFileName: string
    files: string[],
    current_file_content: string,
    loading: boolean,
    running: boolean,
    results: string,
}


class Selection extends Component<ISelectionProps, ISelectionState> {

    state = {
        selectedTab: 0,
        selectedFile: -1,
        newFileModal: false,
        newFileName: "",
        confirmDeleteModal: false,
        files: [],
        current_file_content: "",
        loading: true,
        running: false,
        results: "",
    };

    private defaultTemplate = `<?php
namespace Reviewing;

class ApplicationReviewer {
    public static function review() {
        // Your code here...
    }
}`;

    componentDidMount() {
        this.getScripts();
    }

    render() {
        const tabs = [
            { id: "overview", content: "Overview" },
            { id: "code", content: "Code" }
        ];
        const { newFileModal, selectedTab, newFileName, confirmDeleteModal, loading } = this.state;
        return (
            <Page title="Selection">
                <Card>
                    <Tabs tabs={tabs} selected={selectedTab} onSelect={this.handleTabChange} fitted>
                        {this.renderPage()}
                    </Tabs>
                </Card>

                <Modal
                    loading={loading}
                    open={newFileModal}
                    onClose={() => this.setState({ newFileModal: false, newFileName:"" })}
                    title="New Script"
                    primaryAction={{
                        content: 'Create',
                        onAction: this.addNewFile
                    }}
                >
                    <Modal.Section>
                        <TextField label="File name" value={newFileName} onChange={this.handleFileNameChange} />
                    </Modal.Section>
                </Modal>

                <Modal
                    loading={loading}
                    open={confirmDeleteModal}
                    onClose={() => this.setState({ confirmDeleteModal: false})}
                    title="Are you sure?"
                    primaryAction={{
                        content: 'Delete',
                        onAction: this.handleDelete
                    }}
                    secondaryActions={[{
                        content: 'Cancel',
                        onAction: () => this.setState({ confirmDeleteModal: false}),
                    }]}
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
        const { selectedFile, loading, current_file_content } = this.state;
        const { files }: { files: string[] } = this.state;
        if(selectedFile >= 0) {
            const file = files[selectedFile];
            return (
                <>
                    <AceEditor
                        mode="php"
                        theme="twilight"
                        name={file + 'EDITOR'}
                        onChange={this.onChange}
                        width="100%"
                        enableBasicAutocompletion={true}
                        enableLiveAutocompletion={true}
                        enableSnippets={true}
                        value={current_file_content}
                    />
                    <Card.Section>
                        <Stack distribution="equalSpacing">
                            <Button loading={loading} onClick={() => this.setState({ confirmDeleteModal: true })} monochrome destructive> Delete</Button>
                            <Button loading={loading} onClick={this.saveScript} primary> Save</Button>
                        </Stack>
                    </Card.Section>
                </>
            );
        } else {
            return (
                <Card.Section>
                    <TextContainer>No file selected.</TextContainer>
                </Card.Section>
            );
        }
    }
      
    private renderOverview() : ReactNode {
        const { selectedFile, loading, results, running } = this.state;
        const { files }: { files: string[] } = this.state;
        return (
            <>
                <Card.Section>
                    <div style={{ textAlign: "center" }}>
                        <div style={{ width: "30rem", maxWidth: "90%", display: "inline-block", verticalAlign: "middle" }}>
                            <Select
                                disabled={loading}
                                labelInline
                                placeholder={"-- Select --"}
                                label="Script: "
                                options={files.map(f => {
                                    return { label: `${f}.php`, value: f };
                                })}
                                onChange={(s) => {
                                    const newId = files.findIndex(x => x == s);
                                    this.setState({ selectedFile: newId });
                                    this.loadScript(this.state.files[newId]);
                                }}
                                value={selectedFile >= 0 ? files[selectedFile] : ""}
                            />
                        </div>
                        <div style={{ display: "inline-block", marginLeft: "0.5rem", verticalAlign: "middle" }}>
                            <ButtonGroup segmented>
                                <Button disabled={loading} onClick={() => this.setState({ newFileModal: true })} icon={AddCodeMajorMonotone}></Button>
                                <Button loading={loading && !running} disabled={running} onClick={this.syncScripts} icon={RefreshMajorMonotone}></Button>
                                <Button disabled={loading} onClick={this.syncScripts} icon={SettingsMajorMonotone}></Button>
                                <Button disabled={loading && !running} loading={running} onClick={this.runScript} icon={PlayMajorMonotone}></Button>
                            </ButtonGroup>
                        </div>
                    </div>
                </Card.Section>
                <Card.Section>
                    <pre style={{ overflowX: "scroll" }}>{JSON.stringify(results, null, 4)}</pre>
                </Card.Section>
            </>
        );
    }

    private onChange = (newValue: string) => {
        this.setState({ current_file_content: newValue });
    }

    private handleTabChange = (index:number) => {
        this.setState({selectedTab: index});
    }

    private handleDelete = () => {
        const { selectedFile } = this.state;
        const files: string[] = this.state.files;
        this.deleteScript(files[selectedFile]);
    }

    private handleFileNameChange = (name:string) => {
        this.setState({newFileName: name});
    }

    private addNewFile = () => {
        const { newFileName } = this.state;
        if(newFileName.trim().length == 0) {
            toast.error("File name can't be blank");
            return;
        }

        const { files }: { files: string[] } = this.state;
        const newFileNameTrimmed = newFileName.trim().replace(/\.php/, '');
        files.push(newFileNameTrimmed);

        this.setState({
            newFileName: "",
            newFileModal: false,
            selectedFile: files.length - 1,
            current_file_content: this.defaultTemplate
        }, () => this.saveScript());
        this.setState({ loading: true });
    }

    private saveScript = () => {
        this.setState({ loading: true });
        const { selectedFile, current_file_content } = this.state;
        const file: string = this.state.files[selectedFile];
        axios.post(`/committee/admin-api/save-review-script.json`, {
            name: file,
            content: current_file_content
        }).then(res => {
            const status = res.status;
            if(status == 200 || status == 201) {
                const payload = res.data;
                if("success" in payload && payload["success"]) {
                    toast.success(payload["message"]);
                    this.setState({ loading: false });
                    return;
                }
            }
            toast.error("Failed to load data.");
            // console.log(status, res.data);
            this.setState({ loading: false });
        });
    }

    private syncScripts = () => {
        this.setState({ loading: true });
        const { selectedFile } = this.state;
        const file: string = this.state.files[selectedFile];
        axios.get(`/committee/admin-api/sync-review-scripts.json`).then(res => {
            const status = res.status;
            if(status == 200 || status == 201) {
                const payload = res.data;
                if("success" in payload && payload["success"]) {
                    toast.success("Scripts synced");
                    this.setState({ loading: false });
                    return;
                }
            }
            toast.error("Failed to load data.");
            console.log(status, res.data);
            this.setState({ loading: false });
        });
    }

    private getScripts = () => {
        this.setState({ loading: true });
        axios.get(`/committee/admin-api/list-review-scripts.json`).then(res => {
            const status = res.status;
            if(status == 200 || status == 201) {
                const payload = res.data;
                if("success" in payload && payload["success"]) {
                    if("scripts" in payload) {
                        const scripts = payload["scripts"].map((s: string) => s.replace(/\.php/, ''));
                        this.setState({ loading: false, files: scripts });
                        if(scripts.length > 0 && (this.state.selectedFile < 0 || this.state.selectedFile > scripts.length)) {
                            this.setState({ selectedFile: 0 });
                            this.loadScript(scripts[0]);
                        }
                    } else {
                        this.setState({ loading: false });
                    }
                    return;
                }
            }
            toast.error("Failed to load data.");
            console.log(status, res.data);
            this.setState({ loading: false });
        });
    }

    private loadScript(name: string) {
        this.setState({ loading: true });
        axios.post(`/committee/admin-api/load-review-script.json`, {
            name: name
        }).then(res => {
            const status = res.status;
            if(status == 200 || status == 201) {
                const payload = res.data;
                if("success" in payload && payload["success"]) {
                    this.setState({ 
                        current_file_content: payload["content"],
                        loading: false,
                    });
                    return;
                }
            }
            toast.error("Failed to load data.");
            console.log(status, res.data);
            this.setState({ loading: false });
        });
    }

    private deleteScript(name: string) {
        this.setState({ loading: true });
        axios.post(`/committee/admin-api/delete-review-script.json`, {
            name: name
        }).then(res => {
            const status = res.status;
            if(status == 200 || status == 201) {
                const payload = res.data;
                if("success" in payload && payload["success"]) {
                    const files: string[] = this.state.files;
                    const newFiles = files.filter(f => f != name);
                    if(newFiles.length > 0) {
                        this.setState({ 
                            selectedFile: 0, 
                            files: newFiles, 
                            loading: false,
                            confirmDeleteModal: false,
                            selectedTab: 0,
                        }, () => this.loadScript(newFiles[0]));
                    } else {
                        this.setState({ 
                            selectedFile: -1, 
                            files: [], 
                            loading: false,
                            confirmDeleteModal: false,
                            selectedTab: 0,
                            current_file_content: "",
                        });
                    }
                    toast.success("File deleted");
                    return;
                }
            }
            toast.error("Failed to load data.");
            console.log(status, res.data);
            this.setState({ loading: false });
        });
    }

    private runScript = () => {
        const { files }: { files: string[] } = this.state;
        const { selectedFile } = this.state;
        const name = files[selectedFile];
        this.setState({ loading: true, running: true });
        axios.post(`/committee/admin-api/run-review-script.json`, {
            name: name
        }).then(res => {
            const status = res.status;
            if(status == 200 || status == 201) {
                const payload = res.data;
                if("success" in payload && payload["success"]) {
                    console.log(payload["results"]);
                    this.setState({ results: payload["results"] });
                    toast.success("Script run");
                } else {
                    toast.error(payload["message"]);
                }
                this.setState({ loading: false, running: false });
                return;
            }
            toast.error("Failed to load data.");
            console.log(status, res.data);
            this.setState({ loading: false, running: false });
        });
    }
}

export default Selection;