import React, { Component } from "react";
import { Layout, Card, Page, Heading } from "@shopify/polaris";
import axios from 'axios';
import { toast } from "react-toastify";
import { IDashboardProps, IFAQItem } from "../../../interfaces/dashboard.interfaces";
import ReactMarkdown from "react-markdown";
import gfm from 'remark-gfm';


interface IFAQsState {
    loaded: boolean,
    faqs: IFAQItem[],
    faqsLive: boolean,
}

class FAQs extends Component<IDashboardProps, IFAQsState> {

    state = {
        loaded: false,
        faqs: [],
        faqsLive: false,
    }

    componentDidMount() {
        this.loadFAQs();
    }

    render() {
        const { loaded } = this.state;
        return (
            <>
                <div id={"faqs"}>
                    <Page title={"FAQs"}>
                        {loaded
                            ? this.renderFAQs()
                            : <Card sectioned><Heading>Loading FAQs...</Heading></Card>
                        }
                    </Page>
                </div>
            </>
        );
    }


    private renderFAQs() {
        const { faqs, faqsLive } = this.state;
        if (!faqsLive) {
            return <Card sectioned><Heading>Details will be published soon!</Heading></Card>;
        }

        if (faqs.length == 0) {
            return <Card sectioned><Heading>No FAQs to show.</Heading></Card>;
        }

        return (<>{faqs.map(c => this.renderSponsorChallengeCard(c))}</>);
    }

    private renderSponsorChallengeCard(data: IFAQItem) {
        return (
            <Layout key={data.id}>
                <Layout.Section secondary>
                    <div style={{
                        fontWeight: 600,
                        textAlign: "right",
                        fontSize: "1.7rem",
                        padding: "1.7rem",
                    }}>
                        {data.title}
                    </div>
                </Layout.Section>
                <Layout.Section>
                    <Card key={`${Math.random()}`}>
                        <div style={{ padding: "1.5rem" }}>
                            <ReactMarkdown plugins={[gfm]} allowDangerousHtml={true} source={data.answer} className={"markdown-source markdown-body"} />
                        </div>
                    </Card>
                    <br />
                </Layout.Section>
            </Layout>
        );
    }

    private dataUrl = `${this.props.baseStorageUrl}event-data/faqs.json`;
    private loadFAQs() {
        axios.get(this.dataUrl).then(res => {
            const status = res.status;
            if (status >= 200 && status <= 300) {
                const payload = res.data;
                if ("faqs" in payload) {
                    const faqs: IFAQItem[] = payload["faqs"];
                    this.setState({
                        faqs: faqs,
                        faqsLive: payload["live"] || this.props.user.type == "admin",
                        loaded: true
                    });
                }
            } else {
                toast.error("Failed to load FAQs");
                this.setState({ loaded: true });
            }
        });
    }
}

export default FAQs;





