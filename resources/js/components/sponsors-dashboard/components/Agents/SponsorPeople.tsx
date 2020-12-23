import { Avatar, Button, Card, Layout, Page, ResourceList, TextStyle, Banner } from "@shopify/polaris";
import { AddMajor } from "@shopify/polaris-icons";
import axios from "axios";
import React, { Component } from "react";
import { RouteComponentProps, withRouter } from "react-router";
import { ISponsorAgent, ISponsorData } from "../../../../interfaces/sponsors.interfaces";
import DestructiveConfirmation from "../common/DestructiveConfirmation";
import SponsorAgentForm from "./SponsorAgentForm";

interface ISponsorPeopleProps extends RouteComponentProps {
    baseSponsorPath: string,
    sponsor: ISponsorData,
}

interface ISponsorPeopleState {
    loadingMentors: boolean,
    loadingRecruiters: boolean,
    mentors: ISponsorAgent[],
    recruiters: ISponsorAgent[],
    sponsorAgentFormShowing: boolean,
    sponsorAgentFormForType: "mentor" | "recruiter",
    isEditingSponsorAgent: ISponsorAgent | undefined,
    showDestructiveForm: JSX.Element | undefined
}

class SponsorPeople extends Component<ISponsorPeopleProps, ISponsorPeopleState> {

    state = {
        loadingMentors: true,
        loadingRecruiters: true,
        mentors: [],
        mentorsLimit: this.getParameterisedPrivilege("mentors"),
        recruiters: [],
        recruitersLimit: this.getParameterisedPrivilege("recruiters"),
        sponsorAgentFormShowing: false,
        sponsorAgentFormForType: ("mentor" as "mentor" | "recruiter"),
        isEditingSponsorAgent: undefined,
        showDestructiveForm: undefined
    }

    componentDidMount() {
        this.loadSponsorAgents("mentor");
        this.loadSponsorAgents("recruiter");
    }
    render() {
        const {
            loadingMentors,
            loadingRecruiters,
            mentors,
            recruiters,
            sponsorAgentFormShowing,
            isEditingSponsorAgent,
            showDestructiveForm,
            sponsorAgentFormForType,
        } = this.state;
        return (
            <Page
                breadcrumbs={[{
                    content: this.props.sponsor.name,
                    url: this.props.baseSponsorPath
                }]}
                title="People"
            >
                <Layout>
                    <Layout.Section oneHalf>
                        <Card title="Mentors">
                            <Card.Section>
                                {this.state.mentors.length >= this.state.mentorsLimit ?
                                    <Banner status="warning">Mentor limit reached.</Banner>
                                    : <Banner status="info">You are allowed {this.state.mentorsLimit} mentor{this.state.mentorsLimit != 1 ? "s" : ""}.</Banner>}
                            </Card.Section>
                            {loadingMentors || mentors.length > 0 ?
                                <ResourceList
                                    loading={loadingMentors}
                                    items={mentors}
                                    renderItem={this.renderItem}
                                    resourceName={{
                                        singular: 'mentor',
                                        plural: 'mentors',
                                    }}
                                    alternateTool={this.getAddMentorOrLimitButton(false)}
                                />
                                : <Card.Section>
                                    {this.getAddMentorOrLimitButton(true)}
                                </Card.Section>}
                        </Card>
                    </Layout.Section>
                    <Layout.Section oneHalf>
                        <Card title="Recruiters">
                            <Card.Section>
                                {this.state.recruiters.length >= this.state.recruitersLimit ?
                                    <Banner status="warning">Recruiter limit reached.</Banner>
                                    : <Banner status="info">You are allowed {this.state.recruitersLimit} recruiter{this.state.recruitersLimit != 1 ? "s" : ""}.</Banner>}
                            </Card.Section>
                            {loadingRecruiters || recruiters.length > 0 ?
                                <ResourceList
                                    loading={loadingRecruiters}
                                    items={recruiters}
                                    renderItem={this.renderItem}
                                    resourceName={{
                                        singular: 'recruiter',
                                        plural: 'recruiters',
                                    }}
                                    alternateTool={this.getAddRecruiterOrLimitButton(false)}
                                />
                                : <Card.Section>
                                    {this.getAddRecruiterOrLimitButton(true)}
                                </Card.Section>}
                        </Card>
                    </Layout.Section>
                </Layout>
                {sponsorAgentFormShowing ?
                    <SponsorAgentForm
                        active={true}
                        sponsor={this.props.sponsor}
                        editing={isEditingSponsorAgent}
                        type={sponsorAgentFormForType}
                        onCreate={() => this.loadSponsorAgents(sponsorAgentFormForType)}
                        onClose={() => this.setState({ sponsorAgentFormShowing: false, isEditingSponsorAgent: undefined })}
                        onFail={() => console.log("Loading Sponsor Agent Form failed")}
                    /> : <></>
                }
                {showDestructiveForm || <></>}

            </Page>
        );
    }

