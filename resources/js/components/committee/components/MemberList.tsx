import React, { Component } from 'react';
import { Page, Card, ResourceList, Avatar, TextStyle, TextContainer, Layout, Spinner } from "@shopify/polaris";
import axios from 'axios';
import { toast } from 'react-toastify';
import { ICommitteeProps } from '../../../interfaces/committee.interfaces';
import md5 from 'md5';
import DestructiveConfirmation from '../../common/DestructiveConfirmation';
import { RouteComponentProps } from "react-router-dom";

type IMemberListProps = RouteComponentProps & ICommitteeProps;

interface IMemberListState {
    admins: IMemberDetails[],
    committee: IMemberDetails[],
    showDestructiveForm: JSX.Element | undefined,
    isLoading: boolean,
}

interface IMemberDetails {
    name: string,
    email: string,
    id: number,
    type: string,
}

class MemberList extends Component<IMemberListProps, IMemberListState> {
    
    state = {
        admins: [],
        committee: [],
        showDestructiveForm: undefined,
        isLoading: true,
    }

    componentDidMount() {
        this.loadMembers();
    }

    render() {
        const { isLoading, admins, committee, showDestructiveForm } = this.state;
        return (<>
            <Page title="Members">
                <Layout>
                <Layout.Section oneHalf>
                    {this.generateMembersList(isLoading, 'Committee', committee)}
                </Layout.Section>
                <Layout.Section oneHalf>
                    {this.generateMembersList(isLoading, 'Admins', admins)}
                </Layout.Section>
                </Layout>
            </Page>
            {showDestructiveForm || <></>}
        </>);
    }

    private generateMembersList(loading: boolean, title: string, members: IMemberDetails[]) {
        if(members.length == 0) {
            return (
                <Card sectioned title={title}>
                    {loading ?
                        <Spinner size="small" color="teal" /> :
                        <TextContainer>No-one's here...</TextContainer>
                    }
                </Card>
            );      
        }
        return (
            <Card title={title}>
                <ResourceList
                loading={loading}
                resourceName={{singular: 'person', plural: 'people'}}
                items={members}
                renderItem={(item: IMemberDetails) => {
                    const media = item.email.length > 0 
                        ? <Avatar customer size="medium" source={`https://www.gravatar.com/avatar/${md5(item.email.toLowerCase())}?d=retro`} />
                        : <></>;
                    return (
                        <ResourceList.Item id={`${item.id}`} url={""} media={media}
                            onClick={() => this.toggleAdmin(item)}
                        >
                            <h3><TextStyle variation="strong">{item.name}</TextStyle></h3>
                            <div>{item.email}</div>
                        </ResourceList.Item>
                    );
                }}
                />
            </Card>
        );
    }


    private toggleAdmin = (member: IMemberDetails) => {
        // if(member.email == this.props.user.email) {
        //     toast.error("Can't change your own account.");
        //     return;
        // }
        if(member.type == "admin") {
            const destructor : JSX.Element = (
                <DestructiveConfirmation 
                    title={`Are you sure you want to demote ${member.name}?`}
                    onConfirm={() => this.modifyMember(member, "demote-admin")}
                    onClose={() => this.setState({ showDestructiveForm: undefined })}
                />
            );
            this.setState({ showDestructiveForm: destructor });

        } else if(member.type == "committee") {
            const destructor : JSX.Element = (
                <DestructiveConfirmation 
                    title={`Are you sure you want to promote ${member.name}?`}
                    onConfirm={() => this.modifyMember(member, "promote-committee")}
                    onClose={() => this.setState({ showDestructiveForm: undefined })}
                />
            );
            this.setState({ showDestructiveForm: destructor });

        } else {
            toast.error(`${member.name} is a ${member.type}!`);
        }
    }


    private modifyMember(member: IMemberDetails, endpoint: string) {
        this.setState({ isLoading: true });
        axios.post(`/committee/admin-api/${endpoint}.json`, {
            id: member.id,
            email: member.email,
        }).then(res => {
            const status = res.status;
            if(status == 200) {
                const payload = res.data;
                if("success" in payload && payload["success"]) {
                    if("message" in payload) {
                        toast.success(payload["message"]);
                        this.setState({ isLoading: false });
                        return;
                    }
                    const admins: IMemberDetails[] = payload["admins"];
                    const committee: IMemberDetails[] = payload["committee"];
                    this.setState({ 
                        admins: admins,
                        committee: committee,
                        isLoading: false,
                    });
                    return;
                } else {
                    toast.error(payload["message"]); 
                    this.setState({ isLoading: false });
                    return;
                }
            }
            toast.error("Failed to demote admin.");
            // console.log(status, res.data);
            this.setState({ isLoading: false });
        });
    }

    private loadMembers = () => {
        this.setState({ isLoading: true });
        axios.get(`/committee/admin-api/get-members.json`).then(res => {
            const status = res.status;
            if(status == 200) {
                const payload = res.data;
                if("success" in payload && payload["success"]) {
                    const admins: IMemberDetails[] = payload["admins"];
                    const committee: IMemberDetails[] = payload["committee"];
                    this.setState({ 
                        admins: admins,
                        committee: committee,
                        isLoading: false,
                    });
                    return;
                }
            }
            toast.error("Failed to load members.");
            // console.log(status, res.data);
            this.setState({ isLoading: false });
        });
    }
}

export default MemberList;
