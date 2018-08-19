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
            loading: true,
            // if the user is currently taking the eval - false when asking if
            // ready to start, if want to switch to a different eval, etc
            inProgress: false
        };
    }


    // check that the user has permission to be here and where they currently
    // are in their evaluation
    componentWillMount() {
        const user = this.props.currentUser;
        // get the current stage so we can see what user wants to do
        axios.get("/api/evaluation/initialState", { params: {
            userId: user._id, verificationToken: user.verificationToken
        }})
        .then(response => {
            // if information about the eval is returned
            if (propertyExists(response, ["data"], "object")) {
                // // set the redux position state
                // this.props.setPositionState(response.data.evaluationState);
                // if the user has already started this eval
                if (response.data.stage) {
                    this.setState({
                        inProgressStage: response.data.stage,
                        loading: false
                    });
                }
                // if the user is in the middle of a different eval already
                else if (response.data.otherEvalInProgress && response.data.inProgressUrl) {
                    // set state to ask user if they want to go to that other eval
                    this.setState({
                        inProgressUrl: response.data.inProgressUrl,
                        loading: false
                    });
                }
                // if the user has not started this and is not in the middle of
                // a different eval, ask if ready to start this
                else {
                    this.setState({
                        readyToStart: true,
                        loading: false
                    });
                }
            }
            // no information was returned, show that something went wrong
            else { throw("No position state."); }
        })
        .catch(error => {
            // if a known error is returned
            if (propertyExists(error, ["response", "data"], "object")) {
                // deal with all errors
                const errData = error.response.data;
                // if the request is invalid
                if (errData.badRequest) {
                    this.setState({
                        errorMessage: "Something was wrong about your request, refresh and try again.",
                        loading: false
                    });
                }
                // if the user hasn't signed up for this position (wasn't invited)
                else if (errData.notSignedUp) {
                    this.setState({
                        errorMessage: "It looks like you aren't signed up for this evaluation.",
                        loading: false
                    });
                }
                // any other error
                else { this.setErrorState(); }
            }
            // unknown error
            else { this.setErrorState(); }
        })
    }


    setErrorState() {
        // add notification telling user to try again
        this.props.addNotification("Error loading test. Refresh or contact support.", "error");
        // stop loading spinner and show error message
        this.setState({
            loading: false,
            miscError: true
        });
    }


    // user is not doing psych test or gca test or anything at this moment, ask
    // them what they want to do now
    createPreTestContent() {
        // TODO: if the user has already started the eval and is in the middle of a
        // test component, ask if they're ready to continue
        if (this.state.inProgressStage) {
            return <div>Ready to get back into it?</div>
        }
        // TODO: if the user is in the middle of a different eval already
        else if (this.state.inProgressUrl) {
            return <div>Want to switch to your other eval?</div>
        }
        // TODO: if the user is ready to start the eval, ask them if they want
        // to start it
        else if (this.state.readyToStart) {
            return <div>Ready to start?</div>
        }
        // shouldn't be able to get here
        else {
            console.log("Something is wrong.");
            return <MiscError />;
        }
    }


    // create the content that is shown when the user is in the middle of a stage
    // e.g. they are taking the psych analysis, cognitive test, etc...
    createEvalContent() {
        // get the current position information from redux state
        const eval = this.props.evaluationState;

        // TODO: switch block to determine which component type to show
        switch (eval.component) {
            case "Pre-Eval": {
                return (
                    <div>This is an eval! Ready to start?</div>
                );
            }
            case "Admin Questions": {
                return (
                    <div>Admin questions here!</div>
                );
            }
            case "Psychometrics": {
                return (
                    <div>Taking psych eval!</div>
                );
            }
            case "Cognition": {
                return (
                    <div>Taking GCA eval!</div>
                );
            }
            case "Skill": {
                return (
                    <div>Taking skill test!</div>
                );
            }
            default: {
                content = (
                    <div>How did we get here??</div>
                );
            }
        }
    }


    render() {
        // if loading the page, show loading spinner
        if (this.state.loading) { return <CircularProgress color="#76defe" />; }
        // if there is an error loading the eval, show error page
        if (this.state.miscError) { return <MiscError />; }

        // what will be shown to the user - based on current step in redux
        let content = null;

        // if a component is not currently being in progress, ask them what they
        // want to do
        if (!this.state.inProgress) { content = this.createPreTestContent(); }

        // if the user is taking a part of the eval
        content = this.createEvalContent();

        return content;
    }
}


function mapStateToProps(state) {
    return {
        currentUser: state.users.currentUser,
        evaluationState: state.users.evaluationState,
        png: state.users.png
    };
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        setPositionState
    }, dispatch);
}


export default connect(mapStateToProps, mapDispatchToProps)(Evaluation);
