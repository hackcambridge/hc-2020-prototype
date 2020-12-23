import React, { Component } from "react";
import { Page, Card, ResourceList, TextStyle, Modal, TextField } from "@shopify/polaris";
import axios from 'axios';
import { toast } from "react-toastify";
import { IScheduleItem } from "../../../interfaces/dashboard.interfaces";
import { v4 as uuidv4 } from "uuid";
import DestructiveConfirmation from "../../common/DestructiveConfirmation";

interface IScheduleEditorProps {

}

interface IScheduleEditorState {
    lastModified: number,
    schedule: IScheduleItem[],
    live: boolean,
    loading: boolean,
    showDestructiveForm: JSX.Element | undefined,

    modalShowing: boolean,
    modalContent_id: string,
    modalContent_time: string,
    modalContent_title: string,
    modalContent_desc: string,
    modalContent_location: string,
    modalContent_logoUrl?: string,
}

class ScheduleEditor extends Component<IScheduleEditorProps, IScheduleEditorState> {

    state = {
        loading: true,
        lastModified: -1,
        schedule: [] as IScheduleItem[],
        live: false,
        showDestructiveForm: undefined,
        modalShowing: false,
        modalContent_id: "",
        modalContent_time: "",
        modalContent_title: "",
        modalContent_desc: "",
        modalContent_location: "",
        modalContent_logoUrl: "",
    }

    componentDidMount() {
        this.loadEventData();
    }

    render() {
        const {
            schedule,
            modalShowing,
            live,
            loading,
            modalContent_id,
            modalContent_time,
            modalContent_title,
            modalContent_desc,
            modalContent_location,
            modalContent_logoUrl,
            showDestructiveForm,
        } = this.state;
        return (
            <Page
                title={"Schedule"}
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
                    content: "New Schedule Item",
                    onAction: this.addNewScheduleItem
                }]}
            >
                <Card>
                    <ResourceList
                        resourceName={{ singular: 'schedule item', plural: 'schedule items' }}
                        items={schedule}
                        loading={loading}
                        renderItem={(scheduleItem: IScheduleItem) => {
                            const shortcutActions = [
                                { content: '↑', onAction: () => this.changeOrder(scheduleItem, -1) },
                                { content: '↓', onAction: () => this.changeOrder(scheduleItem, 1) },
                            ];
                            return (<>
                                <ResourceList.Item
                                    shortcutActions={shortcutActions}
                                    id={scheduleItem.title}
                                    onClick={() => this.showModal(scheduleItem)}
                                >
                                    <h3>
                                        <TextStyle variation="strong">{scheduleItem.time} — {scheduleItem.title}</TextStyle><br />
                                        <p><em>{scheduleItem.location}</em></p>
                                        {scheduleItem.desc}
                                    </h3>
                                </ResourceList.Item>
                            </>);
                        }}
                    />
                </Card>

                <Modal
                    title={"Edit Schedule Item"}
                    open={modalShowing}
                    onClose={() => this.setState({ modalShowing: false })}
                    primaryAction={{
                        onAction: () => this.updateAndSave(),
                        content: "Save",
                        loading: loading
                    }}
                    secondaryActions={[{
                        onAction: () => this.deleteScheduleItem(modalContent_id),
                        content: "Delete",
                        destructive: true,
                        loading: loading
                    }]}
                    loading={loading}
                >
                    <Modal.Section>
                        <TextField
                            value={modalContent_time}
                            onChange={(t) => this.setState({ modalContent_time: t })}
                            label="Time"
                        />
                        <br />
                        <TextField
                            value={modalContent_title}
                            onChange={(t) => this.setState({ modalContent_title: t })}
                            label="Title"
                        />
                        <br />
                        <TextField
                            value={modalContent_location}
                            onChange={(t) => this.setState({ modalContent_location: t })}
                            label="Location"
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
                            label="Logo URL (optional)"
                        />
                    </Modal.Section>
                </Modal>
                {showDestructiveForm || <></>}
            </Page>
        );
    }

    private addNewScheduleItem = () => {
        const item: IScheduleItem = {
            id: uuidv4(),
            time: "",
            title: "",
            desc: "",
            location: "",
            logoUrl: "",
        }
        const { schedule } = this.state;
        schedule.push(item);
        this.showModal(item);
    }

    private deleteScheduleItem(id: string) {
        const destructor: JSX.Element = (
            <DestructiveConfirmation
                title={`Are you sure you want to delete this?`}
                onConfirm={() => {
                    const { schedule } = this.state;
                    this.setState({
                        schedule: schedule.filter(c => c.id != id),
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


    private changeOrder(scheduleItem: IScheduleItem, by: number) {
        const { schedule } = this.state;
        const itemIndex = schedule.findIndex(c => c.id == scheduleItem.id);
        if (itemIndex > -1) {
            const newIndex = Math.max(0, Math.min(schedule.length - 1, itemIndex + by));

            const mutable: (IScheduleItem | undefined)[] = schedule;
            if (newIndex >= mutable.length) {
                var k = newIndex - mutable.length + 1;
                while (k--) {
                    mutable.push(undefined);
                }
            }
            mutable.splice(newIndex, 0, mutable.splice(itemIndex, 1)[0]);
            const newSchedule = mutable.filter(c => c != undefined) as IScheduleItem[];
            this.setState({ schedule: newSchedule });
        }
    }

    private updateAndSave() {
        const {
            schedule,
            modalContent_id,
            modalContent_time,
            modalContent_title,
            modalContent_desc,
            modalContent_location,
            modalContent_logoUrl,
        } = this.state;
        const toUpdate = schedule.find(c => c.id == modalContent_id);
        if (toUpdate) {
            toUpdate.title = modalContent_title;
            toUpdate.time = modalContent_time;
            toUpdate.desc = modalContent_desc;
            toUpdate.location = modalContent_location;
            toUpdate.logoUrl = modalContent_logoUrl;
        }

        this.saveOutFile();
    }

    private showModal(item: IScheduleItem) {
        this.setState({
            modalShowing: true,
            modalContent_id: item.id,
            modalContent_time: item.time,
            modalContent_title: item.title,
            modalContent_desc: item.desc,
            modalContent_location: item.location,
            modalContent_logoUrl: item.logoUrl,
        });
    }

    private saveOutFile = () => {
        this.setState({ loading: true });

        const {
            schedule,
            live,
            lastModified,
        } = this.state;
        axios.post(`/committee/admin-api/save-event-data-file.json`, {
            file: "schedule.json",
            last_modified: lastModified,
            content: JSON.stringify({
                live: live,
                schedule: schedule
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
            file: "schedule.json"
        }).then(res => {
            const status = res.status;
            if (status == 200 || status == 201) {
                const payload = res.data;
                if ("success" in payload && payload["success"]) {
                    const scheduleItemsJSON = JSON.parse(payload["content"]);
                    if ("schedule" in scheduleItemsJSON) {
                        const schedule: IScheduleItem[] = scheduleItemsJSON["schedule"];
                        this.setState({
                            lastModified: payload["last_modified"],
                            schedule: schedule,
                            live: scheduleItemsJSON["live"] || false,
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

export default ScheduleEditor;
