"use strict"
import React, {Component} from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {forBusiness, getUsers} from '../../actions/usersActions';
import {TextField, RaisedButton, Paper, CircularProgress, Divider } from 'material-ui';
import {Field, reduxForm} from 'redux-form';
import style from '../../../public/styles';
import HomepageTriangles from '../miscComponents/HomepageTriangles';

const styles = {
    hintStyle: {
        color: 'white',
    }, greenText: {
        color: style.colors.moonshotGreenText
    }, blueText: {
        color: style.colors.moonshotMidBlue
    }, purpleText: {
        color: style.colors.moonshotPurple
    }, bigFont: {
        fontSize: "32px"
    }, leftLi: {
        float: "left",
        textAlign: "left",
        position: "relative",
        marginLeft: "100px",
        clear: "both"
    }, rightLi: {
        float: "right",
        textAlign: "left",
        position: "relative",
        marginRight: "100px",
        clear: "both"
    }
};

const renderTextField = ({input, label, meta: {touched, error}, ...custom}) => (
    <TextField
        hintText={label}
        hintStyle={styles.hintStyle}
        errorText={touched && error}
        {...input}
        {...custom}
    />
);

const renderMultilineTextField = ({input, label, meta: {touched, error}, ...custom}) => (
    <TextField
        multiLine={true}
        hintStyle={styles.hintStyle}
        hintText={label}
        {...input}
        {...custom}
    />
);

const validate = values => {
    const errors = {};
    const requiredFields = [
        'name',
        'email',
        'company',
        'title',
        'phone'
    ];
    requiredFields.forEach(field => {
        if (!values[field]) {
            errors[field] = 'This field is required'
        }
    });
    if (values.email && !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(values.email)) {
        errors.email = 'Invalid email address';
    }
    return errors
};

class ForBusiness extends Component {

    handleSubmit(e) {
        e.preventDefault();

        // Check if valid
        const vals = this.props.formData.forBusiness.values;

        // check if all fields have a value
        // let valsCounter = 0;
        // for (let i in vals) {
        //     valsCounter++;
        // }
        //
        // if (!vals || valsCounter !== 5) {
        //     return;
        // }

        if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(vals.email)) {
            return;
        }

        const user = {
            name: this.props.formData.forBusiness.values.name,
            company: this.props.formData.forBusiness.values.company,
            title: this.props.formData.forBusiness.values.title,
            email: this.props.formData.forBusiness.values.email,
            message: this.props.formData.forBusiness.values.message,
            phone: this.props.formData.forBusiness.values.phone,
        };

        console.log("SENDING EMAIL: ", user);

        this.props.forBusiness(user);

