import React, { Component } from "react";
import { htmlDecode, darken } from "../../miscFunctions";
import { connect } from "react-redux";

class StyledContent extends Component {
    render() {
        const self = this;
        const { contentArray } = this.props;
        if (!Array.isArray(contentArray)) return null;

        let keyCounter = -1;
        let contentHtml = [];
        contentArray.forEach(function(part) {
            if (part && typeof part === "object") {
                // default classNames; if className provided, give the part that className instead
                let defaultClassNames =
                    part.includeDefaultClasses === false
                        ? ""
                        : "inlineBlock marginSides80px marginSides40pxUnder700 marginSides20pxUnder400 leftAlign";
                let fontSizes = "font16px font14pxUnder600 font12pxUnder450";
                // code looks smaller
                if (part.partType === "code") {
                    fontSizes = "font16px font12pxUnder600";
                }
                let className = part.className
                    ? part.className
                    : defaultClassNames + " " + fontSizes;
                // if className isn't default but we want to include default classes, add them
                if (part.className && part.includeDefaultClasses) {
                    className = className + " " + defaultClassNames + " " + fontSizes;
                }
                // if should include default classes but want custom font sizes
                if (part.className && part.includeDefaultClassesNotFontSizes) {
                    className = className + " " + defaultClassNames;
                }
                const content = part.content;

                keyCounter++;

                switch (part.partType) {
                    case "text":
                        if (content.length > 0) {
                            contentHtml.push(
                                <div className={className} key={"contentPart" + keyCounter}>
                                    {htmlDecode(content[0])}
                                </div>
                            );
                        }
                        break;
                    case "img":
                        if (content.length > 0) {
                            const altTag = part.altTag ? part.altTag : "";
                            contentHtml.push(
                                <img
                                    alt={altTag}
                                    src={"/images/" + content[0]}
                                    className={className}
                                    key={"contentPart" + keyCounter}
                                />
                            );
                        }
                        break;
                    case "skillChips":
                        const exampleSkills = content.map(function(skill) {
                            return (
                                <div
                                    key={skill + "div"}
                                    style={{ display: "inline-block", marginTop: "15px" }}
                                    className="lightBlueChip"
                                >
                                    <div key={skill} className="primary-cyan">
                                        {htmlDecode(skill)}
                                    </div>
                                </div>
                            );
                        });
                        contentHtml.push(
                            <div id="exampleSkillsContainer" key={"example skills"}>
                                {exampleSkills}
                            </div>
                        );
                        break;
                    case "link":
                        if (content.length > 0) {
                            const linkText = part.linkText ? part.linkText : content[0];
                            const target = part.newTab === false ? "_self" : "_blank";
                            contentHtml.push(
                                <a
                                    key={++keyCounter + " link"}
                                    target={target}
                                    className={className}
                                    href={content[0]}
                                >
                                    {htmlDecode(linkText)}
                                </a>
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
                            if (typeof itemContent !== "string") {
                                return null;
                            }
                            liKeyCounter++;
                            contentHtml.push(
                                <li key={"contentPart" + keyCounter + "li" + liKeyCounter}>
                                    {htmlDecode(itemContent)}
                                </li>
                            );
                        });
                        if (part.partType === "ol") {
                            contentHtml.push(
                                <ol className={className} key={"contentPart" + keyCounter}>
                                    {lis}
                                </ol>
                            );
                            // add a break if there's supposed to be one
                            if (part.shouldBreak) {
                                contentHtml.push(<br key={"br" + keyCounter} />);
                            }
                        } else {
                            contentHtml.push(
                                <ul className={className} key={"contentPart" + keyCounter}>
                                    {lis}
                                </ul>
                            );
                        }
                        break;
                    case "code":
                        if (content.length > 0) {
                            let code = [];
                            content.forEach(function(codeLine, codeIndex) {
                                let codeCopy = codeLine;
                                // "^" is the symbol to use for indenting by one tab
                                while (codeCopy.length > 0 && codeCopy.charAt(0) === "^") {
                                    // add a tab to the beginning of the line
                                    code.push(
                                        <div
                                            className="inlineBlock width40px"
                                            key={"code tab " + codeCopy.length + " " + codeIndex}
                                        />
                                    );
                                    // remove the indent symbol
                                    codeCopy = codeCopy.substring(1);
                                }
                                code.push(
                                    <div
                                        key={"code " + codeIndex}
                                        className="inlineBlock"
                                        style={{ padding: "10px 20px" }}
                                    >
                                        {htmlDecode(codeCopy)}
                                    </div>
                                );
                                code.push(<br key={"code br " + codeIndex} />);
                            });
                            contentHtml.push(
                                <div
                                    className={className + " code"}
                                    style={{
                                        textAlign: "left",
                                        backgroundColor: darken(self.props.backgroundColor)
                                    }}
                                    key={"questionPart" + keyCounter}
                                >
                                    {code}
                                </div>
                            );
                        } else {
                            return null;
                        }
                        break;
                    default:
                        // console.log("content part type unnaccounted for");
                        break;
                }

                // add a break if there's supposed to be one
                if (part.shouldBreak) {
                    contentHtml.push(<br key={"br" + keyCounter} />);
                }
            }
        });

        const className = this.props.className ? this.props.className : "noStyle";
        const style = this.props.style ? this.props.style : {};

        return (
            <div className={className} style={style}>
                {contentHtml}
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        backgroundColor: state.users.backgroundColor
    };
}

export default connect(mapStateToProps)(StyledContent);
