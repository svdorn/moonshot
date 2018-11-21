"use strict";
import React, { Component } from "react";
import { browserHistory } from "react-router";
import { connect } from "react-redux";
import MetaTags from "react-meta-tags";
import { goTo } from "../../../miscFunctions";

class Error404 extends Component {
    render() {
        let route = "/";
        const { currentUser } = this.props;
        if (currentUser) {
            if (currentUser.userType === "accountAdmin") {
                route = "/dashboard";
            } else {
                route = "/myEvaluations";
            }
        }
        return (
            <div className="fillScreen formContainer" style={{ textAlign: "center" }}>
                <MetaTags>
                    <title>404 | Moonshot</title>
                    <meta name="description" content="You are lost but we can show you the way." />
                </MetaTags>

                <div className="form lightBlackForm noBlur">
                    <form>
                        <img
                            alt="404 Image - Rocket Doing Loops"
                            src={"/images/404" + this.props.png}
                            id="image404"
                        />
                        <br />
                        You seem a little lost,<br /> but we can show you the way!
                        <p className="clickable primary-cyan underline" onClick={() => goTo(route)}>
                            Follow Me
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

export default connect(mapStateToProps)(Error404);
