import React, { Component } from "react";
import { Page, Card, Banner, Layout, TextField, Button, TextStyle, DisplayText, ResourceList, Avatar, Badge, TextContainer } from "@shopify/polaris";
import { MobilePlusMajor, CirclePlusMajor } from "@shopify/polaris-icons";
import axios from 'axios';
import { ITeamMember } from "../../../interfaces/dashboard.interfaces";
import DestructiveConfirmation from "../../common/DestructiveConfirmation";
import { toast } from 'react-toastify';

interface ITeamApplicationProps {
    teamID: string,
    teamMembers: ITeamMember[] | undefined,
    teamOwner: boolean | undefined,
    canEdit: boolean,
}

interface ITeamApplicationState {
    initialState: boolean,
    doingAction: boolean,
    teamID: string,
    teamMembers: ITeamMember[],
    joinTeamID: string,
    teamOwner: boolean,
    showDestructiveForm: JSX.Element | undefined
}

class TeamApplication extends Component<ITeamApplicationProps, ITeamApplicationState> {

    state = {
        initialState: !this.props.teamMembers || this.props.teamMembers.length == 0,
        doingAction: false,
        teamMembers: this.props.teamMembers || [],
        teamID: this.props.teamID || "Loading...",
        joinTeamID: "",
        teamOwner: this.props.teamOwner || false,
        showDestructiveForm: undefined,
    }
    render() {
        const { initialState, doingAction, showDestructiveForm } = this.state;
        return (
            <Page title={"Team Information"}>
                <Banner status="info">
                    {this.props.canEdit
                        ? <p>You can change this information at any time before the event.</p>
                        : <p>We are sorry, you can no longer edit your team information.</p>
                    }
                </Banner>
                <br />
                <Card sectioned title={"Specifying a Team is Optional"}>
                    <TextContainer>You don't need to already be part of a team to apply for Hack Cambridge (most teams are formed on the first day!), but if you already know who you want to be working with you can all have your applications reviewed together. Not specifying a team will not impact your chance of being accepted.</TextContainer>
                </Card>
                <br />
                {initialState ? this.buildInitialStateForm(doingAction) : this.buildTeamOverview(doingAction)}
                {showDestructiveForm || <></>}
            </Page>
        );
    }

    private buildInitialStateForm(busyState: boolean) {
        const { joinTeamID } = this.state;
        return (
            <Layout>
                <Layout.Section oneHalf>
                    <Card sectioned title={"Create a New Team"}>
                        <Button
                            disabled={!this.props.canEdit}
                            loading={busyState}
                            primary
                            fullWidth
                            onClick={this.createNewTeam}
                            icon={CirclePlusMajor}>
                            &nbsp;New Team
                        </Button>
                    </Card>
                </Layout.Section>
                <Layout.Section oneHalf>
                    <Card sectioned title={"Join Existing Team"}>
                        <TextField
                            label=""
                            placeholder="Team ID"
                            value={joinTeamID}
                            onChange={(s) => this.setState({ joinTeamID: s })}
                            disabled={busyState || !this.props.canEdit}
                            connectedRight={
                                <Button
                                    onClick={this.setTeam}
                                    loading={busyState}
                                    disabled={!this.props.canEdit}
                                    primary
                                    icon={MobilePlusMajor}
                                />
                            }
                        />
                    </Card>
                </Layout.Section>
            </Layout>
        );
    }

    private buildTeamOverview(busyState: boolean) {
        const { teamID, teamMembers, teamOwner } = this.state;
        return (
            <Card>
                <div style={{ padding: "22px" }}>
                    <div style={{ float: "right", color: '#bf0711' }}>
                        <Button onClick={this.leaveTeam} monochrome outline loading={busyState} disabled={!this.props.canEdit} size="slim">Leave Team</Button>
                    </div>
                    <DisplayText size="medium">
                        <TextStyle variation="strong">
                            Team <TextStyle variation="code"><span style={{ padding: "0 5px" }}>{teamID}</span></TextStyle>
                        </TextStyle>
                    </DisplayText>
                </div>
                <ResourceList
                    resourceName={{ singular: 'team member', plural: 'team members' }}
                    items={teamMembers}
                    renderItem={(member: ITeamMember) => {
                        const shortcutActions = teamOwner ? [{
                            disabled: !this.props.canEdit,
                            content: 'Remove',
                            accessibilityLabel: `Remove`,
                            onClick: () => this.removeTeamMember(member)
                        }] : [];
                        return (
                            <ResourceList.Item
                                id={`${member.user_id}`}
                                onClick={() => {
                                    if (teamOwner && this.props.canEdit) {
                                        this.removeTeamMember(member);
                                    }
                                }}
                                shortcutActions={shortcutActions}
                                media={
                                    <Avatar customer size="small" name={member.user_name} source={`https://www.gravatar.com/avatar/${member.user_email_hash}?d=retro`} />
                                }
                            >
                                <h3>
                                    <TextStyle variation="strong">{member.user_name}</TextStyle>
                                    {member.team_owner ? <>&nbsp;<Badge status="info">Owner</Badge></> : <></>}
                                </h3>
                            </ResourceList.Item>
                        );
                    }}
                />
            </Card>
        );
    }

