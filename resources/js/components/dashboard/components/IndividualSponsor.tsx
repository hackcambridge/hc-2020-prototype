import React, { Component } from 'react';
import { withRouter, RouteComponentProps } from 'react-router';
import { Page, Card, SkeletonBodyText, Image, Avatar, Layout, Heading, TextContainer, DisplayText, Badge, Spinner } from '@shopify/polaris';
import Dashboard404 from '../Dashboard404';
import { IResourceCard, ISponsor, IUserDetails } from '../../../interfaces/dashboard.interfaces';
import axios from 'axios';
import { toast } from 'react-toastify';
import Linkify from 'linkifyjs/react';
import { IAssetInformation, IPortalDefinition } from '../../../interfaces/sponsors.interfaces';
import "react-responsive-carousel/lib/styles/carousel.min.css"; // requires a loader
import { Carousel } from 'react-responsive-carousel';

interface IIndividualSponsorProps {
    sponsorId: string,
    sponsorSlug: string,
}

interface IIndividualSponsorState {
    sponsorId: string | undefined,
    loadingSponsor: boolean,
    loadingResources: boolean,
    sponsor: ISponsor | undefined,
    user: IUserDetails | undefined,
    resources: IResourceCard[],
    nextSponsor: {
        id: string,
        slug: string,
    },
    prevSponsor: {
        id: string,
        slug: string,
    },
    portalInfo: IPortalDefinition | undefined,
}

class IndividualSponsor extends Component<IIndividualSponsorProps & RouteComponentProps, IIndividualSponsorState> {

    state = {
        sponsorId: undefined,
        loadingSponsor: true,
        loadingResources: true,
        sponsor: undefined,
        user: undefined,
        resources: [],
        nextSponsor: {
            id: "",
            slug: "",
        },
        prevSponsor: {
            id: "",
            slug: "",
        },
        portalInfo: {
            data: {
                ["description"]: "",
                ["url"]: "",
                ["discord invite link"]: "",
            },
            files: [],
        },
    }

    componentDidMount() {
        const sponsorId = this.props.sponsorId;
        if (!sponsorId) {
            this.setState({ loadingSponsor: false, loadingResources: false });
        } else {
            this.loadInformation(sponsorId, this.props.sponsorSlug);
            this.retrieveSponsor(sponsorId, this.props.sponsorSlug);
        }
    }

