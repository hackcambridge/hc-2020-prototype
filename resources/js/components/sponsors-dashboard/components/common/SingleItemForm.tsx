import React, { Component } from "react";
import { RouteComponentProps } from "react-router-dom";
import { ISponsorData, IAssetInformation } from "../../../../interfaces/sponsors.interfaces";
import { Button, Page, Card, TextField, ResourceList, Thumbnail, TextStyle } from "@shopify/polaris";
import { AddMajorMonotone } from "@shopify/polaris-icons";
import UploadForm from "./UploadForm";
import DestructiveConfirmation from "./DestructiveConfirmation";

interface ISingleItemFormProps extends RouteComponentProps {
    hasTitle: boolean,
    hasDescription: boolean,
    hasAssets: boolean,
    detailType: string,
    baseSponsorPath: string,
    sponsor: ISponsorData,
    pageTitle: string
}

interface ISingleItemFormState {
    title: string,
    description: string,
    files: IAssetInformation[],
    uploadFormShowing: boolean,
    showDestructiveForm: JSX.Element | undefined
}

class SingleItemForm extends Component<ISingleItemFormProps, ISingleItemFormState> {
    state = {
        title: "",
        description: "",
        files: [],
        uploadFormShowing: false,
        showDestructiveForm: undefined
    }

    render() {
        const { title, description, files, uploadFormShowing, showDestructiveForm } = this.state;
  
        return (
            <Page
                breadcrumbs={[{
                    content: this.props.sponsor.name, 
                    url: this.props.baseSponsorPath
                }]}
                title={this.props.pageTitle}
                // titleMetadata={<Badge status="attention">Outstanding</Badge>}
                // primaryAction={{content: 'Save', disabled: false}}
                // secondaryActions={[{content: 'Duplicate'}, {content: 'View on your store'}]}
            >
                <Card sectioned>
                    <Card.Section>
                        <TextField label="Title" value={title} onChange={this.handleTitleChange} />
                        <br />
                        <TextField label="Description" value={description} onChange={this.handleDescriptionChange} multiline={4}/>
                        <br />
                        {files.length > 0 ? 
                            <ResourceList
                                resourceName={{singular: 'asset', plural: 'assets'}}
                                items={files}
                                renderItem={this.renderAssetThumbnail}
                                showHeader={true}
                                loading={false}
                                alternateTool={
                                    <Button 
                                        plain icon={AddMajorMonotone} 
                                        onClick={() => this.setState({ uploadFormShowing: true })}>
                                    </Button>
                                }
                            />
                        : <Button onClick={() => this.setState({ uploadFormShowing: true })}>Add asset</Button>}
                    </Card.Section>
                    <Card.Section>
                        <Button primary>Save</Button>
                    </Card.Section>
                </Card>
                {uploadFormShowing ? <UploadForm 
                    onClose={() => this.setState({ uploadFormShowing: false })}
                    onSubmit={(urls: string[]) => {
                        urls.forEach(url => {
                            const parts = url.split("/");
                            this.setState({ files: [
                                { name: parts[parts.length - 1], url: url },
                                ...this.state.files
                            ] });
                        });
                    }}
                /> : <></>}
                {showDestructiveForm || <></>}
            </Page>
        );
    }

    handleTitleChange = (value: string) => {
        this.setState({ title: value });
    }

    handleDescriptionChange = (value: string) => {
        this.setState({ description: value });
    }

    renderAssetThumbnail = (item: IAssetInformation) => {
        const { name, url } = item;
        const thumbnail = <Thumbnail source={url} alt={name}></Thumbnail>;
        const actions = [{
            content: 'Delete',
            onAction: () => this.deleteAsset(item)
        }];
        return (
            <ResourceList.Item
                id={name}
                media={thumbnail}
                onClick={() => this.deleteAsset(item)}
                accessibilityLabel={`View details for ${name}`}
                shortcutActions={actions}
            >
                <h3>
                    <TextStyle variation="strong">{name}</TextStyle>
                </h3>
            </ResourceList.Item>
        );
    }

    deleteAsset(item: IAssetInformation) {
        const destructor : JSX.Element = (
            <DestructiveConfirmation 
                onConfirm={() => this.actuallyDeleteAsset(item)}
                onClose={() => this.setState({ showDestructiveForm: undefined })}
            />
        );

        this.setState({ showDestructiveForm: destructor });
    }

    actuallyDeleteAsset(item: IAssetInformation) {
        this.setState({ files: this.state.files.filter(f => f.url !== item.url) });
    }
}

export default SingleItemForm;