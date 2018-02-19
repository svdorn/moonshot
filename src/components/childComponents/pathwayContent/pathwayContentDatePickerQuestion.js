import React, {Component} from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {updateAnswer} from '../../../actions/usersActions';
import TwoOptionsChoice from './twoOptionsChoice';
import Question from './question';
import {DatePicker} from 'material-ui';



class PathwayContentDatePickerQuestion extends Component {
    constructor(props) {
        super(props);
        const quizId = props.quizId;

        let date = null;

        // mark things the user had saved as answers if the user has anything saved
        if (props.currentUser && props.currentUser.answers && props.currentUser.answers[quizId] && props.currentUser.answers[quizId].dateValue) {
            date = props.currentUser.answer[quizId].dateValue;
        }

        this.state = { quizId, date };
    }

    componentDidUpdate() {
        if (this.props.quizId !== this.state.quizId) {
            const props = this.props;
            const quizId = props.quizId;

            let date = undefined;

            // mark things the user had saved as answers if the user has anything saved
            if (props.currentUser && props.currentUser.answers && props.currentUser.answers[quizId] && props.currentUser.answers[quizId].dateValue) {
                date = props.currentUser.answer[quizId].dateValue;
            }

            this.setState({ quizId, date });
        }
    }


    handleDateChange(event, date) {
        this.setState({
            ...this.state,
            date
        });

        const answer = {
            answerType: "datePicker",
            value: date,
        };

        const user = this.props.currentUser;
        this.props.updateAnswer(user._id, user.verificationToken, this.props.quizId, answer);
    };


    render() {
        return (
            <div className="center font20px font16pxUnder600 font12pxUnder400">
                <div style={{marginBottom:"20px"}}><Question question={this.props.question} /></div>
                <DatePicker
                    openToYearSelection={false}
                    hintText="11/19/2018"
                    value={this.state.date}
                    onChange={this.handleDateChange.bind(this)}
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

export default connect(mapStateToProps, mapDispatchToProps)(PathwayContentDatePickerQuestion);
