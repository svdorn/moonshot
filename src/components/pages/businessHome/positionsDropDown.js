"use strict";
import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import {} from "../../../actions/usersActions";
import { goTo } from "../../../miscFunctions";

import "./businessHome.css";

const posTypes = ["Developer", "Product", "Support/Customer Service", "Marketing", "Sales"];
// TODO: Make sure none are too long
const allTitles = [
    "Software Engineer",
    "Developer",
    "Front End Developer",
    "Product Manager",
    ".NET Developer",
    "Java Developer",
    "Web Developer",
    "Quality Assurance Engineer",
    "Software Developer",
    "Application Developer",
    "Node.js Developer",
    "Full-Stack Developer",
    "DevOps Engineer",
    "Chief Product Officer",
    "Product Manager",
    "Associate Product Manager",
    "Product Owner",
    "Group Product Manager",
    "Director of Product Management",
    "VP of Product Management",
    "Customer Service Representative",
    "Customer Service Specialist",
    "Customer Service Engineer",
    "Customer Service Supervisor",
    "Customer Service Manager",
    "Customer Support Representative",
    "Customer Support Specialist",
    "Customer Support Engineer",
    "Customer Support Manager",
    "Customer Success Associate",
    "Customer Success Manager",
    "Implementation Specialist",
    "Customer Success Team Lead",
    "Customer Experience Manager",
    "Director of Customer Experience",
    "Content Creator",
    "Content Strategist",
    "Content Marketing Manager",
    "Creative Assistant",
    "Digital Brand Manager",
    "Creative Director",
    "Marketing Data Analyst",
    "Marketing Technologist",
    "Digital Marketing Manager",
    "Social Media Coordinator",
    "Social Media Strategist",
    "Community Manager",
    "SEO Specialist",
    "SEO Strategist",
    "SEO/Marketing Manager",
    "Sales Representative",
    "Account Manager",
    "Outside Sales Representative",
    "Account Executive",
    "Inside Sales Representative",
    "Sales Consultant",
    "Sales Manager",
    "Collection Agent",
    "Car Sales Executive",
    "Regional Sales Manager"
];

class PositionsDropDown extends Component {
    constructor(props) {
        super(props);

        this.state = {};
    }

    // if you click on a role name
    typeAdvance = type => () => {
        goTo(`/explore?role=${type}`);
    };

    // if you clicked on a specific title
    nameAdvance = name => () => {
        goTo(`/explore?title=${name}`);
    };

    // display the five functions as options if there is no search text
    noTextOptions() {
        const options = posTypes.map(type => {
            return (
                <div styleName="drop-down-option" onClick={this.typeAdvance(type)}>
                    {type}
                </div>
            );
        });

        return options;
    }

    // display the matching searched position titles if there is any search text
    suggestions() {
        const options = allTitles
            .filter(s => s.toLowerCase().includes(this.props.inputText.toLowerCase()))
            .map(title => {
                return (
                    <div styleName="drop-down-option" onClick={this.nameAdvance(title)}>
                        {title}
                    </div>
                );
            });
        return options;
    }

    render() {
        const options = this.props.inputText ? this.suggestions() : this.noTextOptions();

        return (
            <div styleName="drop-down">
                <div styleName="drop-down-header drop-down-option">Popular Positions</div>
                {options}
                <div />
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        currentUser: state.users.currentUser
    };
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({}, dispatch);
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(PositionsDropDown);
