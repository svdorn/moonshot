"use strict"
import React, {Component} from 'react';
import {connect} from 'react-redux';
import {browserHistory} from 'react-router';
import {closeNotification} from "../../actions/usersActions";
import {bindActionCreators} from 'redux';
import axios from 'axios';
import MetaTags from 'react-meta-tags';

class ApplyContainer extends Component {
    constructor(props) {
        super(props);

        this.state = {
            users: []
        };
    }

    render() {
        return (
            <div>
                <MetaTags>
                    <title>Apply | Moonshot</title>
                    <meta name="description" content="Moonshot admin page." />
                </MetaTags>
                    <div>
                        {this.props.children}
                    </div>
            </div>
        );
    }
}


function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        closeNotification,
    }, dispatch);
}

function mapStateToProps(state) {
    return {
        currentUser: state.users.currentUser
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(ApplyContainer);
