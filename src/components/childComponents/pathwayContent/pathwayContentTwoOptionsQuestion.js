import React, {Component} from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {updateAnswer} from '../../../actions/usersActions';
import TwoOptionsChoice from './twoOptionsChoice';
import Question from './question';


class PathwayContentTwoOptionsQuestion extends Component {
    constructor(props) {
        super(props);

        let option1 = "";
        let option2 = "";
        if (typeof props.choices === "object") {
            option1 = props.choices.choice1;
            option2 = props.choices.choice2;
        }

        let choice = undefined;
        // try to assign the value to the value that the user already had from the db
        try {
            const userChoice = props.currentUser.answers[props.quizId].value;
            //
            if (userChoice === 1 || userChoice === 2) {
                choice = userChoice;
            }
        } catch(e) { /* do nothing if value invalid */ }

        const quizId = props.quizId;
        this.state = { quizId, choice, option1, option2 }
    }


    componentDidUpdate() {
        console.log("eh")
        if (this.props.quizId !== this.state.quizId) {
            let option1 = "";
            let option2 = "";
            if (typeof this.props.choices === "object") {
                option1 = this.props.choices.choice1;
                option2 = this.props.choices.choice2;
            }

            let choice = undefined;
            // try to assign the value to the value that the user already had from the db
            try {
                const userChoice = this.props.currentUser.answers[this.props.quizId].value;
                //
                if (userChoice === 1 || userChoice === 2) {
                    choice = userChoice;
                }
            } catch(e) { /* do nothing if value invalid */ }

            const quizId = this.props.quizId;

            this.setState({ quizId, choice, option1, option2 });
        }
    }


    // set the current choice to the one that was clicked, save in db
    handleClick = (choice) => {
        // save if choice is valid
        if (choice === 1 || choice === 2) {
            this.setState({choice});

            const answer = {
                answerType: "twoOptions",
                value: choice
            };
            const user = this.props.currentUser;
            this.props.updateAnswer(user._id, user.verificationToken, this.props.quizId, answer);
        }
    }


    render() {
        return (
            <div className="center font20px font16pxUnder600 font12pxUnder400">
                <div style={{padding:"20px 0"}}><Question question={this.props.question} /></div>

                <TwoOptionsChoice
                    selected={this.state.choice === 1}
                    text={this.state.option1}
                    choice={1}
                    onClick={this.handleClick}
                />
                <div className="twoOptionsOr">or</div>
                <TwoOptionsChoice
                    selected={this.state.choice === 2}
                    text={this.state.option2}
                    choice={2}
                    onClick={this.handleClick}
                />
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

export default connect(mapStateToProps, mapDispatchToProps)(PathwayContentTwoOptionsQuestion);
