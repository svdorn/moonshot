"use strict"
import React, {Component} from 'react';
import {
    TextField,
    DropDownMenu,
    MenuItem,
    Divider,
    Toolbar,
    ToolbarGroup,
    Dialog,
    FlatButton,
    CircularProgress
} from 'material-ui';
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

        const emptyPathway = {
            name: "Loading...",
            previewImage: "",
            sponsor: {name: "", logo: ""},
            estimatedCompletionTime: "",
            deadline: "",
            price: "",
            _id: undefined
        }

        this.state = {
            searchTerm: "",
            category: "",
            company: "",
            explorePathways: [],
            featuredPathways: [emptyPathway, emptyPathway, emptyPathway],
            companies: [],
            categories: [],
            open: false,
            dialogPathway: null,
        }
    }

    componentDidMount() {
        let self = this;

        // populate explorePathways with initial pathways
        self.search();

        axios.get("/api/pathways/getAllCompaniesAndCategories")
        .then(function(res) {
            // make sure component is mounted before changing state
            if (self.refs.discover) {
                self.setState({
                    companies: res.data.companies,
                    categories: res.data.categories
                });
            }
        })

        // populate featuredPathways with initial pathways
        axios.get("/api/pathways/search", {
            params: {
                limit: 3
            }
        }).then(res => {
            // make sure component is mounted before changing state
            if (self.refs.discover) {
                self.setState({featuredPathways: res.data});
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


    pathwayClicked(pathwayUrl, pathwayId) {
        let currentUser = this.props.currentUser;
        if (!currentUser || currentUser === "no user") {
            this.goTo('/pathway?pathway=' + pathwayUrl);
        } else {
            // if the user has the pathway, go straight to the content page
            if (currentUser.pathways.some(function(path) {
                return path.pathwayId == pathwayId;
            })) {
                this.goTo('/pathwayContent?pathway=' + pathwayUrl)
            }
            // otherwise go to the pathway landing page
            else {
                this.goTo('/pathway?pathway=' + pathwayUrl);
            }
        }
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
        axios.get("/api/pathways/search", {
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

    handleOpen = (pathway, reserveSpot) => {
        if (!reserveSpot) {
            this.goTo('/pathway?pathway=' + pathway.url);
        }
        else {
            const pathwayName = pathway.name;
            // tell the user they are preregistered if logged in
            const currentUser = this.props.currentUser;
            if (currentUser && currentUser != "no user") {
                const user = {
                    name: currentUser.name,
                    email: currentUser.email,
                    pathway: pathwayName,
                }
                const signedIn = true;
                this.props.comingSoon(user, signedIn);
                this.setState({open: true});
            }
            // if not logged in, prompt for user info
            else {
                this.setState({open: true, dialogPathway: pathwayName});
            }
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
                textAlign: "center"
            },
            separatorLineLeft: {
                left: 0,
                width: "calc(50% - 85px);",
                height: "3px",
                backgroundColor: "white",
                position: "absolute",
                top: "12px"
            },
            separatorLineRight: {
                right: 0,
                width: "calc(50% - 85px);",
                height: "3px",
                backgroundColor: "white",
                position: "absolute",
                top: "12px"
            },
            separatorText1: {
                padding: "0px 40px",
                backgroundColor: "transparent",
                display: "inline-block",
                position: "relative",
                fontSize: "23px",
                color: "white"
            },
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
                color: "#b37bfe"
            },
            separatorLine: {
                width: "100%",
                height: "3px",
                backgroundColor: "#b37bfe",
                position: "absolute",
                top: "12px"
            },
            searchBar: {
                width: "80%",
                margin: "auto",
                marginTop: "0px",
                marginBottom: "30px"
            },
            pathwayPreviewUl: {},
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
            let formattedDeadline = "";
            if (pathway.deadline) {
                const deadline = new Date(pathway.deadline);
                formattedDeadline = deadline.getMonth() + "/" + deadline.getDate() + "/" + deadline.getYear();
            }
            if (!pathway.comingSoon) {
                return (
                    <li className="pathwayPreviewLi explorePathwayPreview"
                        key={key}
                        onClick={() => self.pathwayClicked(pathway.url, pathway._id)}
                    >
                        <PathwayPreview
                            name={pathway.name}
                            image={pathway.previewImage}
                            logo = {pathway.sponsor.logoForLightBackground}
                            sponsorName = {pathway.sponsor.name}
                            completionTime={pathway.estimatedCompletionTime}
                            deadline={formattedDeadline}
                            price={pathway.price}
                            _id={pathway._id}
                            comingSoon = {pathway.comingSoon}
                            variation="3"
                        />
                    </li>
                );
            } else if (pathway.comingSoon) {
                return (
                    <li className="pathwayPreviewLi explorePathwayPreview"
                        key={key}
                        //<!-- onClick={() => self.goTo('/pathway?' + pathway._id)}-->
                        onClick={() => self.handleOpen(pathway, pathway.comingSoon)}
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
                            comingSoon={pathway.comingSoon}
                            variation="3"
                        />
                    </li>
                );
            }
        });

        // create the pathway previews
        key = 0;
        const featuredPathwayPreviews = this.state.featuredPathways.map(function (pathway) {
            key++;
            let formattedDeadline = "";
            if (pathway.deadline) {
                const deadline = new Date(pathway.deadline);
                formattedDeadline = deadline.getMonth() + "/" + deadline.getDate() + "/" + deadline.getYear();
            }
            if (!pathway.comingSoon) {
                return (
                    <li className="pathwayPreviewLi featuredPathwayPreview"
                        key={key}
                        onClick={() => self.pathwayClicked(pathway.url, pathway._id)}
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
                            variation="2"
                        />
                    </li>
                );
            } else if (pathway.comingSoon) {
                return (
                    <li className="pathwayPreviewLi featuredPathwayPreview"
                        key={key}
                        //<!-- onClick={() => self.goTo('/pathway?' + pathway._id)}-->
                        onClick={() => self.handleOpen(pathway, pathway.comingSoon)}
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
                            comingSoon={pathway.comingSoon}
                            variation="2"
                        />
                    </li>
                );
            }
        });

        const categoryItems = this.state.categories.map(function (tag) {
            return <MenuItem value={tag} primaryText={tag} key={tag}/>
        })

        const companyItems = this.state.companies.map(function (company) {
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
                                <div style={{color: "#00c3ff"}}>Your spot has been reserved!</div>
                            }
                        </div>
                        :
                        <ComingSoonForm
                            pathway={this.state.dialogPathway}
                            onSubmit={this.handleClose}
                        />
                    }

                </Dialog>

                <div className="lightBlueToLightPurpleGradient">
                    <div className="headerDiv"/>
                    <div className="center font40px font24pxUnder500 whiteText"
                         style={{marginTop: '15px', marginBottom: '10px'}}>
                        Discover Pathways
                    </div>

                    <div>
                        <div style={style.separator1}>
                            <div className="separatorLineLeft"/>
                            <div className="separatorLineRight"/>
                            <div style={style.separatorText1}>
                                Featured
                            </div>
                        </div>

                        <div className="pathwayPrevListContainer" style={style.pathwayPreviewFeaturedContainer}>
                            <ul className="horizCenteredList pathwayPrevList oneLinePathwayPrevList"
                                style={style.pathwayPreviewUl}>
                                {featuredPathwayPreviews}
                            </ul>
                        </div>
                    </div>
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
                    <ul className="horizCenteredList pathwayPrevList" style={{...style.pathwayPreviewUl, minHeight: "400px"}}>
                        {explorePathwayPreviews}
                    </ul>
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
