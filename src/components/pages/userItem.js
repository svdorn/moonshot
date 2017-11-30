import React, { Component } from 'react';
import { Image, Row, Col, Well, Button } from 'react-bootstrap';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { addToCart, updateCart } from '../../actions/cartActions';

class UserItem extends Component {

  handleCart() {
    const user = [...this.props.cart, {
      _id: this.props._id,
      username: this.props.username,
      userType: this.props.userType,
      images: this.props.images,
      password: this.props.password,
      email: this.props.email,
      name: this.props.name,
      quantity: 1
    }]

    // CHECK IF CART IS EMPTY
    if (this.props.cart.length > 0) {
      // CART IS NOT EMPTY
      let _id = this.props._id;

      let cartIndex = this.props.cart.findIndex(function(cart) {
        return cart._id === _id;
      })

      // IF RETURNS -1 THERE ARE NO ITEMS WITH SAME ID
      if (cartIndex === -1) {
        this.props.addToCart(user);
      } else {
        // WE NEED TO UPDATE QUANTITY
        this.props.updateCart(_id, 1, this.props.cart)
      }
    } else {
      // CART IS EMPTY
        this.props.addToCart(user);
    }

  }

  constructor() {
    super();
    this.state = {
      isClicked: false
    };
  }

  onReadMore() {
    this.setState({isClicked: true});
  }

  render() {
    return (
      <Well>
        <Row>
          <Col xs={12} sm={4}>
            <Image src={this.props.images} responsive/>
          </Col>
          <Col xs={12} sm={8}>
            <h6>{this.props.username}</h6>
            <p>{(this.props.userType.length > 50 && this.state.isClicked === false)?(this.props.userType.substring(0, 50)):(this.props.userType)}
              <button className='link' onClick={this.onReadMore.bind(this)}>
                {(this.state.isClicked === false && this.props.userType !== null && this.props.userType.length > 50)?('...read more'):('')}
              </button>
            </p>
            <Button onClick={this.handleCart.bind(this)} bsStyle='primary'>Buy now</Button>
          </Col>
        </Row>
      </Well>
    );
  }
}

function mapStateToProps(state) {
  return {
    cart: state.cart.cart
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({
    addToCart: addToCart,
    updateCart: updateCart
  }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(UserItem);
