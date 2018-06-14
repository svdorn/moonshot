"use strict"
import React, { Component } from "react";
import { connect } from "react-redux";
import { browserHistory } from "react-router";
import { bindActionCreators } from "redux";
import { sawEvaluationIntro } from "../../actions/usersActions";
import axios from "axios";
import MetaTags from "react-meta-tags";
import { CircularProgress } from "material-ui";

class EvaluationIntro extends Component {
    markSeen() {
        const currentUser = this.props.currentUser;
        this.props.sawEvaluationIntro(currentUser._id, currentUser.verificationToken);
    }


    goTo(route) {
        // goes to the wanted page
        browserHistory.push(route);
        // goes to the top of the new page
        window.scrollTo(0, 0);
    }


    render() {
        const currentUser = this.props.currentUser;

        if (!currentUser.currentPosition) {
            this.goTo("/myEvaluations");
        }

        return (
            <div className="blackBackground fillScreen whiteText center">
                <MetaTags>
                    <title>{currentUser.currentPosition.name} | Moonshot</title>
                    <meta name="description" content={"Show an employer your personality and skills."} />
                </MetaTags>
                <div className="employerHeader" />
                <div className="evalPortionIntro skillsUserAgreement center">
                    <div className="font24px" style={{marginBottom: "20px"}}><span>{currentUser.currentPosition.name}</span></div>
                    <div>
                        <p>This is the {currentUser.currentPosition.name} evaluation. It consists of a series of skills tests, a psychometric test, and short answer questions.</p>
                        <p>Employers cannot see your answers to the skills or psychometric tests.</p>
                        <p>There will be a progress bar so you can see how much you have completed.</p>
                        <p>Before every section there will be an introduction with instructions. Read through them carefully.</p>
                        <p>Click the button to start once you are ready.</p>
                    </div>
                    <br/>
                    {this.props.loadingNextPage ?
                        <CircularProgress style={{marginBottom: "40px"}} />
                        :
                        <div style={{marginBottom: "40px", width: "initial"}} className="skillContinueButton" onClick={this.markSeen.bind(this)}>Begin</div>
                    }
                </div>
            </div>
        );
    }
}


function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        sawEvaluationIntro
    }, dispatch);
}

function mapStateToProps(state) {
    return {
        currentUser: state.users.currentUser,
        loadingNextPage: state.users.loadingSomething
    };
}


export default connect(mapStateToProps, mapDispatchToProps)(EvaluationIntro);