    private createNewTeam = () => {
        if (!this.props.canEdit) return;
        this.setState({ doingAction: true });
        axios.post(`/dashboard-api/create-team.json`, {}).then(res => {
            const status = res.status;
            if (status == 200) {
                const payload = res.data;
                if ("success" in payload && payload["success"]) {
                    const teamMembers: ITeamMember[] = payload["team"];
                    const teamID: string = payload["team_id"];
                    this.setState({
                        initialState: false,
                        doingAction: false,
                        teamID: teamID,
                        teamMembers: teamMembers,
                        teamOwner: true,
                    });
                    toast.success("Created team.");
                    return;
                }
            }
            toast.error("An error occurred.");
            // console.log(status, res.data);
            this.setState({ doingAction: false });
        });
    }

    private leaveTeam = () => {
        if (!this.props.canEdit) return;
        const destructor: JSX.Element = (
            <DestructiveConfirmation
                onConfirm={() => this.handleLeaveTeam()}
                onClose={() => this.setState({ showDestructiveForm: undefined })}
                confirmText={"Yes, leave group"}
            />
        );
        this.setState({ showDestructiveForm: destructor });
    }

    private handleLeaveTeam = () => {
        if (!this.props.canEdit) return;
        this.setState({ doingAction: true });
        axios.post(`/dashboard-api/leave-team.json`, {}).then(res => {
            const status = res.status;
            if (status == 200) {
                const payload = res.data;
                if ("success" in payload && payload["success"]) {
                    this.setState({
                        initialState: true,
                        doingAction: false,
                        teamID: "Loading...",
                        teamMembers: [],
                        teamOwner: false,
                    });
                    toast.info("Left team.");
                    return;
                }
            }
            toast.error("An error occurred.");
            // console.log(status, res.data);
            this.setState({ doingAction: false });
        });
    }


    private setTeam = () => {
        if (!this.props.canEdit) return;
        const { joinTeamID } = this.state;
        this.setState({ doingAction: true });
        axios.post(`/dashboard-api/set-team.json`, {
            "team_id": joinTeamID
        }).then(res => {
            const status = res.status;
            if (status == 200) {
                const payload = res.data;
                if ("success" in payload && payload["success"]) {
                    const teamMembers: ITeamMember[] = payload["team"];
                    const teamID: string = joinTeamID;
                    this.setState({
                        initialState: false,
                        doingAction: false,
                        teamID: teamID,
                        teamMembers: teamMembers,
                        joinTeamID: "",
                    });
                    toast.success("Successfully joined team.");
                    return;
                }
                else if ("success" in payload) {
                    toast.error(payload["message"]);
                    this.setState({ doingAction: false });
                    return;
                }
            }
            toast.error("An error occurred.");
            // console.log(status, res.data);
            this.setState({ doingAction: false });
        });
    }

    private removeTeamMember = (member: ITeamMember) => {
        if (!this.props.canEdit) return;
        if (!member.team_owner) {
            const destructor: JSX.Element = (
                <DestructiveConfirmation
                    onConfirm={() => this.handleTeamMemberRemoval(member)}
                    onClose={() => this.setState({ showDestructiveForm: undefined })}
                    title={`Remove ${member.user_name} from this group?`}
                    confirmText={"Yes, remove them"}
                />
            );

            this.setState({ showDestructiveForm: destructor });
        } else {
            const destructor: JSX.Element = (
                <DestructiveConfirmation
                    onConfirm={() => this.handleLeaveTeam()}
                    onClose={() => this.setState({ showDestructiveForm: undefined })}
                    title={`Are you sure?`}
                    confirmText={"Yes, I want to leave the team"}
                />
            );

            this.setState({ showDestructiveForm: destructor });
        }
    }

    private handleTeamMemberRemoval = (member: ITeamMember) => {
        this.setState({ doingAction: true });
        axios.post(`/dashboard-api/remove-team-member.json`, {
            "team_id": member.team_id,
            "user_id": member.user_id,
        }).then(res => {
            const status = res.status;
            if (status == 200) {
                const payload = res.data;
                if ("success" in payload && payload["success"]) {
                    const teamMembers: ITeamMember[] = payload["team"];
                    this.setState({
                        initialState: false,
                        doingAction: false,
                        teamMembers: teamMembers,
                    });
                    return;
                }
            }
            // console.log(status, res.data);
            this.setState({ doingAction: false });
        });
    }
}

export default TeamApplication;
