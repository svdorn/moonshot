"use strict";
import React from "react";
import { TextField } from "material-ui";
import NewTextField from "@material-ui/core/TextField";
import colors from "./colors";
import { browserHistory } from "react-router";
import clipboard from "clipboard-polyfill";

// Queue implementation
function Queue() {
    this.data = [];
}
Queue.prototype.enqueue = function(record) {
    this.data.unshift(record);
};
Queue.prototype.dequeue = function() {
    return this.data.pop();
};
Queue.prototype.first = function() {
    return this.data[0];
};
Queue.prototype.last = function() {
    return this.data[this.data.length - 1];
};
Queue.prototype.size = function() {
    return this.data.length;
};

// Stack implementation
function Stack() {
    this.data = [];
}
Stack.prototype.push = function(record) {
    this.data.push(record);
};
Stack.prototype.pop = function() {
    return this.data.pop();
};
Stack.prototype.bottom = function() {
    return this.data[0];
};
Stack.prototype.top = function() {
    return this.data[this.data.length - 1];
};
Stack.prototype.size = function() {
    return this.data.length;
};

const style = {
    // the hint that shows up when search bar is in focus
    searchHintStyle: { color: "rgba(255, 255, 255, .3)" },
    searchInputStyle: { color: "rgba(255, 255, 255, .8)" },
    searchFloatingLabelFocusStyle: { color: colors.primaryCyan },
    searchFloatingLabelStyle: { color: colors.primaryCyan },
    searchUnderlineFocusStyle: { color: colors.primaryCyan }
};

const renderTextField = ({ input, label, meta: { touched, error }, ...custom }) => (
    <TextField
        hintText={label}
        floatingLabelText={label}
        errorText={touched && error}
        inputStyle={style.searchInputStyle}
        hintStyle={style.searchHintStyle}
        floatingLabelFocusStyle={style.searchFloatingLabelFocusStyle}
        floatingLabelStyle={style.searchFloatingLabelStyle}
        underlineFocusStyle={style.searchUnderlineFocusStyle}
        className="text-field"
        {...input}
        {...custom}
    />
);

const renderPasswordField = ({ input, label, meta: { touched, error }, ...custom }) => (
    <TextField
        hintText={label}
        floatingLabelText={label}
        errorText={touched && error}
        inputStyle={style.searchInputStyle}
        hintStyle={style.searchHintStyle}
        floatingLabelFocusStyle={style.searchFloatingLabelFocusStyle}
        floatingLabelStyle={style.searchFloatingLabelStyle}
        underlineFocusStyle={style.searchUnderlineFocusStyle}
        {...input}
        {...custom}
        className="text-field"
        type="password"
    />
);

// get the qualifier (e.g. "above average", "expert", etc) based on a score
function qualifierFromScore(score) {
    // make sure the score is a number we can use
    if (typeof score === "string") {
        score = parseInt(score, 10);
    }
    if (typeof score !== "number") {
        return "N/A";
    }
    if (score === NaN) {
        return "N/A";
    }

    // between 90 (inclusive) and 110 (exclusive) is intermediate/average
    if (score < 90) {
        return "Below Average";
    } else if (score < 110) {
        return "Average";
    } else {
        return "Above Average";
    }
}

// get a first name from a full name
function getFirstName(name) {
    // split by spaces, get array of non-spaced names, return the first one
    let firstName = "";
    try {
        firstName = name.split(" ")[0];
    } catch (e) {
        firstName = "";
    }
    return firstName;
}

// checks if an email is of the correct form (i.e. name@something.blah)
function isValidEmail(email) {
    return typeof email === "string" && /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(email);
}

// decodes html-encoded text
function htmlDecode(text) {
    text = text
        .replace(/&quot;/g, '"')
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">");
    return text;
}

// checks if a file has the correct type based on the extension
function isValidFileType(fileName, allowedFileTypes) {
    // make sure arguments are valid
    if (typeof fileName !== "string") {
        console.log(
            "Invalid usage of isValidFileType()! First argument must be the name of the file (e.g. 'dingus.png')"
        );
        return false;
    }
    if (!Array.isArray(allowedFileTypes)) {
        console.log(
            "Invalid usage of isValidFileType()! Second argument must be an array of extensions (e.g. ['csv', 'pdf'])"
        );
        return false;
    }

    // get the file extension from the end of the file name
    let extension = fileName
        .split(".")
        .pop()
        .toLowerCase();
    // look through the list of allowed file types, if any matches, success
    const isValid = allowedFileTypes.includes(extension);

    return isValid;
}

