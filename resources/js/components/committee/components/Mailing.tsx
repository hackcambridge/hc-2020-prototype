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
    { label: 'Every hacker with pending invitation', value: 'hacker_pend' },
    { label: 'Every confirmed hacker', value: 'hacker_conf' },
    { label: 'Every hacker with rejected invitation', value: 'hacker_rej' },
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

    private defaultHTMLTemplate = `<p class="greeting">Hi %recipient.name%!</p>
<p>We are happy to invite you to participate in Hex Cambridge 2021!</p>
<div style="margin: 2rem 0;">
    <a class="noline" href="https://hackcambridge.com/dashboard/apply/invitation"><span class="button">Your Hex Cambridge Invitation →</span></a>
</div>
<p class="signoff">All the best,<br/>The Hex Cambridge Team</p>`;
    private defaultPlaintextTemplate = `Hi %recipient.name%!

We are happy to invite you to participate in Hex Cambridge 2021!

Your Hack Cambridge invitation: https://hackcambridge.com/dashboard/apply/invitation/.

All the best,

The Hack Cambridge Team`;

    constructor(props: IMailingProps & RouteComponentProps) {
        super(props);
        this.keyboardShortcuts = this.keyboardShortcuts.bind(this);
    }

    componentDidMount() {
        document.addEventListener("keydown", this.keyboardShortcuts, false);
        this.getTemplates();
    }

    componentWillUnmount() {
        document.removeEventListener("keydown", this.keyboardShortcuts, false);
    }

    keyboardShortcuts(e: KeyboardEvent) {
        // cmd + s will save
        if (this.state.selectedTab == 1 && e.code == "KeyS" && (navigator.platform.match("Mac") ? e.metaKey : e.ctrlKey)) {
            e.preventDefault();
            this.saveTemplate();
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

    render() {
        const tabs = [
            { id: "plaintext", content: "Plaintext" },
            { id: "html", content: "HTML" }
        ];
        const {
            recipient,
            subject,
            emailList,
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
                    value={recipient}
                /><br />
                { this.state.recipient == "custom" ?
                    <TextField label="Email list:" placeholder=";-separated values" value={emailList} onChange={this.handleEmailListChange} /> : ''}
                <br />
                <TextField label="Subject" value={subject} onChange={this.handleSubjectChange} />
                <br />
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
                            <Button loading={loading} onClick={this.saveTemplate} primary> Save</Button>
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
                                label="Template: "
                                options={files.map(f => {
                                    return { label: `${f}`, value: f };
                                })}
                                onChange={(s) => {
                                    const newId = files.findIndex(x => x == s);
                                    this.setState({ selectedTemplate: newId });
                                    this.loadTemplate(this.state.files[newId]);
                                }}
                                value={selectedTemplate >= 0 ? files[selectedTemplate] : ""}
                            />
                        </div>
                        <div style={{ display: "inline-block", marginLeft: "0.5rem", verticalAlign: "middle" }}>
                            <ButtonGroup segmented>
                                <Button disabled={loading} onClick={() => this.setState({ newFileModal: true })} icon={AddCodeMajor}></Button>
                                <Button loading={loading && !running} disabled={running} onClick={this.syncTemplates} icon={RefreshMajor}></Button>
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
        this.deleteTemplate(files[selectedTemplate]);
    }

    private handleFileNameChange = (name: string) => {
        this.setState({ newFileName: name });
    }
    private handleRecipientChange = (newValue: string) => {
        this.setState({ recipient: newValue });
    }

    private handleSubjectChange = (newValue: string) => {
        this.setState({ subject: newValue });
    }

    private handleEmailListChange = (newValue: string) => {
        this.setState({ emailList: newValue });
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
        }, () => this.saveTemplate());
        this.setState({ loading: true });
    }

    private saveTemplate = () => {
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

    private syncTemplates = () => {
        this.setState({ loading: true });
        axios.get(`/committee/admin-api/sync-mail-templates.json`).then(res => {
            const status = res.status;
            if (status == 200 || status == 201) {
                const payload = res.data;
                if ("success" in payload && payload["success"]) {
                    toast.success("Templates synced");
                    this.getTemplates();
                    return;
                }
            }
            toast.error("Failed to load data.");
            console.log(status, res.data);
            this.setState({ loading: false });
        });
    }

    private getTemplates = () => {
        this.setState({ loading: true });
        axios.get(`/committee/admin-api/list-mail-templates.json`).then(res => {
            const status = res.status;
            if (status == 200 || status == 201) {
                const payload = res.data;
                if ("success" in payload && payload["success"]) {
                    if ("templates" in payload) {
                        var templates_array = []
                        for (let index in payload["templates"]) {
                            templates_array.push(payload["templates"][index]);
                        }
                        const templates = templates_array.map((s: string) => s.replace(/\.(html|txt)/, ''));
                        this.setState({ loading: false, files: templates });
                        if (templates.length > 0 && (this.state.selectedTemplate < 0 || this.state.selectedTemplate > templates.length)) {
                            this.setState({ selectedTemplate: 0 });
                            this.loadTemplate(templates[0]);
                        } else {
                            this.loadTemplate(templates[this.state.selectedTemplate]);
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

    private loadTemplate(name: string) {
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

    private deleteTemplate(name: string) {
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
                        }, () => this.loadTemplate(newFiles[0]));
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
        const { selectedTemplate, recipient, emailList, subject } = this.state;
        const name = files[selectedTemplate];
        this.setState({ loading: true, running: true });
        axios.post(`/committee/admin-api/send-mail.json`, {
            name: name,
            subject: subject,
            type: recipient,
            emails: emailList,
        }, {
            headers: { CacheControl: "no-cache, no-store, max-age=0, must-revalidate" }
        }).then(res => {
            const status = res.status;
            console.log(res);
            if (status == 200 || status == 201) {
                const payload = res.data;
                if ("success" in payload && payload["success"]) {
                    toast.success(payload["emails"] + " emails sent");
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