    render() {
        const { sponsorId, loadingSponsor } = this.state;
        return (<>
            { loadingSponsor
                ? this.loadingMarkup
                : sponsorId
                    ? this.renderSponsor()
                    : this.invalidSponsor()
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

    private nextSponsor = async () => {
        const { nextSponsor } = this.state;

        this.setState({ loadingSponsor: true, loadingResources: true });
        const currentUrl = this.props.history.location.pathname;
        const base = currentUrl.substring(0, currentUrl.lastIndexOf('/', currentUrl.lastIndexOf('/')-1));
        if (nextSponsor.id) {
            this.props.history.push(`${base}/${nextSponsor.id}/${nextSponsor.slug}`);
            this.loadInformation(nextSponsor.id, nextSponsor.slug);
            this.retrieveSponsor(nextSponsor.id, nextSponsor.slug);
        }
    }

    private prevSponsor = async () => {
        const { prevSponsor } = this.state;

        this.setState({ loadingSponsor: true, loadingResources: true });
        const currentUrl = this.props.history.location.pathname;
        const base = currentUrl.substring(0, currentUrl.lastIndexOf('/', currentUrl.lastIndexOf('/')-1));
        if (prevSponsor.id) {
            this.props.history.push(`${base}/${prevSponsor.id}/${prevSponsor.slug}`);
            this.loadInformation(prevSponsor.id, prevSponsor.slug);
            this.retrieveSponsor(prevSponsor.id, prevSponsor.slug);
        }
    }

    private renderSponsor = () => {
        const { sponsor, resources, portalInfo, nextSponsor, prevSponsor } = this.state;
        var loading =
            (<div style={{ textAlign: "center", marginTop: "3em" }}>
                <Card sectioned><Heading>Loading more info.....</Heading></Card>
                <div style={{ marginTop: "1.5em" }}>
                    <Spinner color="teal" />
                </div>
            </div>);

        if (sponsor) {
            const actual_sponsor: ISponsor = sponsor!;
            const tier = actual_sponsor.tier;
            const data = portalInfo.data;
            const portalInfoImages = portalInfo.files.filter((x: IAssetInformation) => { return !x.name.toLowerCase().includes("logo") });
            const tier_badge = () => {
                switch (tier.toLowerCase()) {
                    case "co-host":
                        return "info"
                    case "tera":
                        return "success"
                    case "giga":
                        return "attention"
                    case "mega":
                        return "warning"
                    case "kilo":
                        return undefined
                    default: return undefined
                }
            }
            const metadata = <>
                {<Badge status={tier_badge()}>{this.capitalizeAndOnlyAlphaNumeric(tier)}</Badge>}
            </>;
            const carouselDivs = portalInfoImages.map((p: IAssetInformation) => {
                return (
                    <div key={p.url}>
                        <img src={p.url} />
                    </div>
                )
            })
            const placeholderCarousel = (
                <div>
                    <img style={{ width: "100%" }} id="image" src={"https://" + window.location.hostname + "/images/office-background.jpg"}></img>
                </div>
            )
            let logoUrl: IAssetInformation = portalInfo.files.find((x: IAssetInformation) => { return x.name.toLowerCase().includes("logo") });
            if (!logoUrl || logoUrl === undefined) {
                logoUrl = "https://" + window.location.hostname + "/images/no-logo-sponsor.png";
            } else {
                logoUrl = logoUrl.url;
            }
            return (
                <Page
                    breadcrumbs={[{ content: 'Sponsors', url: '..' }]}
                    title={`${actual_sponsor.name}`}
                    titleMetadata={metadata}
                    subtitle={`Sponsor #${actual_sponsor.id}`}
                    pagination={{
                        hasPrevious: Number.isInteger(prevSponsor.id) || prevSponsor.id.length > 0,
                        hasNext: Number.isInteger(nextSponsor.id) || nextSponsor.id.length > 0,
                        onNext: this.nextSponsor,
                        onPrevious: this.prevSponsor
                    }}
                    primaryAction={{ content: 'Speak To Them!', onAction: () => { window.open(portalInfo.data["discord invite link"]) } }}
                    thumbnail={
                        <Avatar
                        source={logoUrl}
                        size="large"
                        name={`${actual_sponsor.name}`}
                    />}
                >
                    <Carousel
                        showIndicators={false}
                        showThumbs={false} >
                        {carouselDivs.length === 0 ? placeholderCarousel : carouselDivs}
                    </Carousel>
                    <Layout>
                        <Layout.Section key="About" secondary>
                            <br />
                            <Card>
                                <div style={{ padding: "1.4rem 2rem" }}>
                                    <DisplayText
                                        size="large">
                                        {actual_sponsor.name}
                                    </DisplayText>
                                    <TextContainer>
                                        <br />
                                        <Heading>About</Heading>
                                        <p>
                                            {data.description}
                                        </p>
                                    </TextContainer>
                                </div>
                            </Card>
                        </Layout.Section>
                        <Layout.Section key="Objects">
                            <br />
                            <Card>
                                {
                                    Object.keys(data).map((key, index) => {
                                        if (key === "description") {
                                            return
                                        } else {
                                            let value = data[key];
                                            return ([
                                                <Linkify key={key} tagName="a" options={{ target: { url: '_blank' } }}>
                                                    <div style={{ padding: "1.4rem 2rem" }} key={index}>
                                                        <Heading>{this.capitalizeAndOnlyAlphaNumeric(key)}</Heading>
                                                        <br style={{ lineHeight: "3px" }} />
                                                        <TextContainer>{value}</TextContainer>
                                                    </div>
                                                </Linkify>
                                            ]);
                                        }
                                    })
                                }
                            </Card>
                        </Layout.Section>
                    </Layout>
                    <div style={{ padding: "2rem" }}>
                    </div>
                    <Layout>
                        {resources ? resources.map(c => this.renderResourceCard(c)) : loading}
                    </Layout>
                </Page>
            );
        } else {
            this.invalidSponsor()
        }
    };

    private capitalizeAndOnlyAlphaNumeric(string: string) {
        let firstLetterCapital = (string == "url") ? "URL" : string[0].toUpperCase() + string.slice(1);
        let replaceNonAlphaNumeric = firstLetterCapital.replace(/[^a-z0-9]/gi,' ');
        return replaceNonAlphaNumeric
    }

    private onlyUnique(value: ISponsor, index: number, self: any) {
        var test = index === self.findIndex((t: ISponsor) => {
            return (t.type === value.type)
        });
        return (test);
    }

    private loadInformation(sponsorId: string, sponsorSlug: string) {
        this.setState({ loadingResources: true });
        axios.post(`/sponsors/dashboard-api/load-resources.json`, {
            sponsor_id: sponsorId,
            sponsor_slug: sponsorSlug,
            sponsor_details: ["social_media", "prizes", "workshop", "portal-info", "demo"]
        }).then(res => {
            const status = res.status;
            var portalInfo = undefined;
            if (status >= 200 && status < 300) {
                const data = res.data;
                if (data && "success" in data && data["success"]) {
                    const details = data["details"];
                    if (Array.isArray(details)) {
                        const sorted_by_updated = details.sort((a, b) => (a.updated_at < b.updated_at) ? 1 : -1);
                        const duplicates_removed = sorted_by_updated.filter(this.onlyUnique);
                        const portalInfoJSON = duplicates_removed.reduce((result, r) => {
                            if (r.type === "portal-info") {
                                const pInfo: IPortalDefinition = JSON.parse(r["payload"]);
                                portalInfo = pInfo;
                            } else {
                                let info: IResourceCard = JSON.parse(r["payload"]);
                                info.mainType = r.type;
                                result.push(info);
                            }
                            return result;
                        }, [])
                        this.setState({ resources: portalInfoJSON, portalInfo: portalInfo, loadingResources: false });
                        return;
                    }
                }
            } else {
                toast.error("Failed to load more information");
                this.setState({ loadingResources: true });
            }

            this.setState({ loadingResources: false });
        });
    }

    private renderResourceCard(data: IResourceCard) {
        return (
            <Layout.Section oneThird>
                <Card title={this.capitalizeAndOnlyAlphaNumeric(data.mainType)} sectioned>
                    {
                        (!data || data.files.length === 0) ? <></> : <Image
                            source={data.files[0].url}
                            alt={data.files[0].name}
                            style={{ maxWidth: "100%", maxHeight: "100%" }}
                        />
                    }

                    {data.title ? <DisplayText> {this.capitalizeAndOnlyAlphaNumeric(data.title)}</DisplayText> : <></>}
                    <br />
                    <p>{data.description ? data.description : ""}</p>
                </Card>
            </Layout.Section>
        );
    }

    private invalidSponsor = () => {
        return <Dashboard404 />;
    };

    private retrieveSponsor = (sponsorId: string, sponsorSlug: string) => {
        this.setState({ loadingSponsor: true });
        axios.post(`/sponsors/dashboard-api/get-sponsors-list.json`, {
            sponsor_id: sponsorId,
            sponsor_slug: sponsorSlug,
        }).then(res => {
            const status = res.status;
            if (status >= 200 && status <= 300) {
                const payload = res.data;
                if ("success" in payload && payload["success"]) {
                    const nextSponsor: { id: string, slug: string } = payload["data"]["nextSponsor"];
                    const prevSponsor: { id: string, slug: string } = payload["data"]["prevSponsor"];
                    const sponsor: ISponsor = payload["data"]["sponsor"];
                    this.setState({
                        loadingSponsor: false,
                        sponsorId: sponsorId,
                        sponsor: sponsor,
                        nextSponsor: nextSponsor,
                        prevSponsor: prevSponsor,
                    });
                    return;
                } else {
                    toast.error(payload["message"]);
                    this.setState({ loadingSponsor: true });
                    console.log("Error encountered", payload);
                }
            } else {
                toast.error("Failed to load sponsors");
                this.setState({ loadingSponsor: false });
            }
        })
    }
}

export default withRouter(IndividualSponsor);
