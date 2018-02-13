import React, {Component} from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {updateAnswer} from '../../actions/usersActions';
import TwoOptionsChoice from './twoOptionsChoice';


class PathwayContentTwoOptionsQuestion extends Component {
    constructor(props) {
        super(props);

        console.log(props);

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
        this.state = { choice, option1, option2 }
    }


    // set the current choice to the one that was clicked, save in db
    handleClick = (choice) => {
        console.log("here");
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
            <div className="center">
                <div className="font20px font16pxUnder600" style={{marginBottom:"20px"}}>{this.props.question}</div>

                <TwoOptionsChoice
                    selected={this.state.choice === 1}
                    text={this.state.option1}
                    choice={1}
                    onClick={this.handleClick}
                />
                or
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
