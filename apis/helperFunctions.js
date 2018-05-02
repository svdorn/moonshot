const sanitizeHtml = require('sanitize-html');

// strictly sanitize, only allow bold and italics in input
const sanitizeOptions = {
    allowedTags: ['b', 'i', 'em', 'strong'],
    allowedAttributes: []
}

const helperFunctions = {
    // remove html tags from a variable (any type) to prevent code injection
    sanitize: function(something) {
        const somethingType = (typeof something);
        switch (somethingType) {
            case "object":
                return sanitizeObject(something);
                break;
            case "boolean":
            case "number":
                return something;
                break;
            case "string":
                return sanitizeHtml(something, sanitizeOptions);
                break;
            case "undefined":
            case "symbol":
            case "function":
            default:
                return undefined;
        }
    }
}

function sanitizeObject(obj) {
    console.log("doin it");
    if (!obj) {
        return undefined;
    }

    if (Array.isArray(obj)) {
        return sanitizeArray(obj);
    }

    let newObj = {};

    for (var prop in obj) {
        // skip loop if the property is from prototype
        if (!obj.hasOwnProperty(prop)) continue;
        let value = obj[prop];
        let propType = typeof value;

        switch (propType) {
            case "undefined":
                break;
            case "object":
                if (Array.isArray(value)) {
                    newObj[prop] = sanitizeArray(value);
                } else {
                    newObj[prop] = sanitizeObject(value);
                }
                break;
            case "boolean":
            case "number":
                newObj[prop] = value;
                break;
            case "string":
                newObj[prop] = sanitizeHtml(value, sanitizeOptions);
                break;
            default:
            // don't give the object the property if it isn't one of these things
        }
    }

    return newObj;
}

function sanitizeArray(arr) {
    if (!arr) {
        return undefined;
    }

    const sanitizedArr = arr.map(function (value) {
        let valueType = (typeof value);

        switch (valueType) {
            case "object":
                if (Array.isArray(value)) {
                    return sanitizeArray(value);
                } else {
                    return sanitizeObject(value);
                }
                break;
            case "boolean":
            case "number":
                return value;
                break;
            case "string":
                return sanitizeHtml(value, sanitizeOptions);
                break;
            case "undefined":
            default:
                // don't give the object the property if it isn't one of these things
                return undefined;
        }
    });

    return sanitizedArr;
}

module.exports = helperFunctions;
