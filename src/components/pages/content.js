"use strict"
import React, {Component} from 'react';
import {Card, CardHeader, CardActions, CardText, CardMedia, CardTitle, Dialog, RaisedButton, Paper} from 'material-ui';
import YouTube from 'react-youtube';

class Content extends Component {
    constructor(props) {
        super(props);
        this.state = {
            dialogOpen: false,
        }
    }

    handleOpen = () => {
        this.setState({dialogOpen: true});
    };

    handleClose = () => {
        this.setState({dialogOpen: false});
    };

    render() {

        const opts = {
            height: '390',
            width: '640',
            playerVars: { // https://developers.google.com/youtube/player_parameters
                autoplay: 1
            }
        };

        return (
            <div style={{position: 'relative'}}>
                <Dialog
                    title="Unity Dev"
                    open={this.state.dialogOpen}
                    onRequestClose={this.handleClose}
                    autoScrollBodyContent={true}
                    autoDetectWindowHeight={true}
                    className="dialog"
                >
                    <YouTube
                        videoId="_cCGBMmMOFw"
                        id="PLFt_AvWsXl0fnA91TcmkRyhhixX9CO3Lw"
                        opts={opts}
                        onReady={this._onReady}
                        onEnd={this._onEnd}
                    />
                </Dialog>
                <Paper className="form" zDepth={2}>
                    <h1>Sandbox</h1>
                    <RaisedButton onClick={this.handleOpen}>
                        <Card>
                            <CardHeader
                                title="Unity Dev"
                            />
                            <CardMedia
                                overlay={<CardTitle title="Unity Dev" subtitle="1 Hour"/>}
                            >
                                <img src="http://img.youtube.com/vi/_cCGBMmMOFw/1.jpg" alt=""/>
                            </CardMedia>
                            <CardText>
                                Basic description of youtube thing here.
                            </CardText>
                        </Card>
                    </RaisedButton>
                </Paper>
            </div>
        );
    }

    _onEnd(event) {
        event.target.nextVideo();
    }

    _onReady(event) {
        // access to player in all event handlers via event.target
        //event.target.pauseVideo();
    }
}

export default Content;