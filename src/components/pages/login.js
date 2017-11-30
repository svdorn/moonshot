"use strict"
import React, { Component } from 'react';
import TextField from 'material-ui/TextField';
import RaisedButton from 'material-ui/RaisedButton';

const styles = {
    underlineStyle: {
        borderColor: '#00c3ff',
    },
    floatingLabelStyle: {
        color: '#00c3ff',
    },
    floatingLabelFocusStyle: {
        color: '#00c3ff',
    },
    button: {
        labelColor: '#00c3ff',
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
                    floatingLabelFocusStyle={styles.floatingLabelFocusStyle}
                    underlineFocusStyle={styles.underlineStyle}
                /><br />
                <TextField
                    floatingLabelText="Password"
                    type="password"
                    floatingLabelStyle={styles.floatingLabelStyle}
                    floatingLabelFocusStyle={styles.floatingLabelFocusStyle}
                    underlineFocusStyle={styles.underlineStyle}
                /><br />
                <RaisedButton label="Submit" labelColor="#fafafa" backgroundColor="#00c3ff" style={styles.button} />
            </div>
        );
    }
}

export default Login;
