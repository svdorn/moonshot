"use strict"
import React, { Component } from 'react';
import { AppBar, Paper } from 'material-ui';
import { connect } from 'react-redux';
class Profile extends Component{

    render(){
        return(
            <div>
                    <AppBar className="appBar"
                            showMenuIconButton={false}
                            title={this.props.currentUser.name}/>
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        currentUser: state.users.currentUser,
    };
}

export default connect(mapStateToProps)(Profile);