    private renderItem = (item: ISponsorAgent) => {
        const { id, name, email } = item;
        const media = <Avatar customer size="medium" name={name} />;

        return (
            <ResourceList.Item
                id={`${id}`}
                onClick={() => this.setState({ isEditingSponsorAgent: item, sponsorAgentFormShowing: true })}
                media={media}
                accessibilityLabel={`View details for ${name}`}
                shortcutActions={[
                    {
                        content: 'Edit',
                        onAction: () => this.setState({ isEditingSponsorAgent: item, sponsorAgentFormShowing: true })
                    },
                    {
                        content: 'Delete',
                        onAction: this.handleDeleteSponsorAgent(item)
                    },
                ]}
            >
                <h3>
                    <TextStyle variation="strong">{name}</TextStyle>
                </h3>
                <div>{email}</div>
            </ResourceList.Item>
        );
    };

    loadSponsorAgents(type: "mentor" | "recruiter") {
        if (type == "mentor" && !this.state.loadingMentors) {
            this.setState({ loadingMentors: true });
        }
        else if (type == "recruiter" && !this.state.loadingRecruiters) {
            this.setState({ loadingRecruiters: true });
        }
        axios.post(`/sponsors/dashboard-api/load-agents-${type}.json`, {
            sponsor_id: +this.props.sponsor.id,
            sponsor_slug: this.props.sponsor.slug,
        }).then(res => {
            const status = res.status;
            if (status == 200) {
                const payload = res.data;
                if (payload && "success" in payload && payload["success"] && "agents" in payload) {
                    const agents: ISponsorAgent[] = payload["agents"];
                    if (type == "mentor") { this.setState({ mentors: agents, loadingMentors: false }) }
                    else if (type == "recruiter") { this.setState({ recruiters: agents, loadingRecruiters: false }) }
                    return;
                }
            }
            console.log(status, res.data);
            if (type == "mentor") { this.setState({ loadingMentors: false }) }
            else if (type == "recruiter") { this.setState({ loadingRecruiters: false }) }
        });
    }

    handleDeleteSponsorAgent(agent: ISponsorAgent) {
        return () => {
            const destructor: JSX.Element = (
                <DestructiveConfirmation
                    onConfirm={() => this.deleteSponsorAgent(agent)}
                    onClose={() => this.setState({ showDestructiveForm: undefined })}
                />
            );

            this.setState({ showDestructiveForm: destructor });
        }
    }

    private deleteSponsorAgent(agent: ISponsorAgent) {
        if (agent.type == "mentor" && !this.state.loadingMentors) {
            this.setState({ loadingMentors: true });
        }
        else if (agent.type == "recruiter" && !this.state.loadingRecruiters) {
            this.setState({ loadingRecruiters: true });
        }
        axios.post(`/sponsors/dashboard-api/remove-agent-${agent.type}.json`, {
            sponsor_id: +this.props.sponsor.id,
            sponsor_slug: this.props.sponsor.slug,
            email: agent.email
        }).then(res => {
            const status = res.status;
            if (status == 200) {
                const payload = res.data;
                if ("success" in payload && payload["success"]) {
                    if (agent.type == "mentor") this.loadSponsorAgents("mentor");
                    else if (agent.type == "recruiter") this.loadSponsorAgents("recruiter");
                    return;
                }
            }
            console.log(status, res.data);
            if (agent.type == "mentor") { this.setState({ loadingMentors: false }) }
            else if (agent.type == "recruiter") { this.setState({ loadingRecruiters: false }) }
        });
    }

    private getParameterisedPrivilege(name: string): number {
        const option = this.props.sponsor.privileges.split(";").filter(i => i.startsWith(name));
        if (option.length > 0) {
            const parts = (option[0].split(/\[([^\]]*)\]/));
            if (parts.length == 3) {
                return +(parts[1]);
            }
        }
        return 0;
    }

    private getAddMentorOrLimitButton(inBody: boolean) {
        const currentQuantity = this.state.loadingMentors ? 0 : this.state.mentors.length;
        if (currentQuantity < this.state.mentorsLimit) {
            return (
                <Button
                    plain={inBody ? undefined : true} icon={AddMajor}
                    onClick={() => this.setState({ sponsorAgentFormForType: "mentor", sponsorAgentFormShowing: true })}>
                    {inBody ? "\xa0Add a Mentor" : ""}
                </Button>
            );
        } else {
            return (
                <Button disabled
                    plain={inBody ? undefined : true} icon={AddMajor}>{inBody ? "\xa0Add a Mentor" : ""}
                </Button>
            );
        }
    }

    private getAddRecruiterOrLimitButton(inBody: boolean) {
        const currentQuantity = this.state.loadingRecruiters ? 0 : this.state.recruiters.length;
        if (currentQuantity < this.state.recruitersLimit) {
            return (
                <Button
                    plain={inBody ? undefined : true} icon={AddMajor}
                    onClick={() => this.setState({ sponsorAgentFormForType: "recruiter", sponsorAgentFormShowing: true })}>
                    {inBody ? "\xa0Add a Recruiter" : ""}
                </Button>
            );
        } else {
            return (
                <Button disabled
                    plain={inBody ? undefined : true} icon={AddMajor}>{inBody ? "\xa0Add a Recruiter" : ""}
                </Button>
            );
        }
    }
}

export default withRouter(SponsorPeople);
