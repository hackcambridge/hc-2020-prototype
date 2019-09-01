import React, { Component } from "react";
import { Page, Badge, Card, DisplayText, Layout, ResourceList, Button, Avatar, TextStyle } from "@shopify/polaris";
import { ISponsorData, ISponsorAgent } from "../../../interfaces/sponsors.interfaces";
import { RouteComponentProps, withRouter } from "react-router";
import SponsorAgentForm from "./SponsorAgentForm";
import { AddMajorMonotone } from "@shopify/polaris-icons";
import axios from "axios";
import DestructiveConfirmation from "./DestructiveConfirmation";

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
        recruiters: [],
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
            sponsorAgentFormForType
        } = this.state;
        return (
            <Page
                breadcrumbs={[{
                    content: this.props.sponsor.name, 
                    url: this.props.baseSponsorPath
                }]}
                title="People"
                // titleMetadata={<Badge status="attention">Outstanding</Badge>}
                // primaryAction={{content: 'Save', disabled: false}}
                // secondaryActions={[{content: 'Duplicate'}, {content: 'View on your store'}]}
            >
                <Card>
                    <div style={{ padding: "2rem" }}>
                        <DisplayText size="small">This is where we explain what the f*ck is going on.</DisplayText>
                    </div>
                </Card>
                <br style={{ margin: "30px" }} />
                <Layout>
                    <Layout.Section oneHalf>
                        <Card title="Mentors">
                            {loadingMentors || mentors.length > 0 ?
                                <ResourceList
                                    loading={loadingMentors}
                                    items={mentors}
                                    renderItem={this.renderItem}
                                    resourceName={{
                                        singular: 'mentor',
                                        plural: 'mentors',
                                    }}
                                    alternateTool={
                                        <Button 
                                            plain icon={AddMajorMonotone} 
                                            onClick={() => this.setState({ sponsorAgentFormForType: "mentor", sponsorAgentFormShowing: true })}>
                                        </Button>
                                    }
                                />
                            :  <Card.Section>
                                    <Button 
                                        icon={AddMajorMonotone} 
                                        onClick={() => this.setState({ sponsorAgentFormForType: "mentor", sponsorAgentFormShowing: true })}
                                    >
                                        &nbsp;Add a Mentor
                                    </Button>
                                </Card.Section>}
                        </Card>
                    </Layout.Section>
                    <Layout.Section oneHalf>
                    <Card title="Recruiters">
                            {loadingRecruiters || recruiters.length > 0 ?
                                <ResourceList
                                    loading={loadingRecruiters}
                                    items={recruiters}
                                    renderItem={this.renderItem}
                                    resourceName={{
                                        singular: 'recruiter',
                                        plural: 'recruiters',
                                    }}
                                    alternateTool={
                                        <Button 
                                            plain icon={AddMajorMonotone} 
                                            onClick={() => this.setState({ sponsorAgentFormForType: "recruiter", sponsorAgentFormShowing: true })}>
                                        </Button>}
                                />
                            :  <Card.Section>
                                    <Button 
                                        icon={AddMajorMonotone} 
                                        onClick={() => this.setState({ sponsorAgentFormForType: "recruiter", sponsorAgentFormShowing: true,  })}
                                    >
                                        &nbsp;Add a Recruiter
                                    </Button>
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
                    /> : <></>
                }
                {showDestructiveForm || <></>}

            </Page>
        );
    }

    private renderItem = (item: ISponsorAgent) => {
        const {id, name, email} = item;
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
        if(type == "mentor" && !this.state.loadingMentors) {
            this.setState({ loadingMentors: true });
        }
        else if(type == "recruiter" && !this.state.loadingRecruiters) {
            this.setState({ loadingRecruiters: true });
        }
        axios.post(`/sponsors/dashboard-api/load-agents-${type}.json`, {
            sponsor_id: +this.props.sponsor.id,
            sponsor_slug: this.props.sponsor.slug,
        }).then(res => {
            const status = res.status;
            if(status == 200) {
                const payload = res.data;
                if(payload && "success" in payload && payload["success"] && "agents" in payload) {
                    const agents : ISponsorAgent[] = payload["agents"];
                    if(type == "mentor") { this.setState({ mentors: agents, loadingMentors: false }) }
                    else if(type == "recruiter") { this.setState({ recruiters: agents, loadingRecruiters: false }) }
                    return;
                }
            }
            console.log(status, res.data);
            if(type == "mentor") { this.setState({ loadingMentors: false }) }
            else if(type == "recruiter") { this.setState({ loadingRecruiters: false }) }
        });
    }

    handleDeleteSponsorAgent(agent: ISponsorAgent) {
        return () => {
            const destructor : JSX.Element = (
                <DestructiveConfirmation 
                    onConfirm={() => this.deleteSponsorAgent(agent)}
                    onClose={() => this.setState({ showDestructiveForm: undefined })}
                />
            );
    
            this.setState({ showDestructiveForm: destructor });
        }
    }

    private deleteSponsorAgent(agent: ISponsorAgent) {
        if(agent.type == "mentor" && !this.state.loadingMentors) {
            this.setState({ loadingMentors: true });
        }
        else if(agent.type == "recruiter" && !this.state.loadingRecruiters) {
            this.setState({ loadingRecruiters: true });
        }
        axios.post(`/sponsors/dashboard-api/remove-agent-${agent.type}.json`, {
            sponsor_id: +this.props.sponsor.id,
            sponsor_slug: this.props.sponsor.slug,
            email: agent.email
        }).then(res => {
            const status = res.status;
            if(status == 200) {
                const payload = res.data;
                if("success" in payload && payload["success"]) {
                    if(agent.type == "mentor") this.loadSponsorAgents("mentor");
                    else if(agent.type == "recruiter") this.loadSponsorAgents("recruiter");
                    return;
                }
            }
            console.log(status, res.data);
            if(agent.type == "mentor") { this.setState({ loadingMentors: false }) }
            else if(agent.type == "recruiter") { this.setState({ loadingRecruiters: false }) }        });
    }
}

export default withRouter(SponsorPeople);