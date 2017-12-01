"use strict"
import React, { Component } from 'react';
import { TextField, RaisedButton, Paper } from 'material-ui';
import { login } from '../../actions/usersActions';


const styles = {
    floatingLabelStyle: {
        color: '#00c3ff',
    },
};

class Login extends Component {

    handleSubmit(){
        const user = [{
            username: this.refs.username.getValue(),
            password: this.refs.password.getValue(),
        }];

        console.log(user);

        this.props.postUser(user);
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

export default Login;
