"use strict"
import React, {Component} from 'react';
import {Col, Well, Button, Form, FormControl, FormGroup, Checkbox, ControlLabel} from 'react-bootstrap';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { findDOMNode } from 'react-dom';
import { postUser, getUsers } from '../../actions/usersActions';
import axios from 'axios';


class Signup extends Component {
  handleSubmit() {
      // TODO get the users, check if a user with that username already exists,
      // eventually will want to do this as they are entering in their Username

      // check that the passwords match, if not don't let them submit
      // eventually will want to do this as passwords are being typed in
      const password = findDOMNode(this.refs.password1).value;
      const password2 = findDOMNode(this.refs.password2).value;
      if (password != password2) {
          console.log("passwords do not match");
          return;
      }

      const user = [{
          username: findDOMNode(this.refs.username).value,
          userType: "student",
          //userType: findDOMNode(this.refs.userType).value,
          //images: findDOMNode(this.refs.image).value,
          password: findDOMNode(this.refs.password1).value,
          email: findDOMNode(this.refs.email).value,
          name: findDOMNode(this.refs.name).value
      }];

      console.log(user);

      this.props.postUser(user);
  }

    render() {
        return (
            <Well>
                <Form horizontal>
                    <FormGroup controlId="formHorizontalEmail">
                        <Col componentClass={ControlLabel} sm={2}>
                            Full Name
                        </Col>
                        <Col sm={10}>
                            <FormControl
                                type="text"
                                placeholder="John"
                                ref="name"
                            />
                        </Col>
                    </FormGroup>

                    <FormGroup controlId="formHorizontalEmail">
                        <Col componentClass={ControlLabel} sm={2}>
                            Username
                        </Col>
                        <Col sm={10}>
                            <FormControl
                                type="text"
                                placeholder="jsmith"
                                ref="username"
                            />
                        </Col>
                    </FormGroup>

                    <FormGroup controlId="formHorizontalEmail">
                        <Col componentClass={ControlLabel} sm={2}>
                            Email
                        </Col>
                        <Col sm={10}>
                            <FormControl
                                type="email"
                                placeholder="Email"
                                ref="email"
                            />
                        </Col>
                    </FormGroup>

                    <FormGroup controlId="formHorizontalPassword">
                        <Col componentClass={ControlLabel} sm={2}>
                            Password
                        </Col>
                        <Col sm={10}>
                            <FormControl
                                type="password"
                                placeholder="Password"
                                ref="password1"
                            />
                        </Col>
                    </FormGroup>

                    <FormGroup controlId="formHorizontalPassword">
                        <Col componentClass={ControlLabel} sm={2}>
                            Confirm Password
                        </Col>
                        <Col sm={10}>
                            <FormControl
                                type="password"
                                placeholder="Confirm Password"
                                ref="password2"
                            />
                        </Col>
                    </FormGroup>

                    <FormGroup>
                        <Col smOffset={2} sm={10}>
                            <Button onClick={this.handleSubmit.bind(this)}>
                                Sign up
                            </Button>
                        </Col>
                    </FormGroup>
                </Form>
            </Well>
        );
    }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({
    postUser,
    getUsers
  }, dispatch);
}

export default connect(null, mapDispatchToProps)(Signup);
