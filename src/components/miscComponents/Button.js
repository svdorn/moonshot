"use strict";
import React, { Component } from "react";
import MaterialButton from "@material-ui/core/Button";

class Button extends Component {
    render() {
        let props = {};
        if (!this.props.variant) props.variant = "contained";
        if (!this.props.color) props.color = "primary";

        return (
            <MaterialButton
                {...props}
                {...this.props}
                classes={{ root: "no-focus-outline no-text-transform" }}
            >
                {this.props.children}
            </MaterialButton>
        );
    }
}

export default Button;
