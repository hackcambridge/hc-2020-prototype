import React, { Component, ReactNode } from 'react';
import { Page, Card, Tabs, Button, Modal, TextField, Stack, Select, TextContainer, ButtonGroup } from "@shopify/polaris";
import { AddCodeMajor, RefreshMajor, PlayMajor } from '@shopify/polaris-icons';
import axios from 'axios';
import { toast } from 'react-toastify';

import AceEditor from "react-ace";
import "ace-builds/src-noconflict/mode-php";
import "ace-builds/src-noconflict/theme-twilight";
import "ace-builds/src-noconflict/ext-language_tools.js";
import { withRouter, RouteComponentProps } from 'react-router-dom';

interface IMailingProps { }

interface IMailingState {

    recipient: string
    emailList: string
    subject: string
    selectedTab: number
    selectedTemplate: number
    newFileModal: boolean
    confirmDeleteModal: boolean
    newFileName: string
    files: string[],
    html_content: string,
    plaintext_content: string,
    loading: boolean,
    running: boolean,
}

const options = [
    { label: 'Every hacker', value: 'hacker' },
    { label: 'Every hacker started application', value: 'hacker_app' },
    { label: 'Every hacker not started application', value: 'hacker_noapp' },
    { label: 'Every hacker submitted application', value: 'hacker_sub_app' },
    { label: 'Every hacker not submitted application', value: 'hacker_nosub_app' },
    { label: 'Every invited hacker', value: 'hacker_inv' },
    { label: 'Every non-invited hacker', value: 'hacker_noinv' },
    { label: 'Every pending hacker', value: 'hacker_pend' },
    { label: 'Every confirmed hacker', value: 'hacker_conf' },
    { label: 'Every rejected hacker', value: 'hacker_rej' },
    { label: 'List of emails (; separated)', value: 'custom' },
];


class Mailing extends Component<IMailingProps & RouteComponentProps, IMailingState> {

    state = {
        recipient: 'custom',
        emailList: "",
        subject: "",
        selectedTab: 0,
        selectedTemplate: -1,
        newFileModal: false,
        newFileName: "",
        confirmDeleteModal: false,
        files: [],
        html_content: "",
        plaintext_content: "",
        loading: true,
        running: false,
    };

    private defaultHTMLTemplate = ``;
    private defaultPlaintextTemplate = ``;

    constructor(props: IMailingProps & RouteComponentProps) {
        super(props);
        this.keyboardShortcuts = this.keyboardShortcuts.bind(this);
    }

    componentDidMount() {
        document.addEventListener("keydown", this.keyboardShortcuts, false);
        this.getScripts();
    }

    componentWillUnmount() {
        document.removeEventListener("keydown", this.keyboardShortcuts, false);
    }

    keyboardShortcuts(e: KeyboardEvent) {
        // cmd + s will save
        if (this.state.selectedTab == 1 && e.code == "KeyS" && (navigator.platform.match("Mac") ? e.metaKey : e.ctrlKey)) {
            e.preventDefault();
            this.saveScript();
        }

        // Does not work on Safari (cannot override cmd + NUM)
        // cmd + 1/2 will change tab
        if (e.code == "Digit1" && (navigator.platform.match("Mac") ? e.metaKey : e.ctrlKey)) {
            e.preventDefault();
            this.setState({ selectedTab: 0 })
        }

        if (e.code == "Digit2" && (navigator.platform.match("Mac") ? e.metaKey : e.ctrlKey)) {
            e.preventDefault();
            this.setState({ selectedTab: 1 })
        }

    }

    private handleRecipientChange(newValue: string) {
        this.state.recipient = newValue;
    }

    private handleSubjectChange(newValue: string) {
        this.state.subject = newValue;
    }

