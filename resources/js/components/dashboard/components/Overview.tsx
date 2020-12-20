import React, { Component } from "react";
import { Page, Card, TextContainer, Heading, DisplayText, Link, Layout, ResourceList, Modal } from "@shopify/polaris";
import { IDashboardProps } from "../../../interfaces/dashboard.interfaces";
import { RouteComponentProps } from "react-router";
import { withRouter } from "react-router-dom";
import axios from 'axios';

type IDashboardPropsWithRouter = RouteComponentProps & IDashboardProps;

interface IOverviewState {
    loading: boolean,
    stats: IOverviewStats | undefined,
    modalShowing: string,

    loadedDatafile: boolean,
    majors: { id: string, count: number }[],
    universities: { id: string, count: number }[],
    studyLevels: { id: string, count: number }[],
    expoAssignments: IExpoAssigments[],
    expoModalShowing: boolean,
}

interface IOverviewStats {
    checkedIn: number
}

interface IExpoAssigments {
    title: string,
    location: string,
}

class Overview extends Component<IDashboardPropsWithRouter, IOverviewState> {
    private detailsReady = true;
    private expoMapUrl = "https://assets.hackcambridge.com/table-allocations.png?t=" + Date.now();
    private teamAllocationsUrl = "https://assets.hackcambridge.com/team_assignments.json";

    state = {
        loading: true,
        stats: undefined,
        loadedDatafile: false,
        modalShowing: "",
        majors: [] as { id: string, count: number }[],
        universities: [] as { id: string, count: number }[],
        studyLevels: [] as { id: string, count: number }[],
        expoAssignments: [] as IExpoAssigments[],
        expoModalShowing: false,
    }

    componentDidMount() {
        this.loadStats();
        this.loadDatafile();
        this.loadTeamAllocations();
    }

    render() {
        return (
            <>
                {/* <img src="/images/HC-HackerHeader-bg.png" alt="Hacker Header picture" style={{ position: "absolute", width: "100%", marginTop: "-30px", zIndex: -1000 }} /> */}
                <Page title={""}>
                    {/* <img id="hacker-header-fg" src="/images/HC-HackerHeader-fgv2.png" alt="Hacker Header picture" /> */}
                    {this.renderStartApplicationBanner()}
                    {/* {this.renderMoreComingSoonBanner()} */}
                    {/* {this.renderEventOverview()} */}
                </Page>
            </>
        );
    }

    private renderStartApplicationBanner() {
        if (!this.props.canApply || this.props.user.type != "hacker") {
            return <></>;
        }
        return (
            <Card>
                <Link url={`${this.props.baseUrl}/apply/individual`}>
                    <div id="apply-banner"><img src="/images/apply-text-overlay.png" /></div>
                </Link>
            </Card>
        );
    }



    private renderStats() {
        const { loading, stats } = this.state;
        if (loading) { return <Heading>Loading stats...</Heading>; }
        else if (!stats) { return <Heading>Nothing here right now!</Heading>; }

        const statistics: IOverviewStats = stats!;
        return (<>
            <div style={{ textAlign: "center", fontSize: "1.8rem" }}>
                <span style={{
                    paddingRight: "1rem",
                    fontSize: "1.2rem",
                    lineHeight: "1.8rem",
                    verticalAlign: "middle",
                    fontWeight: 700,
                    color: "red",
                }}>LIVE</span>
                <span>Hacker Count: <span style={{ fontWeight: 700 }}>{statistics.checkedIn}</span></span>
            </div>
        </>);
    }

    private renderDatafileStats() {
        const { loadedDatafile, universities, majors, studyLevels, modalShowing } = this.state;
        if (!loadedDatafile) { return <></>; }

        const cards = [
            { set: universities, modalKey: "uni", title: "Universities" },
            { set: majors, modalKey: "degree", title: "Degrees" },
            { set: studyLevels, modalKey: "level", title: "Experience" },
        ];
        return <>
            {cards.map(c => {
                const { set, modalKey, title } = c;
                const amOpen = modalKey == modalShowing;
                const subset = amOpen ? set : set.slice(0, 3);
                return <>
                    <Card
                        sectioned
                        title={title}
                        actions={[{
                            content: (!amOpen ? "All" : "Collapse"),
                            onAction: () => this.setState({ modalShowing: (!amOpen ? modalKey : "") })
                        }]}
                    >
                        {subset.map(u => {
                            return <>
                                <div style={{ display: "inline-block", width: "100%", fontSize: "1.5rem", padding: "0.3rem 0" }}>
                                    <span><strong>{u.id}</strong></span>
                                    <span style={{ float: "right" }}>{u.count}</span>
                                </div>
                                <br />
                            </>;
                        })}
                    </Card>
                    <br />
                </>
            })}
        </>;
    }

    private loadStats() {
        this.setState({ loading: true });
        axios.get("/dashboard-api/get-overview-stats.json").then(res => {
            const status = res.status;
            if (status == 200) {
                const payload = res.data;
                if ("success" in payload && payload["success"]) {
                    const stats: IOverviewStats = payload["stats"];
                    this.setState({ loading: false, stats: stats });
                    return;
                } else {
                    console.log(payload["message"]);
                }
            } else {
                console.log(`Request failed. Status: ${status}`);
            }
            this.setState({ loading: false });
        });
    }

    private loadDatafile() {
        axios.get("/assets/data/public-stats.json").then(res => {
            const status = res.status;
            if (status == 200) {
                const payload = res.data;
                const majorsDict: { [key: string]: number } = payload["major"];
                const majors = Object.keys(majorsDict).map(k => { return { id: k, count: +majorsDict[k] } }).sort((a, b) => b.count - a.count);
                const universitiesDict: { [key: string]: number } = payload["school/name"];
                const universities = Object.keys(universitiesDict).map(k => { return { id: k, count: +universitiesDict[k] } }).sort((a, b) => b.count - a.count);
                const studyLevelsDict: { [key: string]: number } = payload["level_of_study"];
                const studyLevels = Object.keys(studyLevelsDict).map(k => { return { id: k, count: +studyLevelsDict[k] } }).sort((a, b) => b.count - a.count);

                this.setState({
                    majors: majors,
                    universities: universities,
                    studyLevels: studyLevels,
                    loadedDatafile: true,
                });
            } else {
                console.log(`Request failed. Status: ${status}`);
            }
        });
    }

    private loadTeamAllocations() {
        axios.get(this.teamAllocationsUrl).then(res => {
            const status = res.status;
            if (status == 200) {
                const payload = res.data as { assignments: IExpoAssigments[] };
                this.setState({
                    expoAssignments: payload.assignments ? payload.assignments.sort((a, b) => a.title.localeCompare(b.title)) : [] as IExpoAssigments[]
                });
            } else {
                this.setState({ expoAssignments: [] as IExpoAssigments[] });
                console.log(`Request failed. Status: ${status}`);
            }
        });
    }
}

export default withRouter(Overview);
