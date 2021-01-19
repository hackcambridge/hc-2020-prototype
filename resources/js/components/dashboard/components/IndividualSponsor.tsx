import React, { Component } from 'react';
import { withRouter, RouteComponentProps } from 'react-router';
import { Page, Card, SkeletonBodyText, Image, Thumbnail, Layout, Heading, TextContainer, DisplayText, Badge, Spinner } from '@shopify/polaris';
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
}

interface IIndividualSponsorState {
    sponsorId: string | undefined,
    loading: boolean,
    sponsor: ISponsor | undefined,
    user: IUserDetails | undefined,
    resources: IResourceCard[],
    nextSponsor: string | undefined,
    portalInfo: IPortalDefinition | undefined,
}

class IndividualSponsor extends Component<IIndividualSponsorProps & RouteComponentProps, IIndividualSponsorState> {

    state = {
        sponsorId: undefined,
        loading: true,
        sponsor: undefined,
        user: undefined,
        resources: [],
        nextSponsor: undefined,
        portalInfo: {
            data: {
                ["description"]: "",
                ["url"]: "",
                ["discord invite link"]: "",
            },
            files: [],
        },
    }

    constructor(props: IIndividualSponsorProps & RouteComponentProps) {
        super(props);
    }

    componentDidMount() {
        const sponsorId = this.props.sponsorId;
        if (!sponsorId) {
            this.setState({ loading: false });
        } else {
            this.retrieveSponsor(sponsorId, true);
        }
    }

    componentDidUpdate() {
        const { sponsor, loading } = this.state;
        if (sponsor && loading === true) {
            this.loadInformation();
        }
    }