    render() {
        const tabs = [
            { id: "plaintext", content: "Plaintext" },
            { id: "html", content: "HTML" }
        ];
        const {
            newFileModal,
            selectedTab,
            newFileName,
            confirmDeleteModal,
            loading,
        } = this.state;
        return (
            <Page fullWidth title="Mailing">
                <Select
                    label="Recipient"
                    options={options}
                    onChange={this.handleRecipientChange}
                    value={this.state.recipient}
                />
                <TextField label="Subject" value={this.state.subject} onChange={this.handleSubjectChange} />;
                <Card>
                    {this.renderOverview()}
                    <Tabs tabs={tabs} selected={selectedTab} onSelect={this.handleTabChange} fitted>
                        {this.renderEditor()}
                    </Tabs>
                </Card>

                <Modal
                    loading={loading}
                    open={newFileModal}
                    onClose={() => this.setState({ newFileModal: false, newFileName: "" })}
                    title="New Template"
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
                    onClose={() => this.setState({ confirmDeleteModal: false })}
                    title="Are you sure?"
                    primaryAction={{
                        content: 'Delete',
                        onAction: this.handleDelete
                    }}
                    secondaryActions={[{
                        content: 'Cancel',
                        onAction: () => this.setState({ confirmDeleteModal: false }),
                    }]}
                >
                    <Modal.Section>
                        <p>This operation cannot be undone! Delete at your own risk!</p>
                    </Modal.Section>
                </Modal>
            </Page>
        );
    }

