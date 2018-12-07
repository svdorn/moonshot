"use strict";
import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { } from "../../actions/usersActions";
import CircularProgress from "@material-ui/core/CircularProgress";
import MetaTags from "react-meta-tags";
import { goTo } from "../../miscFunctions";
import { Button } from "../miscComponents";

import "./finished.css";

class Finished extends Component {
    constructor(props) {
        super(props);
    }

    // create the main content of the page
    createContent() {
        const { currentUser } = this.props;
        let companyName;
        if (!currentUser || !currentUser.companyName) {
            companyName = "Moonshot";
        } else {
            companyName = currentUser.companyName
        }

        return (
            <div>
                <div className="paddingTop50px marginBottom30px">
                    <div className="font38px font30pxUnder700 font24pxUnder500" style={{ color: this.props.primaryColor }}>
                        {companyName} Evaluation
                    </div>
                    <div
                        className="font16px font14pxUnder700 font12pxUnder500"
                        styleName="powered-by"
                        style={{ opacity: "0.6" }}
                    >
                        Powered by Moonshot Insights
                    </div>
                </div>
                <div styleName="text">
                    <div>
                        Thanks for taking the time to finish your evaluation! Your results have been saved and are being reviewed by {companyName}. You can now safely exit this tab.
                    </div>
                </div>
            </div>
        );
    }

    //name, email, password, confirm password, signup button
    render() {
        let content = this.createContent();

        return (
            <div className="fillScreen">
                <MetaTags>
                    <title>Finished Evaluation | Moonshot</title>
                    <meta
                        name="description"
                        content="Thank you for finishing your evaluation."
                    />
                </MetaTags>
                <div className="center">{content}</div>
            </div>
        );
    }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators(
        {
        },
        dispatch
    );
}

function mapStateToProps(state) {
    return {
        loading: state.users.loadingSomething,
        currentUser: state.users.currentUser,
        png: state.users.png,
        primaryColor: state.users.primaryColor,
        textColor: state.users.textColor
    };
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Finished);
