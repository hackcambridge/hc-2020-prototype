import React, { Component } from "react";
import { RouteComponentProps, withRouter } from "react-router-dom";
import { Page, ChoiceList, TextField, Layout, Card, Avatar, ResourceList, TextStyle, Button } from "@shopify/polaris";
import { AddMajor } from '@shopify/polaris-icons';
import { ISponsorAgent, ISponsorData } from "../../../interfaces/sponsors.interfaces";
import axios from "axios";
import SponsorAgentForm from "./Agents/SponsorAgentForm";
import DestructiveConfirmation from "./common/DestructiveConfirmation";
import { toast } from "react-toastify";

interface ISponsorAdminProps extends RouteComponentProps {
    baseSponsorPath: string,
    sponsor: ISponsorData,
    onUpdate: () => void
}

interface ISponsorAdminState {
    selected: string[]
    packageName: string,
    recruiters: number,
    mentors: number,
    doingSave: boolean,
    loadingAgents: boolean,
    agents: ISponsorAgent[],
    sponsorAgentFormShowing: boolean,
    isEditingSponsorAgent: ISponsorAgent | undefined,
    showDestructiveForm: JSX.Element | undefined
}

class SponsorAdmin extends Component<ISponsorAdminProps, ISponsorAdminState> {

    state = {
        selected: this.parsePrivilegeString(),
        packageName: this.props.sponsor.tier,
        recruiters: this.getParameterisedPrivilege("recruiters"),
        mentors: this.getParameterisedPrivilege("mentors"),
        doingSave: false,
        loadingAgents: true,
        agents: [],
        sponsorAgentFormShowing: false,
        isEditingSponsorAgent: undefined,
        showDestructiveForm: undefined
    };

    private privilegeTextOptions = [
        {
            label: 'Can bring swag',
            value: 'swag',
        },
        {
            label: 'Can advertise hardware or an API',
            value: 'resources',
        },
        {
            label: 'Can do a workshop',
            value: 'workshop',
        },
        {
            label: 'Can have a social media shoutout',
            value: 'social_media',
        },
        {
            label: 'Can give a product/themed prize',
            value: 'prizes',
        },
        {
            label: 'Can give a product demo',
            value: 'demo',
        },
        {
            label: 'Can give opening ceremony presentation',
            value: 'presentation',
        },
        {
            label: 'Can view and review hackers\' applications',
            value: 'reviewing',
        }
    ];

    componentDidMount() {
        this.loadSponsorAgents();
    }

    render() {
        const {
            selected,
            packageName,
            recruiters,
            mentors,
            doingSave,
            agents,
            loadingAgents,
            sponsorAgentFormShowing,
            isEditingSponsorAgent,
            showDestructiveForm
        } = this.state;
        const resourceName = {
            singular: 'sponsor agent',
            plural: 'sponsor agents',
        };

        return (
            <Page
                breadcrumbs={[{ content: `${this.props.sponsor.name}`, url: `${this.props.baseSponsorPath}overview` }]}
                title="Admin"
                primaryAction={{ content: 'Delete', onAction: this.handleDeleteClicked, destructive: true }}
            >
                <Layout>
                    <Layout.Section oneHalf>
                        <Card title="Details">
                            <Card.Section>
                                <TextField label="Package Name" value={packageName} onChange={this.handlePackageNameChange} />
                                <br style={{ margin: "20px" }} />
                                <ChoiceList
                                    allowMultiple
                                    title={'Privileges'}
                                    choices={this.privilegeTextOptions}
                                    selected={selected}
                                    onChange={this.handlePrivilegeChange}
                                />
                                <br style={{ margin: "20px" }} />
                                <TextField
                                    label="Recruiters"
                                    type="number"
                                    value={`${recruiters}`}
                                    onChange={this.handleRecruiterNumberChange}
                                />
                                <br style={{ margin: "20px" }} />
                                <TextField
                                    label="Mentors"
                                    type="number"
                                    value={`${mentors}`}
                                    onChange={this.handleMentorNumberChange}
                                />
                                <br style={{ margin: "20px" }} />
                                <Button onClick={this.handleSaveClicked} loading={doingSave} primary>Save</Button>
                            </Card.Section>
                        </Card>
                    </Layout.Section>
                    <Layout.Section oneHalf>
                        <Card title="Access">
                            {loadingAgents || agents.length > 0 ?
                                <ResourceList
                                    loading={loadingAgents}
                                    items={agents}
                                    renderItem={this.renderItem}
                                    resourceName={resourceName}
                                    alternateTool={
                                        <Button
                                            plain icon={AddMajor}
                                            onClick={() => this.setState({ sponsorAgentFormShowing: true })}>
                                        </Button>}
                                />
                                : <Card.Section>
                                    <Button
                                        icon={AddMajor}
                                        onClick={() => this.setState({ sponsorAgentFormShowing: true })}
                                    >
                                        &nbsp;Add a Sponsor Agent
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
                        onCreate={() => {
                            toast.success("Created sponsor agent");
                            this.loadSponsorAgents();
                        }}
                        onFail={(error_string) => {
                            toast.error(error_string);
                        }}
                        onClose={() => this.setState({ sponsorAgentFormShowing: false, isEditingSponsorAgent: undefined })}
                    /> : <></>
                }
                {showDestructiveForm || <></>}
            </Page>
        );
    }

