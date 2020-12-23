import React, { Component, ReactNode } from 'react';
import { Page, Card, Tabs, Button, Modal, TextField, Stack, Select, TextContainer, ButtonGroup, Checkbox, ResourceList } from "@shopify/polaris";
import { AddCodeMajor, RefreshMajor, PlayMajor, SettingsMajor } from '@shopify/polaris-icons';
import axios from 'axios';
import { toast } from 'react-toastify';

import AceEditor from "react-ace";
import "ace-builds/src-noconflict/mode-php";
import "ace-builds/src-noconflict/theme-twilight";
import "ace-builds/src-noconflict/ext-language_tools.js";
import ReactJson from 'react-json-view'
import { IApplicationDetail, IUserDetails } from '../../../interfaces/committee.interfaces';
import { withRouter, RouteComponentProps } from 'react-router-dom';

interface IOmnitoolProps { }

interface IOmnitoolState {
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

    settingsModal: boolean,
    doingInvites: boolean,
    alreadyInvited: string[],
    reviewMode: boolean,
    reviewDecisionModalShowing: boolean,
    reviewDecisionModalInformation: IReviewDecisionModalContent;
}

interface IReviewDecisionSet {
    details: { [key: string]: IReviewDecisionDetails },
}

interface IReviewDecisionModalContent {
    details?: IReviewDecisionDetails
}

interface IReviewDecisionDetails {
    teamName: string,
    applications: IReviewDecisionApplicationDetail[],
    score: number,
    adjustment: number,
    decision: "accept" | "reject" | "ignore",
}

interface IReviewDecisionApplicationDetail {
    id: number,
    user: IUserDetails,
    application: IApplicationDetail,
    score: number,
    adjustment: number,
}

class Omnitool extends Component<IOmnitoolProps & RouteComponentProps, IOmnitoolState> {

    private reviewDecisionModalInformationDefault: IReviewDecisionModalContent = {};

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

