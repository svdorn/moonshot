// get the place the scripts need to be added to
let head = document.getElementsByTagName("head")[0];

// source urls for branch-specific
const additionalTags = [

];

// go through each tag we want to create
additionalTags.forEach(function(tag) {
    try {
        // create a tag
        let newTag = document.createElement(tag.type);
        // go through each property
        for (let property in tag.properties) {
            // don't go through a default property
            if (!tag.properties.hasOwnProperty(property)) continue;
            // add the property to the tag
            newTag[property] = tag.properties[property];
        }
        // add the script to the document
        head.append(newTag);
    }
    // catch any random error
    catch (error) {
        console.log(error);
    }
});
