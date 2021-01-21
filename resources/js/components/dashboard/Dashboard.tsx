import React, { Component, ReactNode, SVGProps } from "react";
import { withRouter, RouteComponentProps, Link, Switch, Route, Redirect } from "react-router-dom";
import { IDashboardProps, IApplicationRecord } from "../../interfaces/dashboard.interfaces";
import {
    AppProvider,
    Frame,
    TopBar,
    Navigation,
    Banner,
} from "@shopify/polaris";
import { LogOutMinor, IqMajor, AddCodeMajor, JobsMajor, CustomerPlusMajor, HomeMajor, ConfettiMajor, LocationMajor, FlagMajor, SocialAdMajor, QuestionMarkMajor ,ShopcodesMajor, CustomersMajor, TeamMajor, NoteMajor} from '@shopify/polaris-icons';
import Dashboard404 from "./Dashboard404";
import Overview from "./components/Overview";
import Apply from "./components/Apply";
import TeamApplication from "./components/TeamApplication";
import axios from 'axios';
import { ToastContainer, cssTransition } from "react-toastify";
import 'react-toastify/dist/ReactToastify.min.css';
import md5 from "md5";
import Invitation from "./components/Invitation";
import Challenges from "./components/Challenges";
import Schedule from "./components/Schedule";
import Sponsors from "./components/Sponsors";
import FAQs from "./components/FAQs";
import IndividualSponsor from "./components/IndividualSponsor";
import Profile from "./components/Profile";
import QRScanner from "./components/QRScanner"
import TeamMatch from "./components/TeamMatch";
import QRGenerate from "./components/QRGenerate";

type IDashboardPropsWithRouter = RouteComponentProps & IDashboardProps;
interface IDashboardState {
    isLoading: boolean,
    searchActive: boolean,
    searchText: string,
    userMenuOpen: boolean,
    showMobileNavigation: boolean,
    createSponsorFormShowing: boolean,
    currentLocation: string,
    application?: IApplicationRecord | undefined,
    applicationOpen: boolean,
}


class Dashboard extends Component<IDashboardPropsWithRouter, IDashboardState> {

    state = {
        isLoading: false,
        searchActive: false,
        searchText: '',
        userMenuOpen: false,
        showMobileNavigation: false,
        createSponsorFormShowing: false,
        currentLocation: this.props.location.pathname,
        application: this.props.user.application,
        applicationOpen: true,
    };

    componentDidMount() {
        if (this.props.user.application) {
            this.setState({ applicationOpen: !this.props.user.application.reviewed });
            this.updateApplicationRecord(this.props.user.application);
        } else {
            this.loadApplicationRecord();
        }
    }

    private theme = {
        colors: {
            topBar: {
                background: '#212b36',
                backgroundLighter: '#334150',
                color: '#FFFFFF',
            },
        },
        logo: {
            width: 40,
            topBarSource: '/images/logo_white.png',
            url: `${this.props.baseUrl}/`,
            accessibilityLabel: 'Hex Cambridge',
        },
    };

