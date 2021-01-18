import React, { Component } from "react";
import { Page, Card, ResourceList, TextStyle, Modal, TextField } from "@shopify/polaris";
import axios from 'axios';
import { toast } from "react-toastify";
import { ISponsorChallenge } from "../../../interfaces/dashboard.interfaces";
import { v4 as uuidv4 } from "uuid";
import AceEditor from "react-ace";
import DestructiveConfirmation from "../../common/DestructiveConfirmation";

interface IChallengesEditorProps {

}

interface IChallengesEditorState {
    lastModified: number,
    challenges: ISponsorChallenge[],
    live: boolean,
    loading: boolean,
    showDestructiveForm: JSX.Element | undefined,

    modalShowing: boolean,
    modalContent_id: string,
    modalContent_title: string,
    modalContent_desc: string,
    modalContent_logoUrl: string,
    modalContent_resourceLink: string,
    modalContent_discordChannel: string,
    modalContent_content: string,
}

class ChallengesEditor extends Component<IChallengesEditorProps, IChallengesEditorState> {

    state = {
        loading: true,
        lastModified: -1,
        challenges: [] as ISponsorChallenge[],
        live: false,
        showDestructiveForm: undefined,
        modalShowing: false,
        modalContent_id: "",
        modalContent_title: "",
        modalContent_desc: "",
        modalContent_logoUrl: "",
        modalContent_resourceLink: "",
        modalContent_discordChannel: "",
        modalContent_content: "",
    }

    componentDidMount() {
        this.loadEventData();
    }

    render() {
        const {
            challenges,
            modalShowing,
            live,
            loading,
            modalContent_id,
            modalContent_title,
            modalContent_desc,
            modalContent_logoUrl,
            modalContent_resourceLink,
            modalContent_discordChannel,
            modalContent_content,
            showDestructiveForm,
        } = this.state;
        return (
            <Page
                title={"Challenges"}
                primaryAction={{
                    loading: loading,
                    content: live ? "Unpublish" : "Publish",
                    primary: !live && !loading,
                    destructive: live && !loading,
                    onAction: () => this.changePublished(!live)
                }}
                secondaryActions={[{
                    content: "Force Save",
                    onAction: this.saveOutFile
                }, {
                    content: "New Challenge",
                    onAction: this.addNewChallenge
                }]}
            >
                <Card>
                    <ResourceList
                        resourceName={{ singular: 'challenge', plural: 'challenges' }}
                        items={challenges}
                        loading={loading}
                        renderItem={(challenge: ISponsorChallenge) => {
                            const shortcutActions = [
                                { content: '↑', onAction: () => this.changeOrder(challenge, -1) },
                                { content: '↓', onAction: () => this.changeOrder(challenge, 1) },
                            ];
                            return (<>
                                <ResourceList.Item
                                    shortcutActions={shortcutActions}
                                    id={challenge.title}
                                    onClick={() => this.showModal(challenge)}
                                >
                                    <h3>
                                        <TextStyle variation="strong">{challenge.title}</TextStyle><br />
                                        {challenge.description}
                                    </h3>
                                </ResourceList.Item>
                            </>);
                        }}
                    />
                </Card>

                <Modal
                    title={"Edit Challenge"}
                    open={modalShowing}
                    onClose={() => this.setState({ modalShowing: false })}
                    primaryAction={{
                        onAction: () => this.updateAndSave(),
                        content: "Save",
                        loading: loading
                    }}
                    secondaryActions={[{
                        onAction: () => this.deleteChallenge(modalContent_id),
                        content: "Delete",
                        destructive: true,
                        loading: loading
                    }]}
                    loading={loading}
                >
                    <Modal.Section>
                        <TextField
                            value={modalContent_title}
                            onChange={(t) => this.setState({ modalContent_title: t })}
                            label="Title"
                        />
                        <br />
                        <TextField
                            value={modalContent_desc}
                            onChange={(t) => this.setState({ modalContent_desc: t })}
                            label="Description"
                            multiline={4}
                        />
                        <br />
                        <TextField
                            value={modalContent_logoUrl}
                            onChange={(t) => this.setState({ modalContent_logoUrl: t })}
                            label="Logo URL"
                        />
                        <br />
                        <TextField
                            value={modalContent_resourceLink}
                            onChange={(t) => this.setState({ modalContent_resourceLink: t })}
                            label="Resource Link (Optional)"
                            placeholder="https://example.com/sample-app or https://example.com/data.csv" 
                        />
                        <br />
                        <TextField
                            value={modalContent_discordChannel}
                            onChange={(t) => this.setState({ modalContent_discordChannel: t })}
                            label="Discord Channel Invite Code (Optional)"
                            helpText="Just the invite code, we will automatically create the link https://discord.gg/{code}"
                        />
                        <br />
                        <p>Full Content</p>
                        <AceEditor
                            mode="markdown"
                            name="markdown"
                            theme="twilight"
                            onChange={(c) => this.setState({ modalContent_content: c })}
                            width="100%"
                            enableBasicAutocompletion={true}
                            enableLiveAutocompletion={true}
                            enableSnippets={true}
                            fontSize={14}
                            minLines={6}
                            maxLines={12}
                            setOptions={{ useWorker: false }}
                            value={modalContent_content}
                        />
                    </Modal.Section>
                </Modal>
                {showDestructiveForm || <></>}
            </Page>
        );
    }

