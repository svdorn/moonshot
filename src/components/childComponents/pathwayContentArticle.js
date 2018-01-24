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

    render() {
        const content = this.state.content;
        return (
            <Paper className={this.props.className} style={{...this.props.style}} zDepth={1}>
                {this.state.content !== undefined ?
                    <div className="center" style={{marginBottom: "10px"}}>
                        <h4>{content.name}</h4>
                        <button className="outlineButton font30px font20pxUnder500 whiteBlueButton">
                            <a href={content.link} target="_blank" style={{textDecoration: 'none', color: '#70cbff'}}>
                                Go to Step
                            </a>
                        </button>
                    </div>
                    : null}
            </Paper>
        );
    }
}

function mapStateToProps(state) {
    return {
        step: state.users.currentSubStep
    };
}

export default connect(mapStateToProps)(PathwayContentLink);
