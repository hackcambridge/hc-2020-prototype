import React, { Component } from "react";
import { Page, Card, Heading, Layout, SkeletonBodyText, TextContainer, Thumbnail, TextField, Subheading, Autocomplete, Stack, Tag, Button, Icon } from "@shopify/polaris";
import { RouteComponentProps } from "react-router";
import { withRouter } from "react-router-dom";
import md5 from "md5";
import { IUserDetails } from "../../../interfaces/committee.interfaces";
import { toast } from "react-toastify";
import axios from "axios";
import { SearchMinor } from "@shopify/polaris-icons";

interface IHackerProfileState {
    loading: boolean,
    user: IUserDetails | undefined,
    currentTag: string,
    tagOptions: { value: string, label: string }[],
    workIdeas: string,
    workTags: Array<string>,
}
const options = [
    { value: 'Machine Learning', label: 'Machine Learning' },
    { value: 'Computer Vision', label: 'Computer Vision' },
    { value: 'E-Commerce', label: 'E-Commerce' },
    { value: 'Robotics', label: 'Robotics' },
    { value: 'Neural Networks', label: 'Neural Networks' },
];


class Profile extends Component<RouteComponentProps, IHackerProfileState> {

    state = {
        loading: false,
        user: undefined,
        currentTag: "",
        tagOptions: options,
        workIdeas: "",
        workTags: [],
    }

    componentWillMount() {
        this.retrieveProfile();
    }

    render() {
        const { loading } = this.state;
        return (<>
            { loading
                ? this.loadingMarkup
                : this.renderProfile()
            }
        </>);
    }

    private loadingMarkup = <>
        <Page title={"Loading..."}>
            <Card sectioned>
                <SkeletonBodyText />
            </Card>
        </Page>
    </>;

    private renderProfile = () => {
        const { user }: { user: IUserDetails | undefined } = this.state;
        const { currentTag, tagOptions, workIdeas, workTags } = this.state;
        if (user) {
            const usr: IUserDetails = user;
            const profile = JSON.parse(usr.profile);
            const eventDetails = JSON.parse(usr.eventDetails || "{}");
            const textTagField = (<Autocomplete.TextField
                onChange={this.updateTagText}
                label="Tags"
                value={currentTag}
                placeholder="Machine learning, Big Data, AI"
            />);
            const emptyState = (
                <React.Fragment>
                    <Icon source={SearchMinor} />
                    <div style={{ textAlign: 'center' }}>
                        <Button plain monochrome onClick={this.newTag}>Add {currentTag}</Button>
                    </div>
                </React.Fragment>
            );
            return (
                <Page
                    title={`${usr.name}`}
                    subtitle={`${"school" in profile ? (profile["school"]["name"] || "") : ""}`}
                    thumbnail={<Thumbnail
                        source={`https://www.gravatar.com/avatar/${md5(usr.email.toLowerCase())}?d=retro&s=200`}
                        size="large"
                        alt={`${usr.name}`}
                    />}
                >
                    <Layout>
                        <Layout.Section>
                            <Card>
                                <div style={{ padding: "1.4rem 2rem" }}>
                                    <Heading>Information for team forming</Heading>
                                    <br />
                                    <TextField label="Ideas I would be interested working in" value={workIdeas} onChange={this.handleIdeasChange} multiline={4} />
                                    <br />
                                    <Subheading>Areas I would be interested working in:</Subheading>
                                    <br />
                                    <TextContainer>
                                        <Stack>
                                            {workTags.map(idea =>
                                                <Tag key={idea} onRemove={() => { this.removeTag(idea) }}>{idea}</Tag>)}
                                        </Stack>
                                    </TextContainer>
                                    <br />
                                    <Autocomplete
                                        allowMultiple
                                        options={tagOptions}
                                        selected={workTags}
                                        textField={textTagField}
                                        onSelect={this.updateTags}
                                        listTitle="Suggested Tags"
                                        emptyState={emptyState}
                                    />
                                    <br />
                                    <Button primary size="slim" onClick={this.saveProfile}>Save</Button>
                                </div>
                            </Card>
                        </Layout.Section>
                    </Layout>
                    <br />
                    <Card sectioned title="Workshop attendance">
                        <TextContainer>
                            {"workshops" in eventDetails && eventDetails["workshops"].length > 0 ? eventDetails["workshops"].join(", ") : <i>(None)</i>}
                        </TextContainer>
                    </Card>
                </Page>
            );
        }
    };

    private newTag = () => {
        const { workTags}:{workTags: string[]} = this.state;
        const { currentTag } = this.state;
        workTags.push(currentTag);
        this.setState({ workTags: workTags, currentTag: '' });
    }

    private updateTagText = (newValue: string) => {
        this.setState({ currentTag: newValue });

        if (newValue === "") {
            this.setState({ tagOptions: options });
            return;
        }

        const filterRegex = new RegExp(newValue, 'i');
        const resultOptions = options.filter((option) =>
            option.label.match(filterRegex),
        );
        let endIndex = resultOptions.length - 1;
        if (resultOptions.length === 0) {
            endIndex = 0;
        }
        this.setState({ tagOptions: resultOptions });
    }

    private handleIdeasChange = (newIdeas: string) => {
        this.setState({
            workIdeas: newIdeas,
        });
    }

    private updateTags = (tags: string[]) => {
        this.setState({ workTags: tags });
    }

    private removeTag = (idea: string) => {
        const { workTags }: { workTags: string[] } = this.state;
        const index = workTags.indexOf(idea, 0);
        if (index > -1) {
            workTags.splice(index, 1);
        }
        this.setState({ workTags: workTags });
    }

    private retrieveProfile = () => {
        this.setState({ loading: true });
        axios.get("/dashboard-api/get-profile.json")
            .then(res => {
                const status = res.status;
                if (status == 200) {
                    const payload = res.data;
                    if ("success" in payload && payload["success"]) {
                        const user: IUserDetails = payload["user"];
                        const eventDetails = JSON.parse(user.eventDetails || "{}");
                        this.setState({
                            loading: false,
                            user: user,
                            workIdeas: "ideas" in eventDetails ? eventDetails["ideas"] : "",
                            workTags: "tags" in eventDetails ? eventDetails["tags"] : [],
                        });
                    } else {
                        toast.error(payload["message"]);
                    }
                } else {
                    toast.error("Failed to load user profile.");
                }

                this.setState({ loading: false });
            });
    }

    private saveProfile = () => {
        const { user }: { user: IUserDetails | undefined } = this.state;
        const { workIdeas, workTags} = this.state;
        if (user) {
            const usr: IUserDetails = user;
            var newEventDetails = JSON.parse(usr.eventDetails || "{}");
            newEventDetails["ideas"] = workIdeas;
            newEventDetails["tags"] = workTags;
            axios.post("/dashboard-api/update-profile.json", {
                eventDetails: JSON.stringify(newEventDetails),
            })
                .then(res => {
                    const status = res.status;
                    if (status == 200) {
                        const payload = res.data;
                        if ("success" in payload && payload["success"]) {
                            this.renderProfile();
                            toast.success("Successfully updated profile.")
                        } else {
                            toast.error(payload["message"]);
                        }
                    } else {
                        toast.error("Failed to save profile information.");
                    }

                    this.setState({ loading: false });
                });
        } else {
            toast.error("No user found.")
        }
    }

}

export default withRouter(Profile);
