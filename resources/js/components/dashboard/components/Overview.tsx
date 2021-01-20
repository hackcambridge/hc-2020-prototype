import React, { Component } from "react";
import { Page, Card, Link, DisplayText, Heading, Layout, Modal, ResourceList, TextContainer } from "@shopify/polaris";
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
    // private teamAllocationsUrl = "https://assets.hackcambridge.com/team_assignments.json";

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
        // this.loadTeamAllocations();
    }

    render() {
        return (
            <>
                <img src="/images/HC-HackerHeader-bg.png" alt="Hacker Header picture" style={{ position: "absolute", width: "100%", marginTop: "-30px", zIndex: -1000 }} />
                <Page title={""}>
                    <img id="hacker-header-fg" src="/images/HC-HackerHeader-fgv2.png" alt="Hacker Header picture" />
                    {this.renderStartApplicationBanner()}
                    {this.renderMoreComingSoonBanner()}
                    {this.renderEventOverview()}
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

    private renderMoreComingSoonBanner() {
        if(this.detailsReady) {
            return <></>;
        }
        return (
            <Card sectioned title={``}>
                <div style={{ textAlign: "center", padding: "1rem", color: "#8e8e8e" }}>
                    <DisplayText size="medium">More Coming Soon...</DisplayText>
                    <br />
                    <TextContainer>Hey {this.props.user.name.split(" ")[0]}, we'll be adding more information here closer to the event. Stay tuned!</TextContainer>
                </div>
            </Card>
        );
    }

    private renderEventOverview() {
        if(!this.detailsReady) {
            return <></>;
        }

        const longLinks = [
            { text: "Join the Hex Cambridge Discord Channel", link: "/dashboard/join-discord", internal: false },
            // { text: "Hackathon Devpost", link: "https://hexcambridge.devpost.com/", internal: false },
            { text: "View the challenges", link: "/dashboard/challenges", internal: true },
            { text: "What's happening when", link: "/dashboard/schedule", internal: true },
            { text: "Hex Cambridge Gaming Sessions Sign-up", link: "https://forms.gle/Pj7wsvPQFRigEQBm9", internal: false },
            // { text: "Find your way around", link: "/dashboard/map", internal: true },
            { text: "Report a bug", link: "https://discord.gg/XPw9wHhFQk", internal: false },
        ];
        const { expoModalShowing, expoAssignments } = this.state;
        return <>
            <Layout>
                <Layout.Section oneHalf>
                    <Card>
                        <ResourceList 
                            items={longLinks}
                            renderItem={(item) => {
                                return (
                                    <ResourceList.Item id={item.text} onClick={() => {
                                        if(item.internal) { this.props.history.push(item.link); }
                                        else { window.open(item.link, "_blank"); }
                                    }}>
                                        <Heading>{item.text} →</Heading> 
                                    </ResourceList.Item>
                                );
                            }}
                        />
                    </Card>
                    {/* <br />
                    <Card title={"Expo Layout"} actions={expoAssignments.length > 0 ? [{
                        content: "Team Allocations", 
                        onAction: () => this.setState({ expoModalShowing: true })
                    }] : []}>
                        {/* <img style={{ width: "100%" }} src={this.expoMapUrl} /> */}
                    {/* </Card> */}
                </Layout.Section>
                <Layout.Section oneHalf>
                    {/* <Card sectioned>{this.renderStats()}</Card><br /> */}
                    {this.renderDatafileStats()}
                </Layout.Section>
            </Layout>
            {/* <Modal title={"Expo Assignments"} open={expoModalShowing} onClose={() => this.setState({ expoModalShowing: false })}>
                <Modal.Section>
                    {expoAssignments.length == 0
                        ? <Heading>Nothing here yet.</Heading>
                        : <div>
                            {expoAssignments.map(e => {
                                return <div style={{ display: "inline-block", width: "100%", fontSize: "2rem", margin: "0.6rem 0", padding: "0.5rem 0", borderBottom: "#d8d8d8 1px solid" }}>
                                    <span style={{ fontWeight: 600 }}>{e.title}</span>
                                    <span style={{ float: "right" }} >{e.location}</span>
                                </div>;
                            })}
                        </div>
                    }
                </Modal.Section>
            </Modal> */}
        </>;
    }

    private renderStats() {
        const { loading, stats } = this.state;
        if(loading) { return <Heading>Loading stats...</Heading>; }
        else if(!stats) { return <Heading>Nothing here right now!</Heading>; }
        
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
        if(!loadedDatafile) { return <></>; }

        const cards = [
            { set: universities, modalKey: "uni", title: "Universities" },
            { set: majors, modalKey: "degree", title: "Degrees" },
            { set: studyLevels, modalKey: "level", title: "Experience" },
        ];
        return <>
            {cards.map(c => {
                const { set, modalKey, title } = c;
                const amOpen = modalKey == modalShowing;
                const subset = amOpen ? set : set.slice(0,3);
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
        axios.get("/dashboard-api/participants-overview.json").then(res => {
            const status = res.status;
            if (status == 200) {
                const payload = res.data["overview"];
                const majorsDict: [ {name: string, participants: number }] = payload["majors"];
                const majors = majorsDict.map(k => { return { id: k.name, count: k.participants } }).sort((a, b) => b.count - a.count);
                const universitiesDict: [ {name: string, participants: number } ] = payload["universities"];
                const universities = universitiesDict.map(k => { return { id: k.name, count: k.participants } }).sort((a, b) => b.count - a.count);
                const studyLevelsDict: [ {name: string, participants: number } ] = payload["levels"];
                const studyLevels = studyLevelsDict.map(k => { return { id: k.name, count: k.participants } }).sort((a, b) => b.count - a.count);

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

    // private loadTeamAllocations() {
    //     axios.get(this.teamAllocationsUrl).then(res => {
    //         const status = res.status;
    //         if (status == 200) {
    //             const payload = res.data as { assignments: IExpoAssigments[] };
    //             this.setState({
    //                 expoAssignments: payload.assignments ? payload.assignments.sort((a, b) => a.title.localeCompare(b.title)) : [] as IExpoAssigments[]
    //             });
    //         } else {
    //             this.setState({ expoAssignments: [] as IExpoAssigments[] });
    //             console.log(`Request failed. Status: ${status}`);
    //         }
    //     });
    // }
}

export default withRouter(Overview);
