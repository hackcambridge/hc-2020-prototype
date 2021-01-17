import React, { Component } from 'react';
import {withRouter, RouteComponentProps} from 'react-router';
import { Page, Card, SkeletonBodyText, Image, MediaCard, Thumbnail, Layout, Heading, TextContainer, DisplayText, Button, Badge, Modal, Stack, RangeSlider, KeyboardKey, Spinner } from '@shopify/polaris';
import Dashboard404 from '../Dashboard404';
import { ISponsor, IUserDetails } from '../../../interfaces/dashboard.interfaces';
import axios from 'axios';
import { toast } from 'react-toastify';
import md5 from 'md5';
import { textFieldQuestions } from './Apply';
import Linkify from 'linkifyjs/react';
import { IAssetInformation, IResourceDefinition, ISponsorData } from '../../../interfaces/sponsors.interfaces';
import "react-responsive-carousel/lib/styles/carousel.min.css"; // requires a loader
import { Carousel } from 'react-responsive-carousel';
import { portal } from '@shopify/polaris/dist/types/latest/src/components/shared';

interface IIndividualSponsorProps {
    SponsorId: string,
}

interface IIndividualSponsorState {
    SponsorId: number | undefined,
    loading: boolean,
    Sponsor: ISponsor | undefined,
    user: IUserDetails | undefined,
    loadingDefinitions: boolean,
    resources: undefined,
    totalNo: number,
    portalInfo: undefined,
}

class IndividualSponsor extends Component<IIndividualSponsorProps & RouteComponentProps, IIndividualSponsorState> {
    
    state = {
        SponsorId: undefined, // possibly redundant copy of ID
        loading: true, // loading main spons object
        loadingDefinitions: true, // loading additional resource cards
        Sponsor: undefined, // key sponsor object
        user: undefined,
        resources: undefined, //where all resource cards are stored
        totalNo: 0, //for pagination purposes
        portalInfo: {
            data:{
                ["description"]:"",
                ["url"]:"",
                ["discord invite link"]:"",
            },
            files:[],
        }, //for company main info purposes
    }

    componentDidMount() {
        const SponsorId = +this.props.SponsorId;
        if (Number.isNaN(SponsorId)) {
            this.setState({ loading: false });
        } else{
            this.retrieveSponsor(SponsorId);
        }
    }