    handlePrivilegeChange = (value: string[]) => {
        this.setState({ selected: value });
    };

    handlePackageNameChange = (value: string) => {
        this.setState({ packageName: value });
    }

    handleRecruiterNumberChange = (value: string) => {
        this.setState({ recruiters: +value });
    }

    handleMentorNumberChange = (value: string) => {
        this.setState({ mentors: +value });
    }

    handleSaveClicked = () => {
        this.setState({ doingSave: true });
        axios.post(`/sponsors/dashboard-api/update-sponsor.json`, {
            sponsor_id: this.props.sponsor.id,
            sponsor_slug: this.props.sponsor.slug,
            tier: this.state.packageName || "",
            privileges: this.generatePrivilegeString()
        }).then(res => {
            const status = res.status;
            if (status == 200 || status == 201) {
                toast.success("Sponsor updated");
                this.props.onUpdate();
            } else {
                toast.error("An error occurred");
            }
            this.setState({ doingSave: false });
        });
    }

    handleDeleteClicked = () => {
        const destructor: JSX.Element = (
            <DestructiveConfirmation
                title={`Are you sure you want to delete '${this.props.sponsor.name}'?`}
                onConfirm={this.doDeleteSponsor}
                onClose={() => this.setState({ showDestructiveForm: undefined })}
            />
        );

        this.setState({ showDestructiveForm: destructor });
    }

    private doDeleteSponsor = () => {
        axios.post(`/sponsors/dashboard-api/delete-sponsor.json`, {
            sponsor_id: +this.props.sponsor.id,
            sponsor_slug: this.props.sponsor.slug,
        }).then(res => {
            const status = res.status;
            if (status == 200) {
                const payload = res.data;
                if ("success" in payload && payload["success"]) {
                    this.props.onUpdate();
                    this.props.history.push('/sponsors/dashboard/');
                    toast.success("Sponsor deleted");
                    return;
                } else {
                    toast.error(`An error occurred. ${payload["message"]}`);
                }
            } else {
                toast.error(`An error occurred`);
            }
            console.log(status, res.data);
            this.setState({ loadingAgents: false });
        });
    }

    private generatePrivilegeString(): string {
        const textOptions = this.state.selected.join(";");
        const optionsArray = [textOptions];
        if (this.state.mentors > 0) {
            optionsArray.push(`mentors[${this.state.mentors}]`);
        }
        if (this.state.recruiters > 0) {
            optionsArray.push(`recruiters[${this.state.recruiters}]`);
        }
        return optionsArray.join(";");
    }

    private parsePrivilegeString(): string[] {
        return this.props.sponsor.privileges.split(";").filter(i => !i.includes("["));
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

    loadSponsorAgents() {
        if (!this.state.loadingAgents) {
            this.setState({ loadingAgents: true });
        }
        axios.post(`/sponsors/dashboard-api/load-agents-access.json`, {
            sponsor_id: +this.props.sponsor.id,
            sponsor_slug: this.props.sponsor.slug,
            type: "access"
        }).then(res => {
            const status = res.status;
            if (status == 200) {
                const payload = res.data;
                if (payload && "success" in payload && payload["success"] && "agents" in payload) {
                    const agents: ISponsorAgent[] = payload["agents"];
                    this.setState({ agents: agents, loadingAgents: false });
                    return;
                }
            }
            console.log(status, res.data);
            this.setState({ loadingAgents: false });
        });
    }

    private deleteSponsorAgent(agent: ISponsorAgent) {
        if (!this.state.loadingAgents) {
            this.setState({ loadingAgents: true });
        }
        axios.post(`/sponsors/dashboard-api/remove-agent-access.json`, {
            sponsor_id: +this.props.sponsor.id,
            sponsor_slug: this.props.sponsor.slug,
            email: agent.email
        }).then(res => {
            const status = res.status;
            if (status == 200) {
                console.log(res.data);
                const payload = res.data;
                if ("success" in payload && payload["success"]) {
                    this.loadSponsorAgents();
                    toast.success("Successfully deleted sponsor agent.");
                    return;
                } else {
                    toast.error(payload["message"]);
                }
            } else {
                toast.error("An error occurred");
            }
            console.log(status, res.data);
            this.setState({ loadingAgents: false });
        });
    }

}

export default withRouter(SponsorAdmin);