    private addNewChallenge = () => {
        const challenge: ISponsorChallenge = {
            id: uuidv4(),
            title: "",
            description: "",
            content: "",
            logoUrl: "",
            resourceLink: ""
        }
        const { challenges } = this.state;
        challenges.push(challenge);
        this.showModal(challenge);
    }

    private deleteChallenge(id: string) {
        const destructor: JSX.Element = (
            <DestructiveConfirmation
                title={`Are you sure you want to delete this?`}
                onConfirm={() => {
                    const { challenges } = this.state;
                    this.setState({
                        challenges: challenges.filter(c => c.id != id),
                        modalShowing: false
                    }, this.saveOutFile)
                }}
                onClose={() => this.setState({ showDestructiveForm: undefined })}
            />
        );
        this.setState({ showDestructiveForm: destructor });
    }

    private changePublished(published: boolean) {
        this.setState({ loading: true, live: published }, this.saveOutFile)
    }


    private changeOrder(challenge: ISponsorChallenge, by: number) {
        const { challenges } = this.state;
        const challengeIndex = challenges.findIndex(c => c.id == challenge.id);
        if (challengeIndex > -1) {
            const newIndex = Math.max(0, Math.min(challenges.length - 1, challengeIndex + by));

            const mutableChallenges: (ISponsorChallenge | undefined)[] = challenges;
            if (newIndex >= mutableChallenges.length) {
                var k = newIndex - mutableChallenges.length + 1;
                while (k--) {
                    mutableChallenges.push(undefined);
                }
            }
            mutableChallenges.splice(newIndex, 0, mutableChallenges.splice(challengeIndex, 1)[0]);
            const newChallenges = mutableChallenges.filter(c => c != undefined) as ISponsorChallenge[];
            this.setState({ challenges: newChallenges });
        }
    }

    private updateAndSave() {
        const {
            challenges,
            modalContent_id,
            modalContent_title,
            modalContent_desc,
            modalContent_logoUrl,
            modalContent_resourceLink,
            modalContent_discordChannel,
            modalContent_content,
        } = this.state;
        const toUpdate = challenges.find(c => c.id == modalContent_id);
        if (toUpdate) {
            toUpdate.title = modalContent_title;
            toUpdate.description = modalContent_desc;
            toUpdate.logoUrl = modalContent_logoUrl;
            toUpdate.resourceLink = modalContent_resourceLink;
            toUpdate.discordChannel = modalContent_discordChannel;
            toUpdate.content = modalContent_content;
        }

        this.saveOutFile();
    }

    private showModal(challenge: ISponsorChallenge) {
        this.setState({
            modalShowing: true,
            modalContent_id: challenge.id,
            modalContent_title: challenge.title,
            modalContent_desc: challenge.description,
            modalContent_content: challenge.content,
            modalContent_logoUrl: challenge.logoUrl,
            modalContent_resourceLink: challenge.resourceLink,
            modalContent_discordChannel: challenge.discordChannel || "",
        });
    }

    private saveOutFile = () => {
        this.setState({ loading: true });

        const {
            challenges,
            live,
            lastModified,
        } = this.state;
        axios.post(`/committee/admin-api/save-event-data-file.json`, {
            file: "challenges.json",
            last_modified: lastModified,
            content: JSON.stringify({
                live: live,
                challenges: challenges
            }),
        }).then(res => {
            const status = res.status;
            if (status == 200 || status == 201) {
                const payload = res.data;
                if ("success" in payload && payload["success"]) {
                    const newModifiedTime = payload["last_modified"];
                    this.setState({ loading: false, modalShowing: false, lastModified: newModifiedTime });
                    return;
                } else {
                    toast.error(payload["message"]);
                    this.setState({ loading: false });
                    return;
                }
            }
            toast.error("Failed to save data.");
            this.setState({ loading: false });
            console.log(status, res.data);
            // this.setState({ doingInvites: false });
        });
    }

    private loadEventData() {
        axios.post(`/committee/admin-api/load-event-data-file.json`, {
            file: "challenges.json"
        }).then(res => {
            const status = res.status;
            if (status == 200 || status == 201) {
                const payload = res.data;
                if ("success" in payload && payload["success"]) {
                    const challengesJSON = JSON.parse(payload["content"]);
                    if ("challenges" in challengesJSON) {
                        const challenges: ISponsorChallenge[] = challengesJSON["challenges"];
                        this.setState({
                            lastModified: payload["last_modified"],
                            challenges: challenges,
                            live: challengesJSON["live"] || false,
                            loading: false,
                        });
                        return;
                    }
                } else {
                    toast.error(payload["message"]);
                    this.setState({ loading: false });
                    return
                }
            }
            toast.error("Failed to load data.");
            console.log(status, res.data);
            this.setState({ loading: false });
        });
    }
}

export default ChallengesEditor;
