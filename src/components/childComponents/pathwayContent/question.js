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
            let defaultClassNames = "inlineBlock font20px font14pxUnder600 marginSides80px marginSides40pxUnder700 marginSides20pxUnder400 leftAlign";
            if (part.partType === "code") {
                defaultClassNames = "inlineBlock font16px font12pxUnder600 marginSides80px marginSides40pxUnder700 marginSides20pxUnder400 leftAlign";
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
                case "img":
                    if (content.length > 0) {
                        const altText = part.altText ? part.altText : "";
                        return (
                            <div>
                                <img src={"/images/" + content[0]}
                                     alt={altText}
                                     className={className}
                                     key={"contentPart" + keyCounter} />
                                     {breakArea}
                            </div>
                        );
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
                    return (
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
                    console.log("question part type unnaccounted for");
                    return null;
            }

        });

        let overallClassName = this.props.className ? this.props.className : "noStyle";

        return (
            <div className={overallClassName}>
                {questionHtml}
            </div>
        );
    }
}

export default Question;