// checks if a password is secure enough
function isValidPassword(password) {
    const MIN_PASSWORD_LENGTH = 8;
    return typeof password === "string" && password.length >= MIN_PASSWORD_LENGTH;
}

// goes to a different page within moonshot insights; passing "/onboarding" would go to moonshotinsights.io/onboarding
function goTo(route) {
    window.Intercom("update");
    // go to the wanted page
    browserHistory.push(route);
    // scroll to the top of the new page
    window.scrollTo(0, 0);
}

// returns whether the thing has a truthy value (defined, not null, not empty string)
function truthy(thing) {
    return !!thing;
}

// check if a child property exists on an object, and optionally checks if the
// EX: if we have an object named user like this:
// { info: { name: "Austin" } }
// this returns true: propertyExists(user, ["info", "name"], "string")
// this returns true: propertyExists(user, ["info", "name"])
// this returns false: propertyExists(user, ["info", "name"], "object")
// this returns false: propertyExists(user, ["info", "career"])
function propertyExists(object, propertyTree, type) {
    let parent = object;
    // if the parent does not exist, property can't exist
    if (!parent) {
        return false;
    }
    // if no properties given, property can't exist
    if (!Array.isArray(propertyTree) || propertyTree.length === 0) {
        return false;
    }

    // start with the first property in the tree
    let treePropIndex = 0;
    // go through each property in the tree
    while (treePropIndex < propertyTree.length) {
        // make sure the parent is an object so it can have given properties
        if (typeof parent !== "object") {
            return false;
        }
        // name of the object property
        const propName = propertyTree[treePropIndex];
        // if the property does not exist, fail
        if (parent[propName] === undefined) {
            return false;
        }
        // the property is legit, so set the parent to be the value of the child prop
        parent = parent[propName];
        // move to the next property
        treePropIndex++;
    }
    // at this point, parent is the value we wanted to check
    // if there is a defined wanted type, check for it
    if (truthy(type)) {
        return typeof parent === type;
    }
    // otherwise return that the property is valid
    else {
        return true;
    }
}

function withinElement(event, element) {
    if (!element || !event) {
        return false;
    }

    const clickX = event.clientX;
    const clickY = event.clientY;
    const elementRect = element.getBoundingClientRect();

    const withinX = elementRect.left <= clickX && clickX <= elementRect.right;
    const withinY = elementRect.top <= clickY && clickY <= elementRect.bottom;

    return withinX && withinY;
}

function elementInViewport(el) {
    var rect = el.getBoundingClientRect();

    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}

function elementPartiallyInViewport(el) {
    var rect = el.getBoundingClientRect();

    const screenHeight = window.innerHeight || document.documentElement.clientHeight;
    const screenWidth = window.innerWidth || document.documentElement.clientWidth;

    const inVertically = rect.top < screenHeight && rect.bottom > 0;
    const inHorizontally = rect.left < screenWidth && rect.right > 0;

    return inVertically && inHorizontally;
}

function makePossessive(name) {
    if (typeof name !== "string") {
        return name;
    }
    const possessivePronouns = ["your", "her", "his", "their", "our"];
    if (name.endsWith("'s") || possessivePronouns.includes(name.toLowerCase())) {
        return name;
    } else {
        return name + "'s";
    }
}

function makeSingular(string) {
    if (typeof string !== "string") {
        return string;
    }
    if (string.endsWith("s")) {
        return string.slice(0, string.length - 1);
    } else {
        return string;
    }
}

function replaceCharacters(oldString, characters, replacement) {
    if (
        typeof oldString !== "string" ||
        typeof replacement !== "string" ||
        !Array.isArray(characters)
    ) {
        throw new Error(
            "replaceCharacters usage: replaceCharacters('dingi', ['i', 'n'], 'ae') results in daeaegae"
        );
    }

    let newString = "";

    oldString.split("").forEach(currChar => {
        if (characters.includes(currChar)) {
            newString += replacement;
        } else {
            newString += currChar;
        }
    });

    return newString;
}

