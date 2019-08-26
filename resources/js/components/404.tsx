import React from "react";
import { Link } from "react-router-dom";

import { Button, PageHeader } from "antd";
// import Button from 'antd/es/button';
// import 'antd/es/button/style';

class NotFound extends React.Component {
    render() {
        return (
            <>
                <h1>404</h1>
                <a href="/">X</a>
                <div>{JSON.stringify(this.props)}</div>
                <Button type="primary">Primary</Button>
                <PageHeader onBack={() => null} title="Title" subTitle="This is a subtitle" />
            </>
        )
    }
}

export default NotFound;
