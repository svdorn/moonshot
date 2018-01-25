"use strict"
import React, {Component} from 'react';
import {TextField, DropDownMenu, MenuItem, Divider, Toolbar, ToolbarGroup, Dialog, FlatButton, CircularProgress} from 'material-ui';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {browserHistory} from 'react-router';
import PathwayPreview from '../childComponents/pathwayPreview';
import ComingSoonForm from '../childComponents/comingSoonForm';
import {closeNotification, comingSoon} from "../../actions/usersActions";
import {Field, reduxForm} from 'redux-form';
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

class Discover extends Component {
    constructor(props) {
        super(props);

        this.state = {
            searchTerm: "",
            category: "",
            company: "",
            explorePathways: [],
            featuredPathways: [],
            open: false,
            dialogPathway: null,
        }
    }

    componentDidMount() {
        // populate explorePathways with initial pathways
        this.search();

        // populate featuredPathways with initial pathways
        axios.get("/api/search", {
            params: {
                limit: 3
            }
        }).then(res => {
            // make sure component is mounted before changing state
            if (this.refs.discover) {
                this.setState({featuredPathways: res.data});
            }
        }).catch(function (err) {
        })
    }

    goTo(route) {
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
        this.setState({category}, () => {
            this.search();
        })
    };

    handleCompanyChange = (event, index, company) => {
        this.setState({company}, () => {
            this.search();
        })
    };

    search() {
        console.log('yo');
        axios.get("/api/search", {
            params: {
                searchTerm: this.state.term,
                category: this.state.category,
                company: this.state.company
            }
        }).then(res => {
            // make sure component is mounted before changing state
            if (this.refs.discover) {
                this.setState({explorePathways: res.data});
            }
        }).catch(function (err) {
        })
    }

    handleOpen = (pathway) => {
        // tell the user they are preregistered if logged in
        const currentUser = this.props.currentUser;
        if (currentUser && currentUser != "no user") {
            const user = {
                name: currentUser.name,
                email: currentUser.email,
                pathway: this.props.pathway,
            }
            const signedIn = true;
            this.props.comingSoon(user, signedIn);
            this.setState({open: true});
        }
        // if not logged in, prompt for user info
        else {
            this.setState({open: true, dialogPathway: pathway});
        }
    };

    handleClose = () => {
        this.setState({open: false, dialogPathway: null});
    };

