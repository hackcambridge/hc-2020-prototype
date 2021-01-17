import React, { Component } from 'react';
import { Page, Card, ResourceList, Avatar, TextStyle, Heading, Filters, Checkbox, Autocomplete, Button, Stack, Tag, TextContainer, Icon, EmptyState } from "@shopify/polaris";
import axios from 'axios';
import { IHackerSummary } from '../../../interfaces/committee.interfaces';
import { toast } from 'react-toastify';
import md5 from 'md5';
import { SearchMinor } from '@shopify/polaris-icons';
import { tag_options } from '../../../data/tag.options';

interface ITeamMatchProps {

}

interface ITeamMatchState {
    isLoading: boolean,
    hackers: IHackerSummary[],
    filterValue: string,
    currentTag: string,
    tagOptions: { value: string, label: string }[],
    appliedTags: Array<string>,
    teamed: boolean,
}

class TeamMatch extends Component<ITeamMatchProps, ITeamMatchState> {

    state = {
        isLoading: false,
        hackers: [],
        filterValue: "",
        currentTag: "",
        tagOptions: tag_options,
        appliedTags: [],
        teamed: false,
    }

    private newTag = () => {
        const { appliedTags }: { appliedTags: string[] } = this.state;
        const { currentTag } = this.state;
        appliedTags.push(currentTag);
        this.setState({ appliedTags: appliedTags, currentTag: '' });
    }

    private updateTagText = (newValue: string) => {
        this.setState({ currentTag: newValue });

        if (newValue === "") {
            this.setState({ tagOptions: tag_options });
            return;
        }

        this.setState({ tagOptions: []});
    }

    private updateTags = (tags: string[]) => {
        this.setState({ appliedTags: tags });
    }

    private handleTeamedChange = (teamed: boolean) => {
        this.setState({ teamed: teamed });
    }

    private handleRemoveTag = (tag: string) => {
        const { appliedTags }: { appliedTags: string[] } = this.state;
        const index = appliedTags.indexOf(tag, 0);
        if (index > -1) {
            appliedTags.splice(index, 1);
        }
        this.setState({ appliedTags: appliedTags });
    }

    render() {
        const { isLoading, hackers, filterValue, currentTag, appliedTags, teamed, tagOptions } = this.state;

        const includeTeamedFilter = {
            key: 'includeTeamed',
            label: 'Include hackers with teams',
            filter: (
                <Checkbox
                    label="Include hackers with teams"
                    checked={teamed}
                    onChange={this.handleTeamedChange}
                />
            ),
            shortcut: true,
        };

        const appliedFilters = appliedTags.map((tag) => ({
            key: tag,
            label: tag,
            onRemove: () => { this.handleRemoveTag(tag) }
        }));

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

        const emptyStateMarkup = !hackers.length ? (
            <EmptyState
                heading={appliedTags.length ? "No hackers matched your search" : "Add tags to search for hacker"}
                image={''}
            >
                <p>
                    You can use the tag search box to enter keywords and be matched with other hackers with similar interests.
            </p>
            </EmptyState>
        ) : undefined;

        const filterControl = (
            <Filters
                queryValue={filterValue}
                filters={[includeTeamedFilter]}
                appliedFilters={appliedFilters}
                onQueryChange={(m) => this.setState({ filterValue: m })}
                onQueryClear={() => this.setState({ filterValue: "" })}
                onClearAll={() => { }}
            />
        );

        const titlePrefix = (hackers.length > 0 && !isLoading) ? `${hackers.length} ` : "";

        return (
            <Page title={`${titlePrefix} Hackers`}>
                <Card>
                    <div style={{ padding: "1.4rem 2rem" }}>
                        <Autocomplete
                            allowMultiple
                            options={tagOptions}
                            selected={appliedTags}
                            textField={textTagField}
                            onSelect={this.updateTags}
                            listTitle="Suggested Tags"
                            emptyState={emptyState}
                        />
                        <br />
                        <Button primary size="slim" onClick={this.loadMatchingHackers}>Search</Button>
                        <br />
                    </div>
                    <ResourceList
                        emptyState={emptyStateMarkup}
                        loading={isLoading}
                        resourceName={{ singular: 'hacker', plural: 'hackers' }}
                        items={hackers.length != 0 ?  
                            hackers.filter((app: IHackerSummary) => {
                            return ((app.name.toLowerCase().includes(filterValue.toLowerCase()) ||
                                (!app.discord || app.discord.toLowerCase().includes(filterValue.toLowerCase()))) &&
                                (teamed ? true : !app.team));
                        }) 
                        : []}
                        renderItem={this.renderApplicationSummaryRow}
                        filterControl={filterControl}
                    />
                </Card>
            </Page>
        );
    }

    private loadMatchingHackers = () => {
        const { appliedTags } = this.state;

        this.setState({ isLoading: true });
        axios.post(`/dashboard-api/teammates-finder.json`, {
            keywords: appliedTags,
        }).then(res => {
            const status = res.status;
            if (status == 200) {
                const payload = res.data;
                if ("success" in payload && payload["success"]) {
                    const hackers: IHackerSummary[] = payload["hackers"];
                    this.setState({
                        hackers: hackers,
                        isLoading: false,
                    });
                    return;
                }
            }
            toast.error("Failed to load applications.");
            this.setState({ isLoading: false });
        });
    }

    private renderApplicationSummaryRow = (item: IHackerSummary) => {
        const media = item.email.length > 0
            ? <Avatar customer size="medium" source={`https://www.gravatar.com/avatar/${md5(item.email.toLowerCase())}?d=retro`} />
            : <></>;

        return (
            <ResourceList.Item
                id={`${item.name}`}
                url={''}
                media={media}
                accessibilityLabel={`View details for ${item.name}`}
            >
                <h3>
                    <TextStyle variation="strong">{item.name}</TextStyle>
                </h3>
                <div>{item.email}</div>
                <div>Discord nickname: {item.discord ? item.discord : <i>(none)</i> }</div>
            </ResourceList.Item>
        );
        return <h1></h1>
    }
}

export default TeamMatch;
