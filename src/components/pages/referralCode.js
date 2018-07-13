"use strict"
import React, { Component } from 'react';
import { TextField, CircularProgress, FlatButton, Dialog } from 'material-ui';
import { closeNotification, addNotification } from '../../actions/usersActions';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { browserHistory } from 'react-router';
import { Field, reduxForm } from 'redux-form';
import HomepageTriangles from '../miscComponents/HomepageTriangles';
import axios from 'axios';
import TermsOfUse from '../policies/termsOfUse';
import PrivacyPolicy from '../policies/privacyPolicy';
import AffiliateAgreement from '../policies/affiliateAgreement';
import MetaTags from 'react-meta-tags';

const styles = {
    floatingLabelStyle: {
        color: '#00c3ff',
    },

};

const renderTextField = ({input, label, meta: {touched, error}, ...custom}) => (
    <TextField
        hintText={label}
        floatingLabelText={label}
        errorText={touched && error}
        floatingLabelStyle={styles.floatingLabelStyle}
        {...input}
        {...custom}
    />
);

const validate = values => {
    const errors = {};
    const requiredFields = [
        'email',
        'name'
    ];
    if (values.email && !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(values.email)) {
        errors.email = 'Invalid email address';
    }
    requiredFields.forEach(field => {
        if (!values[field]) {
            errors[field] = 'This field is required';
        }
    });

    return errors
};

class ReferralCode extends Component {
    constructor(props) {
        super(props);

        this.state = {
            showErrors: true,
            loading: false,
            error: undefined,
            referralCode: undefined,
            agreeingToTerms: false,
            openPP: false,
            openTOU: false,
            openAA: false
        };
    }


    handleCheckMarkClick() {
        this.setState({
            ...this.state,
            agreeingToTerms: !this.state.agreeingToTerms
        })
    }


    handleOpenPP = () => {
        this.setState({openPP: true});
    };
    handleClosePP = () => {
        this.setState({openPP: false});
    };

    handleOpenTOU = () => {
        this.setState({openTOU: true});
    };
    handleCloseTOU = () => {
        this.setState({openTOU: false});
    };

    handleOpenAA = () => {
        this.setState({openAA: true});
    };
    handleCloseAA = () => {
        this.setState({openAA: false});
    };


    handleSubmit(e) {
        e.preventDefault();

        if (!this.state.agreeingToTerms) {
            this.props.addNotification("Must agree to Affiliate Agreement, Terms of Use, and Privacy Policy.", "error");
            return;
        }

        let self = this;
        const vals = this.props.formData.referralCode.values;

        // Check if the form is valid
        let notValid = false;
        const requiredFields = [
            'email',
            'name'
        ];
        requiredFields.forEach(field => {
            if (!vals || !vals[field]) {
                self.props.touch(field);
                notValid = true;
            }
        });
        if (notValid) return;
        if (vals.email && !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(vals.email)) {
            return;
        }

        const email = self.props.formData.referralCode.values.email;
        const name = self.props.formData.referralCode.values.name;

        // make the loading bar show up
        self.setState({...this.state, loading: true});
        axios.post("api/misc/createReferralCode", {name, email})
        .then(function(response) {
            // stop the loading bar, show the referral code
            const referralCode = response.data;
            self.setState({...self.state, loading: false, referralCode})
        })
        .catch(function(error) {
            // stop the loading bar, show error
            self.setState({...self.state, loading: false, error: error.response.data})
        })
    }

    goTo (route)  {
        // closes any notification
        this.props.closeNotification();
        // goes to the wanted page
        browserHistory.push(route);
        // goes to the top of the new page
        window.scrollTo(0, 0);
    }

