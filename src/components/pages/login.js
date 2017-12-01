"use strict"
import React, { Component } from 'react';
import { TextField, RaisedButton, Paper } from 'material-ui';
import { login } from '../../actions/usersActions';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';



const styles = {
    floatingLabelStyle: {
        color: '#00c3ff',
    },

};

class Login extends Component {

    handleSubmit(){

        const username = this.refs.username.getValue();
        const password= this.refs.password.getValue();


        this.props.login(username, password);

        console.log(this.state.currentUser);
    }

    render(){
        return (
            <Paper className="form" zDepth={2}>
                <h1>Login</h1>
                <TextField
                    floatingLabelText="Username or Email"
                    type="text"
                    floatingLabelStyle={styles.floatingLabelStyle}
                    ref="username"
                /><br />
                <TextField
                    required={true}
                    valueType={String}
                    floatingLabelText="Password"
                    type="password"
                    floatingLabelStyle={styles.floatingLabelStyle}
                    ref="password"
                /><br />
                <RaisedButton onClick={this.handleSubmit.bind(this)} type="submit" label="Login" primary={true} className="button" />
            </Paper>
        );
    }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({
    login
  }, dispatch);
}

function mapStateToProps(state) {
  return {
    currentUser: state.currentUser
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Login);
