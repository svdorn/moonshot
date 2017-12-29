"use strict"
import React, { Component } from 'react';
import {connect} from 'react-redux';
import { Paper, Menu, MenuItem, Divider } from 'material-ui';
import PasswordChange from './passwordchange';
import Account from './account';

class Settings extends Component {
    constructor(props) {
        super(props);
        this.state = {value: 1};
    }

    handleChange = (event, index) => {
        this.setState({value: index})
    };

    //name, username, email, password, confirm password, signup button
    render() {
        console.log(this.props);
        return (
            <div className="fullHeight greenToBlue">
                {this.props.notification !== undefined ?
                    <Paper className={"messageHeader " + this.props.notification.type}>
                        {this.props.notification.message}
                    </Paper>
                    :
                    null
                }
                <div className="container">
                    <Paper className="boxStyle">
                        <Menu value={this.state.value} onChange={this.handleChange} style={{backgroundColor:'#00c3ff'}}>
                            <MenuItem primaryText="Account" disabled={true}/>
                            <Divider/>
                            <MenuItem value={1} primaryText="Settings"/>
                            <MenuItem value={2} style={{color:'white'}} primaryText="Change Password"/>
                        </Menu>
                    </Paper>
                    {this.state.value === 1 ?
                        <Account />
                        :
                       <PasswordChange />
                    }
                </div>
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
    };
}

export default connect(mapStateToProps)(Settings);