    render() {
        const actionsPP = [
            <FlatButton
                label="Close"
                primary={true}
                onClick={this.handleClosePP}
            />,
        ];
        const actionsTOU = [
            <FlatButton
                label="Close"
                primary={true}
                onClick={this.handleCloseTOU}
            />,
        ];
        const actionsAA = [
            <FlatButton
                label="Close"
                primary={true}
                onClick={this.handleCloseAA}
            />,
        ];
        let blurredClass = '';
        if (this.state.openTOU || this.state.openPP) {
            blurredClass = 'dialogForBizOverlay';
        }

        return (
            <div className="fillScreen formContainer">
                <MetaTags>
                    <title>Referral Code | Moonshot</title>
                    <meta name="description" content="Become a Moonshot referrer and get $300 for every friend that gets a job through us!" />
                </MetaTags>

                <div className={blurredClass}>
                    <Dialog
                        actions={actionsPP}
                        modal={false}
                        open={this.state.openPP}
                        onRequestClose={this.handleClosePP}
                        autoScrollBodyContent={true}
                        paperClassName="dialogForSignup"
                        overlayClassName="dialogOverlay"
                    >
                        <PrivacyPolicy/>
                    </Dialog>
                    <Dialog
                        actions={actionsTOU}
                        modal={false}
                        open={this.state.openTOU}
                        onRequestClose={this.handleCloseTOU}
                        autoScrollBodyContent={true}
                        paperClassName="dialogForSignup"
                        overlayClassName="dialogOverlay"
                    >
                        <TermsOfUse/>
                    </Dialog>
                    <Dialog
                        actions={actionsAA}
                        modal={false}
                        open={this.state.openAA}
                        onRequestClose={this.handleCloseAA}
                        autoScrollBodyContent={true}
                        paperClassName="dialogForSignup"
                        overlayClassName="dialogOverlay"
                    >
                        <AffiliateAgreement/>
                    </Dialog>
                    <HomepageTriangles style={{pointerEvents:"none"}} variation="1" />
                    <div className="form lightWhiteForm" style={{padding: "10px 20px"}}>
                        {this.state.referralCode ?
                            <div className="blueText">
                                <span className="font20px">Your referral code is:</span>
                                <br/>
                                <span className="font32px">{this.state.referralCode}</span>
                                <br/>
                                <span className="font20px">Your referral url is:</span>
                                <br/>
                                <span className="font16px" style={{marginBottom: "20px", display:"inline-block"}}>{"https://moonshotinsights.io/?referralCode="}{this.state.referralCode}</span>
                                <br/>
                                <span className="font16px">
                                    Have your friend enter this code when they
                                    finish a pathway or use that url when they sign up.
                                    If they get the job, we{"'"}ll
                                    send you $300 through PayPal. We sent you an
                                    email with your code and some extra info.
                                </span>
                            </div>
                            :
                            <form onSubmit={this.handleSubmit.bind(this)}>
                                <span className="font24px">Earn $300 for every friend that <br/>gets a job through Moonshot.</span>
                                <br/>
                                <div className="inputContainer">
                                    <div className="fieldWhiteSpace"/>
                                    <Field
                                        name="name"
                                        component={renderTextField}
                                        label="Name"
                                        className="lightBlueInputText"
                                    /><br/>
                                </div>
                                <div className="inputContainer">
                                    <div className="fieldWhiteSpace"/>
                                    <Field
                                        name="email"
                                        component={renderTextField}
                                        label="Email"
                                        className="lightBlueInputText"
                                    /><br/>
                                </div>
                                <div style={{margin: "20px 20px 10px"}} className="blueText">
                                    <div className="checkbox smallCheckbox whiteCheckbox"
                                         onClick={this.handleCheckMarkClick.bind(this)}>
                                        <img
                                            alt=""
                                            className={"checkMark" + this.state.agreeingToTerms}
                                            src={"/icons/CheckMarkBlue" + this.props.png}
                                        />
                                    </div>
                                    I understand and agree to
                                    the <bdi className="clickable blueText" onClick={this.handleOpenAA}><b>Affiliate Agreement</b></bdi>
                                    , <bdi className="clickable blueText" onClick={this.handleOpenPP}><b>Privacy Policy</b></bdi>
                                    , and <bdi className="clickable blueText" onClick={this.handleOpenTOU}><b>Terms of Use</b></bdi>.
                                </div>
                                <button
                                    type="submit"
                                    className="formSubmitButton font24px font16pxUnder600"
                                    style={{marginTop: "20px"}}
                                >
                                    Get Referral Code
                                </button>
                                { this.state.loading ? <div className="center"><CircularProgress style={{marginTop:"20px"}}/></div> : "" }
                                { this.state.error ? <div>{this.state.error}</div> : null }
                            </form>
                        }
                    </div>
                </div>
            </div>
        );
    }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        closeNotification,
        addNotification
    }, dispatch);
}

function mapStateToProps(state) {
    return {
        currentUser: state.users.currentUser,
        formData: state.form,
        png: state.users.png
    };
}

ReferralCode = reduxForm({
    form:'referralCode',
    validate,
})(ReferralCode);

export default connect(mapStateToProps, mapDispatchToProps)(ReferralCode);
