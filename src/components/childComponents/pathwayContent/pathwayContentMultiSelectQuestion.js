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
        // mark things the user had saved as answers if the user has anything saved
        if (props.currentUser && props.currentUser.answers && props.currentUser.answers[quizId]) {
            props.answers.forEach(function(answer) {
                options[answer.answerNumber] = props.currentUser.answers[quizId].value.some(function(userAnswer) {
                    return userAnswer === answer.answerNumber.toString();
                });
            });
        }
        // mark everything not selected if user doesn't have answers saved
        else {
            props.answers.forEach(function(answer) {
                options[answer.answerNumber] = false;
            });
        }

        this.state = { quizId, options };
    }

    componentDidUpdate() {
        const props = this.props;
        const quizId = props.quizId;
        if (quizId !== this.state.quizId) {
            let options = {};
            // mark things the user had saved as answers if the user has anything saved
            if (props.currentUser && props.currentUser.answers && props.currentUser.answers[quizId]) {
                props.answers.forEach(function(answer) {
                    options[answer.answerNumber] = props.currentUser.answers[quizId].some(function(userAnswer) {
                        return userAnswer === answer.answerNumber.toString();
                    });
                });
            }
            // mark everything not selected if user doesn't have answers saved
            else {
                props.answers.forEach(function(answer) {
                    options[answer.answerNumber] = false;
                });
            }

            this.state = { quizId, options };
        }
    }

    handleClick(answerNumber) {
        console.log("hyello");
        let newOptions = {...this.state.options};
        // the first two nots make it evaluate the truthiness of the statement.
        // the second one flips it
        // so if it's false or undefined, flip it to true. if it's true, flip to false
        newOptions[answerNumber] = !!!newOptions[answerNumber];

        // save the new option in state
        this.setState({
            ...this.state,
            options: newOptions
        })

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

        // save answer to db
        const answer = {
            answerType: "multiSelect",
            value: answerValues
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
                <div className="multipleChoiceOption clickableNoUnderline"
                    answernumber={answer.answerNumber}
                    key={answer.answerNumber}
                    onClick={()=>self.handleClick(answer.answerNumber)}
                >
                    <div className={"multipleChoiceCircle " + selectedClass} />
                    <div className="multipleChoiceAnswer">{answer.body}</div>
                </div>
            );
        });

        return (
            <div className="center font20px font16pxUnder600 font12pxUnder400">
                <div style={{marginBottom:"20px"}}><Question question={this.props.question} /></div>
                {options}
            </div>
        );
    }

}












