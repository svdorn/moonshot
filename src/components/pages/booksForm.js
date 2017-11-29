"use strict"

import React, { Component } from 'react';
import { MenuItem, InputGroup, DropdownButton, Image, Col, Row, Well, Panel, FormControl, FormGroup, ControlLabel, Button } from 'react-bootstrap';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { findDOMNode } from 'react-dom';
import { postUser, deleteUser, getUsers, resetButton } from '../../actions/booksActions';
import axios from 'axios';

class BooksForm extends Component {
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
    const book = [{
      username: findDOMNode(this.refs.username).value,
      userType: findDOMNode(this.refs.userType).value,
      images: findDOMNode(this.refs.image).value,
      price: findDOMNode(this.refs.price).value
    }];
    this.props.postUser(book);
  }

  onDelete() {
    let bookId = findDOMNode(this.refs.delete).value;

    this.props.deleteUser(bookId);
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
    findDOMNode(this.refs.price).value = '';
    this.setState({img:''});
  }

  render() {

    const booksList = this.props.books.map(function(book) {
      return (
        <option key={book._id}>{book._id}</option>
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
              <FormGroup controlId="price"  validationState={this.props.validation}>
                <ControlLabel>Price</ControlLabel>
                <FormControl
                    type="text"
                    placeholder="Enter Price"
                    ref="price" />
                    <FormControl.Feedback />
              </FormGroup>
              <Button
                onClick={(!this.props.msg)?(this.handleSubmit.bind(this)) : (this.resetForm.bind(this))}
                bsStyle={(!this.props.style)?("primary"):(this.props.style)}>
                {(!this.props.msg)?("Save book"):(this.props.msg)}
              </Button>
            </Panel>
            <Panel style={{marginTop:'25px'}}>
              <FormGroup controlId="formControlsSelect">
                <ControlLabel>Select a book id to delete</ControlLabel>
                <FormControl ref="delete" componentClass="select" placeholder="select">
                  <option value="select">select</option>
                    {booksList}
                </FormControl>
              </FormGroup>
              <Button onClick={this.onDelete.bind(this)} bsStyle="danger">Delete book</Button>
            </Panel>
          </Col>
        </Row>
      </Well>
    );
  }
}

function mapStateToProps(state) {
  return {
    books: state.books.books,
    msg: state.books.msg,
    style: state.books.style,
    validation: state.books.validation
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

export default connect(mapStateToProps, mapDispatchToProps)(BooksForm);
