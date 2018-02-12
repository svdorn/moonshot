import React, {Component} from 'react';
import {Paper} from 'material-ui';
import {connect} from 'react-redux';
import axios from 'axios';
import PathwayContentSliderQuestion from './pathwayContentSliderQuestion';
//import PathwayContentMultipleChoiceQuestion from './pathwayContentMultipleChoiceQuestion';
//import PathwayContentTwoOptionsQuestion from './pathwayContentTwoOptionsQuestion';

class PathwayContentQuiz extends Component {
    constructor(props) {
        super(props);
        this.state = {
            quiz: undefined,
            currStep: {},
        }
    }

    componentDidMount() {
        // load content if it isn't already loaded
        if (this.props.step !== this.state.currStep) {
            const id = this.props.step.contentID;

            axios.get("/api/getQuiz", {
                params: {
                    _id: id
                }
            }).then(res => {
                this.setState({quiz: res.data, currStep: this.props.step});
            })

            // .catch(function (err) {
            //     console.log("error getting searched-for quiz");
            // })
        }
    }

    // componentDidUpdate() {
    //     if (this.props.step !== this.state.currStep) {
    //         const id = this.props.step.contentID;
    //
    //         axios.get("/api/getArticle", {
    //             params: {
    //                 _id: id
    //             }
    //         }).then(res => {
    //             this.setState({content: res.data, currStep: this.props.step});
    //         }).catch(function (err) {
    //             console.log("error getting searched for article");
    //         })
    //     }
    // }

    render() {
        const quiz = this.state.quiz;
        // if the quiz hasn't yet been received from back end, don't show anything
        if (!quiz || !quiz.questionType) {
            return null;
        }

        const sliderOptions = quiz.sliderOptions ? quiz.sliderOptions : {};
        const questionType = quiz.questionType;
        switch (questionType) {
            case "slider":
                return <PathwayContentSliderQuestion
                            question={quiz.question}
                            minValue={quiz.sliderOptions.minValue}
                            maxValue={quiz.sliderOptions.maxValue}
                            initialValue={quiz.sliderOptions.initialValue}
                            step={quiz.sliderOptions.step} />
                break;
            default:
                return null;
        }

        return (
            <Paper className={this.props.className} style={{...this.props.style}} zDepth={1}>
                {this.state.quiz !== undefined ?
                    <div className="center" style={{marginBottom: "10px"}}>
                        <h4>Question {currStep.subStepNumber}</h4>
                        <div>{quiz.question}</div>

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

export default connect(mapStateToProps)(PathwayContentQuiz);
