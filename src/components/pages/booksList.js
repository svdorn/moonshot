"use strict"
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { getUsers } from '../../actions/booksActions';
import { Carousel, Grid, Col, Row, Button } from 'react-bootstrap';

import BookItem from './bookItem';
import BooksForm from './booksForm';
import Cart from './cart';

class BooksList extends Component {
  componentDidMount() {
    // Dispatch an action
    this.props.getUsers();
  }
  render() {
    const booksList = this.props.books.map(function(booksArr) {
      return (
        <Col xs={12} m={6} md={4} key={booksArr._id}>
          <BookItem
                _id={booksArr._id}
                username={booksArr.username}
                userType={booksArr.userType}
                images={booksArr.images}
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
          {booksList}
        </Row>
      </Grid>
    );
  }
}

function mapStateToProps(state) {
  return {
    books: state.books.books
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({
    getUsers: getUsers
  }, dispatch)
}

export default connect(mapStateToProps, mapDispatchToProps)(BooksList)
