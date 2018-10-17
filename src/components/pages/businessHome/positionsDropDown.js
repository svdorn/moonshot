"use strict";
import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import {} from "../../../actions/usersActions";
import {} from "../../../miscFunctions";

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
    "Remote Customer Service Representative",
    "Customer Service Specialist",
    "Customer Service Engineer",
    "Customer Service Supervisor",
    "Customer Service Manager",
    "Customer Support Representative",
    "Remote Customer Support Representative",
    "Customer Support Specialist",
    "Multilingual Customer Support Specialist",
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

    typeAdvance = type => () => {
        console.log("advancing with type: ", type);
    };

    nameAdvance = name => () => {
        console.log("advancing with position name: ", name);
    };

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

    suggestions() {
        console.log("this.props.inputText: ", this.props.inputText);
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
