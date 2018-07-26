"use strict"
import React from "react";
import { TextField } from "material-ui";
import colors from "./colors";
import { browserHistory } from "react-router";

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


// get a first name from a full name
function getFirstName(name) {
    // split by spaces, get array of non-spaced names, return the first one
    let firstName = "";
    try {
        firstName = name.split(' ')[0];
    } catch (e) {
        firstName = "";
    }
    return firstName;
}


// checks if an email is of the correct form (i.e. name@something.blah)
function isValidEmail(email) {
    return /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(email);
}


// decodes html-encoded text
function htmlDecode(text) {
    text = text.replace(/&quot;/g,"\"")
               .replace(/&amp;/g,"&")
               .replace(/&lt;/g,"<")
               .replace(/&gt;/g,">");
    return text;
}


// checks if a file has the correct type based on the extension
function isValidFileType(fileName, allowedFileTypes) {
    // make sure arguments are valid
    if (typeof fileName !== "string") {
        console.log("Invalid usage of isValidFileType()! First argument must be the name of the file (e.g. 'dingus.png')");
        return false;
    }
    if (!Array.isArray(allowedFileTypes)) {
        console.log("Invalid usage of isValidFileType()! Second argument must be an array of extensions (e.g. ['csv', 'pdf'])");
        return false;
    }

    // get the file extension from the end of the file name
    let extension = fileName.split('.').pop().toLowerCase();
    // look through the list of allowed file types, if any matches, success
    const isValid = allowedFileTypes.includes(extension);

    return isValid;
}


// goes to a different page within moonshot insights; passing "/onboarding" would go to moonshotinsights.io/onboarding
function goTo(route) {
    // go to the wanted page
    browserHistory.push(route);
    // scroll to the top of the new page
    window.scrollTo(0, 0);
}


const miscFunctions = {
    qualifierFromScore,
    renderTextField,
    renderPasswordField,
    getFirstName,
    isValidEmail,
    htmlDecode,
    isValidFileType,
    goTo
}

module.exports = miscFunctions;
