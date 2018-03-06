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
import {closeNotification} from "../../actions/usersActions";
import {Field, reduxForm} from 'redux-form';
import axios from 'axios';

const renderTextField = ({input, label, ...custom}) => (
    <TextField
        hintText={label}
        floatingLabelText={label}
        {...input}
        {...custom}
    />
);

class MyCandidates extends Component {
    constructor(props) {
        super(props);

        const emptyCandidate = {
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
            stage: "",
            pathway: "",
            candidates: [emptyCandidate],
            open: false,
            dialogPathway: null,
        }
    }

    componentDidMount() {
        // populate candidates with initial pathways
        this.search();

        // populate candidates with initial people
        axios.get("/api/candidateSearch", {
            params: {
                limit: 3
            }
        }).then(res => {
            // make sure component is mounted before changing state
            if (this.refs.myCandidates) {
                this.setState({candidates: res.data});
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

    handleStageChange = (event, index, stage) => {
        this.setState({stage}, () => {
            this.search();
        })
    };

    handlePathwayChange = (event, index, pathway) => {
        this.setState({pathway}, () => {
            this.search();
        })
    };

    search() {
        axios.get("/api/candidateSearch", {
            params: {
                searchTerm: this.state.term,
                stage: this.state.stage,
                pathway: this.state.pathway
            }
        }).then(res => {
            // make sure component is mounted before changing state
            if (this.refs.myCandidates) {
                this.setState({candidates: res.data});
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
            }
        }

        // create the pathway previews
        let key = 0;
        let self = this;
        const candidatePreviews = this.state.candidates.map(function (pathway) {
            key++;
            let formattedDeadline = "";
            if (pathway.deadline) {
                const deadline = new Date(pathway.deadline);
                formattedDeadline = deadline.getMonth() + "/" + deadline.getDate() + "/" + deadline.getYear();
            }

            return (
                <li className="pathwayPreviewLi explorePathwayPreview"
                    key={key}
                    onClick={() => self.goTo('/pathway?pathway=' + pathway.url)}
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
        });

        // TODO get tags from DB
        const tags = ["Not Contacted", "Contacted", "Interviewing", "Hired", "Dismissed"];
        const stageItems = tags.map(function (tag) {
            return <MenuItem value={tag} primaryText={tag} key={tag}/>
        })

        // TODO get companies from DB
        const companies = ["Moonshot"];
        const pathwayItems = companies.map(function (pathway) {
            return <MenuItem value={pathway} primaryText={pathway} key={pathway}/>
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
            <div className={"jsxWrapper" + blurredClass} ref='myCandidates'>
                <div style={style.separator}>
                    <div style={style.separatorLine}/>
                    <div style={style.separatorText}>
                        My Candidates
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
                        <DropDownMenu value={this.state.stage}
                                      onChange={this.handleStageChange}
                                      underlineStyle={styles.underlineStyle}
                                      anchorOrigin={styles.anchorOrigin}
                                      style={{fontSize: "20px", marginTop: "11px"}}
                        >
                            <MenuItem value={""} primaryText="Stage"/>
                            <Divider/>
                            {stageItems}
                        </DropDownMenu>
                        <DropDownMenu value={this.state.pathway}
                                      onChange={this.handlePathwayChange}
                                      underlineStyle={styles.underlineStyle}
                                      anchorOrigin={styles.anchorOrigin}
                                      style={{fontSize: "20px", marginTop: "11px"}}
                        >
                            <MenuItem value={""} primaryText="Pathway"/>
                            <Divider/>
                            {pathwayItems}
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

                    <DropDownMenu value={this.state.stage}
                                  onChange={this.handleStageChange}
                                  underlineStyle={styles.underlineStyle}
                                  anchorOrigin={styles.anchorOrigin}
                                  style={{fontSize: "20px", marginTop: "11px"}}
                    >
                        <MenuItem value={""} primaryText="Stage"/>
                        <Divider/>
                        {stageItems}
                    </DropDownMenu>
                    <div><br/></div>
                    <DropDownMenu value={this.state.pathway}
                                  onChange={this.handlePathwayChange}
                                  underlineStyle={styles.underlineStyle}
                                  anchorOrigin={styles.anchorOrigin}
                                  style={{fontSize: "20px", marginTop: "11px"}}
                    >
                        <MenuItem value={""} primaryText="Pathway"/>
                        <Divider/>
                        {pathwayItems}
                    </DropDownMenu>
                </div>


                <div>
                    <ul className="horizCenteredList pathwayPrevList" style={style.pathwayPreviewUl}>
                        {candidatePreviews}
                    </ul>
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
        currentUser: state.users.currentUser
    };
}

MyCandidates = reduxForm({
    form: 'myCandidates',
})(MyCandidates);

export default connect(mapStateToProps, mapDispatchToProps)(MyCandidates);
