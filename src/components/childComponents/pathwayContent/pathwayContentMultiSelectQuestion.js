import React, {Component} from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {updateAnswer} from '../../../actions/usersActions';
import TwoOptionsChoice from './twoOptionsChoice';
import _ from 'lodash';
import Question from './question';



class PathwayContentMultiSelectQuestion extends Component {
    constructor(props) {
        super(props);
        const quizId = props.quizId;

        let options = {};
        let customAnswer = {selected: false, value: "Other_____"};
        // mark things the user had saved as answers if the user has anything saved
        if (props.currentUser && props.currentUser.answers && props.currentUser.answers[quizId]) {
            let dbAnswer = props.currentUser.answers[quizId];
            props.answers.forEach(function(answer) {
                options[answer.answerNumber] = dbAnswer.value.some(function(userAnswer) {
                    return userAnswer === answer.answerNumber.toString();
                });
            });
            // add the custom answer, if a user had one
            if (dbAnswer.optionalCustomAnswer) {
                customAnswer.selected = true;
                customAnswer.value = dbAnswer.optionalCustomAnswer;
            }
        }
        // mark everything not selected if user doesn't have answers saved
        else {
            props.answers.forEach(function(answer) {
                options[answer.answerNumber] = false;
            });
        }

        this.state = { quizId, options, customAnswer };
    }

    componentDidUpdate() {
        const props = this.props;
        const quizId = props.quizId;
        if (quizId !== this.state.quizId) {
            let options = {};
            let customAnswer = {selected: false, value: "Other_____"};

            // mark things the user had saved as answers if the user has anything saved
            if (props.currentUser && props.currentUser.answers && props.currentUser.answers[quizId]) {
                const dbAnswer = props.currentUser.answers[quizId];
                props.answers.forEach(function(answer) {
                    options[answer.answerNumber] = props.currentUser.answers[quizId].some(function(userAnswer) {
                        return userAnswer === answer.answerNumber.toString();
                    });
                });
                // add the custom answer, if a user had one
                if (dbAnswer.optionalCustomAnswer) {
                    customAnswer.selected = true;
                    customAnswerl.value = dbAnswer.optionalCustomAnswer;
                }
            }
            // mark everything not selected if user doesn't have answers saved
            else {
                props.answers.forEach(function(answer) {
                    options[answer.answerNumber] = false;
                });
            }

            this.setState({ quizId, options, customAnswer });
        }
    }

    handleClick(answerNumber, isCustomAnswer) {
        let newOptions = {...this.state.options};
        let customAnswerSelected = this.state.customAnswer.selected;
        let customAnswerValue = this.state.customAnswer.value;
        // flip this value if the custom answer is the one that was clicked
        if (isCustomAnswer) {
            customAnswerSelected = !customAnswerSelected;
        }

        if (isCustomAnswer) {
            // if nothing has been typed into the custom area and it is clicked,
            // set its value to an empty string
            if (customAnswerSelected && customAnswerValue == "Other_____") {
                customAnswerValue = "";
            }
            // if the user left the custom value empty then de-selected it,
            // fill it in with the default custom answer
            if (!customAnswerSelected && customAnswerValue == "") {
                customAnswerValue = "Other_____";
            }
            this.setState({
                ...this.state,
                customAnswer: {
                    // flip the 'selected' value due to the click
                    selected: customAnswerSelected,
                    value: customAnswerValue
                }
            })
        } else {
            // the first two nots make it evaluate the truthiness of the statement.
            // the second one flips it
            // so if it's false or undefined, flip it to true. if it's true, flip to false
            newOptions[answerNumber] = !!!newOptions[answerNumber];

            // save the new option in state
            this.setState({
                ...this.state,
                options: newOptions
            })
        }

        // loop through all the answers in newOptions to make an array for
        // the db to store answers in
        let answerValues = [];
        for (let answerNumber in newOptions) {
            // skip loop if this property is from the Object prototype
            if (!newOptions.hasOwnProperty(answerNumber)) continue;
            // add the answerNumber to the array if it is marked
            if (newOptions[answerNumber]) {
                answerValues.push(answerNumber);
            }
        }

        // save the custom answer only if it is clicked
        let optionalCustomAnswer = undefined;
        if (customAnswerSelected) {
            optionalCustomAnswer = customAnswerValue;
        }

        // save answer to db
        const answer = {
            answerType: "multiSelect",
            value: answerValues,
            optionalCustomAnswer
        };
        const user = this.props.currentUser;
        this.props.updateAnswer(user._id, user.verificationToken, this.props.quizId, answer);
    }


    handleInputChange(e) {
        this.setState({
            ...this.state,
            customAnswer: {
                value: e.target.value,
                selected: true
            }
        }, this.saveAnswer)
    }


    saveAnswer() {
        // loop through all the answers in newOptions to make an array for
        // the db to store answers in
        let answerValues = [];
        for (let answerNumber in this.state.options) {
            // skip loop if this property is from the Object prototype
            if (!this.state.options.hasOwnProperty(answerNumber)) continue;
            // add the answerNumber to the array if it is marked
            if (this.state.options[answerNumber]) {
                answerValues.push(answerNumber);
            }
        }

        const answer = {
            answerType: "multiSelect",
            value: answerValues,
            optionalCustomAnswer: this.state.customAnswer.value
        };
        const user = this.props.currentUser;
        this.props.updateAnswer(user._id, user.verificationToken, this.props.quizId, answer);
    }


    render() {
        let self = this;
        // go through every option
        const options = this.props.answers.map(function(answer) {
            // see if the option is selected
            const isSelected = self.state.options[answer.answerNumber];
            const selectedClass = isSelected ? "selected" : "notSelected";
            // return a list item-looking thing for each answer
            return (
                <div className="multiSelectOption clickableNoUnderline"
                    answernumber={answer.answerNumber}
                    key={answer.answerNumber}
                    onClick={()=>self.handleClick(answer.answerNumber, false)}
                >
                    <div className={"multiSelectCircle " + selectedClass} />
                    <div className="multiSelectAnswer">{answer.body}</div>
                </div>
            );
        });

        // add custom answer option if allowed in props
        const customAnswerSelectedClass = this.state.customAnswer.selected ? "selected" : "notSelected";
        if (this.props.allowCustomAnswer) {
            options.push(
                <div className="multiSelectOption clickableNoUnderline"
                    answernumber="custom"
                    key="customArea"
                    onClick={()=>{if (!this.state.customAnswer.selected){self.handleClick(undefined, true)}}}
                >
                    <div className={"multiSelectCircle " + customAnswerSelectedClass} onClick={()=>{if (this.state.customAnswer.selected){self.handleClick(undefined, true)}}} />
                    {this.state.customAnswer.selected ?
                        <textarea
                            type="text"
                            className="multiSelectCustomAnswer"
                            value={self.state.customAnswer.value}
                            onChange={(e) => self.handleInputChange(e)}
                        />
                    :
                        <div className="multiSelectAnswer">{self.state.customAnswer.value}</div>
                    }

                </div>
            );
        }

        return (
            <div className="center font20px font16pxUnder600 font12pxUnder400">
                <div style={{marginBottom:"20px"}}><Question question={this.props.question} /></div>
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

export default connect(mapStateToProps, mapDispatchToProps)(PathwayContentMultiSelectQuestion);
