"use strict";
import React, { Component } from "react";
import { connect } from "react-redux";
import { browserHistory } from "react-router";
import { addNotification } from "../../../actions/usersActions";
import { bindActionCreators } from "redux";
import axios from "axios";
import { CircularProgress, RaisedButton } from "material-ui";

class SkillPicker extends Component {
    constructor(props) {
        super(props);

        this.state = {
            skills: undefined
        };
    }

    componentDidMount() {
        const self = this;
        const { currentUser } = this.props;
        if (!currentUser) {
            return this.props.addNotification(
                "You aren't logged in! Try refreshing the page.",
                "error"
            );
        }

        axios
            .get("/api/admin/allSkills", {
                params: {
                    userId: currentUser._id,
                    verificationToken: currentUser.verificationToken
                }
            })
            .then(response => {
                self.setState({ skills: response.data });
            })
            .catch(error => {
                console.log("error: ", error);
                // set skills to empty array to get rid of loader
                self.setState({ skills: [] });
                self.props.addNotification("Error getting skills.", "error");
            });
    }

    goTo(route) {
        // goes to the wanted page
        browserHistory.push(route);
        // goes to the top of the new page
        window.scrollTo(0, 0);
    }

    render() {
        const self = this;
        const { currentUser } = this.props;

        if (!currentUser || !currentUser.admin === true) {
            return null;
        }

        if (!Array.isArray(this.state.skills)) {
            return (
                <div className="fillScreen">
                    <CircularProgress />
                </div>
            );
        }

        // show all the current skills
        const skills = this.state.skills.map(skill => {
            return (
                <div
                    key={skill._id}
                    onClick={() => this.goTo(`/admin/skillEditor/${skill._id}`)}
                    className="clickable primary-white"
                >
                    {skill.name}
                </div>
            );
        });

        // show option to create a new skill
        skills.push(
            <div
                key={"new skill"}
                onClick={() => this.goTo(`/admin/skillEditor/new`)}
                className="clickable primary-white"
            >
                {"+ New Skill"}
            </div>
        );

        return (
            <div className="fillScreen primary-white" style={{ margin: "30px" }}>
                {skills}
            </div>
        );
    }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators(
        {
            addNotification
        },
        dispatch
    );
}

function mapStateToProps(state) {
    return {
        currentUser: state.users.currentUser
    };
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(SkillPicker);
