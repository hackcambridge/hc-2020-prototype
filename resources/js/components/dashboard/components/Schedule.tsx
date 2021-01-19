import React, { Component } from "react";
import { Layout, Card, Page, Heading, Link } from "@shopify/polaris";
import axios from 'axios';
import { toast } from "react-toastify";
import { IDashboardProps, IScheduleItem } from "../../../interfaces/dashboard.interfaces";


interface IScheduleState {
    loaded: boolean,
    schedule: IScheduleItem[],
    scheduleLive: boolean,
}

class Schedule extends Component<IDashboardProps, IScheduleState> {

    state = {
        loaded: false,
        schedule: [],
        scheduleLive: false,
    }

    componentDidMount() {
        this.loadSchedule();
    }

    render() {
        const { loaded } = this.state;
        return (
            <>
                <div id={"sponsor-schedule"}>
                    <Page title={"Schedule"}>
                        {loaded
                            ? this.renderSchedule()
                            : <Card sectioned><Heading>Loading schedule...</Heading></Card>
                        }
                    </Page>
                </div>
            </>
        );
    }


    private renderSchedule() {
        const { schedule, scheduleLive } = this.state;
        if (!scheduleLive) {
            return <Card sectioned><Heading>Details will be published soon!</Heading></Card>;
        }

        if (schedule.length == 0) {
            return <Card sectioned><Heading>No schedule to show.</Heading></Card>;
        }

        return (<>{schedule.map(c => this.renderScheduleItemCard(c))}</>);
    }

    private renderScheduleItemCard(data: IScheduleItem) {
        return (
            <Layout key={data.id}>
                <Layout.Section secondary>
                    <div style={{
                        fontWeight: 600,
                        textAlign: "right",
                        fontSize: "2rem",
                        padding: "2rem",
                    }}>
                        {data.time}
                    </div>
                    {data.logoUrl.trim().length > 0
                        ? <img style={{
                            maxWidth: "120px",
                            maxHeight: "60px",
                            float: "right",
                            padding: "0 2rem 1rem 0",
                        }} src={data.logoUrl} />
                        : <></>}
                </Layout.Section>
                <Layout.Section>
                    <Card key={`${data.title}`}>
                        <div style={{ padding: "1.5rem" }}>
                            <Heading>{data.title}</Heading>
                            {data.desc.trim().length > 0
                                ? <><p style={{ marginBottom: "1rem" }}>{this.renderLocation(data.location)}</p><p>{data.desc}</p></>
                                : <p>{this.renderLocation(data.location)}</p>
                            }
                        </div>
                    </Card>
                    <br />
                </Layout.Section>
            </Layout>
        );
    }

    private renderLocation = (location: string) => {
        return (
            (location.startsWith("http") ?
                <Link url={location} external>{location}</Link>
                : <em>{location}</em>
            )
        );
    }

    private dataUrl = `${this.props.baseStorageUrl}event-data/schedule.json`;
    private loadSchedule() {
        axios.get(this.dataUrl).then(res => {
            const status = res.status;
            if (status >= 200 && status <= 300) {
                const payload = res.data;
                if ("schedule" in payload) {
                    const schedule: IScheduleItem[] = payload["schedule"];
                    this.setState({
                        schedule: schedule,
                        scheduleLive: payload["live"] || this.props.user.type == "admin",
                        loaded: true
                    });
                }
            } else {
                toast.error("Failed to load schedule");
                this.setState({ loaded: true });
            }
        });
    }
}

export default Schedule;





