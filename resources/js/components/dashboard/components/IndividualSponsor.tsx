import React, { Component } from 'react';
import { withRouter, RouteComponentProps } from 'react-router';
import { Page, Card, SkeletonBodyText, Image, MediaCard, Thumbnail, Layout, Heading, TextContainer, DisplayText, Button, Badge, Modal, Stack, RangeSlider, KeyboardKey, Spinner } from '@shopify/polaris';
import Dashboard404 from '../Dashboard404';
import { ISponsor, IUserDetails } from '../../../interfaces/dashboard.interfaces';
import axios from 'axios';
import { toast } from 'react-toastify';
import Linkify from 'linkifyjs/react';
import { IAssetInformation, IResourceDefinition, ISponsorData } from '../../../interfaces/sponsors.interfaces';
import "react-responsive-carousel/lib/styles/carousel.min.css"; // requires a loader
import { Carousel } from 'react-responsive-carousel';

interface IIndividualSponsorProps {
    SponsorId: string,
}

interface IIndividualSponsorState {
    SponsorId: number | undefined,
    loading: boolean,
    Sponsor: ISponsor | undefined,
    user: IUserDetails | undefined,
    loadingResources: boolean,
    resources: undefined,
    nextSponsor: number,
    portalInfo: undefined,
}

class IndividualSponsor extends Component<IIndividualSponsorProps & RouteComponentProps, IIndividualSponsorState> {

    state = {
        SponsorId: undefined,
        loading: true,
        loadingResources: true,
        Sponsor: undefined,
        user: undefined,
        resources: undefined,
        nextSponsor: 0,
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
        const SponsorId = +this.props.SponsorId;
        if (Number.isNaN(SponsorId)) {
            this.setState({ loading: false });
        } else {
            this.retrieveSponsor(SponsorId);
        }
    }

    componentDidUpdate() {
        const { Sponsor, SponsorId, loading, loadingResources } = this.state;
        if (Sponsor && loadingResources === true) {
            this.loadInformation();
        }
    }

    render() {
        const { SponsorId, loading } = this.state;
        return (<>
            { loading
                ? this.loadingMarkup
                : SponsorId
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
        await this.retrieveSponsor(nextSponsor,true);
        // await this.loadInformation();
        this.props.history.push(`${base}/${nextSponsor}`);
    }

    private renderSponsor = () => {
        const { Sponsor, resources } = this.state;
        var loading =
            <div style={{ textAlign: "center", marginTop: "3em" }}>
                <Card sectioned><Heading>Loading more info.....</Heading></Card>
                <div style={{ marginTop: "1.5em" }}>
                    <Spinner color="teal" />
                </div>
            </div>
        if (Sponsor) {
            const tier = Sponsor.tier;
            const data = this.state.portalInfo.data;
            const portalInfoImages = this.state.portalInfo.files.filter((x: IAssetInformation) => { return !x.name.toLowerCase().includes("logo") });
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
                    <img style={{ width: "100%" }} id="image" src="https://s3.eu-west-2.amazonaws.com/hc-upload/sponsors/not-marhsll-wace/843eb30a-011e-4c42-a1c1-bde699b27f1d.jpg"></img>
                    <p className="legend">An office</p>
                </div>
            )
            let logoUrl: string | undefined = this.state.portalInfo.files.find((x: IAssetInformation) => { return x.name.toLowerCase().includes("logo") });
            if (!logoUrl || logoUrl === undefined) {
                logoUrl = "https://s3.eu-west-2.amazonaws.com/hc-upload/sponsors/not-marhsll-wace/c1ec840f-aee7-4fea-9d90-735767708767.png";
            } else {
                logoUrl = logoUrl.url;
            }
            return (
                <Page
                    breadcrumbs={[{ content: 'Sponsors', url: '../sponsors' }]}
                    title={`${Sponsor.name}`}
                    titleMetadata={metadata}
                    subtitle={`Sponsor #${Sponsor.id}`}
                    pagination={{
                        hasPrevious: false,
                        hasNext: true,
                        onNext: this.nextSponsor
                    }}
                    primaryAction={{ content: 'Speak To Them!', onAction: () => { window.open(this.state.portalInfo.data["discord invite link"]) } }}
                    thumbnail={<Thumbnail
                        source={logoUrl}
                        size="large"
                        alt={`${Sponsor.name}`}
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
                                        {Sponsor.name}
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
                                                        <TextContainer>{value} hi</TextContainer>
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

    private async loadInformation() {
        axios.post(`/sponsors/dashboard-api/load-resources.json`, {
            sponsor_id: this.state.Sponsor.id,
            sponsor_slug: this.state.Sponsor.slug,
            sponsor_details: ["social-media", "prizes", "workshop", "portal-info", "demo-details"]
        }).then(res => {
            console.log("loading info",this.state);
            const status = res.status;
            var portalInfo = undefined;
            if (status >= 200 && status < 300) {
                const data = res.data;
                if (data && "success" in data && data["success"]) {
                    const details = data["details"];
                    if (Array.isArray(details)) {
                        const portalInfoJSON = details.reduce((result, r) => {
                            if (r.type === "portal-info") {
                                const pInfo: {
                                    data: { [varName: string]: string },
                                    files: IAssetInformation[]
                                } = JSON.parse(r["payload"]);
                                portalInfo = pInfo;
                            } else {
                                let info: {
                                    title: string,
                                    description: string,
                                    files: IAssetInformation[]
                                } = JSON.parse(r["payload"]);
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

    private renderResourceCard(data) {
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
    
    private onlyUnique(value, index, self) {
        var test = index === self.findIndex(t => {
            return (t.id === value.id)
        });
        return (test);
    }

    private retrieveSponsor = async (SponsorId: number, callback: boolean = false) => {
        this.setState({ loading: true });
        var optionalCallback = callback ? this.loadInformation : () => {};
        axios.get(`/sponsors/dashboard-api/get-sponsors-reduced.json`).then(res => {
            const status = res.status;
            if (status >= 200 && status <= 300) {
                const payload = res.data;
                if ("success" in payload && payload["success"]) {
                    var sortedSponsors = payload["data"].sort((a, b) => (a.name > b.name) ? 1 : -1);
                    sortedSponsors = sortedSponsors.filter(this.onlyUnique);
                    var index = sortedSponsors.map(sponsor => { return sponsor.id }).indexOf(SponsorId);
                    var nextSponsor = sortedSponsors[(index+1)%sortedSponsors.length];
                    var nextId = nextSponsor === undefined ? SponsorId : nextSponsor.id;
                    const target: ISponsor = payload["data"].find(sponsor => {
                        return sponsor.id === SponsorId
                    })
                    this.setState({
                        loading: false,
                        SponsorId: SponsorId,
                        Sponsor: target,
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