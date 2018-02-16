import React, {Component} from 'react';

class StyledContent extends Component {
    render() {
        console.log("HEY");
        const contentArray = this.props.contentArray;
        if (!Array.isArray(contentArray)) { return null; }

        let keyCounter = 0;
        const contentHtml = contentArray.map(function(part) {
            // add a break if the content part needs a break after it
            const breakArea = part.shouldBreak ? <br/> : null;
            // default classNames; if className provided, give the part that className instead
            const defaultClassNames = "inlineBlock sideMargins80px sideMargins40pxUnder700 sideMargins20pxUnder400";
            let className = part.className ? part.className : defaultClassNames;
            // if className isn't default but we want to include default classes, add them
            if (part.className && part.includeDefaultClasses) {
                className = className + " " + defaultClassNames;
            }
            const content = part.content;

            keyCounter++;

            switch (part.partType) {
                case "text":
                    if (content.length > 0) {
                        return (
                            <div className={className} key={"contentPart" + keyCounter}>
                                {content[0]}
                                {breakArea}
                            </div>
                        );
                    } else {
                        return null;
                    }
                    break;
                case "ol":
                case "ul":
                    // if no items given for the lists, return nothing
                    if (!Array.isArray(content) || content.length < 1) {
                        return null;
                    }
                    // make the items inside the list
                    let liKeyCounter = 0;
                    const lis = content.map(function(itemContent) {
                        // return nothing if the item content is not a string
                        if (typeof itemContent !== "string") { return null; }
                        liKeyCounter++;
                        return (
                            <li key={"contentPart" + keyCounter + "li" + liKeyCounter}>{itemContent}</li>
                        );
                    });
                    if (part.partType === "ol") {
                        return (
                            <ol className={className} key={"contentPart" + keyCounter}>
                                {lis}
                                {breakArea}
                            </ol>
                        );
                    } else {
                        return (
                            <ul className={className} key={"contentPart" + keyCounter}>
                                {lis}
                                {breakArea}
                            </ul>
                        );
                    }
                    break;
                default:
                    console.log("content part type unnaccounted for");
                    return null;
            }
        });

        console.log("rendering formatted")

        return (
            <div className="center">
                {contentHtml}
            </div>
        );
    }
}

export default StyledContent;
