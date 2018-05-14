import React, {Component} from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {updateAnswer} from '../../../actions/usersActions';
import _ from 'lodash';
import Question from './question';


let savedRecently = false;

class PathwayContentMultiSelectQuestion extends Component {
    constructor(props) {
        super(props);
        const quizId = props.quizId;
        let answer = "";

        // if the user has an answer saved in the db, bring it up
        if (props.currentUser && props.currentUser.answers && props.currentUser.answers[quizId]) {
            answer = props.currentUser.answers[quizId].value;
            // html decode it
            answer = answer.replace(/&quot;/g,"\"")
                           .replace(/&amp;/g,"&")
                           .replace(/&lt;/g,"<")
                           .replace(/&gt;/g,">");
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
                // html decode it
                answer = answer.replace(/&quot;/g,"\"")
                               .replace(/&amp;/g,"&")
                               .replace(/&lt;/g,"<")
                               .replace(/&gt;/g,">");
            }

            this.setState({ quizId, answer });
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
            answer: e.target.value
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
                {this.props.name ?
                    <div style={{marginBottom:"20px"}}><h4 className="marginTop20px blueText font30px">{this.props.name}</h4></div>
                    : null
                }
                <div style={{marginBottom:"20px"}}><Question question={this.props.question} /></div>
                <textarea
                    type="text"
                    style={{whiteSpace: "pre-wrap"}}
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
