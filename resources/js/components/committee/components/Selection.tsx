import React, { Component, ReactNode} from 'react';
import { Page, Card, Tabs, Button, Modal, TextField } from "@shopify/polaris";

interface ISelectionProps {

}

interface ISelectionState {
    selected: number
    newFileModal: boolean
    fileName: string
    files: {id: string, content: string, panelID: string}[]
}

class Selection extends Component<ISelectionProps, ISelectionState> {

    state = {
        selected: 0,
        newFileModal: false,
        fileName: "",
        files: [ {
            id: 'overview',
            content: 'Overview',
            panelID: 'overview-content',
            } ]
    };

    render() {

        return (
            <Page title="Selection">
                <Card>
                    <Tabs tabs={this.state.files} selected={this.state.selected} onSelect={this.handleTabChange} fitted>
                        <Card.Section title={this.state.files[this.state.selected].content}>
                            {this.renderPage()}
                        </Card.Section>
                    </Tabs>
                </Card>

                <Modal
                    open={this.state.newFileModal}
                    onClose={() => this.setState({ newFileModal: false, fileName:"" })}
                    title="New File"
                    primaryAction={{
                        content: 'Create',
                        onAction: this.addNewFile
                    }}
                >
                    <Modal.Section>
                        <TextField label="File name" value={this.state.fileName} onChange={this.handleFileNameChange} />
                    </Modal.Section>
                </Modal>
            </Page>
        );
    }

    private renderPage() : ReactNode {
        if (this.state.selected == 0) {
            return this.renderOverview();
        }
        return (<p>Oops, something has happened</p>);
    }

    private renderOverview() : ReactNode {
        return (
            <Button onClick={() => {
                this.setState({newFileModal: true});
            }} monochrome outline> Create new file</Button>
        );
    }

    private handleTabChange = (index:number) => {
        this.setState({selected: index});
    }

    private handleFileNameChange = (name:string) => {
        this.setState({fileName: name});
    }

    private addNewFile = () => {
        this.setState({fileName: ""});
        this.setState({newFileModal: false});
        this.state.files.push({
            id: this.state.fileName,
            content: this.state.fileName,
            panelID: this.state.fileName
        });
    }
}

export default Selection;