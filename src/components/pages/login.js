"use strict"
import React, { Component } from 'react';
import { TextField, RaisedButton, Paper } from 'material-ui';

const styles = {
    floatingLabelStyle: {
        color: '#00c3ff',
    },
};

class Login extends Component {
    render(){
        return (
            <Paper className="form" zDepth={2}>
                <h1>Login</h1>
                <TextField
                    floatingLabelText="Username or Email"
                    type="text"
                    floatingLabelStyle={styles.floatingLabelStyle}
                /><br />
                <TextField
                    required={true}
                    valueType={String}
                    floatingLabelText="Password"
                    type="password"
                    floatingLabelStyle={styles.floatingLabelStyle}
                /><br />
                <RaisedButton type="submit" label="Login" primary={true} className="button" />
            </Paper>
        );
    }
}

export default Login;
