import React, {Component} from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {updateAnswer} from '../../../actions/usersActions';
import TwoOptionsChoice from './twoOptionsChoice';
import Question from './question';
import Slider from 'material-ui/Slider';

// answer has been saved in the last 1.5 seconds
let savedRecently = false;

class FreeResponseAndSliderOnSelectQuestion extends Component {
    constructor(props) {
        super(props);
        const quizId = props.quizId;

        let options = {};

        // go through every value given by the question as an answer to click
        props.answers.forEach(function(answer) {
            // each option is recorded the same way as in the db, plus the actual question
            options[answer.answerNumber.toString()] = {
                body: answer.body
            };
        });

        // mark things the user had saved as answers if the user has anything saved
        if (props.currentUser && props.currentUser.answers && props.currentUser.answers[quizId] && props.currentUser.answers[quizId].value) {
            let dbAnswer = props.currentUser.answers[quizId];

            // go through every value given by the question as an answer to click
            props.answers.forEach(function(answer) {
                // if the option wasn't saved in db, this will be undefined
                // otherwise it'll have the "skill" and "answerText" fields
                options[answer.answerNumber.toString()].value = dbAnswer.value[answer.answerNumber.toString()];

                // if answer text exists, replace it with an html-decoded version of itself
                let userAnswer = options[answer.answerNumber.toString()].value;
                if (userAnswer && typeof userAnswer.answerText === "string") {
                    // only care about the text at this point
                    userAnswer = userAnswer.answerText;
                    // replace html-encoded entities with decoded versions
                    userAnswer = userAnswer.replace(/&quot;/g,"\"")
                                           .replace(/&amp;/g,"&")
                                           .replace(/&lt;/g,"<")
                                           .replace(/&gt;/g,">");

                    options[answer.answerNumber.toString()].value.answerText = userAnswer;
                }
            });
        }

        const minSliderValue = this.props.minSliderValue ? this.props.minSliderValue : 1;
        const maxSliderValue = this.props.maxSliderValue ? this.props.maxSliderValue : 10;
        const sliderStep = this.props.sliderStep ? this.props.sliderStep : 1;

        this.state = { quizId, options, minSliderValue, maxSliderValue, sliderStep, savedValues: {} };
    }

    componentDidUpdate() {
        const props = this.props;
        const quizId = props.quizId;
        if (quizId !== this.state.quizId) {
            let options = {};

            // go through every value given by the question as an answer to click
            props.answers.forEach(function(answer) {
                // each option is recorded the same way as in the db, plus the actual question
                options[answer.answerNumber.toString()] = {
                    body: answer.body
                };
            });

            // mark things the user had saved as answers if the user has anything saved
            if (props.currentUser && props.currentUser.answers && props.currentUser.answers[quizId]) {
                let dbAnswer = props.currentUser.answers[quizId];

                // go through every value given by the question as an answer to click
                props.answers.forEach(function(answer) {
                    // if the option wasn't saved in db, this will be undefined
                    // otherwise it'll have the "skill" and "answerText" fields
                    options[answer.answerNumber.toString()].value = dbAnswer.value[answer.answerNumber.toString()];

                    // if answer text exists, replace it with an html-decoded version of itself
                    let userAnswer = options[answer.answerNumber.toString()].value;
                    if (userAnswer && typeof userAnswer.answerText === "string") {
                        // replace html-encoded entities with decoded versions
                        userAnswer = userAnswer.replace(/&quot;/g,"\"");
                        userAnswer = userAnswer.replace(/&amp;/g,"&");
                        userAnswer = userAnswer.replace(/&lt;/g,"<");
                        userAnswer = userAnswer.replace(/&gt;/g,">");

                        options[answer.answerNumber.toString()].value.answerText = userAnswer;
                    }
                });
            }

            const minSliderValue = this.props.minSliderValue ? this.props.minSliderValue : 1;
            const maxSliderValue = this.props.maxSliderValue ? this.props.maxSliderValue : 10;
            const sliderStep = this.props.sliderStep ? this.props.sliderStep : 1;

            this.setState({ quizId, options, minSliderValue, maxSliderValue, sliderStep, savedValues: {} });
        }
    }

