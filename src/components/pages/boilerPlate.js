"use strict"
import React, { Component } from "react";


class FreeResponse extends Component {
    constructor(props) {
        super(props);

        this.state = {};
    }

    render() {
        return (
            <div>
            </div>
        );
    }
}


function mapStateToProps(state) {
    return {
        currentUser: state.users.currentUser
    };
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({

    }, dispatch);
}


export default connect(mapStateToProps, mapDispatchToProps)(FreeResponse);