function copyCustomLink(currentUser, addNotification) {
    if (propertyExists(currentUser, ["businessInfo", "uniqueName"], "string")) {
        let URL = "https://moonshotinsights.io/apply/" + currentUser.businessInfo.uniqueName;
        URL = encodeURI(URL);
        clipboard.writeText(URL);
        addNotification("Link copied to clipboard", "info");
    } else {
        addNotification("Error copying link, try refreshing", "error");
    }
}

// takes in either a className as ".name-of-element" or id as "#name-of-element"
function copyFromPage(identifier) {
    let range = document.createRange();
    range.selectNode(document.querySelector(identifier));
    window.getSelection().removeAllRanges();
    window.getSelection().addRange(range);
    document.execCommand("copy");
}

function getMonthText(month) {
    switch (month) {
        case 0:
            return "January";
            break;
        case 1:
            return "February";
            break;
        case 2:
            return "March";
            break;
        case 3:
            return "April";
            break;
        case 4:
            return "May";
            break;
        case 5:
            return "June";
            break;
        case 6:
            return "July";
            break;
        case 7:
            return "August";
            break;
        case 8:
            return "September";
            break;
        case 9:
            return "October";
            break;
        case 10:
            return "November";
            break;
        case 11:
            return "December";
            break;
        default:
            return "January";
            break;
    }
}

function getFormattedDate(date) {
    const newDate = new Date(date);
    let year = newDate.getFullYear();
    let month = getMonthText(newDate.getMonth());
    let day = newDate.getDate();

    return month + " " + day + ", " + year;
}

// brings up message telling user to fill out empty fields if they're empty
// returns true if a field was blank
// you have to include the values, an array of the fields, and this.props.touch from redux-form
function fieldsAreEmpty(vals, requiredFields, touch) {
    // start with assumption that all fields are filled out
    let fieldIsEmpty = false;

    const touchIsFunction = typeof touch === "function";

    // go through each required field
    requiredFields.forEach(field => {
        // if the field is empty ...
        if (!vals || !vals[field]) {
            // ... touch it to bring up the error message
            if (touchIsFunction) touch(field);
            // ... and mark that some field is not filled out
            fieldIsEmpty = true;
        }
    });

    return fieldIsEmpty;
}

function randomInt(lowBound, highBound) {
    const range = highBound - lowBound;
    return Math.floor(Math.random() * (range + 1)) + lowBound;
}

function noop() {}

// round a number to the given number of decimal points
function round(number, places) {
    if (typeof number !== "number") {
        return number;
    }

    // make sure places is valid and an integer
    if (typeof places !== "number" || places < 0) {
        places = 0;
    }
    places = Math.round(places);

    // multiply by 10^(places), round, divide by 10^(places)
    const multiplier = Math.pow(10, places);
    let rounded = number * multiplier;
    rounded = Math.round(rounded);
    rounded /= multiplier;

    return rounded;
}

// decrease the shade of a color by a certain amount (default 20)
function darken(color, difference) {
    if (typeof color !== "string") return color;
    if (color.length === 7) color = color.substring(1);
    if (color.length !== 6) return color;
    if (typeof difference !== "number") difference = 20;
    let r = parseInt(color.substring(0, 2), 16) - difference;
    let g = parseInt(color.substring(2, 4), 16) - difference;
    let b = parseInt(color.substring(4, 6), 16) - difference;
    if (r < 0) r = 0;
    if (g < 0) g = 0;
    if (b < 0) g = 0;
    r = r.toString(16);
    g = g.toString(16);
    b = b.toString(16);
    if (r.length === 1) r = "0" + r;
    if (g.length === 1) g = "0" + g;
    if (b.length === 1) b = "0" + b;
    return "#" + r + g + b;
}

// return true if the value is white or undefined
function isWhiteOrUndefined(color) {
    return !color || color.toLowerCase() == "#ffffff" || color.toLowerCase() == "white";
}

const miscFunctions = {
    qualifierFromScore,
    renderTextField,
    renderPasswordField,
    getFirstName,
    isValidEmail,
    htmlDecode,
    isValidFileType,
    isValidPassword,
    goTo,
    truthy,
    propertyExists,
    withinElement,
    makePossessive,
    makeSingular,
    elementInViewport,
    elementPartiallyInViewport,
    replaceCharacters,
    copyCustomLink,
    copyFromPage,
    getFormattedDate,
    fieldsAreEmpty,
    noop,
    randomInt,
    round,
    darken,
    isWhiteOrUndefined,

    Queue,
    Stack
};

module.exports = miscFunctions;