    componentDidUpdate(){
        const {Sponsor, loadingDefinitions} = this.state;
        if (Sponsor && loadingDefinitions === true){
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

    private nextSponsor = () => {
        this.setState({ loading: true });
        const total = this.state.totalNo;
        const currentUrl = this.props.history.location.pathname;
        const base = currentUrl.substring(0, currentUrl.lastIndexOf('/'));
        const currentSponsor:string = currentUrl.substring(currentUrl.lastIndexOf('/')+1);
        const nextSponsor = (currentSponsor != null && !(currentSponsor==="")) ? (parseInt(currentSponsor) + 1)% (total+1) : parseInt(currentSponsor)
        this.props.history.push(`${base}/${nextSponsor}`);
    }

    private renderSponsor = () => {
        const {Sponsor,user,resources} = this.state;
        var loading = 
            <div style={{textAlign:"center",marginTop:"3em"}}>
                <Card sectioned><Heading>Loading more info.....</Heading></Card>
                <div style={{marginTop:"1.5em"}}>
                    <Spinner color="teal" /> 
                </div>
            </div>
        if(Sponsor) {
            const tier = Sponsor.tier;
            const data = this.state.portalInfo.data;
            const portalInfoImages = this.state.portalInfo.files.filter((x:IAssetInformation)=>{return !x.name.toLowerCase().includes("logo")});
            const app: ISponsor | undefined = Sponsor;
            const tier_badge = () => {
                switch(tier.toLowerCase()) {
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
            const carouselDivs = portalInfoImages.map((p:IAssetInformation)=>{
                return(
                    <div>
                        <img src={p.url} />
                        <p className="legend">{p.name}</p>
                    </div>
                )
            })
            const placeholderCarousel = (
                <div>
                    <img style={{width:"100%"}} id="image" src="https://s3.eu-west-2.amazonaws.com/hc-upload/sponsors/not-marhsll-wace/843eb30a-011e-4c42-a1c1-bde699b27f1d.jpg"></img>
                    <p className="legend">An office</p>
                </div>
            )
            let logoUrl: string | undefined = this.state.portalInfo.files.find((x:IAssetInformation)=> {return x.name.toLowerCase().includes("logo")});
            if (!logoUrl || logoUrl === undefined) {
                logoUrl = "https://www.pngfind.com/pngs/m/665-6659827_enterprise-comments-default-company-logo-png-transparent-png.png";
            } else{
                logoUrl = logoUrl.url;
            }
            return (
                <Page 
                    breadcrumbs={[{content: 'Sponsors', url: '../sponsors'}]}
                    title={`${app.name}`}
                    titleMetadata={metadata}
                    subtitle={`Sponsor #${app.id}`}
                    pagination={{
                        hasPrevious: false,
                        hasNext: true,
                        onNext: this.nextSponsor
                    }}
                    primaryAction={{content: 'Speak To Them!', onAction: () => {window.open(this.state.portalInfo.data["discord invite link"])}}}
                    thumbnail={<Thumbnail
                        source={logoUrl}
                        size="large"
                        alt={`${app.name}`}
                    />}
                >
                    <Carousel 
                        renderThumbs={()=>{}}>
                        {carouselDivs.length === 0 ? placeholderCarousel:carouselDivs}
                    </Carousel>
                    <Layout>
                        <Layout.Section secondary>
                            <br />
                            <Card>
                                <div style={{ padding: "1.4rem 2rem"}}>
                                    <DisplayText 
                                    size="large">
                                        {app.name}
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
                                        if (key==="description"){
                                            return
                                        } else{
                                            let value = data[key];
                                            return ([
                                                <Linkify tagName="a" options={{ target: {url: '_blank'} }}>
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
        } else{
            this.invalidSponsor()
        }
    };

    private capitalizeFirstLetter(string: string) {
        return string[0].toUpperCase() + string.slice(1);
    }

    private loadInformation() {
        axios.post(`/sponsors/dashboard-api/load-resources.json`, {
            sponsor_id: this.state.Sponsor.id,
            sponsor_slug: this.state.Sponsor.slug,
            sponsor_details: ["social-media","prizes","workshop","portal-info","demo-details"]
        }).then(res => {
            const status = res.status;
            var portalInfo = undefined;
            if(status >= 200 && status < 300) {
                const data = res.data;
                if(data && "success" in data && data["success"]) {
                    const details = data["details"];
                    if(Array.isArray(details)) {
                        const detailState = details.reduce((result,r)=>{
                            if (r.type==="portal-info"){
                                const pInfo: {
                                    data: {[varName: string]:string},
                                    files: IAssetInformation[]
                                } = JSON.parse(r["payload"]);
                                portalInfo = pInfo;
                            } else{
                                const info: {
                                    title: string,
                                    description: string,
                                    files: IAssetInformation[]
                                } = JSON.parse(r["payload"]);
                                const rInfo = {
                                    mainType: r.type,
                                    title: info.title,
                                    description: info.description,
                                    files: info.files,
                                }
                                result.push(rInfo);
                            }
                            return result;
                        },[])
                        this.setState({ resources: detailState, portalInfo: portalInfo, loadingDefinitions: false });
                        return;
                    }
                }
            } else {
                toast.error("Failed to load more information");
                this.setState({ loadingDefinitions: true });
            }

            this.setState({ loadingDefinitions: false });
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
                    style={{maxWidth:"100%",maxHeight:"100%"}}
                />
                }

                <DisplayText>{data.title ? this.capitalizeFirstLetter(data.title) : "A resource!" }</DisplayText>
                <p>{data.description ? this.capitalizeFirstLetter(data.description) : "" }</p>
            </Card>
            </Layout.Section>
        );
    }

    private invalidSponsor = () => {
        return <Dashboard404 />;
    };

    private retrieveSponsor = (SponsorId: number) => {
        this.setState({ loading: true });
        axios.get(`/sponsors/dashboard-api/get-sponsors-reduced.json`).then(res => {
            const status = res.status;
            if(status >= 200 && status <= 300) {
                const payload = res.data;
                if("success" in payload && payload["success"]) {
                    var total = payload["data"].length;
                    const target: ISponsor = payload["data"].find(sponsor =>{
                        return sponsor.id === SponsorId
                    })
                    this.setState({ 
                        loading: false, 
                        SponsorId: SponsorId,
                        Sponsor: target,
                        totalNo: total,
                    });
                    return;
                } else {
                    toast.error(payload["message"]);
                }
            } else {
                toast.error("Failed to load sponsors");
                this.setState({ loading: false });
            }
        })
    }
}

export default IndividualSponsor;