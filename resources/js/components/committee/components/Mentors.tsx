import React, { Component } from 'react';
import { Page, Card, ResourceList, Avatar, TextStyle, Layout, Button } from "@shopify/polaris";
import axios from 'axios';
import { toast } from 'react-toastify';
import { ICommitteeProps, IMentor } from '../../../interfaces/committee.interfaces';
import { RouteComponentProps } from "react-router-dom";
import { AddMajor } from '@shopify/polaris-icons';
import MentorForm from './Mentor/MentorForm';
import DestructiveConfirmation from '../../common/DestructiveConfirmation';

type IMentorListProps = RouteComponentProps & ICommitteeProps;

interface IMentorListState {
    mentors: IMentorDetails[],
    showDestructiveForm: JSX.Element | undefined,
    isEditingMentor: IMentor | undefined,
    mentorFormShowing: boolean,
    isLoading: boolean,
}

interface IMentorDetails {
    name: string,
    email: string,
    id: number,
}

class Mentors extends Component<IMentorListProps, IMentorListState> {

    state = {
        mentors: [],
        showDestructiveForm: undefined,
        isEditingMentor: undefined,
        mentorFormShowing: false,
        isLoading: true,
    }

    componentDidMount() {
        this.loadMentors();
    }

    render() {
        const { isLoading, mentors, isEditingMentor, mentorFormShowing, showDestructiveForm } = this.state;
        const resourceName = {
            singular: 'mentor',
            plural: 'mentors',
        };

        return (<>
            <Page title="Mentors">
                <Layout>
                    <Layout.Section>
                        <Card title="Access">
                            {isLoading || mentors.length > 0 ?
                                <ResourceList
                                    loading={isLoading}
                                    items={mentors}
                                    renderItem={this.renderItem}
                                    resourceName={resourceName}
                                    alternateTool={
                                        <Button
                                            plain icon={AddMajor}
                                            onClick={() => this.setState({ mentorFormShowing: true })}>
                                        </Button>}
                                />
                                : <Card.Section>
                                    <Button
                                        icon={AddMajor}
                                        onClick={() => this.setState({ mentorFormShowing: true })}
                                    >
                                        &nbsp;Add a Mentor
                                    </Button>
                                </Card.Section>}
                        </Card>
                    </Layout.Section>
                </Layout>
            </Page>
            {mentorFormShowing ?
                <MentorForm
                    active={true}
                    editing={isEditingMentor}
                    onCreate={() => {
                        toast.success("Added Mentor");
                        this.loadMentors();
                    }}
                    onFail={(error_string) => {
                        toast.error(error_string);
                    }}
                    onClose={() => this.setState({ mentorFormShowing: false, isEditingMentor: undefined })}
                /> : <></>
            }
            {showDestructiveForm || <></>}
        </>);
    }

    private renderItem = (item: IMentor) => {
        const { id, name, email } = item;
        const media = <Avatar customer size="medium" name={name} />;

        return (
            <ResourceList.Item
                id={`${id}`}
                onClick={() => this.setState({ isEditingMentor: item, mentorFormShowing: true })}
                media={media}
                accessibilityLabel={`View details for ${name}`}
                shortcutActions={[
                    {
                        content: 'Edit',
                        onAction: () => this.setState({ isEditingMentor: item, mentorFormShowing: true })
                    },
                    {
                        content: 'Delete',
                        onAction: this.handleDeleteMentor(item)
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

    handleDeleteMentor(mentor: IMentor) {
        return () => {
            const destructor: JSX.Element = (
                <DestructiveConfirmation
                    onConfirm={() => this.deleteMentor(mentor)}
                    onClose={() => this.setState({ showDestructiveForm: undefined })}
                />
            );

            this.setState({ showDestructiveForm: destructor });
        }
    }

    private loadMentors = () => {
        this.setState({ isLoading: true });
        axios.get(`/committee/admin-api/get-mentors.json`).then(res => {
            const status = res.status;
            if (status == 200) {
                const payload = res.data;
                if ("success" in payload && payload["success"]) {
                    const mentors: IMentorDetails[] = payload["mentors"];
                    this.setState({
                        mentors: mentors,
                        isLoading: false,
                    });
                    return;
                }
            }
            toast.error("Failed to load mentors.");
            this.setState({ isLoading: false });
        });
    }

    private deleteMentor(mentor: IMentor) {
        if (!this.state.isLoading) {
            this.setState({ isLoading: true });
        }
        axios.post(`/committee/admin-api/remove-mentor.json`, {
            email: mentor.email
        }).then(res => {
            const status = res.status;
            if (status == 200) {
                console.log(res.data);
                const payload = res.data;
                if ("success" in payload && payload["success"]) {
                    this.loadMentors();
                    toast.success("Successfully deleted mentor.");
                    return;
                } else {
                    toast.error(payload["message"]);
                }
            } else {
                toast.error("An error occurred");
            }
            this.setState({ isLoading: false });
        });
    }
}

export default Mentors;
