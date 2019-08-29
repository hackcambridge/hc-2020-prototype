import React, { Component } from "react";
import {
    ActionList,
    AppProvider,
    Card,
    Frame,
    TopBar,
    Navigation,
} from "@shopify/polaris";
import {AddMajorMonotone, ConversationMinor, DnsSettingsMajorMonotone, HomeMajorMonotone, OrdersMajorTwotone, OnlineStoreMajorTwotone, CirclePlusOutlineMinor, SmileyJoyMajorMonotone, SocialAdMajorMonotone, MentionMajorMonotone, ConfettiMajorMonotone, CodeMajorMonotone, DataVisualizationMajorMonotone, SandboxMajorMonotone, GamesConsoleMajorMonotone, MobileBackArrowMajorMonotone, LogOutMinor, MobileChevronMajorMonotone, TransferWithinShopifyMajorMonotone} from '@shopify/polaris-icons';
import { BrowserRouter, Route, Link, Switch } from "react-router-dom";
import { X, Y } from "./x";
import { ISponsorDashboardProps } from "../../scenes/sponsors";
import SponsorHome from "./SponsorHome"
import SponsorPeople from "./SponsorPeople";
import Sponsor404 from "./Sponsor404";

interface ISponsorDashboardState {
    isLoading: boolean,
    searchActive: boolean,
    searchText: string,
    userMenuOpen: boolean,
    showMobileNavigation: boolean,
}

class SponsorDashboard extends Component<ISponsorDashboardProps, ISponsorDashboardState> {

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


        const userMenuActions = [
            {
                id: "links",
                items: [
                    {content: 'Go to Dashboard', url: "/", icon: TransferWithinShopifyMajorMonotone},
                    {content: 'Go to Homepage', url: "/", icon: TransferWithinShopifyMajorMonotone},
                ],
            },
            {
                id: "logout",
                items: [{content: 'Logout', url: "/logout", icon: LogOutMinor}],
            },
        ];

        const navigationUserMenuMarkup = (
            <Navigation.UserMenu
                actions={userMenuActions}
                avatarInitials={this.props.user.name.charAt(0)}
            />
        );

        const userMenuMarkup = (
            <TopBar.UserMenu
                actions={userMenuActions}
                name={this.props.user.name}
                initials={this.props.user.name.charAt(0)}
                open={userMenuOpen}
                onToggle={this.toggleState('userMenuOpen')}
            />
        );

        const searchResultsMarkup = (
            <Card>
                <ActionList
                    items={[
                        {content: 'Shopify help center', url: "/sponsors/dashboard/xyz"},
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
                searchResultsVisible={searchActive}
                searchField={searchFieldMarkup}
                searchResults={searchResultsMarkup}
                onSearchResultsDismiss={this.handleSearchResultsDismiss}
                onNavigationToggle={this.toggleState('showMobileNavigation')}
            />
        );

        const navigationMarkup = (
            <Navigation location={`${this.props.baseUrl}/`} userMenu={navigationUserMenuMarkup}>
                <Navigation.Section
                    title="Sections"
                    // https://polaris-icons.shopify.com/?icon=GamesConsoleMajor
                    items={[
                        {
                            label: 'Dashboard', icon: HomeMajorMonotone,
                            url: `${this.props.baseUrl}`
                        },
                        {
                            label: 'People',
                            icon: SmileyJoyMajorMonotone,
                            url: `${this.props.baseUrl}/people`
                        },
                        {
                            label: 'Swag',
                            icon: ConfettiMajorMonotone,
                            url: `${this.props.baseUrl}/swag`
                        },
                        {
                            label: 'Hardware/API',
                            icon: DnsSettingsMajorMonotone,
                            url: `${this.props.baseUrl}/api`
                        },
                        {
                            label: 'Social Media',
                            icon: MentionMajorMonotone,
                            url: `${this.props.baseUrl}/social-media`
                        },
                        {
                            label: 'Prizes',
                            icon: GamesConsoleMajorMonotone,
                            url: `${this.props.baseUrl}/prizes`
                        },
                        {
                            label: 'Demo Details',
                            icon: CodeMajorMonotone,
                            url: `${this.props.baseUrl}/demo-details`
                        },
                        {
                            label: 'Workshop',
                            icon: SandboxMajorMonotone,
                            url: `${this.props.baseUrl}/workshop`
                        },
                        {
                            label: 'Presentation',
                            icon: DataVisualizationMajorMonotone,
                            url: `${this.props.baseUrl}/presentation`
                        },
                    ]}
                />
                <Navigation.Section
                    title="Sponsors"
                    items={[
                        {
                            url: `${this.props.baseUrl}/`,
                            label: 'Palantir',
                        },
                    ]}
                    action={{
                        accessibilityLabel: 'Add new sponsor',
                        icon: CirclePlusOutlineMinor,
                        onClick: () => {},
                    }}
                />
            </Navigation>
        );



        const theme = {
            colors: {
                topBar: {
                    background: '#b71515',
                    backgroundLighter: '#c52e2f',
                    // background: '#2e0058',
                    // backgroundLighter: '#461571',
                    color: '#FFFFFF',
                },
            },
            logo: {
                width: 144,
                topBarSource: '/images/101-sponsors.png',
                url: '/sponsors/dashboard/',
                accessibilityLabel: 'Hack Cambridge',
            },
        };

        const adapterLink = ({ url, ...rest }) => {
            const _url = url as string;
            if(_url.startsWith(this.props.baseUrl)) {
                return <Link to={url} {...rest} />
            } else {
                return <a href={url} {...rest} />
            }
        }

        return (
            <BrowserRouter>
                <AppProvider theme={theme} linkComponent={adapterLink}>
                    <Frame
                        topBar={topBarMarkup}
                        navigation={navigationMarkup}
                        showMobileNavigation={showMobileNavigation}
                        onNavigationDismiss={this.toggleState('showMobileNavigation')}
                    >
                        <Switch>
                            <Route exact path={`${this.props.baseUrl}/`} component={SponsorHome} />
                            <Route exact path={`${this.props.baseUrl}/people`} component={SponsorPeople} />
                            <Route path={``} component={Sponsor404} />
                        </Switch>
                    </Frame>
                </AppProvider>
            </BrowserRouter>
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

export default SponsorDashboard;
