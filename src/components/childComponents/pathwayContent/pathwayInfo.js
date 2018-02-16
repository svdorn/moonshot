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

            axios.get("/api/getPathwayInfo", {
                params: {
                    _id: id
                }
            }).then(res => {
                this.setState({contentArray: res.data.contentParts, currStep: this.props.step});
            }).catch(function (err) {
                console.log("error getting searched for info");
            })
        }
    }

    componentDidUpdate() {
        if (this.props.step !== this.state.currStep) {
            const id = this.props.step.contentID;

            axios.get("/api/getPathwayInfo", {
                params: {
                    _id: id
                }
            }).then(res => {
                console.log("info is: ", res.data);
                this.setState({contentArray: res.data, currStep: this.props.step});
            }).catch(function (err) {
                console.log("error getting searched for info");
            })
        }
    }

    render() {
        return (
            <StyledContent contentArray={this.state.contentArray} />
        );
    }
}

function mapStateToProps(state) {
    return {
        step: state.users.currentSubStep
    };
}

export default connect(mapStateToProps)(PathwayInfo);
