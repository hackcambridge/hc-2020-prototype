import React, { Component, ReactNode } from "react";
import {
    AppProvider,
    Frame,
    TopBar,
    Navigation,
} from "@shopify/polaris";
import {DnsSettingsMajor, HomeMajor,EnvelopeMajor, CirclePlusOutlineMinor, SmileyJoyMajor, MentionMajor, ConfettiMajor, CodeMajor, DataVisualizationMajor, SandboxMajor, GamesConsoleMajor, LogOutMinor, MobileChevronMajor, TransferWithinShopifyMajor, LockMajor, IqMajor, FlagMajor} from '@shopify/polaris-icons';
import { Link, withRouter, RouteComponentProps, Redirect } from "react-router-dom";
import { ISponsorDashboardProps, ISponsorData } from "../../interfaces/sponsors.interfaces";
import Sponsor404 from "./Sponsor404";
import axios from 'axios';
import SponsorContext from "./SponsorContext";
import CreateSponsorForm from "./components/common/CreateSponsorForm";
import { toast, ToastContainer, cssTransition } from "react-toastify";
import 'react-toastify/dist/ReactToastify.min.css';
import md5 from 'md5';

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
    currentLocation: string,
}

interface INavMenuItem { label: string, icon: ReactNode, url: string }


class SponsorDashboard extends Component<ISponsorDashboardAppendedProps, ISponsorDashboardState> {

    state = {
        isLoading: false,
        searchActive: false,
        searchText: '',
        userMenuOpen: false,
        showMobileNavigation: false,
        sponsors: this.props.sponsors.sort((a, b) => (a.name > b.name) ? 1 : -1),
        createSponsorFormShowing: false,
        currentLocation: this.props.location.pathname,

    };

    private toggleState = (key: string) => {
        return () => {
            this.setState(prev => {
                const newState = prev;
                newState[key] = !prev[key];
                return newState;
            });
        };
    };

    private userMenuActions = [
        {
            id: "links",
            items: [
                { content: 'Go to Dashboard', url: "/dashboard", icon: TransferWithinShopifyMajor },
                { content: 'Go to Homepage', url: "/", icon: TransferWithinShopifyMajor },
            ],
        },
        {
            id: "logout",
            items: [{ content: 'Logout', url: "/logout", icon: LogOutMinor }],
        },
    ];


    private topBarMarkup = (userMenuMarkup: ReactNode) => (
        <TopBar
            showNavigationToggle
            userMenu={userMenuMarkup}
            onNavigationToggle={this.toggleState('showMobileNavigation')}
        />
    );

    private navSections = (sponsor: ISponsorData) => !sponsor ? [] : this.privilegeStringToNavSections(sponsor);
    private sponsorSectionsNavMarkup = (items: INavMenuItem[]) => items.length == 0 ? <></> : (
        <Navigation.Section
            title="Sections"
            items={items}
        />
    );

    private theme = {
        colors: {
            topBar: {
                // background: linear-gradient(45deg, rgba(255, 122, 98, 1) 0%, rgba(211, 104, 182, 1) 100%);
                background: '#3D82FF',
                backgroundLighter: '#c52e2f',
                // background: '#2e0058',
                // backgroundLighter: '#461571',
                color: '#FFFFFF',
            },
        },
        logo: {
            width: 65,
            topBarSource: '/images/logo_white.png',
            url: `${this.props.baseUrl}/`,
            accessibilityLabel: 'Hex Cambridge',
        },
    };

    private adapterLink = ({ url, ...rest }) => {
        const _url = url as string;
        if (_url.startsWith(this.props.baseUrl)) {
            return <Link to={url} {...rest} />
        } else {
            return <a href={url} {...rest} />
        }
    }


    componentDidMount(): void {
        this.getAllSponsors();
    }

