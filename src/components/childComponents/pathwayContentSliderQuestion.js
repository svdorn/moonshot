import React, {Component} from 'react';
import {Paper} from 'material-ui';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {updateAnswer} from '../../actions/usersActions';
import Slider from 'material-ui/Slider';

class PathwayContentSliderQuestion extends Component {
    constructor(props) {
        super(props);
        this.state = {
            sliderValue: props.initialValue ? props.initialValue : 1,
        }
    }


    handleSlider = (event, value) => {
        this.setState({sliderValue: value});
    };


    // save slider's value in db when user stops moving the slider
    saveSliderValue = (event) => {
        const answer = {
            answerType: "sliderValue",
            value: this.state.sliderValue
        };
        const user = this.props.currentUser;
        this.props.updateAnswer(user._id, user.verificationToken, this.props.quizId, answer);
    }


    render() {
        return (
            <div className="center">
                <div className="sliderContainer">
                    <div className="font20px font16pxUnder600" style={{marginBottom:"20px"}}>{this.props.question}</div>
                    <div className="font20px font16pxUnder600">{this.state.sliderValue}</div>
                    <Slider
                        min={this.props.minValue}
                        max={this.props.maxValue}
                        step={this.props.step}
                        value={this.state.sliderValue}
                        onChange={this.handleSlider}
                        onDragStop={this.saveSliderValue}
                    />
                    <div style={{float:"left", margin:"-40px 0 0 -6px"}}>{this.props.minValue}</div>
                    <span style={{float:"right", margin:"-40px -10px 0 0"}}>{this.props.maxValue}</span>
                </div>
            </div>
        );
    }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        updateAnswer
    }, dispatch);
}

function mapStateToProps(state) {
    return {
        currentUser: state.users.currentUser
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(PathwayContentSliderQuestion);
