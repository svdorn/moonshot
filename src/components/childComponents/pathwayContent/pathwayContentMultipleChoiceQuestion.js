import React, {Component} from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {updateAnswer} from '../../../actions/usersActions';
import TwoOptionsChoice from './twoOptionsChoice';
import _ from 'lodash';
import Question from './question';


class PathwayContentMultipleChoiceQuestion extends Component {
    constructor(props) {
        super(props);

        let answerNumber = undefined;
        let isCustomAnswer = false;
        let savedCustomAnswer = "Other_____";
        // try to assign the value to the value that the user already had from the db
        try {
            const userAnswer = props.currentUser.answers[props.quizId];
            const userValue = userAnswer.value;
            isCustomAnswer = userAnswer.isCustomAnswer;
            // ensure user choice is a valid number
            if ((typeof userValue === "number" && userValue >= 1) || userAnswer.isCustomAnswer) {
                if ((props.allowCustomAnswer && userValue <= props.answers.length) ||
                    (!props.allowCustomAnswer && userValue < props.answers.length)
                    || userAnswer.isCustomAnswer) {
                        answerNumber = userValue;
                        if (isCustomAnswer) {
                            savedCustomAnswer = userValue;
                        }
                }
            }
        } catch(e) { /* do nothing if value invalid */ }

        // the last time the custom answer was saved
        const lastSave = new Date();
        // if there is a timer on to save the custom answer
        const timerOn = false;

        this.state = { answerNumber, isCustomAnswer, savedCustomAnswer, lastSave }
    }


    // set the current choice to the one that was clicked, save in db
    handleClick = (answerNumber, isCustomAnswer) => {
        // don't do anything if they aren't changing anything
        if (answerNumber === this.state.answerNumber) {
            return;
        }
        // save if choice is valid
        if ((typeof answerNumber === "number" && answerNumber >= 1) || typeof answerNumber === "string") {
            if ((this.props.allowCustomAnswer && answerNumber <= this.props.answers.length) ||
                (!this.props.allowCustomAnswer && userChoice < this.props.answers.length) ||
                isCustomAnswer) {

                let savedCustomAnswer = this.state.savedCustomAnswer;
                // if leaving custom answer and it's blank, switch it back to "Other_____"
                if (savedCustomAnswer === "" && !isCustomAnswer) {
                    savedCustomAnswer = "Other_____";
                }
                // if entering custom answer and it says "Other_____", switch it to be blank
                if (isCustomAnswer && answerNumber === "Other_____") {
                    answerNumber = "";
                    savedCustomAnswer = "";
                }
                this.setState({answerNumber, isCustomAnswer, savedCustomAnswer}, this.saveAnswer);
            }
        }
    }


    // saveAnswerAndEndTimer = () => {
    //     console.log("saving and ending timer");
    //     this.saveAnswer();
    //     this.setState({timerOn: false});
    // }
    //
    // setSaveTimer() {
    //     let self = this;
    //     if (!this.state.timerOn) {
    //         this.setState({...this.state, timerOn: true}, function() {
    //             console.log("state set");
    //             console.log(self);
    //             setTimeout(self.saveAnswerAndEndTimer().bind(self), 300);
    //         })
    //     }
    // }

    handleInputChange(e, saveFunction) {
        this.setState({
            ...this.state,
            answerNumber: e.target.value,
            savedCustomAnswer: e.target.value,
        }, this.saveAnswer)
    }


    saveAnswer() {
        const answer = {
            answerType: "multipleChoice",
            value: this.state.answerNumber,
            isCustomAnswer: this.state.isCustomAnswer
        };
        const user = this.props.currentUser;
        this.props.updateAnswer(user._id, user.verificationToken, this.props.quizId, answer);
    }


    render() {
        let self = this;
        let options=[];
        if (Array.isArray(self.props.answers)) {
            options = self.props.answers.map(function(answer) {
                let selectedClass = answer.answerNumber === self.state.answerNumber ? "selected" : "notSelected";
                return (
                    <div className="multipleChoiceOption clickableNoUnderline"
                        answernumber={answer.answerNumber}
                        key={answer.answerNumber}
                        onClick={()=>self.handleClick(answer.answerNumber, false)}
                    >
                        <div className={"multipleChoiceCircle " + selectedClass} />
                        <div className="multipleChoiceAnswer">{answer.body}</div>
                    </div>
                );
            });
        }

        // answerNumber can be a string if it is the custom answer
        const isCustomAnswer = this.state.isCustomAnswer;
        const customAreaClass = isCustomAnswer ? "selected" : "notSelected"
        if (this.props.allowCustomAnswer) {
            console.log("here");
            options.push(
                <div className="multipleChoiceOption clickableNoUnderline"
                    answernumber="custom"
                    key="customArea"
                    onClick={()=>self.handleClick(self.state.savedCustomAnswer, true)}
                >
                    <div className={"multipleChoiceCircle " + customAreaClass} />
                    {isCustomAnswer ?
                        <textarea
                            type="text"
                            className="multipleChoiceCustomAnswer"
                            value={self.state.savedCustomAnswer}
                            onChange={(e) => self.handleInputChange(e)}
                        />
                    :
                        <div className="multipleChoiceAnswer">{self.state.savedCustomAnswer}</div>
                    }

                </div>
            );
        }

        return (
            <div className="center">
                <div className="font20px font16pxUnder600" style={{marginBottom:"20px"}}><Question question={this.props.question} /></div>
                {options}
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

export default connect(mapStateToProps, mapDispatchToProps)(PathwayContentMultipleChoiceQuestion);
