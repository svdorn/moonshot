"use strict"
import React, { Component } from 'react';
import { Paper, RaisedButton, TextField, DropDownMenu, MenuItem, Divider, Toolbar, ToolbarGroup } from 'material-ui';
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
            category: "",
            company: "",
            explorePathways: [],
            featuredPathways: []
        }
    }

    componentDidMount() {
        // populate explorePathways with initial pathways
        this.search();

        // populate featuredPathways with initial pathways
        axios.get("/api/search", {
            params: {
                limit: 4
            }
        }).then(res => {
            // make sure component is mounted before changing state
            if (this.refs.discover) {
                this.setState({ featuredPathways: res.data });
            }
        }).catch(function(err) {
            console.log("error getting searched for pathway");
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
        this.setState({...this.state, term: term}, () => {
            if (term !== undefined) {
                this.search();
            }
        });
    }

    handleCategoryChange = (event, index, category) => {
        console.log(category);
        this.setState({category}, () => {
            this.search();
        })
    };

    handleCompanyChange = (event, index, company) => {
        console.log(company);
        this.setState({company}, () => {
            this.search();
        })
    };

    search() {
        console.log("getting pathways with category: ", this.state.category);
        axios.get("/api/search", {
            params: {
                searchTerm: this.state.term,
                category: this.state.category,
                company: this.state.company
            }
        }).then(res => {
            console.log("resultant pathways:");
            console.log(res.data)
            // make sure component is mounted before changing state
            if (this.refs.discover) {
                this.setState({ explorePathways: res.data });
            }
        }).catch(function(err) {
            console.log("error getting searched-for pathway");
        })
    }

    render(){
        const style = {
            separator: {
                width: "70%",
                margin: "25px auto 0px",
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
            },
            searchBar: {
                width: "80%",
                margin: "auto",
                marginTop: "0px",
                marginBottom: "30px"
            },
            pathwayPreviewLi: {
                verticalAlign: "top"
            },
            pathwayPreviewUl: {
                width:"125%",
                transform: "scale(.8)",
                marginLeft:"-12.5%",
                WebkitTransformOriginY: "0",
                MozTransformOriginY: "0",
                MsTransformOriginY: "0"
            },
            pathwayPreviewContainer: {
                height: "352px"
            }
        }

        // create the pathway previews
        let key = 0;
        let self = this;
        const explorePathwayPreviews = this.state.explorePathways.map(function(pathway) {
            key++;
            const deadline = new Date(pathway.deadline);
            const formattedDeadline = deadline.getMonth() + "/" + deadline.getDate() + "/" + deadline.getYear();
            return (
                <li style={style.pathwayPreviewLi} key={key} onClick={() => self.goTo('/pathway/' + pathway._id)}><PathwayPreview
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
        key = 0;
        const featuredPathwayPreviews = this.state.featuredPathways.map(function(pathway) {
            key++;
            const deadline = new Date(pathway.deadline);
            const formattedDeadline = deadline.getMonth() + "/" + deadline.getDate() + "/" + deadline.getYear();
            return (
                <li style={style.pathwayPreviewLi} key={key} onClick={() => self.goTo('/pathway/' + pathway._id)}><PathwayPreview
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

        // TODO get tags from DB
        const tags = ["Artificial Intelligence", "UI/UX", "Game Development", "Virtual Reality"];
        const categoryItems = tags.map(function(tag) {
            return <MenuItem value={tag} primaryText={tag} key={tag} />
        })

        // TODO get companies from DB
        const companies = ["Epic", "Google", "Tesla", "Holos", "Blizzard"];
        const companyItems = companies.map(function(company) {
            return <MenuItem value={company} primaryText={company} key={company} />
        })


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
                            Featured
                        </div>
                    </div>

                    <div className="pathwayPrevListContainer" style={style.pathwayPreviewContainer}>
                        <ul className="horizCenteredList pathwayPrevList" style={style.pathwayPreviewUl}>
                            {featuredPathwayPreviews}
                        </ul>
                    </div>


                    <div style={style.separator}>
                        <div style={style.separatorLine} />
                        <div style={style.separatorText}>
                            Explore
                        </div>
                    </div>

                    <Toolbar style={style.searchBar}>
                        <ToolbarGroup>
                            <Field
                                name="search"
                                component={renderTextField}
                                label="Search"
                                onChange={event => this.onSearchChange(event.target.value)}
                                value={this.state.searchTerm}
                            />
                        </ToolbarGroup>

                        <ToolbarGroup>
                            <DropDownMenu value={this.state.category}
                                          onChange={this.handleCategoryChange}
                                          underlineStyle={styles.underlineStyle}
                                          anchorOrigin={styles.anchorOrigin}
                                          style={{fontSize:"20px", marginTop:"11px"}}
                            >
                                <MenuItem value={""} primaryText="Category" />
                                <Divider />
                                {categoryItems}
                            </DropDownMenu>
                            <DropDownMenu value={this.state.company}
                                          onChange={this.handleCompanyChange}
                                          underlineStyle={styles.underlineStyle}
                                          anchorOrigin={styles.anchorOrigin}
                                          style={{fontSize:"20px", marginTop:"11px"}}
                            >
                                <MenuItem value={""} primaryText="Company" />
                                <Divider />
                                {companyItems}
                            </DropDownMenu>
                        </ToolbarGroup>
                    </Toolbar>

                    <div className="pathwayPrevListContainer">
                        <ul className="horizCenteredList pathwayPrevList" style={style.pathwayPreviewUl}>
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
