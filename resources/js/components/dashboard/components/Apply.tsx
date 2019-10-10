import React, { Component } from "react";
import { Page, Card, Banner, DropZone, Button, ButtonGroup, Stack, Subheading, TextStyle, TextField, Heading, PageActions } from "@shopify/polaris";
import axios from 'axios';
import { IApplicationRecord } from "../../../interfaces/dashboard.interfaces";

interface IApplyProps {
    canEdit: boolean,
    initialRecord: IApplicationRecord | undefined,
    updateApplication: (application: IApplicationRecord) => void,
}

interface IApplyState {
    uploadedFileURL?: string | undefined,
    uploadedFileName?: string | undefined,
    isUploadingFile: boolean,
    isSaving: boolean,
    questionValues: { [key: string]: string },
    isSubmitted: boolean,
}

function RequiredStar() {
    return <span style={{ color: "red" }}>*</span>;
}

class Apply extends Component<IApplyProps, IApplyState> {

    state = {
        isUploadingFile: false,
        isSaving: false,
        uploadedFileName: this.props.initialRecord ? (this.props.initialRecord.cvFilename || "") : "",
        uploadedFileURL: this.props.initialRecord ? (this.props.initialRecord.cvUrl || "") : "",
        questionValues: (this.props.initialRecord ? JSON.parse(this.props.initialRecord.questionResponses) : {}) as { [key: string]: string },
        isSubmitted: this.props.initialRecord ? this.props.initialRecord.isSubmitted : false,
    }


    private textFieldQuestions: { id: string, title: string, placeholder: string }[] = [
        { id: "1", title: "This is question 1", placeholder: "111" },
        { id: "2", title: "This is question 2", placeholder: "222" },
    ]

    private buildFileSelector() {
        const fileSelector = document.createElement('input');
        fileSelector.setAttribute('type', 'file');
        fileSelector.setAttribute('accept', 'application/pdf');
        fileSelector.onchange = (_) => {
            if(!this.state.isUploadingFile) {
                this.setState({ isUploadingFile: true });
            }
            console.log(fileSelector.files);

            if(fileSelector.files) {
                const file = fileSelector.files.item(0);
                if(file) {
                    this.setState({ 
                        isUploadingFile: false,
                        uploadedFileName: file.name,
                        uploadedFileURL: "https://google.com"
                    });
                    return;
                } 
            }

            this.setState({ isUploadingFile: false });
        }
        return fileSelector;
    }

    private fileSelector: HTMLElement;
    componentDidMount(){
        this.fileSelector = this.buildFileSelector();
        this.loadApplicationRecord();
    }

    handleFileSelect = () => {
        // e.preventDefault();
        this.fileSelector.click();
    }

    handleCVRemove = () => {
        this.setState({
            uploadedFileName: "",
            uploadedFileURL: "",
        });
    }

    private saveForm(submitted: boolean) {
        this.setState({ isSaving: true });
        this.updateRecordInDatabase(submitted);
    }

    render() {
        const { 
            isUploadingFile, 
            uploadedFileName, 
            uploadedFileURL, 
            questionValues,
            isSubmitted,
            isSaving,
        } = this.state;

        return (
            <Page title={"Apply for Hack Cambridge"}>
                <Card sectioned>
                    <Banner status="info">
                        {this.props.canEdit 
                            ? <p>You change this information at any time before the 10th November application deadline.</p>
                            : <p>Application have now closed.</p>
                        }
                    </Banner>

                    <div style={{ paddingBottom: "12px", paddingTop: "30px" }}>
                        <Heading>CV / Resume</Heading>
                    </div>
                    {uploadedFileName.length > 0 
                        ?   <ButtonGroup segmented>
                                <Button outline size="slim" url={uploadedFileURL}>{uploadedFileName}</Button>
                                <Button destructive size="slim" onClick={this.handleCVRemove} disabled={!this.props.canEdit || isSaving}>Remove</Button>
                            </ButtonGroup>
                        :   <Button size="slim" loading={isUploadingFile} onClick={this.handleFileSelect} disabled={!this.props.canEdit}>Upload CV</Button>
                    }

                    {this.textFieldQuestions.map(q => {
                        return (
                            <div key={q.id}>
                                <div style={{ paddingBottom: "12px", paddingTop: "40px" }}>
                                    <Heading>{q.title}</Heading>
                                </div>
                                <TextField
                                    id={q.id}
                                    label=""
                                    value={q.id in questionValues ? questionValues[q.id] : ""}
                                    onChange={(value) => {
                                        const newValues = questionValues;
                                        newValues[q.id] = value;
                                        this.setState({ questionValues: newValues });
                                    }}
                                    multiline={4}
                                    placeholder={q.placeholder}
                                    disabled={!this.props.canEdit}
                                    showCharacterCount
                                />
                            </div>
                        );
                    })}

                    {this.props.canEdit ? 
                        <div style={{ float: "right", padding: "30px 0" }}>
                            {isSubmitted 
                                ? <ButtonGroup segmented>
                                    <Button loading={isSaving} onClick={() => this.saveForm(false)}>Unsubmit</Button>
                                    <Button loading={isSaving} primary onClick={() => this.saveForm(true)}>Update</Button>
                                </ButtonGroup>
                                : <ButtonGroup segmented>
                                    <Button loading={isSaving} onClick={() => this.saveForm(false)}>Save Draft</Button>
                                    <Button loading={isSaving} primary onClick={() => this.saveForm(true)}>Submit</Button>
                                </ButtonGroup>
                            }
                        </div>
                    : <></>}
                </Card>
            </Page>
        );
    }

    private updateRecordInDatabase(isSubmitted: boolean) {
        const questionValues = this.state.questionValues;
        const questions: { [key : string]: string } = {};
        this.textFieldQuestions.forEach(q => {
            questions[q.id] = q.id in questionValues ? questionValues[q.id] : ""
        });

        axios.post(`/dashboard-api/update-application.json`, {
            cvFilename: this.state.uploadedFileName || "",
            cvUrl: this.state.uploadedFileURL || "",
            questionResponses: JSON.stringify(questions),
            isSubmitted: isSubmitted,
        }).then(res => {
            const status = res.status;
            if(status == 200) {
                const payload = res.data;
                if("success" in payload && payload["success"]) {
                    const record: IApplicationRecord = payload["payload"];
                    this.props.updateApplication(record);
                    this.setState({ isSubmitted: isSubmitted, isSaving: false });
                    return;
                }
            }
            console.log(status, res.data);
            this.setState({ isSaving: false });
        });
    }

    private loadApplicationRecord() {
        axios.get(`/dashboard-api/application-record.json`).then(res => {
            const status = res.status;
            if(status == 200) {
                const obj = res.data;
                if ("success" in obj && obj["success"]) {
                    const record: IApplicationRecord = obj["record"] as IApplicationRecord;
                    this.setState({
                        uploadedFileName: record.cvFilename || "",
                        uploadedFileURL: record.cvFilename || "",
                        questionValues: JSON.parse(record.questionResponses) as { [key: string]: string },
                        isSubmitted: record.isSubmitted,
                    });
                    return;
                }
            }
        });
    }
}

export default Apply;