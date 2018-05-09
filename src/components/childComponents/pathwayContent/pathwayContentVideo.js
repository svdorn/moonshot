import React, {Component} from 'react';
import YouTube from 'react-youtube';
import {CircularProgress} from 'material-ui';
import {connect} from 'react-redux';
import axios from 'axios';

class PathwayContentVideo extends Component {
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

            axios.get("/api/pathway/video", {
                params: {
                    _id: id
                }
            }).then(res => {
                this.setState({content: res.data, currStep: this.props.step});
            }).catch(function (err) {
                console.log("error getting searched for video");
            })
        }
    }

    componentDidUpdate() {
        if (this.props.step !== this.state.currStep) {
            const id = this.props.step.contentID;

            axios.get("/api/pathway/video", {
                params: {
                    _id: id
                }
            }).then(res => {
                this.setState({content: res.data, currStep: this.props.step});
            }).catch(function (err) {
                console.log("error getting searched for video");
            })
        }
    }

    render() {
        const content = this.state.content;
        if (!content) {
            return null;
        }

        const startTime = content.start ? content.start : undefined;
        const endTime = content.end ? content.end : undefined;
        // setting this to 1 means annotations will show. default is 3, meaning
        // annotations are turned off
        const showAnnotations = content.showAnnotations === true ? "1" : "3";
        const opts = {
            height: '100%',
            width: '100%',
            playerVars: { // https://developers.google.com/youtube/player_parameters
                autoplay: 0,
                rel: 0,
                start: startTime,
                end: endTime,
                iv_load_policy: showAnnotations
            }
        };

        return (
            <div>
                {content !== undefined ?
                    <div style={this.props.style} className={this.props.className}>
                        <YouTube
                            videoId={content.link}
                            opts={opts}
                            onReady={this._onReady}
                            onEnd={this._onEnd}
                        />
                    </div>
                    : <div style={{textAlign: 'center', verticalAlign:'middle'}}>
                        <CircularProgress/>
                    </div>}
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        step: state.users.currentSubStep
    };
}

export default connect(mapStateToProps)(PathwayContentVideo);