    render() {
        const { showMobileNavigation } = this.state.showMobileNavigation;
        // const showMobileNavigation = this.state.showMobileNavigation;
        const isRoot = !("sponsor" in this.props.match.params);
        const sponsorSlug = !isRoot ? this.props.match.params["sponsor"] : undefined;
        const section = this.props.match.params["uri"] || "";
        const sponsor = this.state.sponsors.find(s => s.slug == sponsorSlug);

        const navSection = this.navSections(sponsor);
        const allowedPaths = navSection.map(item => item.url).join(";");
        const validSection = allowedPaths.includes(this.props.location.pathname);

        const sponsorItems = this.state.sponsors.map(sponsor => {
            return {
                url: `${this.props.baseUrl}/${sponsor.slug}/`,
                label: `${sponsor.name}`,
            }
        });

        const renderAdminMenuItems = this.props.user ? ["admin", "committee"].includes(this.props.user.type) : false;
        const navigationMarkup = (
            <Navigation location={`${this.props.location.pathname}`}>
                { renderAdminMenuItems ?
                    <Navigation.Section
                        items={[{
                            url: `${this.props.baseUrl}/overview`,
                            label: "Overview",
                            icon: IqMajor
                        }]}
                    /> : <></>}
                {this.sponsorSectionsNavMarkup(navSection)}
                {(this.props.sponsors.length > 1 || renderAdminMenuItems) ?
                    <Navigation.Section
                        title="Sponsors"
                        items={sponsorItems}
                        action={renderAdminMenuItems ? {
                            accessibilityLabel: 'Add new sponsor',
                            icon: CirclePlusOutlineMinor,
                            onClick: () => this.setState({ createSponsorFormShowing: true }),
                        } : undefined}
                    /> : <></>}
            </Navigation>
        );
        const userMenuMarkup = (
            <TopBar.UserMenu
                actions={this.userMenuActions}
                name={this.props.user.name.split(" ")[0]}
                initials={this.props.user.name.charAt(0)}
                avatar={`https://www.gravatar.com/avatar/${md5(this.props.user.email.toLowerCase())}?d=retro`}
                open={this.state.userMenuOpen}
                onToggle={this.toggleState('userMenuOpen')}
            />
        );

        if (isRoot && (this.props.user.type == "sponsor" || this.props.user.type == "sponsor-reviewer") && this.props.sponsors.length > 0) {
            return <Redirect to={`${this.props.sponsors[0].slug}/overview`} />;
        }
        else if (section.length == 0 && sponsor && this.props.validRoute) {
            return <Redirect to="overview" />;
        }

        const render404 = !isRoot && (!sponsor || !this.props.validRoute || !validSection);

        return (
            <>
                <AppProvider
                    theme={this.theme}
                    i18n={{
                        Polaris: {
                            Avatar: {
                                label: "Avatar",
                                labelWithInitials: "Avatar with initials {initials}"
                            },
                            TopBar: {
                                toggleMenuLabel: "Toggle menu",
                            },
                            Frame: {
                                skipToContent: "Skip to content",
                                Navigation: {
                                    closeMobileNavigationLabel: "Close navigation"
                                }
                            }
                        }
                    }}
                    linkComponent={this.adapterLink}
                >
                    <Frame
                        topBar={this.topBarMarkup(userMenuMarkup)}
                        navigation={navigationMarkup}
                        showMobileNavigation={showMobileNavigation}
                        onNavigationDismiss={this.toggleState('showMobileNavigation')}
                    >
                        {!render404 ? <SponsorContext sponsor={sponsor} sponsorData={this.state.sponsors} onUpdate={() => {
                            this.getAllSponsors(() => { })
                        }} {...this.props} /> : <Sponsor404 />}
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
                <ToastContainer
                    position="top-right"
                    autoClose={3000}
                    transition={cssTransition({
                        enter: 'zoomIn',
                        exit: 'zoomOut',
                        duration: 400
                    })}
                    newestOnTop
                    closeOnClick
                    draggable
                    pauseOnHover
                />
            </>
        );
    }

    private privilegeStringToNavSections(sponsor: ISponsorData) {
        const privileges = sponsor.privileges || "";
        const sponsorSlug = sponsor.slug || "";
        // https://polaris-icons.shopify.com/
        const sections: INavMenuItem[] = [];
        if (sponsor) {
            if (["committee", "admin"].includes(this.props.user.type)) {
                sections.push({
                    label: 'Admin', icon: LockMajor,
                    url: `${this.props.baseUrl}/${sponsorSlug}/admin`
                });
            }
            sections.push({
                label: 'Dashboard', icon: HomeMajor,
                url: `${this.props.baseUrl}/${sponsorSlug}/overview`
            });
            sections.push({
                label: 'Invoice details', icon: EnvelopeMajor,
                url: `${this.props.baseUrl}/${sponsorSlug}/invoice`
            });
        }

        if (privileges.includes("mentors") || privileges.includes("recruiters")) {
            sections.push({
                label: 'People', icon: SmileyJoyMajor,
                url: `${this.props.baseUrl}/${sponsorSlug}/people`
            });
        }

        if (privileges.includes("swag")) {
            sections.push({
                label: 'Swag', icon: ConfettiMajor,
                url: `${this.props.baseUrl}/${sponsorSlug}/swag`
            });
        }

        if (privileges.includes("resources")) {
            sections.push({
                label: 'Dataset/API', icon: DnsSettingsMajor,
                url: `${this.props.baseUrl}/${sponsorSlug}/api`
            });
        }

        if (privileges.includes("social_media")) {
            sections.push({
                label: 'Social Media', icon: MentionMajor,
                url: `${this.props.baseUrl}/${sponsorSlug}/social-media`
            });
        }

        if (privileges.includes("prizes")) {
            sections.push({
                label: 'Prizes', icon: GamesConsoleMajor,
                url: `${this.props.baseUrl}/${sponsorSlug}/prizes`
            });
        }

        if (privileges.includes("demo")) {
            sections.push({
                label: 'Demo Details', icon: CodeMajor,
                url: `${this.props.baseUrl}/${sponsorSlug}/demo-details`
            });
        }

        if (privileges.includes("workshop")) {
            sections.push({
                label: 'Workshop', icon: SandboxMajor,
                url: `${this.props.baseUrl}/${sponsorSlug}/workshop`
            });
        }

        if (privileges.includes("presentation")) {
            sections.push({
                label: 'Presentation', icon: DataVisualizationMajor,
                url: `${this.props.baseUrl}/${sponsorSlug}/presentation`
            });
        }

        sections.push({
            label: 'Portal Info', icon: FlagMajor,
            url: `${this.props.baseUrl}/${sponsorSlug}/portal-info`
        });

        return sections;
    }

    private getAllSponsors(then: () => void = () => { }) {
        axios.get(`/sponsors/dashboard-api/get-sponsors.json`).then(res => {
            const status = res.status;
            if (status == 200) {
                const payload = res.data;
                if ("success" in payload && payload["success"]) {
                    const sponsors: ISponsorData[] = payload["data"];
                    this.setState({ sponsors: sponsors.sort((a, b) => (a.name > b.name) ? 1 : -1) });
                    then();
                    return;
                } else {
                    console.log(payload);
                }
            }
            toast.error("Failed to load members.");
            // console.log(status, res.data);
            // this.setState({ isLoading: false });
        });
    }


}

export default withRouter(SponsorDashboard);
