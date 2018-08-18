"use strict"
import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import CircularProgress from '@material-ui/core/CircularProgress';
import {  } from "../../actions/usersActions";
import { propertyExists } from "../../miscFunctions";
import MiscError from "../miscComponents/miscError";


class Evaluation extends Component {
    constructor(props) {
        super(props);

        this.state = {
            // waiting for confirmation that user can be here
            loading: true
        };
    }


    // TODO: check that the user has permission to be here and that the current
    // evaluation is the one whose info is in redux state
    componentWillMount() {
        axios.get("/evaluation/currentState")
        .then(response => {
            // if information about the position is returned
            if (propertyExists(response, ["data", "positionState"], "object")) {
                // set the redux position state
                this.props.setPositionState(response.data.positionState);
                // stop showing the loading spinner
                this.setState({ loading: false });
            }
            // no information was returned, show that something went wrong
            throw("No position state.");
        })
        .catch(error => {
            // if a known error is returned
            if (propertyExists(error, ["response", "data"], "object")) {
                // TODO: deal with all errors
                // remove loading spinner
                this.setState({ loading: false });
            }
            // unknown error
            else {
                // add notification telling user to try again
                this.props.addNotification("Error loading test. Refresh or contact support.", "error");
                // stop loading spinner and show error message
                this.setState({
                    loading: false,
                    miscError: true
                })
            }
        })
    }


    render() {
        // if loading the page, show loading spinner
        if (this.state.loading) { return <CircularProgress color="#76defe" />; }
        // if there is an error loading the eval, show error page
        if (this.state.miscError) { return <MiscError />; }

        // what will be shown to the user - based on current step in redux
        let content = null;

        // get the current position information from redux state
        const position = this.props.position;

        // TODO: switch block to determine which component type to show

        return content;
    }
}


function mapStateToProps(state) {
    return {
        currentUser: state.users.currentUser,
        position: state.users.currentPosition,
        png: state.users.png
    };
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        setPositionState
    }, dispatch);
}


export default connect(mapStateToProps, mapDispatchToProps)(Evaluation);
