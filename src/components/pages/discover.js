"use strict"
import React, { Component } from 'react';
import { Paper, RaisedButton, TextField } from 'material-ui';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { browserHistory } from 'react-router';
import PathwayPreview from '../childComponents/pathwayPreview';
import Category from '../childComponents/category'
import { closeNotification } from "../../actions/usersActions";
import { Field, reduxForm } from 'redux-form';
import axios from 'axios';

const renderTextField = ({input, label, meta: {touched, error}, ...custom}) => (
    <TextField
        hintText={label}
        floatingLabelText={label}
        {...input}
        {...custom}
    />
);

class Discover extends Component{
    constructor(props) {
        super(props);

        this.state = {
            explorePathways: [],
            featuredPathways: []
        }
    }

    componentDidMount() {
        axios.get("/api/search", {
            params: { searchParam: {} }
        }).then(res => {
            // make sure component is mounted before changing state
            if (this.refs.discover) {
                this.setState({ explorePathways: res.data });
            }
        }).catch(function(err) {
            console.log("error getting explore pathways");
        })

        axios.get("/api/search", {
            params: { searchParam: {} }
        }).then(res => {
            // make sure component is mounted before changing state
            if (this.refs.discover) {
                this.setState({ featuredPathways: res.data });
            }
        }).catch(function(err) {
            console.log("error getting featured pathways");
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

    onSearchChange() {
        const param = this.props.formData.discover.values.search;

        if (param === undefined || param === '') {
            //don't search
        }
        // axios.get("/api/search", param).then(res => {
        //     // make sure component is mounted before changing state
        //     if (this.refs.home) {
        //         this.setState({ pathways: res.data });
        //     }
        // }).catch(function(err) {
        //     console.log("error getting searched for pathways");
        // })
    }

    render(){
        // create the pathway previews
        let pathwayKey = 0;
        const explorePathwayPreviews = this.state.explorePathways.map(function(pathway) {
            pathwayKey++;
            const deadline = new Date(pathway.deadline);
            const formattedDeadline = deadline.getMonth() + "/" + deadline.getDate() + "/" + deadline.getYear();
            return (
                <li style={{verticalAlign: "top"}} key={pathwayKey}><PathwayPreview
                    name = {pathway.name}
                    image = {pathway.previewImage}
                    logo = {pathway.sponsor.logo}
                    sponsorName = {pathway.sponsor.name}
                    completionTime = {pathway.estimatedCompletionTime}
                    deadline = {formattedDeadline}
                    price = {pathway.price}
                    _id = {pathway._id}
                /></li>
            );
        });

        // create the pathway previews
        pathwayKey = 0;
        const featuredPathwayPreviews = this.state.featuredPathways.map(function(pathway) {
            pathwayKey++;
            const deadline = new Date(pathway.deadline);
            const formattedDeadline = deadline.getMonth() + "/" + deadline.getDate() + "/" + deadline.getYear();
            return (
                <li style={{verticalAlign: "top"}} key={pathwayKey}><PathwayPreview
                    name = {pathway.name}
                    image = {pathway.previewImage}
                    logo = {pathway.sponsor.logo}
                    sponsorName = {pathway.sponsor.name}
                    completionTime = {pathway.estimatedCompletionTime}
                    deadline = {formattedDeadline}
                    price = {pathway.price}
                    _id = {pathway._id}
                /></li>
            );
        });








        return(
            <div className='jsxWrapper' ref='discover'>
                <div className='fullHeight greenToBlue'>
                    <h1>Discover cool pathways</h1>
                    <Field
                        name="search"
                        component={renderTextField}
                        label="Search"
                        onChange={this.onSearchChange}
                    />
                    <div className="pathwayPrevListContainer">
                        <ul className="horizCenteredList pathwayPrevList">
                            {featuredPathwayPreviews}
                        </ul>
                    </div>
                    <div className="pathwayPrevListContainer">
                        <ul className="horizCenteredList pathwayPrevList">
                            {explorePathwayPreviews}
                        </ul>
                    </div>
                </div>
            </div>
        );
    }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        closeNotification
    }, dispatch);
}

function mapStateToProps(state) {
    return {
        formData: state.form,
        notification: state.users.notification,
    };
}

Discover = reduxForm({
    form: 'discover',
})(Discover);

export default connect(mapStateToProps, mapDispatchToProps)(Discover);
