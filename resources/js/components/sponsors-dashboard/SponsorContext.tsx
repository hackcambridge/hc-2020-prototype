import React, { Component } from "react";
import { Route, RouteComponentProps, Switch } from "react-router";
import { ISponsorDashboardProps, ISponsorData } from "../../interfaces/sponsors.interfaces";
import SponsorPeople from "./components/Agents/SponsorPeople";
import SponsorResources from "./components/Resources/SponsorResources";
import SponsorPortal from "./components/Resources/SponsorPortal";
import SponsorSwag from "./components/Resources/SponsorSwag";
import SponsorAdmin from "./components/SponsorAdmin";
import SponsorHome from "./components/SponsorHome";
import SponsorOverview from "./components/SponsorOverview";
import SponsorLoading from "./SponsorLoading";
import SingleItemForm from "./components/common/SingleItemForm";

interface ISponsorContextProps extends RouteComponentProps, ISponsorDashboardProps {
    sponsor: ISponsorData,
    sponsorData: ISponsorData[],
    onUpdate: () => void
}

class SponsorContext extends Component<ISponsorContextProps> {

    render() {
        const sponsorSlug = this.props.match.params["sponsor"] || "";
        const sponsorBaseUrl = `${this.props.baseUrl}/${sponsorSlug}/`;
        return (
            <div style={{ marginTop: "30px" }}>
                <Switch>
                    <Route exact path={`${this.props.baseUrl}/overview`} render={(props) =>
                        <SponsorOverview sponsorData={this.props.sponsorData} onUpdate={this.props.onUpdate} {...this.props} {...props} />}
                    />
                    <Route exact path={`${sponsorBaseUrl}overview`} render={(props) =>
                        <SponsorHome baseSponsorPath={sponsorBaseUrl} sponsor={this.props.sponsor} {...this.props} {...props} />}
                    />
                    <Route exact path={`${sponsorBaseUrl}admin`} render={(props) =>
                        <SponsorAdmin baseSponsorPath={sponsorBaseUrl} sponsor={this.props.sponsor} onUpdate={this.props.onUpdate} {...this.props} {...props} />}
                    />
                    <Route exact path={`${sponsorBaseUrl}people`} render={(props) =>
                        <SponsorPeople baseSponsorPath={sponsorBaseUrl} sponsor={this.props.sponsor} {...this.props} {...props} />}
                    />
                    <Route exact path={`${sponsorBaseUrl}api`} render={(props) =>
                        <SponsorResources
                            key={"hw/api"}
                            baseSponsorPath={sponsorBaseUrl}
                            sponsor={this.props.sponsor}
                            title={"Dataset / API"}
                            resourceNames={{ singular: "resource", plural: "resources" }}
                            {...this.props} {...props}
                            types={[
                                // {label: 'Hardware Item', value: 'hardware'},
                                { label: 'Working Dataset', value: 'dataset' },
                                { label: 'Open API Product', value: 'api' },
                            ]}
                            detailType={"resources"}
                        />
                    } />
                    <Route exact path={`${sponsorBaseUrl}swag`} render={(props) =>
                        <SponsorSwag
                            key={"swag"}
                            baseSponsorPath={sponsorBaseUrl}
                            sponsor={this.props.sponsor}
                            title={"Swag"}
                            resourceNames={{ singular: "item of swag", plural: "items of swag" }}
                            detailType={"swag"}
                            {...this.props} {...props}
                        />
                    } />
                    <Route exact path={`${sponsorBaseUrl}invoice`} render={(props) =>
                        <SingleItemForm
                            key={"invoice"}
                            baseSponsorPath={sponsorBaseUrl}
                            sponsor={this.props.sponsor}
                            pageTitle={"Invoice information"}
                            hasTitle={false} hasDescription={false} hasAddress hasAssets={false}
                            detailType={"invoice-address"}
                            {...this.props} {...props}
                        />
                    } />
                    <Route exact path={`${sponsorBaseUrl}workshop`} render={(props) =>
                        <SingleItemForm
                            key={"workshop"}
                            baseSponsorPath={sponsorBaseUrl}
                            sponsor={this.props.sponsor}
                            pageTitle={"Workshop Information"}
                            hasTitle hasDescription hasAddress={false} hasAssets
                            detailType={"workshop"}
                            {...this.props} {...props}
                        />
                    } />
                    <Route exact path={`${sponsorBaseUrl}social-media`} render={(props) =>
                        <SingleItemForm
                            key={"social-media"}
                            baseSponsorPath={sponsorBaseUrl}
                            sponsor={this.props.sponsor}
                            pageTitle={"Social Media Shoutout Information"}
                            hasTitle={false} hasDescription hasAddress={false} hasAssets
                            detailType={"social_media"}
                            {...this.props} {...props}
                        />
                    } />
                    <Route exact path={`${sponsorBaseUrl}demo-details`} render={(props) =>
                        <SingleItemForm
                            key={"demo-details"}
                            baseSponsorPath={sponsorBaseUrl}
                            sponsor={this.props.sponsor}
                            pageTitle={"Product Demo Details"}
                            hasTitle hasDescription hasAddress={false} hasAssets
                            detailType={"demo"}
                            {...this.props} {...props}
                        />
                    } />
                    <Route exact path={`${sponsorBaseUrl}prizes`} render={(props) =>
                        <SingleItemForm
                            key={"prizes"}
                            baseSponsorPath={sponsorBaseUrl}
                            sponsor={this.props.sponsor}
                            pageTitle={"Product/Themed Prize"}
                            hasTitle hasDescription hasAddress={false} hasAssets
                            detailType={"prizes"}
                            {...this.props} {...props}
                        />
                    } />
                    <Route exact path={`${sponsorBaseUrl}presentation`} render={(props) =>
                        <SingleItemForm
                            key={"presentation"}
                            baseSponsorPath={sponsorBaseUrl}
                            sponsor={this.props.sponsor}
                            pageTitle={"Opening Ceremony Presentation"}
                            hasTitle hasAssets hasAddress={false} hasDescription={false}
                            detailType={"presentation"}
                            {...this.props} {...props}
                        />
                    } />            
                    <Route exact path={`${sponsorBaseUrl}portal-info`} render={(props) => 
                        <SponsorPortal 
                            key={"portal-info"}
                            baseSponsorPath={sponsorBaseUrl} 
                            sponsor={this.props.sponsor} 
                            title={"Information for Hackers Portal"}
                            detailType={"portal-info"}
                            {...this.props} {...props}
                        />
                    } />            
                    <Route component={SponsorLoading} />
                </Switch>
            </div>
        );
    }
}

export default SponsorContext;