    render() {
        const style = {
            separator1: {
                width: "70%",
                margin: "12px auto 0px",
                position: "relative",
                height: "40px",
                textAlign: "center"},
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
            pathwayPreviewUl: {

            },
            pathwayPreviewContainer: {
                height: "352px"
            },
            pathwayPreviewFeaturedContainer: {
                height: "400px"
            },
            treeImg: {
                height: "300px",
                position: "absolute",
                bottom: "-14px",
                right: "0px"
            },
            treeText: {
                color: "white",
                position: "absolute",
                top: "150px",
                left: "65px",
                fontSize: "20px"
            }
        }

        // create the pathway previews
        let key = 0;
        let self = this;
        const explorePathwayPreviews = this.state.explorePathways.map(function (pathway) {
            key++;
            const deadline = new Date(pathway.deadline);
            const formattedDeadline = deadline.getMonth() + "/" + deadline.getDate() + "/" + deadline.getYear();
            if (!pathway.comingSoon && self.props.currentUser) {
                return (
                    <li className="pathwayPreviewLi explorePathwayPreview"
                        key={key}
                        onClick={() => self.goTo('/pathway?' + pathway._id)}
                    >
                        <PathwayPreview
                            name={pathway.name}
                            image={pathway.previewImage}
                            logo = {pathway.sponsor.logo}
                            sponsorName = {pathway.sponsor.name}
                            completionTime={pathway.estimatedCompletionTime}
                            deadline={formattedDeadline}
                            price={pathway.price}
                            _id={pathway._id}
                            comingSoon = {pathway.comingSoon}
                        />
                    </li>
                );
            } else if (pathway.comingSoon) {
                return (
                    <li className="pathwayPreviewLi explorePathwayPreview"
                        key={key}
                        //<!-- onClick={() => self.goTo('/pathway?' + pathway._id)}-->
                        onClick={() => self.handleOpen(pathway.name)}
                    >
                        <PathwayPreview
                            name={pathway.name}
                            image={pathway.previewImage}
                            //<!-- logo = {pathway.sponsor.logo} -->
                            //<!-- sponsorName = {pathway.sponsor.name} -->
                            completionTime={pathway.estimatedCompletionTime}
                            deadline={formattedDeadline}
                            price={pathway.price}
                            _id={pathway._id}
                            comingSoon = {pathway.comingSoon}
                        />
                    </li>
                );
            }
        });

        // create the pathway previews
        key = 0;
        const featuredPathwayPreviews = this.state.featuredPathways.map(function (pathway) {
            key++;
            const deadline = new Date(pathway.deadline);
            const formattedDeadline = deadline.getMonth() + "/" + deadline.getDate() + "/" + deadline.getYear();
            return (
                <li className="pathwayPreviewLi featuredPathwayPreview"
                    key={key}
                    //<!-- onClick={() => self.goTo('/pathway?' + pathway._id)}-->
                    onClick={() => self.handleOpen(pathway.name)}
                >
                    <PathwayPreview
                        name={pathway.name}
                        image={pathway.previewImage}
                        //<!-- logo = {pathway.sponsor.logo} -->
                        //<!-- sponsorName = {pathway.sponsor.name} -->
                        completionTime={pathway.estimatedCompletionTime}
                        deadline={formattedDeadline}
                        price={pathway.price}
                        _id={pathway._id}
                        comingSoon = {pathway.comingSoon}
                    />
                </li>
            );
        });

        // TODO get tags from DB
        const tags = ["Artificial Intelligence", "UI/UX", "Game Development", "Virtual Reality"];
        const categoryItems = tags.map(function (tag) {
            return <MenuItem value={tag} primaryText={tag} key={tag}/>
        })

        // TODO get companies from DB
        const companies = ["Moonshot"];
        const companyItems = companies.map(function (company) {
            return <MenuItem value={company} primaryText={company} key={company}/>
        })

        let blurredClass = "";
        if (this.state.open) {
            blurredClass = " dialogForBizOverlay";
        }
        const actions = [
            <FlatButton
                label="Close"
                primary={true}
                onClick={this.handleClose}
            />,
        ];

        return (
            <div className={"jsxWrapper" + blurredClass} ref='discover'>
                <Dialog
                    actions={actions}
                    modal={false}
                    open={this.state.open}
                    onRequestClose={this.handleClose}
                    autoScrollBodyContent={true}
                    paperClassName="dialogForBiz"
                    contentClassName="center"
                    overlayClassName="dialogOverlay"
                >
                    {this.props.currentUser && this.props.currentUser != "no user" ?
                        <div>
                            {this.props.loadingEmailSend ?
                                <div className="center"><CircularProgress style={{marginTop: "20px"}}/></div>
                                :
                                <div style={{color:"#00c3ff"}}>Your spot has been reserved!</div>
                            }
                        </div>
                        :
                        <ComingSoonForm
                            pathway={this.state.dialogPathway}
                            onSubmit={this.handleClose}
                        />
                    }

                </Dialog>

                <div className="greenToBlue headerDiv"/>
                <div className="center font40px font24pxUnder500" style={{marginTop:'15px', marginBottom:'10px'}}>
                    Discover Pathways
                </div>

                <div>
                    <div style={style.separator1}>
                        <div style={style.separatorLine}/>
                        <div style={style.separatorText}>
                            Featured
                        </div>
                    </div>

                    <div className="pathwayPrevListContainer" style={style.pathwayPreviewFeaturedContainer}>
                        <ul className="horizCenteredList pathwayPrevList oneLinePathwayPrevList" style={style.pathwayPreviewUl}>
                            {featuredPathwayPreviews}
                        </ul>
                    </div>


                    <div style={style.separator}>
                        <div style={style.separatorLine}/>
                        <div style={style.separatorText}>
                            Explore
                        </div>
                    </div>

                    <Toolbar style={style.searchBar} id="discoverSearchBarWideScreen">
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
                                          style={{fontSize: "20px", marginTop: "11px"}}
                            >
                                <MenuItem value={""} primaryText="Category"/>
                                <Divider/>
                                {categoryItems}
                            </DropDownMenu>
                            <DropDownMenu value={this.state.company}
                                          onChange={this.handleCompanyChange}
                                          underlineStyle={styles.underlineStyle}
                                          anchorOrigin={styles.anchorOrigin}
                                          style={{fontSize: "20px", marginTop: "11px"}}
                            >
                                <MenuItem value={""} primaryText="Company"/>
                                <Divider/>
                                {companyItems}
                            </DropDownMenu>
                        </ToolbarGroup>
                    </Toolbar>


                    <div id="discoverSearchBarMedScreen">
                        <Field
                            name="search"
                            component={renderTextField}
                            label="Search"
                            onChange={event => this.onSearchChange(event.target.value)}
                            value={this.state.searchTerm}
                        />

                        <br/>

                        <DropDownMenu value={this.state.category}
                                      onChange={this.handleCategoryChange}
                                      underlineStyle={styles.underlineStyle}
                                      anchorOrigin={styles.anchorOrigin}
                                      style={{fontSize: "20px", marginTop: "11px"}}
                        >
                            <MenuItem value={""} primaryText="Category"/>
                            <Divider/>
                            {categoryItems}
                        </DropDownMenu>
                        <div><br/></div>
                        <DropDownMenu value={this.state.company}
                                      onChange={this.handleCompanyChange}
                                      underlineStyle={styles.underlineStyle}
                                      anchorOrigin={styles.anchorOrigin}
                                      style={{fontSize: "20px", marginTop: "11px"}}
                        >
                            <MenuItem value={""} primaryText="Company"/>
                            <Divider/>
                            {companyItems}
                        </DropDownMenu>
                    </div>



                    <div>
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
        closeNotification,
        comingSoon
    }, dispatch);
}

function mapStateToProps(state) {
    return {
        formData: state.form,
        notification: state.users.notification,
        currentUser: state.users.currentUser,
        loadingEmailSend: state.users.loadingSomething
    };
}

Discover = reduxForm({
    form: 'discover',
})(Discover);

export default connect(mapStateToProps, mapDispatchToProps)(Discover);
