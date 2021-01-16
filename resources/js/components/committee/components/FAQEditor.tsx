import React, { Component } from "react";
import { Page, Card, ResourceList, TextStyle, Modal, TextField } from "@shopify/polaris";
import axios from 'axios';
import { toast } from "react-toastify";
import { IFAQItem } from "../../../interfaces/dashboard.interfaces";
import { v4 as uuidv4 } from "uuid";
import AceEditor from "react-ace";
import DestructiveConfirmation from "../../common/DestructiveConfirmation";

interface IFAQEditorProps {

}

interface IFAQEditorState {
    lastModified: number,
    faqs: IFAQItem[],
    live: boolean,
    loading: boolean,
    showDestructiveForm: JSX.Element | undefined,

    modalShowing: boolean,
    modalContent_id: string,
    modalContent_title: string,
    modalContent_answer: string,
}

class FAQEditor extends Component<IFAQEditorProps, IFAQEditorState> {

    state = {
        loading: true,
        lastModified: -1,
        faqs: [] as IFAQItem[],
        live: false,
        showDestructiveForm: undefined,
        modalShowing: false,
        modalContent_id: "",
        modalContent_title: "",
        modalContent_answer: "",
    }

    componentDidMount() {
        this.loadEventData();
    }

    render() {
        const {
            faqs,
            modalShowing,
            live,
            loading,
            modalContent_id,
            modalContent_title,
            modalContent_answer,
            showDestructiveForm,
        } = this.state;
        return (
            <Page
                title={"FAQs"}
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
                    content: "New FAQ",
                    onAction: this.addNewFAQItem
                }]}
            >
                <Card>
                    <ResourceList
                        resourceName={{ singular: 'FAQ', plural: 'FAQs' }}
                        items={faqs}
                        loading={loading}
                        renderItem={(faqsItem: IFAQItem) => {
                            const shortcutActions = [
                                { content: '↑', onAction: () => this.changeOrder(faqsItem, -1) },
                                { content: '↓', onAction: () => this.changeOrder(faqsItem, 1) },
                            ];
                            return (<>
                                <ResourceList.Item
                                    shortcutActions={shortcutActions}
                                    id={faqsItem.title}
                                    onClick={() => this.showModal(faqsItem)}
                                >
                                    <h3>
                                        <TextStyle variation="strong">{faqsItem.title}</TextStyle><br />
                                    </h3>
                                </ResourceList.Item>
                            </>);
                        }}
                    />
                </Card>

                <Modal
                    title={"Edit FAQ Item"}
                    open={modalShowing}
                    onClose={() => this.setState({ modalShowing: false })}
                    primaryAction={{
                        onAction: () => this.updateAndSave(),
                        content: "Save",
                        loading: loading
                    }}
                    secondaryActions={[{
                        onAction: () => this.deleteFAQItem(modalContent_id),
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
                            label="Time"
                        />
                        <br />
                        <p>Full Content</p>
                        <AceEditor
                            mode="markdown"
                            name="markdown"
                            theme="twilight"
                            onChange={(c) => this.setState({ modalContent_answer: c })}
                            width="100%"
                            enableBasicAutocompletion={true}
                            enableLiveAutocompletion={true}
                            enableSnippets={true}
                            fontSize={14}
                            minLines={6}
                            maxLines={12}
                            setOptions={{ useWorker: false }}
                            value={modalContent_answer}
                        />
                    </Modal.Section>
                </Modal>
                {showDestructiveForm || <></>}
            </Page>
        );
    }

    private addNewFAQItem = () => {
        const item: IFAQItem = {
            id: uuidv4(),
            title: "",
            answer: "",
        }
        const { faqs } = this.state;
        faqs.push(item);
        this.showModal(item);
    }

    private deleteFAQItem(id: string) {
        const destructor: JSX.Element = (
            <DestructiveConfirmation
                title={`Are you sure you want to delete this?`}
                onConfirm={() => {
                    const { faqs } = this.state;
                    this.setState({
                        faqs: faqs.filter(c => c.id != id),
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


    private changeOrder(faqsItem: IFAQItem, by: number) {
        const { faqs } = this.state;
        const itemIndex = faqs.findIndex(c => c.id == faqsItem.id);
        if (itemIndex > -1) {
            const newIndex = Math.max(0, Math.min(faqs.length - 1, itemIndex + by));

            const mutable: (IFAQItem | undefined)[] = faqs;
            if (newIndex >= mutable.length) {
                var k = newIndex - mutable.length + 1;
                while (k--) {
                    mutable.push(undefined);
                }
            }
            mutable.splice(newIndex, 0, mutable.splice(itemIndex, 1)[0]);
            const newFAQ = mutable.filter(c => c != undefined) as IFAQItem[];
            this.setState({ faqs: newFAQ });
        }
    }

    private updateAndSave() {
        const {
            faqs,
            modalContent_id,
            modalContent_title,
            modalContent_answer,
        } = this.state;
        const toUpdate = faqs.find(c => c.id == modalContent_id);
        if (toUpdate) {
            toUpdate.title = modalContent_title;
            toUpdate.answer = modalContent_answer;
        }

        this.saveOutFile();
    }

    private showModal(item: IFAQItem) {
        this.setState({
            modalShowing: true,
            modalContent_id: item.id,
            modalContent_title: item.title,
            modalContent_answer: item.answer,
        });
    }

    private saveOutFile = () => {
        this.setState({ loading: true });

        const {
            faqs,
            live,
            lastModified,
        } = this.state;
        axios.post(`/committee/admin-api/save-event-data-file.json`, {
            file: "faqs.json",
            last_modified: lastModified,
            content: JSON.stringify({
                live: live,
                faqs: faqs
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
            file: "faqs.json"
        }).then(res => {
            const status = res.status;
            if (status == 200 || status == 201) {
                const payload = res.data;
                if ("success" in payload && payload["success"]) {
                    const faqsItemsJSON = JSON.parse(payload["content"]);
                    if ("faqs" in faqsItemsJSON) {
                        const faqs: IFAQItem[] = faqsItemsJSON["faqs"];
                        this.setState({
                            lastModified: payload["last_modified"],
                            faqs: faqs,
                            live: faqsItemsJSON["live"] || false,
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

export default FAQEditor;