    handleClick(answerNumber) {
        let newOptions = {...this.state.options};
        let newSavedValues = {...this.state.savedValues};

        // if the answer had already been clicked
        if (newOptions[answerNumber].value) {
            // get ready to put the old value into the savedValues object
            newSavedValues[answerNumber] = newOptions[answerNumber].value;
            // get ready to mark this answer unclicked
            newOptions[answerNumber].value = undefined;
        }
        // if the answer had not been selected before and now is supposed to be
        else {
            // if there is a saved value, reset it to that
            if (this.state.savedValues[answerNumber]) {
                newOptions[answerNumber].value = this.state.savedValues[answerNumber];
                newSavedValues[answerNumber] = undefined;
            }
            // otherwise set it up as a new response
            else {
                newOptions[answerNumber].value = {
                    skill: 1,
                    answerText: ""
                }
            }
        }

        // set state, save the answer in db when state is set
        let self = this;
        this.setState({
            quizId: this.state.quizId,
            options: newOptions,
            savedValues: newSavedValues
        }, self.saveAnswer());
    }


    handleInputChange(e, answerNumber) {
        const self = this;
        let shouldSave = false;

        // should only save if haven't saved in the last couple seconds
        // savedRecently is a global value
        if (!savedRecently) {
            shouldSave = true;
            savedRecently = true;
        }

        // get new value for this textarea
        let newOptions = {...this.state.options};
        newOptions[answerNumber].value.answerText = e.target.value;

        // tell it that it has saved recently if it will save this one
        self.setState({
            ...self.state,
            options: newOptions
        }, function() {
            if (shouldSave) {
                // saves AFTER the timeout so that any information saved in the
                // last couple seconds is also saved
                setTimeout(function() {
                    self.saveAnswer();
                    savedRecently = false;
                }, 1500);
            }
        })
    }


    saveAnswer() {
        let answerObject = {};
        let options = this.state.options;
        for (let currAnswerNumber in options) {
            // don't worry about this property if it's part of the Object prototype
            if (!options.hasOwnProperty(currAnswerNumber)) continue;

            answerObject[currAnswerNumber] = options[currAnswerNumber].value;
        }

        // save answer to db
        const answer = {
            answerType: "freeResponseAndSliderOnSelect",
            value: answerObject
        };
        const user = this.props.currentUser;
        this.props.updateAnswer(user._id, user.verificationToken, this.props.quizId, answer);
    }


    handleSlider(event, value, answerNumber) {
        let newOptions = {...this.state.options};
        newOptions[answerNumber].value.skill = value;
        this.setState({options: newOptions});
    };


    render() {
        let self = this;
        let options = this.state.options;

        const minSliderText = this.props.minSliderText ? this.props.minSliderText : this.state.minSliderValue;
        const maxSliderText = this.props.maxSliderText ? this.props.maxSliderText : this.state.maxSliderValue;

        // go through every option
        let optionsHtml = [];
        for (let answerNumber in options) {
            // don't worry about this property if it's part of the Object prototype
            if (!options.hasOwnProperty(answerNumber)) continue;

            // find if the value on the option exists, which would mean it is selected
            const isSelected = !!options[answerNumber].value;
            const selectedClass = isSelected ? "selected" : "notSelected";

            optionsHtml.push(
                <div key={"option" + answerNumber}>
                    <div className="multiSelectOption clickableNoUnderline"
                         onClick={()=>{if (!isSelected){self.handleClick(answerNumber)}}}
                    >
                        <div className={"multiSelectCircle " + selectedClass} onClick={()=>{if (isSelected){self.handleClick(answerNumber)}}} />
                        {options[answerNumber].body}

                    </div>
                    {isSelected ?
                        <div className="sliderOnSelect">
                            <Slider
                                min={this.state.minSliderValue}
                                max={this.state.maxSliderValue}
                                step={this.state.sliderStep}
                                value={options[answerNumber].value.skill}
                                onChange={(e, value) => this.handleSlider(e, value, answerNumber)}
                                onDragStop={this.saveAnswer.bind(this)}
                            />
                            <div style={{float:"left", margin:"-40px 0 0 -6px"}}>{this.props.minSliderText}</div>
                            <span style={{float:"right", margin:"-40px -10px 0 0"}}>{this.props.maxSliderText}</span>
                        </div>
                    :
                        null
                    }
                    <br/>
                    {isSelected ?
                        <textarea
                            type="text"
                            className="textAreaOnSelect"
                            value={options[answerNumber].value.answerText}
                            placeholder="Describe your experience with this in two to three sentences."
                            onChange={(e) => self.handleInputChange(e, answerNumber)}
                        />
                    :
                        null
                    }
                </div>
            );
            optionsHtml.push(<br key={"br" + answerNumber}/>)
        }

        return (
            <div className="font20px font16pxUnder600 font12pxUnder400 leftAlign">
                <div style={{margin:"0 20px 20px"}}><Question question={this.props.question} /></div>
                {optionsHtml}
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

export default connect(mapStateToProps, mapDispatchToProps)(FreeResponseAndSliderOnSelectQuestion);
