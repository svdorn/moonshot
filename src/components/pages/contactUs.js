"use strict"
import React, {Component} from 'react';
import {TextField, CircularProgress, RaisedButton} from 'material-ui';
import {contactUs, formError} from '../../actions/usersActions';
import HomepageTriangles from '../miscComponents/HomepageTriangles';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {Field, reduxForm} from 'redux-form';
import MetaTags from 'react-meta-tags';
import { renderTextField } from "../../miscFunctions";


const validate = values => {
    const errors = {};
    const requiredFields = [
        'message',
    ];
    requiredFields.forEach(field => {
        if (!values[field]) {
            errors[field] = 'This field is required'
        }
    });

    return errors
};

class ContactUs extends Component {
    handleSubmit(e) {
        e.preventDefault();
        const vals = this.props.formData.contactUs.values;

        // Check if the form is valid
        let notValid = false;
        const requiredFields = [
            'message'
        ];
        requiredFields.forEach(field => {
            if (!vals || !vals[field]) {
                this.props.touch(field);
                notValid = true;
            }
        });
        if (notValid) return;

        const user = {
            message: vals.message,
            name: this.props.currentUser.name,
            email: this.props.currentUser.email,
        };

        this.props.contactUs(user);

    }

    render() {
        return (
            <div className="fillScreen formContainer">
                <MetaTags>
                <title>Contact Us | Moonshot</title>
                <meta name="description" content="Questions? Comments? New sushi restaurant we should try? Contact Moonshot here!" />
                </MetaTags>
                {/*<HomepageTriangles className="blurred" style={{pointerEvents:"none"}} variation="1" />*/}
                <div className="form lightBlackForm noBlur">
                    <form onSubmit={this.handleSubmit.bind(this)}>
                        <h1 style={{marginTop:"15px"}}>Contact Us</h1>
                        <div className="inputContainer">
                            <Field
                                name="message"
                                component={renderTextField}
                                label="Message"
                                className="lightBlueInputText"
                            /><br/>
                        </div>
                        <br/>
                        <RaisedButton
                            label="Contact Us"
                            type="submit"
                            className="raisedButtonBusinessHome"
                            style={{margin: '10px 0'}}
                        />
                        <br/>
                        {this.props.loading ? <CircularProgress style={{marginTop: "20px"}}/> : null}
                    </form>
                </div>

            </div>
        );
    }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        contactUs,
        formError
    }, dispatch);
}

function mapStateToProps(state) {
    return {
        currentUser: state.users.currentUser,
        formData: state.form,
        loading: state.users.loadingSomething,
    };
}

ContactUs = reduxForm({
    form: 'contactUs',
    validate,
})(ContactUs);

export default connect(mapStateToProps, mapDispatchToProps)(ContactUs);
