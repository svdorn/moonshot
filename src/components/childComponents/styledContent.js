import React, {Component} from 'react';

class StyledContent extends Component {
    render() {
        const contentArray = this.props.contentArray;
        if (!Array.isArray(contentArray)) { return null; }

        let keyCounter = 0;
        let contentHtml = [];
        contentArray.forEach(function(part) {
            // default classNames; if className provided, give the part that className instead
            let defaultClassNames = "inlineBlock font20px font14pxUnder600 marginSides80px marginSides40pxUnder700 marginSides20pxUnder400";
            if (part.partType === "code") {
                defaultClassNames = "inlineBlock font16px font12pxUnder600 marginSides80px marginSides40pxUnder700 marginSides20pxUnder400";
            }
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
                case "img":
                    if (content.length > 0) {
                        contentHtml.push(
                            <img src={"/images/" + content[0]}
                                 className={className}
                                 key={"contentPart" + keyCounter} />
                        );
                        // add a break if there's supposed to be one
                        if (part.shouldBreak) { contentHtml.push(<br key={"br" + keyCounter}/>); }
                    }
                    break;
                case "skillChips":
                    const exampleSkills = content.map(function (skill) {
                        return (
                            <div key={skill + "div"}
                                 style={{display: 'inline-block', marginTop: '15px'}}
                                 className="gradientBorderPurpleToPinkChip"
                            >
                                <div key={skill} className="purpleText">
                                    {skill}
                                </div>
                            </div>
                        );
                    });
                    contentHtml.push(
                        <div id="exampleSkillsContainer">
                            {exampleSkills}
                        </div>
                    );
                    break;
                case "link":
                    if (content.length > 0) {
                        const linkText = content.linkText ? content.linkText : content[0];
                        const target = content.newTab === false ? "_self" : "_blank";
                        return (
                            <a target={target} href={content[0]}>{linkText}</a>
                        );
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
                case "code":
                    if (content.length > 0) {
                        let code = [];
                        content.forEach(function(codeLine) {
                            let codeCopy = codeLine;
                            // "^" is the symbol to use for indenting by one tab
                            while (codeCopy.length > 0 && codeCopy.charAt(0) === "^") {
                                // add a tab to the beginning of the line
                                code.push(<div className="inlineBlock width40px"/>);
                                // remove the indent symbol
                                codeCopy = codeCopy.substring(1);
                            }
                            code.push(<div className="inlineBlock">{codeCopy}</div>);
                            code.push(<br/>)
                        });
                        return (
                            <div className={className + " code"} style={{textAlign:"left"}} key={"questionPart" + keyCounter}>
                                {code}
                                {breakArea}
                            </div>
                        );
                    } else {
                        return null;
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
