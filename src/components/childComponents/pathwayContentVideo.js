import React, {Component} from 'react';
import YouTube from 'react-youtube';
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

            axios.get("/api/getVideo", {
                params: {
                    _id: id
                }
            }).then(res => {
                this.setState({content: res.data, currStep: this.props.step});
                console.log(this.state.content);
            }).catch(function (err) {
                console.log("error getting searched for video");
            })
        }
    }

    componentDidUpdate() {
        if (this.props.step !== this.state.currStep) {
            const id = this.props.step.contentID;

            axios.get("/api/getVideo", {
                params: {
                    _id: id
                }
            }).then(res => {
                this.setState({content: res.data, currStep: this.props.step});
                console.log(this.state.content);
            }).catch(function (err) {
                console.log("error getting searched for video");
            })
        }
    }

    render() {

        const opts = {
            height: '390',
            width: '640',
            playerVars: { // https://developers.google.com/youtube/player_parameters
                autoplay: 0
            }
        };

        return (
            <div>
                {this.state.content !== undefined ?
                    <YouTube
                        videoId={this.state.content.link}
                        opts={opts}
                        onReady={this._onReady}
                        onEnd={this._onEnd}
                    />
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

export default connect(mapStateToProps)(PathwayContentVideo);
