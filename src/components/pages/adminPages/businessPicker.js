"use strict"
import React, {Component} from 'react';
import {connect} from 'react-redux';
import {browserHistory} from 'react-router';
import {addNotification} from "../../../actions/usersActions";
import {bindActionCreators} from 'redux';
import axios from 'axios';
import {CircularProgress, RaisedButton} from 'material-ui';


class BusinessPicker extends Component {
    constructor(props) {
        super(props);

        this.state = {
            skills: undefined
        };
    }


    componentDidMount() {
        const self = this;
        axios.get("/api/admin/allSkills", {
            params: {
                userId: this.props.currentUser._id,
                verificationToken: this.props.currentUser.verificationToken
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

        if (!self.props.currentUser.admin === true) {
            return null;
        }

        if (!Array.isArray(this.state.skills)) {
            return (<div className="fillScreen"><CircularProgress /></div>);
        }

        // show all the current skills
        const skills = this.state.skills.map(skill => {
            return (
                <div
                    key={skill._id}
                    onClick={() => this.goTo(`/admin/skillEditor/${skill._id}`)}
                    className="clickable whiteText"
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
                className="clickable whiteText"
            >
                {"+ New Skill"}
            </div>
        );

        return (
            <div className="fillScreen whiteText" style={{margin: "30px"}}>
                {skills}
            </div>
        );
    }
}


function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        addNotification
    }, dispatch);
}

function mapStateToProps(state) {
    return {
        currentUser: state.users.currentUser,
        loadingCreateSkill: state.users.loadingSomething
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(BusinessPicker);
