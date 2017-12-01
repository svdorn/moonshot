"use strict"
import React, {Component} from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { findDOMNode } from 'react-dom';
import { postUser, getUsers } from '../../actions/usersActions';
import { TextField, RaisedButton } from 'material-ui';
import axios from 'axios';

const styles = {
    floatingLabelStyle: {
        color: '#00c3ff',
    },
    button: {
        margin: '12px 0 0 0',
    },
};

class Signup extends Component {

  handleSubmit() {
      // make sure nothing is blank
      // TODO change how the fields look, make them red if they are blank
      const username = this.refs.username.getValue();
      if (username == "") {
          console.log("username can't be blank");
          return;
      }
      const email = this.refs.email.getValue();
      if (email == "") {
          console.log("email can't be blank");
          return;
      }
      const name = this.refs.name.getValue();
      if (name == "") {
          console.log("name can't be blank");
          return;
      }


      // TODO get the users, check if a user with that username already exists,
      // eventually will want to do this as they are entering in their Username

      // check that the passwords match, if not don't let them submit
      // eventually will want to do this as passwords are being typed in
      const password = this.refs.password.getValue();
      const password2 = this.refs.password2.getValue();
      if (password == "") {
          console.log("password can't be blank");
          return;
      }
      if (password != password2) {
          console.log("passwords do not match");
          return;
      }

      const user = [{
          username: username,
          userType: "student",
          //userType: findDOMNode(this.refs.userType).value,
          //images: findDOMNode(this.refs.image).value,
          password: password,
          email: email,
          name: name
      }];

      console.log(user);

      this.props.postUser(user);
  }

  //name, username, email, password, confirm password, signup button
    render() {
        return (
            <div>
                <TextField
                    floatingLabelText="Full Name"
                    type="text"
                    floatingLabelStyle={styles.floatingLabelStyle}
                    ref="name"
                /><br />
                <TextField
                    floatingLabelText="Username"
                    type="text"
                    floatingLabelStyle={styles.floatingLabelStyle}
                    ref="username"
                /><br />
                <TextField
                    floatingLabelText="Email"
                    type="email"
                    floatingLabelStyle={styles.floatingLabelStyle}
                    ref="email"
                /><br />
                <TextField
                    floatingLabelText="Password"
                    type="password"
                    floatingLabelStyle={styles.floatingLabelStyle}
                    ref="password"
                /><br />
                <TextField
                    floatingLabelText="Confirm Password"
                    type="password"
                    floatingLabelStyle={styles.floatingLabelStyle}
                    ref="password2"
                /><br />
                <RaisedButton onClick={this.handleSubmit.bind(this)} type="submit" label="Sign up" primary={true} style={styles.button} />
            </div>
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
