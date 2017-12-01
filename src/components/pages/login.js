"use strict"
import React, { Component } from 'react';
import TextField from 'material-ui/TextField';
import RaisedButton from 'material-ui/RaisedButton';

const styles = {
    floatingLabelStyle: {
        color: '#00c3ff',
    },
    button: {
        margin: '12px 0 0 0',
    },
};

class Login extends Component {
    render(){
        return (
            <div>
                <TextField
                    floatingLabelText="Username or Email"
                    type="text"
                    floatingLabelStyle={styles.floatingLabelStyle}
                /><br />
                <TextField
                    floatingLabelText="Password"
                    type="password"
                    floatingLabelStyle={styles.floatingLabelStyle}
                /><br />
                <RaisedButton type="submit" label="Login" primary={true} style={styles.button} />
            </div>
        );
    }
}

export default Login;
