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
        return (
            <div className={this.props.className} style={{...this.props.style}}>
                {this.state.content !== undefined ?
                    <div className="center" style={{marginBottom: "10px"}}>
                        <h4 className="marginTop20px blueText font30px">{content.name}</h4>
                        <StyledContent contentArray={content.description} />
                        <button className="outlineButton font24px font20pxUnder500 whiteBlueButton">
                            <a href={content.link} onClick={this.handleClick.bind(this)} target="_blank" className="blueText blueTextOnHover" style={{textDecoration: 'none'}}>
                                {content.linkText}
                            </a>
                        </button>
                    </div>
                    : null}
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        step: state.users.currentSubStep,
        currentUser: state.users.currentUser
    };
}

export default connect(mapStateToProps)(PathwayContentArticle);
