import React, { Component } from "react";
import {
    ActionList,
    AppProvider,
    Card,
    Frame,
    TopBar,
    Navigation,
} from "@shopify/polaris";
import {AddMajorMonotone, ConversationMinor, HomeMajorMonotone, OrdersMajorTwotone} from '@shopify/polaris-icons';


interface ISponsorsDashboardFrameProps {}
interface ISponsorsDashboardFrameState {
    isLoading: boolean,
    searchActive: boolean,
    searchText: string,
    userMenuOpen: boolean,
    showMobileNavigation: boolean,
}

class SponsorsDashboardFrame extends Component<ISponsorsDashboardFrameProps, ISponsorsDashboardFrameState> {
    defaultState = {
        emailFieldValue: 'dharma@jadedpixel.com',
        nameFieldValue: 'Jaded Pixel',
    };

    state = {
        isLoading: false,
        searchActive: false,
        searchText: '',
        userMenuOpen: false,
        showMobileNavigation: false,
    };

    render() {
        const {
            searchActive,
            searchText,
            userMenuOpen,
            showMobileNavigation,
        } = this.state;


        const userMenuActions: { id: string, items: { content: string }[] }[] = [
            {
                id: "asd",
                items: [{content: 'Community forums'}],
            },
        ];

        const navigationUserMenuMarkup = (
            <Navigation.UserMenu
                actions={userMenuActions}
                avatarInitials="E"
            />
        );

        const userMenuMarkup = (
            <TopBar.UserMenu
                actions={userMenuActions}
                name="Dharma"
                initials="D"
                open={userMenuOpen}
                onToggle={this.toggleState('userMenuOpen')}
            />
        );

        const searchResultsMarkup = (
            <Card>
                <ActionList
                    items={[
                        {content: 'Shopify help center'},
                        {content: 'Community forums'},
                    ]}
                />
            </Card>
        );

        const searchFieldMarkup = (
            <TopBar.SearchField
                onChange={this.handleSearchFieldChange}
                value={searchText}
                placeholder="Search"
            />
        );

        const topBarMarkup = (
            <TopBar
                showNavigationToggle={true}
                userMenu={userMenuMarkup}
                // searchResultsVisible={searchActive}
                // searchField={searchFieldMarkup}
                // searchResults={searchResultsMarkup}
                // onSearchResultsDismiss={this.handleSearchResultsDismiss}
                onNavigationToggle={this.toggleState('showMobileNavigation')}
            />
        );

        const navigationMarkup = (
            <Navigation location="/" userMenu={navigationUserMenuMarkup}>
                <Navigation.Section
                    items={[
                        {
                            label: 'Back to Shopify',
                            icon: AddMajorMonotone,
                        },
                    ]}
                />
                <Navigation.Section
                    separator
                    title="Sponsors Area"
                    items={[
                        {
                            label: 'Dashboard',
                            icon: HomeMajorMonotone,
                            url: "/sponsors/dashboard/xyz"
                            // onClick: (() => this.props.history.push("/sponsors/dashboard/xyz")),
                        },
                        {
                            label: '',
                            icon: OrdersMajorTwotone,
                            onClick: this.toggleState('isLoading'),
                        },
                    ]}
                    action={{
                        icon: ConversationMinor,
                        accessibilityLabel: 'Contact support',
                        onClick: this.toggleState('modalActive'),
                    }}
                />
            </Navigation>
        );



        const theme = {
            colors: {
                topBar: {
                    // background: '#b71515',
                    // backgroundLighter: '#c52e2f',
                    background: '#2e0058',
                    backgroundLighter: '#461571',
                    color: '#FFFFFF',
                },
            },
            logo: {
                width: 144,
                topBarSource: '/images/101-sponsors.png',
                url: '/',
                accessibilityLabel: 'Jaded Pixel',
            },
        };

        const base = "/sponsors/dashboard";
        return (
            <div style={{height: '500px'}}>
                <AppProvider theme={theme}>
                    <Frame
                        topBar={topBarMarkup}
                        navigation={navigationMarkup}
                        showMobileNavigation={showMobileNavigation}
                        onNavigationDismiss={this.toggleState('showMobileNavigation')}
                    >
                        <h1>Root</h1>
                    </Frame>
                </AppProvider>
            </div>
        );
    }

    private toggleState = (key: string) => {
        return () => {
            this.setState(prev => {
                const newState = prev;
                newState[key] = !prev[key];
                return newState;
            });
        };
    };

    private handleSearchFieldChange = (value) => {
        this.setState({searchText: value});
        if (value.length > 0) {
            this.setState({searchActive: true});
        } else {
            this.setState({searchActive: false});
        }
    };

    private handleSearchResultsDismiss = () => {
        this.setState(() => {
            return {
                searchActive: false,
                searchText: '',
            };
        });
    };
}

export default SponsorsDashboardFrame;
