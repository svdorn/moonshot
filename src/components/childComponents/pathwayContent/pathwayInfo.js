import React, {Component} from 'react';
import {Paper} from 'material-ui';
import {connect} from 'react-redux';
import axios from 'axios';
import StyledContent from '../styledContent';

class PathwayInfo extends Component {
    constructor(props) {
        super(props);
        this.state = {
            contentArray: undefined,
            currStep: {},
        }
    }

    componentDidMount() {
        if (this.props.step !== this.state.currStep) {
            const id = this.props.step.contentID;

            axios.get("/api/pathway/info", {
                params: {
                    _id: id
                }
            }).then(res => {
                this.setState({contentArray: res.data.contentParts, currStep: this.props.step, className: res.data.className});
            }).catch(function (err) {
                console.log("error getting searched for info");
            })
        }
    }

    componentDidUpdate() {
        if (this.props.step !== this.state.currStep) {
            const id = this.props.step.contentID;

            axios.get("/api/pathway/info", {
                params: {
                    _id: id
                }
            }).then(res => {
                this.setState({contentArray: res.data.contentParts, currStep: this.props.step, className: res.data.className});
            }).catch(function (err) {
                console.log("error getting searched for info");
            })
        }
    }

    render() {
        return (
            <StyledContent contentArray={this.state.contentArray} className={this.state.className} />
        );
    }
}

function mapStateToProps(state) {
    return {
        step: state.users.currentSubStep
    };
}

export default connect(mapStateToProps)(PathwayInfo);
