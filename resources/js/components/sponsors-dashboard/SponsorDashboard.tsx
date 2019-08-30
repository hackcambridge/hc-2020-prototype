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
import { BrowserRouter, Route, Link, Switch, withRouter, RouteComponentProps, Redirect } from "react-router-dom";
import { X, Y } from "./x";
import { ISponsorDashboardProps } from "../../scenes/sponsors";
import SponsorHome from "./components/SponsorHome"
import SponsorPeople from "./components/SponsorPeople";
import Sponsor404 from "./Sponsor404";
import axios from 'axios';
import SponsorContext from "./SponsorContext";
import { throws } from "assert";
import CreateSponsorForm from "./components/CreateSponsorForm";

interface ISponsorDashboardAppendedProps extends ISponsorDashboardProps, RouteComponentProps {
    validRoute: boolean
}

interface ISponsorDashboardState {
    isLoading: boolean,
    searchActive: boolean,
    searchText: string,
    userMenuOpen: boolean,
    showMobileNavigation: boolean,
    sponsors: ISponsorData[],
    createSponsorFormShowing: boolean,
}

interface ISponsorData {
    id: string,
    name: string,
    slug: string,
}

class SponsorDashboard extends Component<ISponsorDashboardAppendedProps, ISponsorDashboardState> {

    state = {
        isLoading: false,
        searchActive: false,
        searchText: '',
        userMenuOpen: false,
        showMobileNavigation: false,
        sponsors: [{ id: "", name: "Loading...", slug: "" }] as ISponsorData[],
        createSponsorFormShowing: false,
    };


    componentDidMount(): void {
        this.getAllSponsors();
    }

    render() {
        const {
            searchActive,
            searchText,
            userMenuOpen,
            showMobileNavigation,
        } = this.state;

        const isRoot = "sponsor" in this.props.match.params;
        const sponsor = isRoot ? this.props.match.params["sponsor"] : undefined;
        const section = this.props.match.params["uri"] || "";
        if(section.length == 0 && sponsor > 0 && this.props.validRoute) {
            return <Redirect to="overview" />;
        }

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

        const userMenuMarkup = (
            <TopBar.UserMenu
                actions={userMenuActions}
                name={this.props.user.name.split(" ")[0]}
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
                // searchResultsVisible={searchActive}
                // searchField={searchFieldMarkup}
                // searchResults={searchResultsMarkup}
                // onSearchResultsDismiss={this.handleSearchResultsDismiss}
                onNavigationToggle={this.toggleState('showMobileNavigation')}
            />
        );

        const sponsorItems = this.state.sponsors.map(sponsor => {
            return {
                url: `${this.props.baseUrl}/${sponsor.slug}/`,
                label: `${sponsor.name}`,
            }
        });

        const sponsorSectionsNavMarkup = !sponsor ? <></> : (
            <Navigation.Section
                    title="Sections"
                    items={this.privilegeStringToNavSections(sponsor, "")}
                />
        );

        
        const navigationMarkup = (
            <Navigation location={`${this.props.location.pathname}`}>  
                {sponsorSectionsNavMarkup}
                <Navigation.Section
                    title="Sponsors"
                    items={sponsorItems}
                    action={{
                        accessibilityLabel: 'Add new sponsor',
                        icon: CirclePlusOutlineMinor,
                        // onClick: () => console.log("asdadadasdads"),
                        onClick: () => this.setState({ createSponsorFormShowing: true }),
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
                url: `${this.props.baseUrl}/`,
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
            <AppProvider theme={theme} linkComponent={adapterLink}>
                <Frame
                    topBar={topBarMarkup}
                    navigation={navigationMarkup}
                    showMobileNavigation={showMobileNavigation}
                    onNavigationDismiss={this.toggleState('showMobileNavigation')}
                >
                    {this.props.validRoute ? <SponsorHome {...this.props}/> : <Sponsor404 />}
                    {this.state.createSponsorFormShowing ? 
                        <CreateSponsorForm 
                            active={true} 
                            onCreateSponsor={(sponsor) => {
                                this.getAllSponsors(() => {
                                    this.props.history.push(`${this.props.baseUrl}/${sponsor}/overview`);
                                });
                            }}
                            onClose={() => this.setState({ createSponsorFormShowing: false })}
                        /> : <></>
                    }
                </Frame>
            </AppProvider>
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

    private privilegeStringToNavSections(sponsor, privileges) {
        // https://polaris-icons.shopify.com/
        const sections = [];
        sections.push({
            label: 'Dashboard', icon: HomeMajorMonotone,
            url: `${this.props.baseUrl}/${sponsor}/overview`
        });

        if(true || privileges.includes("mentors") || privileges.includes("recruiters")) {
            sections.push({
                label: 'People', icon: SmileyJoyMajorMonotone,
                url: `${this.props.baseUrl}/${sponsor}/people`
            });
        }

        if(privileges.includes("swag")) {
            sections.push({
                label: 'Swag', icon: ConfettiMajorMonotone,
                url: `${this.props.baseUrl}/${sponsor}/swag`
            });
        }

        if(privileges.includes("resources")) {
            sections.push({
                label: 'Hardware/API', icon: DnsSettingsMajorMonotone,
                url: `${this.props.baseUrl}/api`
            });
        }

        if(privileges.includes("resources")) {
            sections.push({
                label: 'Hardware/API', icon: DnsSettingsMajorMonotone,
                url: `${this.props.baseUrl}/api`
            });
        }

        if(privileges.includes("social_media")) {
            sections.push({
                label: 'Social Media', icon: MentionMajorMonotone,
                url: `${this.props.baseUrl}/social-media`
            });
        }

        if(privileges.includes("prizes")) {
            sections.push({
                label: 'Prizes', icon: GamesConsoleMajorMonotone,
                url: `${this.props.baseUrl}/prizes`
            });
        }

        if(privileges.includes("demo")) {
            sections.push({
                label: 'Demo Details', icon: CodeMajorMonotone,
                url: `${this.props.baseUrl}/demo-details`
            });
        }

        if(privileges.includes("workshop")) {
            sections.push({
                label: 'Workshop', icon: SandboxMajorMonotone,
                url: `${this.props.baseUrl}/workshop`
            });
        }

        if(privileges.includes("presentation")) {
            sections.push({
                label: 'Presentation', icon: DataVisualizationMajorMonotone,
                url: `${this.props.baseUrl}/presentation`
            });
        }

        return sections;
    }

    private getAllSponsors(then: () => void = () => {}) {
        axios.get(`/committee/admin-api/get-sponsors.json`).then(res => {
            const status = res.status;
            if(status == 200) {
                // const data: { data: ISponsorData[] } = res.data;
                const obj: object = res.data;
                if("data" in obj) {
                    const data: ISponsorData[] = obj["data"];
                    this.setState({ sponsors: data.sort((a, b) => (a.name > b.name) ? 1 : -1) });
                    then();
                } else if ("success" in obj && obj["success"] == true) {
                    const data: ISponsorData[] = [];
                    this.setState({ sponsors: data })
                } else {
                    console.log("failed");
                }
            } else {
                console.log(`Status: ${status}`);
                console.log(res.data);
            }
        })
    }
}

export default withRouter(SponsorDashboard);
