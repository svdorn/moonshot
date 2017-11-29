"use strict"
import React, {Component} from 'react';
import {Col, Well, Button, Form, FormControl, FormGroup, Checkbox, ControlLabel} from 'react-bootstrap';

class Signup extends Component {
    render() {
        return (
            <Well>
                <Form horizontal>
                    <FormGroup controlId="formHorizontalEmail">
                        <Col componentClass={ControlLabel} sm={2}>
                            First Name
                        </Col>
                        <Col sm={10}>
                            <FormControl type="text" placeholder="John"/>
                        </Col>
                    </FormGroup>

                    <FormGroup controlId="formHorizontalEmail">
                        <Col componentClass={ControlLabel} sm={2}>
                            Last Name
                        </Col>
                        <Col sm={10}>
                            <FormControl type="text" placeholder="Smith"/>
                        </Col>
                    </FormGroup>

                    <FormGroup controlId="formHorizontalEmail">
                        <Col componentClass={ControlLabel} sm={2}>
                            Username
                        </Col>
                        <Col sm={10}>
                            <FormControl type="text" placeholder="jsmith"/>
                        </Col>
                    </FormGroup>

                    <FormGroup controlId="formHorizontalEmail">
                        <Col componentClass={ControlLabel} sm={2}>
                            Email
                        </Col>
                        <Col sm={10}>
                            <FormControl type="email" placeholder="Email"/>
                        </Col>
                    </FormGroup>

                    <FormGroup controlId="formHorizontalPassword">
                        <Col componentClass={ControlLabel} sm={2}>
                            Password
                        </Col>
                        <Col sm={10}>
                            <FormControl type="password" placeholder="Password"/>
                        </Col>
                    </FormGroup>

                    <FormGroup controlId="formHorizontalPassword">
                        <Col componentClass={ControlLabel} sm={2}>
                            Confirm Password
                        </Col>
                        <Col sm={10}>
                            <FormControl type="password" placeholder="Confirm Password"/>
                        </Col>
                    </FormGroup>

                    <FormGroup>
                        <Col smOffset={2} sm={10}>
                            <Button type="submit">
                                Sign up
                            </Button>
                        </Col>
                    </FormGroup>
                </Form>
            </Well>
        );
    }
}

export default Signup;