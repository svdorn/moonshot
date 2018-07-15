"use strict"
import React from "react";
import { TextField } from "material-ui";
import colors from "./colors";

const style = {
    // the hint that shows up when search bar is in focus
    searchHintStyle: { color: "rgba(255, 255, 255, .3)" },
    searchInputStyle: { color: "rgba(255, 255, 255, .8)" },
    searchFloatingLabelFocusStyle: { color: colors.primaryCyan },
    searchFloatingLabelStyle: { color: colors.primaryCyan },
    searchUnderlineFocusStyle: { color: colors.primaryCyan }
};

const renderTextField = ({input, label, meta: {touched, error}, ...custom}) => (
    <TextField
        hintText={label}
        floatingLabelText={label}
        errorText={touched && error}
        inputStyle={style.searchInputStyle}
        hintStyle={style.searchHintStyle}
        floatingLabelFocusStyle={style.searchFloatingLabelFocusStyle}
        floatingLabelStyle={style.searchFloatingLabelStyle}
        underlineFocusStyle = {style.searchUnderlineFocusStyle}
        {...input}
        {...custom}
    />
);

const renderPasswordField = ({input, label, meta: {touched, error}, ...custom}) => (
    <TextField
        hintText={label}
        floatingLabelText={label}
        errorText={touched && error}
        inputStyle={style.searchInputStyle}
        hintStyle={style.searchHintStyle}
        floatingLabelFocusStyle={style.searchFloatingLabelFocusStyle}
        floatingLabelStyle={style.searchFloatingLabelStyle}
        underlineFocusStyle = {style.searchUnderlineFocusStyle}
        {...input}
        {...custom}
        type="password"
    />
);


// get the qualifier (e.g. "above average", "expert", etc) based on a score
function qualifierFromScore(score, type) {
    // make sure the score is a number we can use
    if (typeof score === "string") { score = parseInt(score, 10); }
    if (typeof score !== "number") { return "N/A"; }
    if (score === NaN) { return "N/A"; }

    let qualifiers = undefined;
    // for predicted performance
    if (type === "predicted") {
        qualifiers = ["Below Average", "Average", "Above Average"];
    }
    // for skill level
    else if (type === "skill") {
        qualifiers = ["Novice", "Intermediate", "Expert"];
    }
    // if invalid type provided, return N/A
    else { return "N/A"; }

    // between 90 (inclusive) and 110 (exclusive) is intermediate/average
    if (score < 90) {
        return qualifiers[0];
    } else if (score < 110) {
        return qualifiers[1];
    } else {
        return qualifiers[2];
    }
}

const miscFunctions = {
    qualifierFromScore,
    renderTextField,
    renderPasswordField
}

module.exports = miscFunctions;
