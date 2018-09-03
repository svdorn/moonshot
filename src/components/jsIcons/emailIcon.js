"use strict"
import React, { Component } from "react";
import "./emailIcon.css";


class EmailIcon extends Component {
    constructor(props) {
        super(props);

        this.state = {};
    }

    render() {
        const validColors = ["orange", "pink", "cyan", "peach", "white", "purple-light", "purple-dark", "black-light", "black-dark", "gray", "red"];
        // color of the icon
        const colorClass = `outline-${validColors.includes(this.props.color) ? this.props.color : "white"}`;
        // color of icon on hover
        const hoverColorClass = `hover-color-${validColors.includes(this.props.hoverColor) ? this.props.hoverColor : "cyan"}`;

        return (
            <div
                styleName={`email-icon ${colorClass} ${hoverColorClass} ${this.props.styleName ? this.props.styleName : ""}`}
                style={this.props.style ? this.props.style : {}}
                className={this.props.className ? this.props.className : ""}
                onClick={typeof this.props.onClick === "function" ? this.props.onClick : () => {}}
            />
        );
    }
}


function mapStateToProps(state) {
    return {
        currentUser: state.users.currentUser
    };
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({

    }, dispatch);
}


export default EmailIcon;
