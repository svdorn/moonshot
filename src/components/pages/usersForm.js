"use strict"

import React, { Component } from 'react';
import { MenuItem, InputGroup, DropdownButton, Image, Col, Row, Well, Panel, FormControl, FormGroup, ControlLabel, Button } from 'react-bootstrap';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { findDOMNode } from 'react-dom';
import { postUser, deleteUser, getUsers, resetButton } from '../../actions/usersActions';
import axios from 'axios';

class UsersForm extends Component {
  constructor() {
    super();
    this.state = {
      images:[{}],
      img:''
    }
  }

  componentDidMount() {
    this.props.getUsers();

    // GET IMAGES FROM API
    axios.get('/api/images')
      .then(response => {
        this.setState({images: response.data})
      })
      .catch(err => {
        this.setState({images:'error loading image files from the server', img:''})
      })
  }

  handleSubmit() {
    const user = [{
      username: findDOMNode(this.refs.username).value,
      userType: findDOMNode(this.refs.userType).value,
      images: findDOMNode(this.refs.image).value,
      password: findDOMNode(this.refs.password).value,
      email: findDOMNode(this.refs.email).value,
      name: findDOMNode(this.refs.name).value
    }];
    this.props.postUser(user);
  }

  onDelete() {
    let userId = findDOMNode(this.refs.delete).value;

    this.props.deleteUser(userId);
  }

  handleSelect(img) {
    this.setState({
      img: '/images/' + img
    })
  }

  resetForm() {
    // RESET the Button
    this.props.resetButton();

    findDOMNode(this.refs.username).value = '';
    findDOMNode(this.refs.userType).value = '';
    findDOMNode(this.refs.email).value = '';
    findDOMNode(this.refs.password).value = '';
    findDOMNode(this.refs.name).value = '';
    this.setState({img:''});
  }

  render() {

    const usersList = this.props.users.map(function(user) {
      return (
        <option key={user._id}>{user._id}</option>
      );
    })

    const imgList = this.state.images.map(function(imgArr, i) {
      return (
        <MenuItem key={i} eventKey={imgArr.name}
          onClick={this.handleSelect.bind(this, imgArr.name)}>
          {imgArr.name}
        </MenuItem>
      )
    }, this)

    return (
      <Well>
        <Row>
          <Col xs={12} sm={6}>
            <Panel>
              <InputGroup>
                <FormControl type="text" ref="image" value={this.state.img} />
                <DropdownButton
                  componentClass={InputGroup.Button}
                  id="input-dropdown-addon"
                  title="Select an image"
                  bsStyle="primary">
                  {imgList}
                </DropdownButton>
              </InputGroup>
              <Image src={this.state.img} responsive />
            </Panel>
          </Col>
          <Col xs={12} sm={6}>
            <Panel>
              <FormGroup controlId="username" validationState={this.props.validation}>
                <ControlLabel>Username</ControlLabel>
                <FormControl
                    type="text"
                    placeholder="Enter username"
                    ref="username" />
                    <FormControl.Feedback />
              </FormGroup>
              <FormGroup controlId="userType"  validationState={this.props.validation}>
                <ControlLabel>UserType</ControlLabel>
                <FormControl
                    type="text"
                    placeholder="Enter User Type"
                    ref="userType" />
                    <FormControl.Feedback />
              </FormGroup>
              <FormGroup controlId="email"  validationState={this.props.validation}>
                <ControlLabel>Email</ControlLabel>
                <FormControl
                    type="text"
                    placeholder="Enter Email"
                    ref="email" />
                    <FormControl.Feedback />
              </FormGroup>
              <FormGroup controlId="name"  validationState={this.props.validation}>
                <ControlLabel>Name</ControlLabel>
                <FormControl
                    type="text"
                    placeholder="Enter Name"
                    ref="name" />
                    <FormControl.Feedback />
              </FormGroup>
              <FormGroup controlId="password"  validationState={this.props.validation}>
                <ControlLabel>Password</ControlLabel>
                <FormControl
                    type="text"
                    placeholder="Enter Password"
                    ref="password" />
                    <FormControl.Feedback />
              </FormGroup>
              <Button
                onClick={(!this.props.msg)?(this.handleSubmit.bind(this)) : (this.resetForm.bind(this))}
                bsStyle={(!this.props.style)?("primary"):(this.props.style)}>
                {(!this.props.msg)?("Save user"):(this.props.msg)}
              </Button>
            </Panel>
            <Panel style={{marginTop:'25px'}}>
              <FormGroup controlId="formControlsSelect">
                <ControlLabel>Select a user id to delete</ControlLabel>
                <FormControl ref="delete" componentClass="select" placeholder="select">
                  <option value="select">select</option>
                    {usersList}
                </FormControl>
              </FormGroup>
              <Button onClick={this.onDelete.bind(this)} bsStyle="danger">Delete user</Button>
            </Panel>
          </Col>
        </Row>
      </Well>
    );
  }
}

function mapStateToProps(state) {
  return {
    users: state.users.users,
    msg: state.users.msg,
    style: state.users.style,
    validation: state.users.validation
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({
    postUser,
    deleteUser,
    getUsers,
    resetButton
  }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(UsersForm);
