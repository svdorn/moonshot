import React, {Component} from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {updateAnswer} from '../../../actions/usersActions';
import _ from 'lodash';
import Question from './question';



class PathwayContentMultiSelectQuestion extends Component {
    constructor(props) {
        super(props);
        const quizId = props.quizId;
        let answer = "";

        // if the user has an answer saved in the db, bring it up
        if (props.currentUser && props.currentUser.answers && props.currentUser.answers[quizId]) {
            answer = props.currentUser.answers[quizId].value;
        }

        this.state = { quizId, answer };
    }

    componentDidUpdate() {
        const props = this.props;
        const quizId = props.quizId;
        if (quizId !== this.state.quizId) {
            let answer = "";
            // if the user has an answer saved in the db, bring it up
            if (props.currentUser && props.currentUser.answers && props.currentUser.answers[quizId]) {
                answer = props.currentUser.answers[quizId].value;
            }

            this.setState({ quizId, answer });
        }
    }


    handleInputChange(e) {
        this.setState({
            ...this.state,
            answer: e.target.value
        }, this.saveAnswer)
    }


    saveAnswer() {
        const answer = {
            answerType: "freeResponse",
            value: this.state.answer
        };
        const user = this.props.currentUser;
        this.props.updateAnswer(user._id, user.verificationToken, this.props.quizId, answer);
    }


    render() {
        let self = this;

        return (
            <div className="center font20px font16pxUnder600 font12pxUnder400">
                <div style={{marginBottom:"20px"}}><Question question={this.props.question} /></div>
                <textarea
                    type="text"
                    className="freeResponseTextArea"
                    value={self.state.answer}
                    onChange={(e) => self.handleInputChange(e)}
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

export default connect(mapStateToProps, mapDispatchToProps)(PathwayContentMultiSelectQuestion);