    // private adapterLink = ({ url, ...rest }: { url: string, rest: { [x: string]: any }}) => {
    private adapterLink = ({ url, ...rest }) => {
        const _url = url as string;
        if (_url.startsWith(this.props.baseUrl)) {
            return <Link to={url} {...rest} onClick={() => {
                if (this.state.showMobileNavigation) {
                    this.setState({ showMobileNavigation: false });
                }
            }} />
        } else {
            return <a href={url} {...rest} />
        }
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

    private userMenuActions = [
        {
            id: "logout",
            items: [
                { content: 'Frontpage', url: "/", icon: HomeMajor },
                { content: 'Profile', url: `${this.props.baseUrl}/profile`, icon: CustomersMajor },
                { content: 'Logout', url: "/logout", icon: LogOutMinor },
            ],
        },
    ];

    private topBarMarkup = (userMenuMarkup: ReactNode) => (
        <TopBar
            showNavigationToggle={true}
            userMenu={userMenuMarkup}
            onNavigationToggle={this.toggleState('showMobileNavigation')}
        />
    );

    render() {
        const showApplicationItems = true;
        const { showMobileNavigation, application } = this.state;
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

        const applicationNavigationItems = [
            { url: `${this.props.baseUrl}/apply/individual`, label: `Details`, icon: AddCodeMajor },
            { url: `${this.props.baseUrl}/apply/team`, label: `Team`, icon: CustomerPlusMajor },
        ];
        if (application && application.invited) {
            applicationNavigationItems.push({ url: `${this.props.baseUrl}/apply/invitation`, label: `Invitation`, icon: ConfettiMajor });
        }

        const dashboardNavigationItems: {
            url: string,
            label: string,
            icon: React.SFC<SVGProps<SVGSVGElement>>,
            badge: string | null,
            new: boolean,
        }[] = [
                {
                    url: `${this.props.baseUrl}/overview`,
                    label: "Overview",
                    icon: IqMajor,
                    new: false,
                    badge: null
                }
            ];

        if (this.allowedEventDetails()) {
            dashboardNavigationItems.push({
                url: `${this.props.baseUrl}/challenges`,
                label: `Challenges`,
                icon: FlagMajor,
                new: false,
                badge: null
            });
            // dashboardNavigationItems.push({ 
            //     url: `${this.props.baseUrl}/sponsors`,
            //     label: `Sponsors`,
            //     icon: JobsMajor,
            //     new: false,
            //     badge: "New",
            // });
            dashboardNavigationItems.push({
                url: `${this.props.baseUrl}/schedule`,
                label: `Schedule`,
                icon: SocialAdMajor,
                new: false,
                badge: null
            });
            dashboardNavigationItems.push({
                url: `${this.props.baseUrl}/faqs`,
                label: `FAQs`,
                icon: QuestionMarkMajor,
                new: false,
                badge: null,
            });
            dashboardNavigationItems.push({
                url: `${this.props.baseStorageUrl}event-data/Hex+Cambridge+2021+Hackers+Guide+v1.0.pdf`,
                label: `Event Guide`,
                icon: NoteMajor,
                new: false,
                badge: "New",
            });
            dashboardNavigationItems.push({
                url: `${this.props.baseUrl}/teammates`,
                label: `Team Matching`,
                icon: TeamMajor,
                new: false,
                badge: "New",
            });
        }

        const allowedQRGenerate = ['admin', 'mentor', 'sponsor', 'sponsor-reviewer', 'committee'];
        if(allowedQRGenerate.includes(this.props.user.type)){
            dashboardNavigationItems.push({
                url: `${this.props.baseUrl}/qrgen`,
                label: `Generate QR Code`,
                icon: ShopcodesMajor,
                new: false,
                badge: null
            });
        }

        if(this.props.user.type == "admin" || this.props.user.type == "hacker") {
            dashboardNavigationItems.push({
                url: `${this.props.baseUrl}/qrscan`,
                label: `Scan QR Code`,
                icon: ShopcodesMajor,
                new: false,
                badge: null
            });
        }

        const navigationMarkup = (
            <Navigation location={`${this.props.location.pathname}`}>
                <Navigation.Section items={dashboardNavigationItems} />

                {showApplicationItems && this.canSeeApplicationItems()
                    ?
                    <>
                        {this.renderApplicationBanner()}
                        <div style={{ marginTop: "-1.6rem" }}>
                            <Navigation.Section items={applicationNavigationItems} />
                        </div>
                    </>
                    : <></>
                }
            </Navigation>
        );

        return (
            <>
                <AppProvider theme={this.theme} linkComponent={this.adapterLink}>
                    <Frame
                        topBar={this.topBarMarkup(userMenuMarkup)}
                        navigation={navigationMarkup}
                        showMobileNavigation={showMobileNavigation}
                        onNavigationDismiss={this.toggleState('showMobileNavigation')}
                    >
                        <div className={"inner-wrapper"}>
                            {this.renderContent()}
                        </div>
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

    private renderContent(): JSX.Element {
        const { applicationOpen } = this.state;
        const eventDetailRoutes = this.allowedEventDetails() ? [
            <Route key="challenges" exact path={`${this.props.baseUrl}/challenges`} render={(props) => <Challenges {...props} {...this.props} />} />,
            <Route key="schedule" exact path={`${this.props.baseUrl}/schedule`} render={(props) => <Schedule {...props} {...this.props} />} />,
            <Route key="sponsors" exact path={`${this.props.baseUrl}/sponsors`} render={(props) => <Sponsors {...props} {...this.props} />} />,
            <Route key="faqs" exact path={`${this.props.baseUrl}/faqs`} render={(props) => <FAQs {...props} {...this.props} />} />,
            <Route key="teammates" exact path={`${this.props.baseUrl}/teammates`} render={(props) => <TeamMatch {...props} {...this.props} />} />,
            <Route key="qrscan" exact path={`${this.props.baseUrl}/qrscan`} render={(props) => <QRScanner {...props} {...this.props} />} />,
            <Route key="qrgen" exact path={`${this.props.baseUrl}/qrgen`} render={(props) => <QRGenerate {...props} {...this.props} />} />,
        ] : [];
        const applicationDetailRoutes = this.canSeeApplicationItems() ? [
            <Redirect key="apply" exact path={`${this.props.baseUrl}/apply`} to={`${this.props.baseUrl}/apply/individual`} />,
            <Route key="apply_individual" exact path={`${this.props.baseUrl}/apply/individual`} render={(_) => <Apply canEdit={applicationOpen} updateApplication={this.updateApplicationRecord} initialRecord={this.props.user.application} applicationsOpen={this.props.canApply} />} />,
            <Route key="apply_team" exact path={`${this.props.baseUrl}/apply/team`} render={(_) => <TeamApplication canEdit={applicationOpen || (this.props.user.application ? !this.props.user.application.rejected : false)} teamID={this.props.user.team.id} teamMembers={this.props.user.team.members} teamOwner={this.props.user.team.owner} />} />,
            <Route key="apply_invitation" exact path={`${this.props.baseUrl}/apply/invitation`} render={(_) => <Invitation application={this.props.user.application} updateApplication={this.updateApplicationRecord} />} />,
        ] : [];
        return (
            <Switch>
                <Redirect exact path={`${this.props.baseUrl}`} to={`${this.props.baseUrl}/overview`} />
                <Route exact path={`${this.props.baseUrl}/overview`} render={(props) => <Overview {...props} {...this.props} />} />
                <Route exact path={`${this.props.baseUrl}/sponsors/:id/:slug`} render={(props) => <IndividualSponsor sponsorId={props.match.params.id} sponsorSlug={props.match.params.slug} {...props} />} />
                <Route exact path={`${this.props.baseUrl}/profile`} render={(props) => <Profile {...props} {...this.props.user} />} />
                {applicationDetailRoutes.map(i => i)}
                {eventDetailRoutes.map(i => i)}
                <Route component={Dashboard404}></Route>
            </Switch>
        );
    }

    private renderApplicationBanner(): JSX.Element {
        const states: {
            [key: string]: {
                status: "warning" | "info" | "critical" | "success" | undefined,
                text: string,
                noLink?: boolean
            }
        } = {
            "notStarted": { status: undefined, text: "Start Application" },
            "started": { status: "warning", text: "Finish Application" },
            "incomplete": { status: undefined, text: "Incomplete Application" },
            "pending": { status: "info", text: "Application Pending" },
            "rejected": { status: "critical", text: "Unsuccessful" },
            "declined": { status: "critical", text: "Place Declined" },
            "invited": { status: "warning", text: "Accept Invite" },
            "confirmed": { status: "success", text: "Place Confirmed", noLink: true },
        }
        const currentState = states[this.getApplicationStateKey()];

        if (currentState) {
            const banner = (
                <Banner status={currentState.status}>
                    <p style={{ fontWeight: 500 }}>{currentState.text}</p>
                </Banner>
            );

            return (
                currentState.noLink
                    ? banner
                    : (
                        <Link to={"/dashboard/apply/individual"} style={{ textDecoration: "inherit", color: "inherit" }}>
                            {banner}
                        </Link>
                    )
            );
        } else {
            return <></>;
        }
    }

    private getApplicationStateKey(): string {
        const { application, applicationOpen } = this.state;
        if (application) {
            if (application.reviewed || application.invited) {
                if (application.invited) {
                    if (application.rejected) return "declined";
                    else if (application.confirmed) return "confirmed";
                    else return "invited";
                }
                else if (application.rejected) return "rejected";
                else return "pending";
            }

            var complete = application.cvFilename && application.cvUrl && true;
            const responses = JSON.parse(application.questionResponses) as { [key: string]: string };
            for (let key in responses) {
                complete = complete && responses[key].length > 0;
            }

            if (applicationOpen) {
                return application.isSubmitted ? (complete ? "pending" : "incomplete") : "started";
            } else {
                return application.isSubmitted ? (complete ? "pending" : "rejected") : "rejected";
            }
        }

        return applicationOpen ? "notStarted" : "rejected";
    }

    private loadApplicationRecord() {
        axios.get(`/dashboard-api/application-record.json`).then(res => {
            const status = res.status;
            if (status == 200) {
                const obj = res.data;
                if ("success" in obj && obj["success"]) {
                    // TODO: check flow, maybe return blank record instead of null.
                    const record: IApplicationRecord = obj["record"];
                    if (record) {
                        this.setState({ applicationOpen: !record.reviewed });
                        this.updateApplicationRecord(record);
                    }
                    return;
                }
            }
        });
    }

    private updateApplicationRecord = (record: IApplicationRecord) => {
        this.setState({ application: record });
    }

    private allowedEventDetails() {
        const { application } = this.state;
        const isParticipant = application && application.invited && application.confirmed && !application.rejected;
        return isParticipant || this.props.user.type != "hacker";
    }

    private canSeeApplicationItems() {
        return ["admin", "hacker"].includes(this.props.user.type);
    }
}

export default withRouter(Dashboard);
