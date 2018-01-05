import React, { Component } from 'react';
import { Paper } from 'material-ui';
import { connect } from 'react-redux';
import axios from 'axios';

class PathwayContentLink extends Component {
    constructor(props){
        super(props);
        this.state = {
            content: undefined,
            currStep: {},
        }
    }

    componentDidUpdate() {
        if (this.props.step === undefined) return;
        if (this.props.step !== this.state.currStep) {
            const id = this.props.step.contentID;

            axios.get("/api/getLink", {
                params: {
                    _id: id
                }
            }).then(res => {
                this.setState({content: res.data, currStep:this.props.step});
                console.log(this.state.content);
            }).catch(function (err) {
                console.log("error getting searched for link");
            })
        }
    }

    render() {
        return (
            <Paper style={{...this.props.style}} zDepth={1}>
                <div>
                    Here:
                    {this.state.content !== undefined ? <div>{this.state.content.url}</div> : <div>Here</div>}
                </div>
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