        // settings
        settingsModal: false,
        doingInvites: false,
        alreadyInvited: [],
        reviewMode: true,
        reviewDecisionModalShowing: false,
        reviewDecisionModalInformation: this.reviewDecisionModalInformationDefault,
    };

    private defaultTemplate = `<?php
namespace Reviewing;

class ApplicationReviewer {
    public static function review() {
        // Your code here...
    }
}`;



    constructor(props: IOmnitoolProps & RouteComponentProps) {
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

    render() {
        const tabs = [
            { id: "overview", content: "Overview" },
            { id: "code", content: "Code" }
        ];
        const {
            newFileModal,
            selectedTab,
            newFileName,
            confirmDeleteModal,
            loading,
            settingsModal,
            doingInvites,
            reviewMode,
            reviewDecisionModalShowing,
            reviewDecisionModalInformation,
        } = this.state;
        const modalDetails = reviewDecisionModalInformation.details || null;
        return (
            <Page fullWidth title="Omnitool">
                <Card>
                    <Tabs tabs={tabs} selected={selectedTab} onSelect={this.handleTabChange} fitted>
                        {this.renderPage()}
                    </Tabs>
                </Card>

                <Modal
                    loading={loading}
                    open={newFileModal}
                    onClose={() => this.setState({ newFileModal: false, newFileName: "" })}
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
                    open={settingsModal}
                    onClose={() => this.setState({ settingsModal: false })}
                    title="Settings"
                >
                    <Modal.Section>
                        <Checkbox label="Review mode" checked={reviewMode} onChange={(v) => this.setState({ reviewMode: v })} />
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

                <Modal
                    open={reviewDecisionModalShowing}
                    onClose={() => this.setState({ reviewDecisionModalShowing: false, reviewDecisionModalInformation: this.reviewDecisionModalInformationDefault })}
                    title="Accept Applications"
                    loading={doingInvites}
                    primaryAction={{
                        content: 'Accept',
                        onAction: () => {
                            if (modalDetails) {
                                this.inviteApplications(
                                    modalDetails.applications.map(i => i.application.id),
                                    modalDetails.teamName,
                                    () => this.setState({ reviewDecisionModalShowing: false, reviewDecisionModalInformation: this.reviewDecisionModalInformationDefault })
                                );
                            } else {
                                this.setState({ reviewDecisionModalShowing: false, reviewDecisionModalInformation: this.reviewDecisionModalInformationDefault });
                            }
                        },
                    }}
                // secondaryActions={[{
                //     content: 'Ignore',
                //     onAction: () => {

                //     },
                // }]}
                >
                    {modalDetails
                        ? (
                            <ResourceList
                                resourceName={{ singular: 'application', plural: 'applications' }}
                                items={modalDetails.applications}
                                renderItem={(item: IReviewDecisionApplicationDetail) => {
                                    return (
                                        <ResourceList.Item
                                            id={`${item.id}`}
                                            onClick={() => {
                                                window.open(`/committee/admin/applications/${item.application.id}`, "_blank")
                                            }}
                                            accessibilityLabel={`View details`}
                                        >
                                            <span style={{ fontSize: "1.6rem" }}>#{item.application.id} &nbsp; {item.user.name}</span> &nbsp; {this.renderScore(item.score, item.adjustment)}
                                        </ResourceList.Item>
                                    );
                                }}
                            />
                        )
                        : <></>
                    }
                </Modal>
            </Page>
        );
    }

    private renderPage(): ReactNode {
        if (this.state.selectedTab == 0) {
            return this.renderOverview();
        }
        return this.renderEditor();
    }

    private renderEditor(): ReactNode {
        const { selectedFile, loading, current_file_content } = this.state;
        const { files }: { files: string[] } = this.state;
        if (selectedFile >= 0) {
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
                        fontSize={14}
                        setOptions={{ useWorker: false }}
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

    private renderOverview(): ReactNode {
        const { selectedFile, loading, results, running, reviewMode } = this.state;
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
                                <Button disabled={loading} onClick={() => this.setState({ newFileModal: true })} icon={AddCodeMajor}></Button>
                                <Button loading={loading && !running} disabled={running} onClick={this.syncScripts} icon={RefreshMajor}></Button>
                                <Button disabled={loading} onClick={() => this.setState({ settingsModal: true })} icon={SettingsMajor}></Button>
                                <Button disabled={loading && !running} loading={running} onClick={this.runScript} icon={PlayMajor}></Button>
                            </ButtonGroup>
                        </div>
                    </div>
                </Card.Section>
                <div style={{ lineHeight: "1.6rem", fontSize: "1.7rem" }}>
                    {reviewMode
                        ? this.renderReviewMode()
                        : (results ?
                            <ReactJson
                                name={false}
                                enableClipboard={true}
                                theme={"solarized"}
                                collapsed={1}
                                style={{ padding: "2rem" }}
                                iconStyle={"circle"}
                                src={JSON.parse(JSON.stringify(results))}
                            /> : <></>)
                    }
                </div>
            </>
        );
    }

    private onChange = (newValue: string) => {
        this.setState({ current_file_content: newValue });
    }

    private handleTabChange = (index: number) => {
        this.setState({ selectedTab: index });
    }

    private handleDelete = () => {
        const { selectedFile } = this.state;
        const files: string[] = this.state.files;
        this.deleteScript(files[selectedFile]);
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
        const newFileNameTrimmed = newFileName.trim().replace(/\.php/, '').toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
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
            if (status == 200 || status == 201) {
                const payload = res.data;
                if ("success" in payload && payload["success"]) {
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
            if (status == 200 || status == 201) {
                const payload = res.data;
                if ("success" in payload && payload["success"]) {
                    toast.success("Scripts synced");
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
        axios.get(`/committee/admin-api/list-review-scripts.json`).then(res => {
            const status = res.status;
            if (status == 200 || status == 201) {
                const payload = res.data;
                if ("success" in payload && payload["success"]) {
                    if ("scripts" in payload) {
                        const scripts = payload["scripts"].map((s: string) => s.replace(/\.php/, ''));
                        this.setState({ loading: false, files: scripts });
                        if (scripts.length > 0 && (this.state.selectedFile < 0 || this.state.selectedFile > scripts.length)) {
                            this.setState({ selectedFile: 0 });
                            this.loadScript(scripts[0]);
                        } else {
                            this.loadScript(scripts[this.state.selectedFile]);
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
            if (status == 200 || status == 201) {
                const payload = res.data;
                if ("success" in payload && payload["success"]) {
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
            if (status == 200 || status == 201) {
                const payload = res.data;
                if ("success" in payload && payload["success"]) {
                    const files: string[] = this.state.files;
                    const newFiles = files.filter(f => f != name);
                    if (newFiles.length > 0) {
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
        axios.post(`/committee/admin-api/run-review-script.json?t=${+new Date}`, {
            name: name
        }, {
            headers: { CacheControl: "no-cache, no-store, max-age=0, must-revalidate" }
        }).then(res => {
            const status = res.status;
            console.log(res);
            if (status == 200 || status == 201) {
                const payload = res.data;
                if ("success" in payload && payload["success"]) {
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
    private renderScore = (score: number, adj: number) => {
        return <span style={{ fontWeight: 600, fontSize: "1.5rem" }}>
            {(Math.round(score * 100) / 100).toFixed(2)} <span style={{ fontSize: "1.2rem", color: (adj >= 0 ? "green" : "red") }}>({adj >= 0 ? "+" : ""}{(Math.round(adj * 100) / 100).toFixed(2)})</span>
        </span>;
    }

    private renderReviewMode() {
        try {
            const reviewDecisions: IReviewDecisionSet = this.state.results as any;
            if (reviewDecisions.details) {
                const keys = Object.keys(reviewDecisions.details);
                const show = keys
                    .map(app => reviewDecisions.details[app])
                    .filter(app => app.decision == "accept");

                return (
                    <Card>
                        <ResourceList
                            resourceName={{ singular: 'application', plural: 'applications' }}
                            items={show}
                            renderItem={(item: IReviewDecisionDetails) => {
                                if (!item) return <>No data.</>;
                                const { alreadyInvited }: { alreadyInvited: string[] } = this.state;
                                const greyOut = alreadyInvited.includes(item.teamName || `${item.applications[0].application.id}`);
                                return (
                                    <ResourceList.Item
                                        id={`${item.applications.length == 1 ? item.applications[0].id : item.teamName}`}
                                        onClick={() => {
                                            this.setState({
                                                reviewDecisionModalShowing: true,
                                                reviewDecisionModalInformation: { details: item }
                                            });
                                        }}
                                        accessibilityLabel={`View details`}
                                    >
                                        <div style={{ padding: "0.1rem" }}>
                                            {item.applications.length == 1
                                                ? <>
                                                    <div style={{ color: greyOut ? "grey" : "red", fontWeight: 700, padding: "0 0 0.2rem", fontSize: "0.8rem" }}>{greyOut ? "INVITED, " : ""}INDIVIDUAL, #{item.applications[0].application.id}</div>
                                                    <div>{item.applications[0].user.name} &nbsp; — &nbsp; {this.renderScore(item.applications[0].score, item.applications[0].adjustment)}</div>
                                                </>
                                                : <>
                                                    <div style={{ color: greyOut ? "grey" : "purple", fontWeight: 700, padding: "0 0 0.2rem", fontSize: "0.8rem" }}>{greyOut ? "INVITED, " : ""}TEAM</div>
                                                    <div>{item.teamName} &nbsp; — &nbsp; {this.renderScore(item.score, item.adjustment)}</div>
                                                </>
                                            }
                                        </div>
                                    </ResourceList.Item>
                                );
                                return <></>;
                            }}
                        />
                    </Card>
                );
            }
            return <></>;
        } catch (e) {
            console.log(e);
        }
    }

    private inviteApplications = (appIDs: number[], teamId: string | null, next: () => void) => {
        this.setState({ doingInvites: true });
        axios.post(`/committee/admin-api/invite-applications.json`, {
            ids: appIDs
        }).then(res => {
            const status = res.status;
            if (status == 200 || status == 201) {
                const payload = res.data;
                if ("success" in payload && payload["success"]) {
                    toast.info(payload["message"]);
                    const { alreadyInvited }: { alreadyInvited: string[] } = this.state;
                    alreadyInvited.push(appIDs.length > 1 && teamId ? teamId : `${appIDs[0]}`);
                    this.setState({ doingInvites: false, alreadyInvited: alreadyInvited });
                    next();
                    return;
                }
            }
            toast.error("Failed to load data.");
            console.log(status, res.data);
            this.setState({ doingInvites: false });
        });
    }
}

export default withRouter(Omnitool);
