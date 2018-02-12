import React, {Component} from 'react';
import {Paper} from 'material-ui';
import {connect} from 'react-redux';
import axios from 'axios';
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

    saveSliderValue = (event) => {
        console.log("SHOULD SAVE NOW");
    }


    render() {
        console.log(this.props);

        return (
            <div className="center">
                <div>{this.props.question}</div>
                <Slider
                    min={this.props.minValue}
                    max={this.props.maxValue}
                    step={this.props.step}
                    value={this.state.sliderValue}
                    onChange={this.handleSlider}
                    onDragStop={this.saveSliderValue}
                />
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {};
}

export default connect(mapStateToProps)(PathwayContentSliderQuestion);