// class PathwayContentMultiSelectQuestion extends Component {
//     constructor(props) {
//         super(props);
//
//         let answerSelection = {};
// //        let isCustomAnswer = false;
// //        let savedCustomAnswer = "Other_____";
//         // try to assign the value to the value that the user already had from the db
//         try {
//             const userAnswers = props.currentUser.answers[props.quizId];
//             const userValues = userAnswer.value;
// //            isCustomAnswer = userAnswer.isCustomAnswer;
//             // ensure user choice is a valid number
//             if (Array.isArray(userValues) {
//                 selectedAnswers = userValues;
// //                if (isCustomAnswer) {
// //                    savedCustomAnswer = userValue;
// //                }
//             }
//         } catch(e) { console.log("invalid saved answer") }
//
//         this.state = { selectedAnswers, /*isCustomAnswer, savedCustomAnswer*/ }
//     }
//
//
//     // set the current choice to the one that was clicked, save in db
//     handleClick = (answerNumber, isCustomAnswer) => {
//         // don't do anything if they aren't changing anything
//         if (answerNumber === this.state.answerNumber) {
//             return;
//         }
//         // save if choice is valid
//         if ((typeof answerNumber === "number" && answerNumber >= 1) || typeof answerNumber === "string") {
//             if ((this.props.allowCustomAnswer && answerNumber <= this.props.answers.length) ||
//                 (!this.props.allowCustomAnswer && userChoice < this.props.answers.length) ||
//                 isCustomAnswer) {
//
//                 let savedCustomAnswer = this.state.savedCustomAnswer;
//                 // if leaving custom answer and it's blank, switch it back to "Other_____"
//                 if (savedCustomAnswer === "" && !isCustomAnswer) {
//                     savedCustomAnswer = "Other_____";
//                 }
//                 // if entering custom answer and it says "Other_____", switch it to be blank
//                 if (isCustomAnswer && answerNumber === "Other_____") {
//                     answerNumber = "";
//                     savedCustomAnswer = "";
//                 }
//                 this.setState({answerNumber, isCustomAnswer, savedCustomAnswer}, this.saveAnswer);
//             }
//         }
//     }
//     //
//     //
//     // // saveAnswerAndEndTimer = () => {
//     // //     console.log("saving and ending timer");
//     // //     this.saveAnswer();
//     // //     this.setState({timerOn: false});
//     // // }
//     // //
//     // // setSaveTimer() {
//     // //     let self = this;
//     // //     if (!this.state.timerOn) {
//     // //         this.setState({...this.state, timerOn: true}, function() {
//     // //             console.log("state set");
//     // //             console.log(self);
//     // //             setTimeout(self.saveAnswerAndEndTimer().bind(self), 300);
//     // //         })
//     // //     }
//     // // }
//     //
//     // handleInputChange(e, saveFunction) {
//     //     this.setState({
//     //         ...this.state,
//     //         answerNumber: e.target.value,
//     //         savedCustomAnswer: e.target.value,
//     //     }, this.saveAnswer)
//     // }
//     //
//     //
//     // saveAnswer() {
//     //     const answer = {
//     //         answerType: "multipleChoice",
//     //         value: this.state.answerNumber,
//     //         isCustomAnswer: this.state.isCustomAnswer
//     //     };
//     //     const user = this.props.currentUser;
//     //     this.props.updateAnswer(user._id, user.verificationToken, this.props.quizId, answer);
//     // }
//
//
//     render() {
//         let self = this;
//         let options=[];
//         if (Array.isArray(self.props.answers)) {
//             options = self.props.answers.map(function(answer) {
//                 const isSelected = this.state.selectedAnswers.some(function(selectedAnswer) {
//                     return selectedAnswer.answerNumber === answer.answerNumber;
//                 })
//                 let selectedClass = isSelected ? "selected" : "notSelected";
//                 return (
//                     <div className="multipleChoiceOption clickableNoUnderline"
//                         answernumber={answer.answerNumber}
//                         key={answer.answerNumber}
//                         onClick={()=>self.handleClick(answer.answerNumber, false)}
//                     >
//                         <div className={"multipleChoiceCircle " + selectedClass} />
//                         <div className="multipleChoiceAnswer">{answer.body}</div>
//                     </div>
//                 );
//             });
//         }
//
//         // answerNumber can be a string if it is the custom answer
//         const isCustomAnswer = this.state.isCustomAnswer;
//         const customAreaClass = isCustomAnswer ? "selected" : "notSelected"
//         if (this.props.allowCustomAnswer) {
//             console.log("here");
//             options.push(
//                 <div className="multipleChoiceOption clickableNoUnderline"
//                     answernumber="custom"
//                     key="customArea"
//                     onClick={()=>self.handleClick(self.state.savedCustomAnswer, true)}
//                 >
//                     <div className={"multipleChoiceCircle " + customAreaClass} />
//                     {isCustomAnswer ?
//                         <textarea
//                             type="text"
//                             className="multipleChoiceCustomAnswer"
//                             value={self.state.savedCustomAnswer}
//                             onChange={(e) => self.handleInputChange(e)}
//                         />
//                     :
//                         <div className="multipleChoiceAnswer">{self.state.savedCustomAnswer}</div>
//                     }
//
//                 </div>
//             );
//         }
//
//         return (
//             <div className="center font20px font16pxUnder600 font12pxUnder400">
//                 <div style={{marginBottom:"20px"}}><Question question={this.props.question} /></div>
//                 {options}
//             </div>
//         );
//     }
// }

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
