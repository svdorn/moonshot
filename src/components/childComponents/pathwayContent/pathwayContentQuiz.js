import React, {Component} from 'react';
import {Paper, CircularProgress} from 'material-ui';
import {connect} from 'react-redux';
import axios from 'axios';
import PathwayContentSliderQuestion from './pathwayContentSliderQuestion';
import PathwayContentMultipleChoiceQuestion from './pathwayContentMultipleChoiceQuestion';
import PathwayContentTwoOptionsQuestion from './pathwayContentTwoOptionsQuestion';

class PathwayContentQuiz extends Component {
    constructor(props) {
        super(props);
        this.state = {
            quiz: undefined,
            currStep: {},
        }
    }

    componentDidMount() {
        const id = this.props.step.contentID;

        axios.get("/api/getQuiz", {
            params: {
                _id: id
            }
        }).then(res => {
            this.setState({quiz: res.data, currStep: this.props.step});
        })
        .catch(function (err) {
            console.log("error getting searched-for quiz");
        });
    }

    componentDidUpdate() {
        // load content if it isn't already loaded
        if (this.props.step !== this.state.currStep) {
            const id = this.props.step.contentID;

            axios.get("/api/getQuiz", {
                params: {
                _id: id
                }
            }).then(res => {
                this.setState({quiz: res.data, currStep: this.props.step});
            }).catch(function (err) {
                console.log("error getting searched-for quiz");
            });
        }
    }

    render() {
        const quiz = this.state.quiz;
        let questionJsx = "Error getting question";
        // if the quiz hasn't yet been received from back end, don't show anything
        if (!quiz || !quiz.questionType) {
            questionJsx = <CircularProgress style={{marginTop:"40px"}}/>;
        } else {
            const sliderOptions = quiz.sliderOptions ? quiz.sliderOptions : {};
            const questionType = quiz.questionType;
            switch (questionType) {
                case "slider":
                    questionJsx =
                        <PathwayContentSliderQuestion
                            question={quiz.question}
                            minValue={quiz.sliderOptions.minValue}
                            maxValue={quiz.sliderOptions.maxValue}
                            initialValue={quiz.sliderOptions.initialValue}
                            step={quiz.sliderOptions.step}
                            quizId={quiz._id}
                        />
                    break;
                case "twoOptions":
                    questionJsx =
                        <PathwayContentTwoOptionsQuestion
                            question={quiz.question}
                            choices={quiz.twoOptionsChoices}
                            quizId={quiz._id}
                        />
                    break;
                case "multipleChoice":
                    questionJsx =
                        <PathwayContentMultipleChoiceQuestion
                            question={quiz.question}
                            answers={quiz.multipleChoiceAnswers}
                            allowCustomAnswer={quiz.allowCustomAnswer}
                            quizId={quiz._id}
                        />
                    break;
                default:
                    break;
            }
        }

        return (
            <div className={this.props.className} style={{...this.props.style}}>
                <div className="center" style={{padding: "10px 0"}}>
                    { questionJsx }
                </div>
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        step: state.users.currentSubStep
    };
}

export default connect(mapStateToProps)(PathwayContentQuiz);
