"use strict"
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { getUsers } from '../../actions/usersActions';
import { Carousel, Grid, Col, Row, Button } from 'react-bootstrap';

import UserItem from './userItem';
import UsersForm from './usersForm';
import Cart from './cart';

class UsersList extends Component {
  componentDidMount() {
    // Dispatch an action
    this.props.getUsers();
  }
  render() {
    const usersList = this.props.users.map(function(usersArr) {
      return (
        <Col xs={12} m={6} md={4} key={usersArr._id}>
          <UserItem
                _id={usersArr._id}
                username={usersArr.username}
                userType={usersArr.userType}
                images={usersArr.images}
                />
        </Col>
      );
    });

    return (
      <Grid>
        <Row>
          <Carousel>
            <Carousel.Item>
              <img width={900} height={300} alt="900x300" src="/images/RedFletcherHeader.png" />
              <Carousel.Caption>
                <h3>First slide label</h3>
                <p>Nulla vitae elit libero, a pharetra augue mollis interdum.</p>
              </Carousel.Caption>
            </Carousel.Item>
            <Carousel.Item>
              <img width={900} height={300} alt="900x300" src="/images/LongCat.gif" />
              <Carousel.Caption>
                <h3>Second slide label</h3>
                <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
              </Carousel.Caption>
            </Carousel.Item>
          </Carousel>
        </Row>
        <Row>
          <Cart />
        </Row>
        <Row style={{marginTop:'15px'}}>
          {usersList}
        </Row>
      </Grid>
    );
  }
}

function mapStateToProps(state) {
  return {
    users: state.users.users
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({
    getUsers: getUsers
  }, dispatch)
}

export default connect(mapStateToProps, mapDispatchToProps)(UsersList)