    render() {
        const { sponsorId, loading } = this.state;
        return (<>
            { loading
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
        this.setState({ loading: true });
        const nextSponsor = this.state.nextSponsor;
        const currentUrl = this.props.history.location.pathname;
        const base = currentUrl.substring(0, currentUrl.lastIndexOf('/'));
        console.log('base', base);
        if(nextSponsor){
            await this.retrieveSponsor(nextSponsor, true);
        }
        // await this.loadInformation();
        this.props.history.push(`${base}/${nextSponsor}`);
    }

    private renderSponsor = () => {
        const { sponsor, resources, portalInfo } = this.state;
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
                {<Badge status={tier_badge()}>{this.capitalizeFirstLetter(tier)}</Badge>}
            </>;
            const carouselDivs = portalInfoImages.map((p: IAssetInformation) => {
                return (
                    <div>
                        <img src={p.url} />
                        <p className="legend">{p.name}</p>
                    </div>
                )
            })
            const placeholderCarousel = (
                <div>
                    <img style={{ width: "100%" }} id="image" src={"https://" + window.location.hostname + "/images/office-background.jpg"}></img>
                    <p className="legend">An office</p>
                </div>
            )
            let logoUrl: string | undefined = portalInfo.files.find((x: IAssetInformation) => { return x.name.toLowerCase().includes("logo") });
            if (!logoUrl || logoUrl === undefined) {
                window.location.hostname
                logoUrl = "https://" + window.location.hostname + "/images/no-logo-sponsor.png";
            }
            // } else {
            //     logoUrl = logoUrl.url;
            // }
            return (
                <Page
                    breadcrumbs={[{ content: 'Sponsors', url: '../sponsors' }]}
                    title={`${actual_sponsor.name}`}
                    titleMetadata={metadata}
                    subtitle={`Sponsor #${actual_sponsor.id}`}
                    pagination={{
                        hasPrevious: false,
                        hasNext: true,
                        onNext: this.nextSponsor
                    }}
                    primaryAction={{ content: 'Speak To Them!', onAction: () => { window.open(this.state.portalInfo.data["discord invite link"]) } }}
                    thumbnail={<Thumbnail
                        source={logoUrl}
                        size="large"
                        alt={`${actual_sponsor.name}`}
                    />}
                >
                    <Carousel
                        renderThumbs={() => { }}>
                        {carouselDivs.length === 0 ? placeholderCarousel : carouselDivs}
                    </Carousel>
                    <Layout>
                        <Layout.Section secondary>
                            <br />
                            <Card>
                                <div style={{ padding: "1.4rem 2rem" }}>
                                    <DisplayText
                                        size="large">
                                        {actual_sponsor.name}
                                    </DisplayText>
                                    <TextContainer>
                                        <Heading>About</Heading>
                                        <p>
                                            {data.description}
                                        </p>
                                    </TextContainer>
                                </div>
                            </Card>
                        </Layout.Section>
                        <Layout.Section>
                            <br />
                            <Card>
                                {
                                    Object.keys(data).map((key, index) => {
                                        if (key === "description") {
                                            return
                                        } else {
                                            let value = data[key];
                                            return ([
                                                <Linkify tagName="a" options={{ target: { url: '_blank' } }}>
                                                    <div style={{ padding: "1.4rem 2rem" }} key={index}>
                                                        <Heading>{this.capitalizeFirstLetter(key)}</Heading>
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

    private capitalizeFirstLetter(string: string) {
        return string[0].toUpperCase() + string.slice(1);
    }

    private loadInformation() {
        const { sponsor } = this.state;
        if (sponsor) {
            const actual_sponsor: ISponsor = sponsor!;
            axios.post(`/sponsors/dashboard-api/load-resources.json`, {
                sponsor_id: actual_sponsor.id,
                sponsor_slug: actual_sponsor.slug,
                sponsor_details: ["social-media", "prizes", "workshop", "portal-info", "demo-details"]
            }).then(res => {
                const status = res.status;
                var portalInfo = undefined;
                if (status >= 200 && status < 300) {
                    const data = res.data;
                    if (data && "success" in data && data["success"]) {
                        const details = data["details"];
                        if (Array.isArray(details)) {
                            const portalInfoJSON = details.reduce((result, r) => {
                                if (r.type === "portal-info") {
                                    const pInfo: IPortalDefinition = JSON.parse(r["payload"]);
                                    portalInfo = pInfo;
                                } else {
                                    let info: IResourceCard
                                        = JSON.parse(r["payload"]);
                                    info.mainType = r.type;
                                    result.push(info);
                                }
                                return result;
                            }, [])
                            this.setState({ resources: portalInfoJSON, portalInfo: portalInfo, loading: false });
                            return;
                        }
                    }
                } else {
                    toast.error("Failed to load more information");
                    this.setState({ loading: true });
                }

                this.setState({ loading: false });
            });
        } else {
            toast.error("No selected sponsor");
        }
    }

    private renderResourceCard(data: IResourceCard) {
        return (
            <Layout.Section oneThird>
                <Card title={this.capitalizeFirstLetter(data.mainType)} sectioned>
                    {
                        (!data || data.files.length === 0) ? <></> : <Image
                            source={data.files[0].url}
                            alt={data.files[0].name}
                            style={{ maxWidth: "100%", maxHeight: "100%" }}
                        />
                    }

                    <DisplayText>{data.title ? this.capitalizeFirstLetter(data.title) : "An untitled resource"}</DisplayText>
                    <p>{data.description ? this.capitalizeFirstLetter(data.description) : ""}</p>
                </Card>
            </Layout.Section>
        );
    }

    private invalidSponsor = () => {
        return <Dashboard404 />;
    };

    private onlyUnique(value: ISponsor, index: number, self: any) {
        var test = index === self.findIndex((t: ISponsor) => {
            return (t.id === value.id)
        });
        return (test);
    }

    private retrieveSponsor = async (sponsorId: string, callback: boolean = false) => {
        this.setState({ loading: true });
        var optionalCallback = callback ? this.loadInformation : () => { };
        axios.get(`/sponsors/dashboard-api/get-sponsors-display.json`).then(res => {
            const status = res.status;
            if (status >= 200 && status <= 300) {
                const payload = res.data;
                if ("success" in payload && payload["success"]) {
                    var sortedSponsors = payload["data"].sort((a: ISponsor, b: ISponsor) => (a.name > b.name) ? 1 : -1);
                    sortedSponsors = sortedSponsors.filter(this.onlyUnique);
                    var index = sortedSponsors.map((sponsor: ISponsor) => { return sponsor.id }).indexOf(sponsorId);
                    var nextSponsor = sortedSponsors[(index + 1) % sortedSponsors.length];
                    var nextId = nextSponsor === undefined ? sponsorId : nextSponsor.id;
                    const target: ISponsor = payload["data"].find((sponsor: ISponsor) => {
                        return sponsor.id === sponsorId
                    })
                    this.setState({
                        loading: callback,
                        sponsorId: sponsorId,
                        sponsor: target,
                        nextSponsor: nextId,
                    }, optionalCallback);
                    return;
                } else {
                    toast.error(payload["message"]);
                    this.setState({ loading: true });
                    console.log("Error encountered", payload);
                }
            } else {
                toast.error("Failed to load sponsors");
                this.setState({ loading: false });
            }
        })
    }
}

export default withRouter(IndividualSponsor);
