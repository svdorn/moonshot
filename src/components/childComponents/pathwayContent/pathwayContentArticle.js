import React, {Component} from 'react';
import {Paper} from 'material-ui';
import {connect} from 'react-redux';
import axios from 'axios';
import StyledContent from '../styledContent';

class PathwayContentArticle extends Component {
    constructor(props) {
        super(props);
        this.state = {
            content: undefined,
            currStep: {},
        }
    }

    componentDidMount() {
        if (this.props.step !== this.state.currStep) {
            const id = this.props.step.contentID;

            axios.get("/api/getArticle", {
                params: {
                    _id: id
                }
            }).then(res => {
                this.setState({content: res.data, currStep: this.props.step});
            }).catch(function (err) {
                console.log("error getting searched for article");
            })
        }
    }

    componentDidUpdate() {
        if (this.props.step !== this.state.currStep) {
            const id = this.props.step.contentID;

            axios.get("/api/getArticle", {
                params: {
                    _id: id
                }
            }).then(res => {
                this.setState({content: res.data, currStep: this.props.step});
            }).catch(function (err) {
                console.log("error getting searched for article");
            })
        }
    }


    handleClick() {
        const linkFunction = this.state.content.linkFunction;
        if (linkFunction) {
            if (linkFunction === "clickedAlert") {
                axios.post("/api/alertLinkClicked", {
                    params: {
                        name: this.props.currentUser.name,
                        userId: this.props.currentUser._id,
                        link: this.state.content.link
                    }
                })
                .catch(function(err) {
                    /* error alerting */
                });
            }
        }
    }


    render() {
        const content = this.state.content;

        if (this.state.content !== undefined) {
            // set the description equal to the article's description
            let description = content.description;
            let descriptionClassName = content.descriptionClassName;
            // if there is no description, check if default description is not allowed
            if (content.description.length === 0) {
                if (content.defaultDescription !== false) {
                    // if default description setting isn't set or is set to true,
                    // include the default description
                    description = [
                        {
                            partType: "text",
                            content: [
                                "Read this article, then come back and advance to the next step."
                            ],
                            shouldBreak: true,
                            includeDefaultClasses: true
                        }
                    ];
                }
            }

            return (
                <div className={this.props.className} style={{...this.props.style}}>
                    <div className="center" style={{marginBottom: "10px"}}>
                        <h4 className="marginTop20px blueText font30px">{content.name}</h4>
                        <StyledContent contentArray={description} className={descriptionClassName} />
                        <button className="outlineButton font24px font20pxUnder500 whiteBlueButton">
                            <a href={content.link} onClick={this.handleClick.bind(this)} target="_blank" className="blueText blueTextOnHover" style={{textDecoration: 'none'}}>
                                {content.linkText}
                            </a>
                        </button>
                    </div>
                </div>
            );
        } else {
            return (
                <div className={this.props.className} style={{...this.props.style}} />
            );
        }
    }
}

function mapStateToProps(state) {
    return {
        step: state.users.currentSubStep,
        currentUser: state.users.currentUser
    };
}

export default connect(mapStateToProps)(PathwayContentArticle);
