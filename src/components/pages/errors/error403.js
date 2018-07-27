"use strict"
import React, { Component } from 'react';
import {connect} from 'react-redux';
import { goTo } from "../../../miscFunctions";

class Error403 extends Component {
    render () {
        let route = "/";
        if (this.props.currentUser) {
            if (this.props.currentUser.userType === "accountAdmin") {
                route = "/myCandidates";
            } else {
                route = "/myEvaluations";
            }
        }
        return (
            <div className="fillScreen formContainer" style={{textAlign:"center"}}>
                <div className="form lightBlackForm noBlur">
                    <form>
                        {"We're sure you're really great, but this page requires Supreme Overlord Status."}
                        <p  className="clickable primary-cyan underline"
                            onClick={() => goTo(route)}>
                            {"Bring me home!"}
                        </p>
                    </form>
                </div>
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        currentUser: state.users.currentUser,
        png: state.users.png
    };
}

export default connect(mapStateToProps)(Error403);
