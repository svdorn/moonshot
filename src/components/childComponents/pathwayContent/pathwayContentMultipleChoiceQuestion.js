import React, {Component} from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {updateAnswer} from '../../../actions/usersActions';
import TwoOptionsChoice from './twoOptionsChoice';
import Question from './question';

// answer has been saved in the last 1.5 seconds
let savedRecently = false;

class PathwayContentMultipleChoiceQuestion extends Component {
    constructor(props) {
        super(props);

        let answerNumber = undefined;
        const quizId = this.props.quizId;
        let isCustomAnswer = false;
        let savedCustomAnswer = "Other_____";
        // try to assign the value to the value that the user already had from the db
        try {
            const userAnswer = props.currentUser.answers[props.quizId];

            if (userAnswer) {
                const userValue = userAnswer.value;
                isCustomAnswer = userAnswer.isCustomAnswer;
                // ensure user choice is a valid number
                if ((typeof userValue === "number" && userValue >= 1) || userAnswer.isCustomAnswer) {
                    answerNumber = userValue;
                    if (isCustomAnswer) {
                        savedCustomAnswer = userValue;
                    }
                }
            }
        } catch (e) {
            if (props.currentUser.admin) {
                console.log("Invalid answer saved.");
            }
        }

        this.state = {answerNumber, isCustomAnswer, savedCustomAnswer, quizId}
    }

    componentDidUpdate() {
        const props = this.props;
        const quizId = props.quizId;
        if (quizId !== this.state.quizId) {
            let answerNumber = undefined;
            let isCustomAnswer = false;
            let savedCustomAnswer = "Other_____";
            // try to assign the value to the value that the user already had from the db
            try {
                // try to get the user's saved answer
                const userAnswer = props.currentUser.answers[props.quizId];

                // if the user has an answer to this question, display that
                if (userAnswer) {
                    const userValue = userAnswer.value;
                    isCustomAnswer = userAnswer.isCustomAnswer;
                    // ensure user choice is a valid number
                    if ((typeof userValue === "number" && userValue >= 1) || userAnswer.isCustomAnswer) {
                        answerNumber = userValue;
                        if (isCustomAnswer) {
                            savedCustomAnswer = userValue;
                        }
                    }
                }
            } catch (e) {
                if (props.currentUser.admin) {
                    console.log("Invalid answer saved.");
                }
            }

            this.setState({answerNumber, isCustomAnswer, savedCustomAnswer, quizId});
        }
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
                (!this.props.allowCustomAnswer && answerNumber <= this.props.answers.length) ||
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


    handleInputChange(e) {
        const self = this;
        let shouldSave = false;

        // should only save if haven't saved in the last couple seconds
        if (!savedRecently) {
            shouldSave = true;
            savedRecently = true;
        }

        // tell it that it has saved recently if it will save this one
        self.setState({
            ...self.state,
            answerNumber: e.target.value,
            savedCustomAnswer: e.target.value
        }, function () {
            if (shouldSave) {
                // saves AFTER the timeout so that any information saved in the
                // last couple seconds is also saved
                setTimeout(function () {
                    self.saveAnswer();
                    savedRecently = false;
                }, 1500);
            }
        })
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
        let medium = self.props.size === 'medium' ? "medium" : "";
        let options = [];
        if (Array.isArray(self.props.answers)) {
            options = self.props.answers.map(answer => {
                let selectedClass = answer.answerNumber === self.state.answerNumber ? "selected" : "notSelected";
                return (
                    <div className="multipleChoiceOption clickableNoUnderline"
                         answernumber={answer.answerNumber}
                         key={answer.answerNumber}
                         onClick={() => self.handleClick(answer.answerNumber, false)}
                    >
                        <div className={"multipleChoiceCircle " + medium + " " + selectedClass}/>
                        <span>{answer.body}</span>
                    </div>
                );
            });
        }

        // answerNumber can be a string if it is the custom answer
        const isCustomAnswer = this.state.isCustomAnswer;
        const customAreaClass = isCustomAnswer ? "selected" : "notSelected"
        if (this.props.allowCustomAnswer) {
            options.push(
                <div className="multipleChoiceOption clickableNoUnderline"
                     answernumber="custom"
                     key="customArea"
                     onClick={() => self.handleClick(self.state.savedCustomAnswer, true)}
                >
                    <div className={"multipleChoiceCircle " + customAreaClass}/>
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
            <div className="center font20px font16pxUnder600 font12pxUnder400">
                <div style={{marginBottom: "20px"}}><Question question={this.props.question}/></div>
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
