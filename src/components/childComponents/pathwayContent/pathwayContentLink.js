import React, {Component} from 'react';
import {Paper} from 'material-ui';
import {connect} from 'react-redux';
import axios from 'axios';

class PathwayContentLink extends Component {
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

            axios.get("/api/pathway/link", {
                params: {
                    _id: id
                }
            }).then(res => {
                this.setState({content: res.data, currStep: this.props.step});
            }).catch(function (err) {
                console.log("error getting searched for link");
            })
        }
    }

    componentDidUpdate() {
        if (this.props.step !== this.state.currStep) {
            const id = this.props.step.contentID;

            axios.get("/api/pathway/link", {
                params: {
                    _id: id
                }
            }).then(res => {
                this.setState({content: res.data, currStep: this.props.step});
            }).catch(function (err) {
                console.log("error getting searched for link");
            })
        }
    }

    render() {
        const content = this.state.content;
        return (
            <div className={this.props.className} style={{...this.props.style}}>
                {this.state.content !== undefined ?
                    <div className="center" style={{marginBottom: "10px"}}>
                        <img alt="Moonshot Logo" src="/images/OfficialLogoBlue.png" key="moonshot" style={{
                            height: "100px",
                            width: "320px",
                            display: "inline-block",
                            marginBottom: "30px",
                            marginLeft: "15px",
                        }}/>
                        <img alt="Plus sign icon" src="/icons/PlusSign.png" key="plusSign" style={{
                            display: "inline-block",
                            height: "25px",
                            width: "25px",
                            marginTop: "5px",
                            marginLeft: "5px",
                        }}/>
                        <img alt={content.company + " logo"} src={content.logo} key={content.company} style={{
                            height: "190px",
                            width: "360px",
                            display: "inline-block"
                        }}/>
                        <h4>Instructions</h4>
                        <p>{content.instructions}</p>
                        <button className="outlineButton font30px font20pxUnder500 whiteBlueButton">
                            <a href={content.url} target="_blank" style={{textDecoration: 'none', color: '#70cbff'}}>
                                Go to Step
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
        step: state.users.currentSubStep
    };
}

export default connect(mapStateToProps)(PathwayContentLink);
