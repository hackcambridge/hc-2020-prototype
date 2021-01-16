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

const sponsorFields: { id: string, title: string, placeholder: string }[] = [
    { id: "1", title: "Industry", placeholder: "" },
    { id: "2", title: "Homepage", placeholder: "Mention anything you want -- it doesn’t have to be technology-related!" },
    { id: "3", title: "Description", placeholder: "" },
    { id: "4", title: "Opportunities", placeholder: "For example GitHub, LinkedIn or your website. Put each link on a new line. " },
]

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
                description:"",
                url:"",
                discord_invite_link:""
            },
            files:[],
        }, //for company main info purposes
    }

    constructor(props: IIndividualSponsorProps & RouteComponentProps){
        super(props);
    }

    componentDidMount() {
        const SponsorId = +this.props.SponsorId;
        console.log("Mounting and next is state",this.state)
        console.log("Mounting and next is props",this.props)
        if (Number.isNaN(SponsorId)) {
            this.setState({ loading: false });
        } else{
            this.retrieveSponsor(SponsorId);
        }
    }

    componentDidUpdate(){
        console.log("Updating and next is state",this.state)
        if (this.state.Sponsor && this.state.loadingDefinitions === true){
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
        const currentSpons:string = currentUrl.substring(currentUrl.lastIndexOf('/')+1);
        console.log(total,currentUrl,base,currentSpons);
        const nextSponsor = (currentSpons != null && !(currentSpons==="")) ? (parseInt(currentSpons) + 1)%total : parseInt(currentSpons)
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
            console.log("rendering stuff here!",user,Sponsor);
            const app: ISponsor = Sponsor;
            const metadata = <>
                {<Badge status={tier_badge()}>{this.capitalizeFirstLetter(tier)}</Badge>}
            </>;
            let logoUrl: string | undefined = this.state.portalInfo.files.find((x:IAssetInformation)=> {x.name.toLowerCase().includes("logo")});
            if (!logoUrl || logoUrl === undefined) {
                // Use backup logo
                logoUrl = "https://www.pngfind.com/pngs/m/665-6659827_enterprise-comments-default-company-logo-png-transparent-png.png";
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
                    primaryAction={{content: 'Speak To Them!', onAction: () => {window.open(this.state.portalInfo.data.discord_invite_link)}}}
                    thumbnail={<Thumbnail
                        source={logoUrl}
                        size="large"
                        alt={`${app.name}`}
                    />}
                >
                    <img style={{width:"100%"}} id="image" src="https://www.unwork.com/wp-content/uploads/2019/08/case-study_body_image-marshall-wace2.jpg"></img>
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
                                            Some text about the company and what it'll be doing.
                                            [SPONSORSHIP TEAM TO WRITE]
                                        </p>
                                    </TextContainer>
                                </div>
                            </Card>
                        </Layout.Section>
                        <Layout.Section>
                            <br />
                            <Card>
                                {sponsorFields.map((value) => {
                                    console.log(value);
                                    return (<Linkify tagName="a" options={{ target: {url: '_blank'} }}>
                                        <div style={{ padding: "1.4rem 2rem" }} key={value.id}>
                                            <Heading>{value.title}</Heading>
                                            <br style={{ lineHeight: "3px" }} />
                                            <TextContainer>Test text</TextContainer>
                                        </div>
                                    </Linkify>);
                                })}
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
        console.log("Called loadInfo",this.state)
        axios.post(`/sponsors/dashboard-api/load-resources.json`, {
            sponsor_id: this.state.Sponsor.id,
            sponsor_slug: this.state.Sponsor.slug,
            // THIS IS WHERE I DETERMINE THE TYPES ALLOWED!
            sponsor_details: ["social-media","prizes","workshop","portal-info","demo-details"]
        }).then(res => {
            const status = res.status;
            var portalInfo = undefined;
            console.log("Load info reso",res)
            if(status >= 200 && status < 300) {
                const data = res.data;
                if(data && "success" in data && data["success"]) {
                    const details = data["details"];
                    if(Array.isArray(details)) {
                        const detailState = details.map(r => {
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
                                // I'm pretty sure there's a nicer way to do this but 
                                // I didn't have time to look it up.
                                const rInfo = {
                                    mainType: r.type,
                                    title: info.title,
                                    description: info.description,
                                    files: info.files,
                                }
                                return rInfo
                            }
                        });
                        
                        this.setState({ resources: detailState, loadingDefinitions: false });
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
        // Title, description, files
        console.log("rendering Resource card, state follows",this.state)
        return (
            <Layout.Section oneThird>
            <Card title={this.capitalizeFirstLetter(data.mainType)} sectioned>
                {
                    (!data && data.files === []) ? <></> : <Image
                    // source = {logoUrl}
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
        console.log("retrieving Sponsor",SponsorId);
        axios.get(`/sponsors/dashboard-api/get-sponsors-reduced.json`).then(res => {
            const status = res.status;
            console.log("Here",res)
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
                    //{"id":2,"name":"Chuen","slug":"chuen","tier":"Chuen2","privileges":";swag;resources;workshop;social_media;mentors[42];recruiters[42]","created_at":"2020-10-31 15:27:29","updated_at":"2020-10-31 15:28:08"}
                    return;
                } else {
                    console.log(payload);
                    toast.error(payload["message"]);
                }
            } else {
                toast.error("Failed to load sponsors");
                this.setState({ loading: false });
            }
        })
    }
}

export default withRouter(IndividualSponsor);