        console.log("email sent");
    }

    scrollToForm() {
        document.querySelector('.form-right').scrollIntoView({
            behavior: 'smooth'
        });
    }

    //name, username, email, password, confirm password, signup button
    render() {
        return (
            <div className="jsxWrapper">
                <div className="fullHeight purpleToBlue">
                    <HomepageTriangles style={{pointerEvents:"none"}} variation="1" />

                    <div className="infoBox whiteText mediumText noWrap" style={{zIndex:"20"}}>
                        Hire innovation.<br/>
                        Source and evaluate<br/>
                        <i>more</i> talent, for <i>less</i><br/>
                        <button className="outlineButton"
                            style={{backgroundColor:"transparent", border:"2px solid white"}}
                            onClick={ () => this.scrollToForm() }>
                            {"Let's begin"}
                        </button>
                    </div>
                </div>


                <div className="fullHeight" style={{textAlign:"center", height:"1000px"}}>
                    <HomepageTriangles variation="2" />
                    <div style={{zIndex: 0}}>
                        <img
                            src="/images/TheMoonshotMethod.png"
                            alt="The Moonshot Method"
                            style={{marginTop:"65px", marginBottom:"70px", width:"700px"}}
                        /><br/>

                        <div style={{...styles.purpleText, ...styles.leftLi}}>
                            <img
                                src="/icons/GraduationHat.png"
                                alt="Graduation Hat"
                                style={{height:"60px", position:"absolute", top:"50%", marginTop:"-45px"}}
                            />
                            <div className="smallText2" style={{float:"right", marginLeft:"140px"}}>
                                <h2>We Source<br/></h2>
                                We find the most forward-thinking<br/>
                                and talented college students<br/>
                                to be potential applicants.
                            </div>
                        </div>

                        <div style={{...styles.rightLi, ...styles.blueText}}>
                            <img
                                src="/icons/TreeBlue.png"
                                alt="Tree"
                                style={{height:"90px", position:"absolute", top:"50%", marginTop:"-45px"}}
                            />
                            <div className="smallText2" style={{float:"right", marginLeft:"140px"}}>
                                <h2>We Train<br/></h2>
                                Pathways are a series of intensive<br/>
                                courses, assessments, and projects<br/>
                                curated by us, approved by you.<br/>
                                Students are trained in market<br/>
                                demanded skills that are not taught in<br/>
                                traditional education.<br/>
                            </div>
                        </div>

                        <div style={{...styles.leftLi, ...styles.greenText}}>
                            <img
                                src="/icons/PaperAndPencilGreen.png"
                                alt="Paper and pencil"
                                style={{height:"80px", position:"absolute", top:"50%", marginTop:"-45px"}}
                            />
                            <div className="smallText2" style={{float:"right", marginLeft:"140px"}}>
                                <h2>We Evaluate<br/></h2>
                                Using qualitative and quantitative<br/>
                                metrics, we assess an individual{"'"}s<br/>
                                performance on a pathway and<br/>
                                compare them side by side with<br/>
                                other candidates<br/>
                            </div>
                        </div>

                        <div style={{...styles.rightLi, ...styles.purpleText}}>
                            <img
                                src="/icons/Badge.png"
                                alt="Badge"
                                style={{height:"90px", position:"absolute", top:"50%", marginTop:"-45px"}}
                            />
                            <div className="smallText2" style={{float:"right", marginLeft:"140px"}}>
                                <h2>You Hire<br/></h2>
                                After pathway completion, we send<br/>
                                the candidates over to you. You can<br/>
                                look over their metrics and contact<br/>
                                them to determine if they are a<br/>
                                good fit for you.<br/>
                            </div>
                        </div>
                    </div>
                </div>


                <div className="fullHeight">
                    <div className="infoBox blueText bigText nowrap">
                        Pay based on success.<br/>
                        No upfront cost. No risk.<br/>
                        No hidden fees.<br/>
                        <div className="dividerSmall" />
                        <button className="outlineButton whiteBlueButton"
                            onClick={ () => this.scrollToForm() }>
                            Get Started
                        </button>
                    </div>
                </div>



                <div className="form-right greenToBlue">
                    <form onSubmit={this.handleSubmit.bind(this)}>
                        <h2 className="whiteText">
                            We <u>source</u> the talent and <u>create</u><br/>
                            a full assessment based on the skills you{"'"}re hiring for.<br/>
                            More information to make better decisions.
                        </h2>
                        <h2 className="whiteText">
                            Contact Us
                        </h2>
                        <Field
                            name="name"
                            component={renderTextField}
                            label="Full Name"
                        /><br/>
                        <Field
                            name="email"
                            component={renderTextField}
                            label="Email"
                        /><br/>
                        <Field
                            name="phone"
                            component={renderTextField}
                            label="Phone Number"
                        /><br/>
                        <Field
                            name="company"
                            component={renderTextField}
                            label="Company"
                        /><br/>
                        <Field
                            name="title"
                            component={renderTextField}
                            label="Title"
                        /><br/>
                        <Field
                            name="message"
                            component={renderMultilineTextField}
                            label="Message"
                        /><br/>
                        <button type="submit"
                                      className="outlineButton whiteBlueButton"
                        >Send</button><br/>
                        <p className="whiteText tinyText">
                            We{"''"}ll get back to you with an email shortly.
                        </p>
                    </form>
                    { this.props.loadingEmailSend ? <CircularProgress style={{marginTop:"20px"}}/> : "" }
                </div>
            </div>
        );
    }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        forBusiness,
        getUsers
    }, dispatch);
}

function mapStateToProps(state) {
    return {
        formData: state.form,
        loadingEmailSend: state.users.loadingSomething,
    };
}

ForBusiness = reduxForm({
    form: 'forBusiness',
    validate,
})(ForBusiness);

export default connect(mapStateToProps, mapDispatchToProps)(ForBusiness);
