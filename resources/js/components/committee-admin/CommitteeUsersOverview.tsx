import React, { Component, ReactNode } from "react";
import {Page, Card, Stack, Button} from '@shopify/polaris';
import {Link} from "react-router-dom";

export function Users(props) {
    return (
        <DataTableLinkExample />
    );
}

class DataTableLinkExample extends Component {
    render() {
        const rows = [
            [
                <Link to="https://www.example.com">Emerald Silk Gown</Link>,
                '$875.00',
                124689,
                140,
                '$122,500.00',
            ],
            [
                <Link to="https://www.example.com">Mauve Cashmere Scarf</Link>,
                '$230.00',
                124533,
                83,
                '$19,090.00',
            ],
            [
                <Link to="https://www.example.com">
                    Navy Merino Wool Blazer with khaki chinos and yellow belt
                </Link>,
                '$445.00',
                124518,
                32,
                '$14,240.00',
            ],
        ];

        return (
            <Page
                breadcrumbs={[{content: 'Orders', url: '/orders'}]}
                title="#1085"
                secondaryActions={[
                    {content: 'Print'},
                    {content: 'Unarchive'},
                    {content: 'Cancel order'},
                ]}
                pagination={{
                    hasPrevious: true,
                    hasNext: true,
                }}
            >
                <Card sectioned title="Fulfill order">
                    <Stack alignment="center">
                        <Stack.Item fill>
                            <p>Buy postage and ship remaining 2 items</p>
                        </Stack.Item>
                        <Button primary>Continue</Button>
                    </Stack>
                </Card>
            </Page>
        );
    }
}


{/*<Page title="Sponsors">*/}
{/*    <Card>*/}
{/*        <DataTable*/}
{/*            columnContentTypes={[*/}
{/*                'text',*/}
{/*                'numeric',*/}
{/*                'numeric',*/}
{/*                'numeric',*/}
{/*                'numeric',*/}
{/*            ]}*/}
{/*            headings={[*/}
{/*                'Product',*/}
{/*                'Price',*/}
{/*                'SKU Number',*/}
{/*                'Quantity',*/}
{/*                'Net sales',*/}
{/*            ]}*/}
{/*            rows={rows}*/}
{/*        />*/}
{/*    </Card>*/}
{/*</Page>*/}
