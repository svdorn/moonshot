import React, {Component} from 'react';

class Question extends Component {
    render() {
        const question = this.props.question;
        if (!Array.isArray(question)) { return null; }

        let keyCounter = 0;
        const questionHtml = question.map(function(part) {
            // add a break if the question part needs a break after it
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
                            <div className={className} key={"questionPart" + keyCounter}>
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
                            <li key={"questionPart" + keyCounter + "li" + liKeyCounter}>{itemContent}</li>
                        );
                    });
                    if (part.partType === "ol") {
                        return (
                            <ol className={className} key={"questionPart" + keyCounter}>
                                {lis}
                                {breakArea}
                            </ol>
                        );
                    } else {
                        return (
                            <ul className={className} key={"questionPart" + keyCounter}>
                                {lis}
                                {breakArea}
                            </ul>
                        );
                    }
                    break;
                default:
                    console.log("question part type unnaccounted for");
                    return null;
            }

        });

        return (
            <div className="center">
                {questionHtml}
            </div>
        );
    }
}

export default Question;
