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
import styles from '../../../public/styles';

const renderTextField = ({input, label, ...custom}) => (
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
            searchTerm: "",
            explorePathways: [],
            featuredPathways: []
        }
    }

    componentDidMount() {
        axios.get("/api/search", {
            params: {  }
        }).then(res => {
            // make sure component is mounted before changing state
            if (this.refs.discover) {
                this.setState({ explorePathways: res.data });
            }
        }).catch(function(err) {
            console.log("error getting explore pathways");
        })

        axios.get("/api/search", {
            params: {  }
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

    onSearchChange(term) {
        this.setState({...this.state, term: term});

        if (term === undefined) {
            //don't search
            console.log("search box is empty");
        }
        else {
            console.log("about to search")
            // CURRENTLY THERE IS NO SEARCH PARAM, MUST INCLUDE TERM SOMEWHERE
            axios.get("/api/search", {
                params: {
                    searchTerm: term
                }
            }).then(res => {
                console.log("resultant pathways:");
                console.log(res.data)
                // make sure component is mounted before changing state
                if (this.refs.discover) {
                    this.setState({ explorePathways: res.data });
                }
            }).catch(function(err) {
                console.log("error getting searched for pathwa");
            })
        }
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

        const style = {
            separator: {
                width: "70%",
                margin: "5px auto",
                position: "relative",
                height: "40px",
                textAlign: "center"
            },
            separatorText: {
                padding: "0px 40px",
                backgroundColor: "white",
                display: "inline-block",
                position: "relative",
                fontSize: "23px",
                color: styles.colors.moonshotLightBlue
            },
            separatorLine: {
                width: "100%",
                height: "3px",
                backgroundColor: styles.colors.moonshotLightBlue,
                position: "absolute",
                top: "12px"
            }
        }

        return(
            <div className='jsxWrapper' ref='discover'>
                <div className="headerSpace greenToBlue" />
                <div>
                    <img
                        src="/images/DiscoverHeader.png"
                        alt="Learn skills employers want - for free."
                        style={{width:"100%"}}
                    />
                </div>
                <div>
                    <div style={style.separator}>
                        <div style={style.separatorLine} />
                        <div style={style.separatorText}>
                            Explore Featured Pathways
                        </div>
                    </div>
                    <div className="pathwayPrevListContainer">
                        <ul className="horizCenteredList pathwayPrevList">
                            {featuredPathwayPreviews}
                        </ul>
                    </div>

                    <Field
                        name="search"
                        component={renderTextField}
                        label="Search"
                        onChange={event => this.onSearchChange(event.target.value)}
                        value={this.state.searchTerm}
                    />

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
