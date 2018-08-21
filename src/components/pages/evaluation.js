"use strict"
import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import axios from "axios";
import CircularProgress from '@material-ui/core/CircularProgress';
import { addNotification } from "../../actions/usersActions";
import { propertyExists, goTo } from "../../miscFunctions";
import MiscError from "../miscComponents/miscError";
import { button } from "../../classes";


class Evaluation extends Component {
    constructor(props) {
        super(props);

        // get position and business ids from url
        const { businessId, positionId } = props.params;
        // get user credentials
        const { _id, verificationToken } = props.currentUser;
        // general arguments for post api call
        const generalApiPostArgs = {
            userId: _id,
            verificationToken,
            positionId,
            businessId
        };
        // general arguments for get api call
        const generalApiGetArgs = { params: generalApiPostArgs };

        this.state = {
            // waiting for confirmation that user can be here
            initialLoad: true,
            // loading anything else
            loading: false,
            // if the user is currently taking the eval - false when asking if
            // ready to start, if want to switch to a different eval, etc
            inProgress: false,
            // if there is a Moonshot error
            miscError: false,
            // an error message spawned by a user error
            errorMessage: undefined,
            // added to and used for api calls
            generalApiGetArgs,
            generalApiPostArgs,

            /* PRE-EVAL */
            // if the user already has this eval in progress
            alreadyInProgress: false,
            // if the user has a different eval in progress already, this will
            // be the url of that eval
            evalInProgress: undefined,
            // if the user has no other eval in progress and has not started
            // this one already
            readyToStart: false
            /* END PRE-EVAL */
        };
    }


    // check that the user has permission to be here and where they currently
    // are in their evaluation
    componentWillMount() {
        // get the current stage so we can see what user wants to do
        axios.get("/api/evaluation/initialState", this.state.generalApiGetArgs)
        .then(this.handleInitialState.bind(this))
        .catch(this.handleError.bind(this));
    }


    // handle the response with initial state data
    handleInitialState(response) {
        console.log(response);
        // if information about the eval is returned
        if (propertyExists(response, ["data"], "object")) {
            // TODO: remove
            // // set the redux position state
            // this.props.setPositionState(response.data.evaluationState);
            // if the user has already started this eval
            if (response.data.alreadyInProgress) {
                this.setState({
                    alreadyInProgress: true,
                    initialLoad: false
                });
            }
            // if the user is in the middle of a different eval already
            else if (response.data.evalInProgress) {
                // set state to ask user if they want to go to that other eval
                this.setState({
                    evalInProgress: response.data.evalInProgress,
                    initialLoad: false
                });
            }
            // if the user has not started this and is not in the middle of
            // a different eval, ask if ready to start this
            else {
                this.setState({
                    readyToStart: true,
                    initialLoad: false
                });
            }
        }
        // no information was returned, show that something went wrong
        else { throw("No position state."); }
    }


    // handle any error returned when getting initial evaluation state
    handleError(error) {
        // if a known error is returned
        if (propertyExists(error, ["response", "data"], "object")) {
            // deal with all errors
            const errData = error.response.data;
            // if the request is invalid
            if (errData.badRequest) {
                this.setState({
                    errorMessage: "Something was wrong about your request.",
                    initialLoad: false
                });
            }
            // if the user hasn't signed up for this position (wasn't invited)
            else if (errData.notSignedUp) {
                this.setState({
                    errorMessage: "It looks like you aren't signed up for this evaluation.",
                    initialLoad: false
                });
            }
            // any other error
            else { this.setErrorState(); }
        }
        // unknown error
        else { this.setErrorState(); }
    }


    setErrorState() {
        // add notification telling user to try again
        this.props.addNotification("Error. Refresh or contact support.", "error");
        // stop loading spinner and show error message
        this.setState({
            initialLoad: false,
            miscError: true
        });
    }


    // gets the current state of the evaluation
    getEvalState = () => {
        axios.get("/api/evaluation/currentState", this.state.generalApiGetArgs)
        .then(this.setEvalState.bind(this))
        .catch(this.handleError.bind(this));
    }


