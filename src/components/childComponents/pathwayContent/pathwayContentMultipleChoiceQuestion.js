import React, {Component} from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {updateAnswer} from '../../../actions/usersActions';
import TwoOptionsChoice from './twoOptionsChoice';


class PathwayContentMultipleChoiceQuestion extends Component {
    constructor(props) {
        super(props);

        let choiceNumber = undefined;
        // try to assign the value to the value that the user already had from the db
        try {
            const userChoice = props.currentUser.answers[props.quizId].value;
            // ensure user choice is a valid number
            if (typeof userChoice === "number" && userChoice > 1) {
                if ((props.allowCustomAnswer && userChoice < props.answers.length) ||
                    (!props.allowCustomAnswer && userChoice <= props.answers.length)) {
                        choiceNumber = userChoice;
                }
            }
        } catch(e) { /* do nothing if value invalid */ }
        this.state = { choiceNumber }
    }


    // set the current choice to the one that was clicked, save in db
    handleClick = (choiceNumber) => {
        console.log("here");
        // save if choice is valid
        if (choice === 1 || choice === 2) {
            this.setState({choiceNumber});

            const answer = {
                answerType: "multipleChoice",
                value: choiceNumber
            };
            const user = this.props.currentUser;
            this.props.updateAnswer(user._id, user.verificationToken, this.props.quizId, answer);
        }
    }


    render() {
        let self = this;
        let options=[];
        console.log('eju');
        if (Array.isArray(self.props.answers)) {
            options = self.props.answers.map(function(answer) {
                let selectedClass = answer.answerNumber === self.state.choiceNumber ? "selected" : "notSelected";
                return (
                    <div className={"multipleChoiceOption " + selectedClass}
                        choiceNumber={answer.answerNumber}
                        key={answer.answerNumber}>
                        <div className="multipleChoiceCircle" />
                        {answer.body}
                    </div>
                );
            });
        }

        if (this.props.allowCustomAnswer) {
            options.push(
                <div>custom area</div>
            );
        }

        return (
            <div className="center">
                <div className="font20px font16pxUnder600" style={{marginBottom:"20px"}}>{this.props.question}</div>
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
