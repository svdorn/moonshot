import React, {Component} from 'react';
import {Paper} from 'material-ui';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {updateAnswer} from '../../../actions/usersActions';
import Slider from 'material-ui/Slider';
import Question from './question';

class PathwayContentSliderQuestion extends Component {
    constructor(props) {
        super(props);

        const minValue = typeof props.minValue === "number" ? props.minValue : 1;
        const maxValue = typeof props.maxValue === "number" ? props.maxValue : 10;
        const step = typeof props.step === "number" ? props.step : 1;
        let sliderValue = minValue;
        // try to assign the value to the value that the user already had from the db
        try {
            const userValue = props.currentUser.answers[props.quizId].value;
            if (typeof userValue !== "number" || userValue < minValue || userValue > maxValue) {
                throw "value from db out of range or doesn't exist";
            } else {
                sliderValue = userValue;
            }
        } catch(e) {
            // if user didn't have something saved, assign the initial value to
            // be whatever the props told it to be, if specified
            sliderValue = minValue;
        }
        this.state = {
            minValue, maxValue, step, sliderValue
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
                <div className="sliderContainer font20px font16pxUnder600 font12pxUnder400">
                    <div style={{marginBottom:"20px"}}><Question question={this.props.question} /></div>
                    <div>{this.state.sliderValue}</div>
                    <Slider
                        min={this.state.minValue}
                        max={this.state.maxValue}
                        step={this.state.step}
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