    // displays an error page telling the user to try again or go home
    createErrorPage() {
        // if there is a user error
        if (this.state.errorMessage) {
            return (
                <div className="center primary-white">
                    <div className="font20px" style={{margin: "20px"}}>Something went wrong.</div>
                    <div className="font14px">
                        {this.state.errorMessage} Try refreshing or contacting support.
                    </div>
                    <div
                        className="button medium round-4px background-primary-cyan"
                        style={{margin: "20px"}}
                        onClick={() => goTo("/myEvaluations")}
                    >
                        Take Me Home
                    </div>
                </div>
            );
        }

        // if there is a Moonshot error
        return <MiscError />;
    }


    // user is not doing psych test or gca test or anything at this moment, ask
    // them what they want to do now
    createPreTestContent() {
        // TODO: if the user has already started the eval and is in the middle of a
        // test component, ask if they're ready to continue
        if (this.state.alreadyInProgress) {
            return (
                <div>
                    <p>You{"'"}ve already started this evaluation.</p>
                    <p>Ready to get back into it?</p>
                    <div className={button.purpleBlue} onClick={this.getEvalState}>
                        Let{"'"}s Go!
                    </div>
                </div>
            )
        }
        // TODO: if the user is in the middle of a different eval already
        else if (this.state.evalInProgress) {
            return <div>Want to switch to your other eval?</div>
        }
        // TODO: if the user is ready to start the eval, ask them if they want
        // to start it
        else if (this.state.readyToStart) {
            return this.startEvalPrompt();
        }
        // shouldn't be able to get here
        else {
            console.log("Something is wrong.");
            return <MiscError />;
        }
    }


    // the screen that shows up telling the user they can start whenever ready
    startEvalPrompt() {
        return (
            <div>
                <p>This evaluation consists of some quick administrative questions and a psychometric test.</p>
                <p>Employers cannot see your answers to any of these questions.</p>
                <p>There will be a progress bar so you can see how much you have completed.</p>
                <p>Before every section there will be an introduction with instructions. Read them carefully.</p>
                <p>Click the button to start once you are ready.</p>
                { this.state.loadingNextPage ?
                    <CircularProgress color="secondary" />
                    :
                    <div
                        className={button.purpleBlue}
                        onClick={this.startEval}
                    >
                        Start
                    </div>
                }
            </div>
        )
    }


    // start the evaluation!
    startEval = () => {
        // replace the Start button with a loading circle
        this.setState({ loading: true });

        axios.post("/api/evaluation/start", this.state.generalApiPostArgs)
        .then(this.setEvalState.bind(this))
        .catch(this.handleError.bind(this));
    }


    // set the new state of an eval from an api call
    setEvalState(response) {
        // TODO
        console.log("new eval state: ", response);
    }


    // create the content that is shown when the user is in the middle of a stage
    // e.g. they are taking the psych analysis, cognitive test, etc...
    createEvalContent() {
        // get the current position information from redux state
        const evaluation = this.props.evaluationState;

        // TODO: switch block to determine which component type to show
        switch (evaluation.component) {
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
                // TODO: do something else here
                content = (
                    <div>How did we get here??</div>
                );
            }
        }
    }


    render() {
        // what will be shown to the user
        let content = null;

        // if loading the page, show loading spinner
        if (this.state.initialLoad) {
            content = <div className="center"><CircularProgress color="secondary" /></div>;
        }
        // if there is an error loading the eval, show error page
        else if (this.state.miscError) { return <MiscError />; }

        // if there is some error, show an error page
        else if (this.state.errorMessage) { content = this.createErrorPage(); }

        // if a component is not currently in progress, ask what to do
        else if (!this.state.inProgress) { content = this.createPreTestContent(); }

        // if the user is taking a part of the eval
        else { content = this.createEvalContent(); }

        return <div className="fillScreen primary-white center">{ content }</div>;
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
        addNotification
        // setPositionState
    }, dispatch);
}


export default connect(mapStateToProps, mapDispatchToProps)(Evaluation);
