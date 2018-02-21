import React, {Component} from 'react';

class StyledContent extends Component {
    render() {
        const contentArray = this.props.contentArray;
        if (!Array.isArray(contentArray)) { return null; }

        let keyCounter = 0;
        let contentHtml = [];
        contentArray.forEach(function(part) {
            // default classNames; if className provided, give the part that className instead
            const defaultClassNames = "inlineBlock marginSides80px marginSides40pxUnder700 marginSides20pxUnder400";
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
                        contentHtml.push(
                            <div className={className} key={"contentPart" + keyCounter}>
                                {content[0]}
                            </div>
                        );
                        // add a break if there's supposed to be one
                        if (part.shouldBreak) { contentHtml.push(<br key={"br" + keyCounter}/>); }
                    }
                    break;
                case "ol":
                case "ul":
                    // if no items given for the lists, return nothing
                    if (!Array.isArray(content) || content.length < 1) {
                        break;
                    }
                    // make the items inside the list
                    let liKeyCounter = 0;
                    const lis = content.map(function(itemContent) {
                        // return nothing if the item content is not a string
                        if (typeof itemContent !== "string") { return null; }
                        liKeyCounter++;
                        contentHtml.push(
                            <li key={"contentPart" + keyCounter + "li" + liKeyCounter}>{itemContent}</li>
                        );
                    });
                    if (part.partType === "ol") {
                        contentHtml.push(
                            <ol className={className} key={"contentPart" + keyCounter}>
                                {lis}
                            </ol>
                        );
                        // add a break if there's supposed to be one
                        if (part.shouldBreak) { contentHtml.push(<br key={"br" + keyCounter}/>); }
                    } else {
                        contentHtml.push(
                            <ul className={className} key={"contentPart" + keyCounter}>
                                {lis}
                            </ul>
                        );
                        // add a break if there's supposed to be one
                        if (part.shouldBreak) { contentHtml.push(<br key={"br" + keyCounter}/>); }
                    }
                    break;
                default:
                    console.log("content part type unnaccounted for");
                    break;
            }
        });

        return (
            <div className="center">
                {contentHtml}
            </div>
        );
    }
}

export default StyledContent;