    private renderEditor(): ReactNode {
        const { selectedTemplate, loading, html_content, plaintext_content } = this.state;
        const { files }: { files: string[] } = this.state;
        if (selectedTemplate >= 0) {
            const file = files[selectedTemplate] + this.state.selectedTab ? ".html" : ".txt";
            return (
                <>
                    <AceEditor
                        mode={this.state.selectedTab ? "html" : "plaintext"}
                        theme="twilight"
                        name={file + 'EDITOR'}
                        onChange={this.onChange}
                        width="100%"
                        enableBasicAutocompletion={true}
                        enableLiveAutocompletion={true}
                        enableSnippets={true}
                        fontSize={14}
                        setOptions={{ useWorker: false }}
                        value={this.state.selectedTab ? html_content : plaintext_content}
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

    private renderOverview(): ReactNode {
        const { selectedTemplate, loading, running } = this.state;
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
                                    return { label: `${f}`, value: f };
                                })}
                                onChange={(s) => {
                                    const newId = files.findIndex(x => x == s);
                                    this.setState({ selectedTemplate: newId });
                                    this.loadScript(this.state.files[newId]);
                                }}
                                value={selectedTemplate >= 0 ? files[selectedTemplate] : ""}
                            />
                        </div>
                        <div style={{ display: "inline-block", marginLeft: "0.5rem", verticalAlign: "middle" }}>
                            <ButtonGroup segmented>
                                <Button disabled={loading} onClick={() => this.setState({ newFileModal: true })} icon={AddCodeMajor}></Button>
                                <Button loading={loading && !running} disabled={running} onClick={this.syncScripts} icon={RefreshMajor}></Button>
                                <Button disabled={loading && !running} loading={running} onClick={this.sendEmail} icon={PlayMajor}></Button>
                            </ButtonGroup>
                        </div>
                    </div>
                </Card.Section>
            </>
        );
    }

    private onChange = (newValue: string) => {
        if (this.state.selectedTab == 0) {
            this.setState({ plaintext_content: newValue });
        } else {
            this.setState({ html_content: newValue });
        }
    }

    private handleTabChange = (index: number) => {
        this.setState({ selectedTab: index });
    }

    private handleDelete = () => {
        const { selectedTemplate } = this.state;
        const files: string[] = this.state.files;
        this.deleteScript(files[selectedTemplate]);
    }

    private handleFileNameChange = (name: string) => {
        this.setState({ newFileName: name });
    }

    private addNewFile = () => {
        const { newFileName } = this.state;
        if (newFileName.trim().length == 0) {
            toast.error("File name can't be blank");
            return;
        }

        const { files }: { files: string[] } = this.state;
        const newFileNameTrimmed = newFileName.trim().replace(/\.(html|txt)/, '').toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
        files.push(newFileNameTrimmed);

        this.setState({
            newFileName: "",
            newFileModal: false,
            selectedTemplate: files.length - 1,
            html_content: this.defaultHTMLTemplate,
            plaintext_content: this.defaultPlaintextTemplate,
        }, () => this.saveScript());
        this.setState({ loading: true });
    }

    private saveScript = () => {
        this.setState({ loading: true });
        const { selectedTemplate, html_content, plaintext_content } = this.state;
        const file: string = this.state.files[selectedTemplate];
        axios.post(`/committee/admin-api/save-mail-template.json`, {
            name: file,
            html_content: html_content,
            plaintext_content: plaintext_content,
        }).then(res => {
            const status = res.status;
            if (status == 200 || status == 201) {
                const payload = res.data;
                if ("success" in payload && payload["success"]) {
                    toast.success(payload["message"]);
                    this.setState({ loading: false });
                    return;
                }
            }
            toast.error("Failed to load data.");
            this.setState({ loading: false });
        });
    }

    private syncScripts = () => {
        this.setState({ loading: true });
        axios.get(`/committee/admin-api/sync-mail-templates.json`).then(res => {
            const status = res.status;
            if (status == 200 || status == 201) {
                const payload = res.data;
                if ("success" in payload && payload["success"]) {
                    toast.success("Templates synced");
                    this.getScripts();
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
        axios.get(`/committee/admin-api/list-mail-templates.json`).then(res => {
            const status = res.status;
            if (status == 200 || status == 201) {
                const payload = res.data;
                if ("success" in payload && payload["success"]) {
                    if ("templates" in payload) {
                        const scripts = payload["templates"].map((s: string) => s.replace(/\.(html|txt)/, ''));
                        this.setState({ loading: false, files: scripts });
                        if (scripts.length > 0 && (this.state.selectedTemplate < 0 || this.state.selectedTemplate > scripts.length)) {
                            this.setState({ selectedTemplate: 0 });
                            this.loadScript(scripts[0]);
                        } else {
                            this.loadScript(scripts[this.state.selectedTemplate]);
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
        axios.post(`/committee/admin-api/load-mail-template.json`, {
            name: name
        }).then(res => {
            const status = res.status;
            if (status == 200 || status == 201) {
                const payload = res.data;
                if ("success" in payload && payload["success"]) {
                    this.setState({
                        plaintext_content: payload["plaintext_content"],
                        html_content: payload["html_content"],
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
        axios.post(`/committee/admin-api/delete-mail-template.json`, {
            name: name
        }).then(res => {
            const status = res.status;
            if (status == 200 || status == 201) {
                const payload = res.data;
                if ("success" in payload && payload["success"]) {
                    const files: string[] = this.state.files;
                    const newFiles = files.filter(f => f != name);
                    if (newFiles.length > 0) {
                        this.setState({
                            selectedTemplate: 0,
                            files: newFiles,
                            loading: false,
                            confirmDeleteModal: false,
                            selectedTab: 0,
                        }, () => this.loadScript(newFiles[0]));
                    } else {
                        this.setState({
                            selectedTemplate: -1,
                            files: [],
                            loading: false,
                            confirmDeleteModal: false,
                            selectedTab: 0,
                            html_content: "",
                            plaintext_content: "",
                        });
                    }
                    toast.success("Template deleted");
                    return;
                }
            }
            toast.error("Failed to load data.");
            console.log(status, res.data);
            this.setState({ loading: false });
        });
    }

    private sendEmail = () => {
        const { files }: { files: string[] } = this.state;
        const { selectedTemplate } = this.state;
        const name = files[selectedTemplate];
        this.setState({ loading: true, running: true });
        axios.post(`/committee/admin-api/send-mail.json`, {
            name: name,
            type: this.state.recipient,
            email: this.state.emailList,
        }, {
            headers: { CacheControl: "no-cache, no-store, max-age=0, must-revalidate" }
        }).then(res => {
            const status = res.status;
            console.log(res);
            if (status == 200 || status == 201) {
                const payload = res.data;
                if ("success" in payload && payload["success"]) {
                    toast.success("Mail sent");
                } else {
                    toast.error(payload["message"]);
                }
                this.setState({ loading: false, running: false });
                return;
            }
            toast.error("Failed to load data.");
            console.log(status, res.data);
            this.setState({ loading: false, running: false });
        }).catch((error) => {
            console.log(error);
            if (error.response) {
                toast.error(`Error: ${error.response.data.message} (line ${error.response.data.line})`);
                this.setState({ loading: false, running: false });
                return;
            }
            toast.error("An error occurred.");
            this.setState({ loading: false, running: false });
        });
    }

}

export default withRouter(Mailing);
