"use strict"
import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import {  } from "../../actions/usersActions";
import {  } from "../../miscFunctions";
import MetaTags from 'react-meta-tags';
import { goTo } from "../../miscFunctions";

class Ease extends Component {
    constructor(props) {
        super(props);

        this.state = {
        }
    }

    componentDidMount() {
        goTo("/apply/Ease");
    }


    render() {
        return (
            <div className="jsxWrapper blackBackground fillScreen center">

            </div>
        );
    }
}


function mapStateToProps(state) {
    return {

    };
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
    }, dispatch);
}


export default connect(mapStateToProps, mapDispatchToProps)(Ease);
