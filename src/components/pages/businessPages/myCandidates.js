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
import {closeNotification} from "../../../actions/usersActions";
import {Field, reduxForm} from 'redux-form';
import MetaTags from 'react-meta-tags';
import axios from 'axios';
import CandidatePreview from '../../childComponents/candidatePreview';

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
            hiringStage: "",
            email: "",
            disabled: true
        }

        this.state = {
            searchTerm: "",
            hiringStage: "",
            pathway: "",
            candidates: [emptyCandidate],
            pathways: [],
            // true if the business has no pathways associated with it
            noPathways: false
        }
    }

    componentDidMount() {
        let self = this;
        axios.get("/api/business/pathways", {
            params: {
                userId: this.props.currentUser._id,
                verificationToken: this.props.currentUser.verificationToken
            }
        })
        .then(function (res) {
            let pathways = res.data;
            if (Array.isArray(pathways) && pathways.length > 0) {
                const firstPathwayName = pathways[0].name;
                if (firstPathwayName) {
                    let selectedPathway = firstPathwayName;
                }
                self.setState({
                    pathways: pathways,
                    pathway: firstPathwayName
                },
                    // search for candidates of first pathway
                    self.search()
                );
            } else {
                self.setState({
                    noPathways: true
                })
            }
        })
        .catch(function (err) {
            console.log("error getting pathways: ", err);
        });
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

    handleHiringStageChange = (event, index, hiringStage) => {
        this.setState({hiringStage}, () => {
            this.search();
        })
    };

    handlePathwayChange = (event, index, pathway) => {
        this.setState({pathway}, () => {
            this.search();
        })
    };

    search() {
        if (!this.state.noPathways) {
            axios.get("/api/business/candidateSearch", {
                params: {
                    searchTerm: this.state.term,
                    hiringStage: this.state.hiringStage,
                    pathway: this.state.pathway,
                    userId: this.props.currentUser._id,
                    verificationToken: this.props.currentUser.verificationToken
                }
            }).then(res => {
                // make sure component is mounted before changing state
                if (this.refs.myCandidates) {
                    this.setState({candidates: res.data});
                }
            }).catch(function (err) {
                console.log("ERROR: ", err);
            })
        }
    }


    render() {
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
                backgroundColor: "#2e2e2e",
                display: "inline-block",
                position: "relative",
                fontSize: "23px",
                color: "white"
            },
            separatorLine: {
                width: "100%",
                height: "3px",
                backgroundColor: "white",
                position: "absolute",
                top: "12px"
            },
            searchBar: {
                width: "80%",
                margin: "auto",
                marginTop: "0px",
                marginBottom: "30px"
            },
            anchorOrigin: {
                vertical: "top",
                horizontal: "left"
            },
            menuLabelStyle: {
                color: "rgba(255,255,255,.8)"
            }
        }

        const currentUser = this.props.currentUser;
        if (!currentUser) {
            return null;
        }

        // find the id of the currently selected pathway
        const pathwayId = this.state.pathway ? this.state.pathways.find(path => {
            return path.name === this.state.pathway;
        })._id : undefined;

        // create the candidate previews
        let key = 0;
        let self = this;

        let candidatePreviews = (
            <div className="center" style={{color: "rgba(255,255,255,.8)"}}>
                {this.state.pathways.length === 0 ? "Loading pathways..." : "Select a pathway to see your candidates."}
            </div>
        )

        if (this.state.pathway != "") {
            candidatePreviews = this.state.candidates.map(candidate => {
                key++;

                let candidatePathwayInfo = {
                    hiringStage: "Not Contacted",
                    isDismissed: false
                }

                // if the candidate does not have a pathways list, it is probably
                // still loading the page; if we get into this if statement, it
                // is an actual candidate
                if (Array.isArray(candidate.pathways)) {
                    const tempPathwayInfo = candidate.pathways.find(path => {
                        return path._id === pathwayId;
                    });
                    // only set the pathway info if any was actually found
                    if (tempPathwayInfo) {
                        candidatePathwayInfo = tempPathwayInfo;
                    }
                }

                const initialHiringStage = candidatePathwayInfo.hiringStage;
                const initialIsDismissed = candidatePathwayInfo.isDismissed;
                const isDisabled = candidate.disabled === true;

                return (
                    <li style={{marginTop: '15px'}}
                        key={key}
                    >
                        <CandidatePreview
                            initialHiringStage={initialHiringStage}
                            initialIsDismissed={initialIsDismissed}
                            employerUserId={currentUser._id}
                            employerVerificationToken={currentUser.verificationToken}
                            companyId={currentUser.businessInfo.company.companyId}
                            candidateId={candidate.userId}
                            pathwayId={pathwayId}
                            editHiringStage={true}
                            name={candidate.name}
                            email={candidate.email}
                            disabled={isDisabled}
                            profileUrl={candidate.profileUrl}
                            location={candidate.location}
                            overallScore={candidatePathwayInfo.overallScore}
                            predicted={candidatePathwayInfo.predicted}
                            archetype={candidate.archetype}
                            skill={candidatePathwayInfo.skill}
                            lastEdited={candidatePathwayInfo.hiringStageEdited}
                        />
                    </li>
                );
            });

        }

        const hiringStages = ["Not Contacted", "Contacted", "Interviewing", "Hired"];
        const hiringStageItems = hiringStages.map(function (hiringStage) {
            return <MenuItem value={hiringStage} primaryText={hiringStage} key={hiringStage}/>
        })

        // TODO get companies from DB
        const pathways = this.state.pathways;
        const pathwayItems = pathways.map(function (pathway) {
            return <MenuItem value={pathway.name} primaryText={pathway.name} key={pathway.name}/>
        })

        // the hint that shows up when search bar is in focus
        const searchHintStyle = { color: "rgba(255, 255, 255, .3)" }
        const searchInputStyle = { color: "rgba(255, 255, 255, .8)" }

        const searchFloatingLabelFocusStyle = { color: "rgb(117, 220, 252)" }
        const searchFloatingLabelStyle = searchHintStyle;
        const searchUnderlineFocusStyle = searchFloatingLabelFocusStyle;

        //TODO to change the menu style, use menuStyle prop

        const searchBar = (
            <div>
                <Toolbar style={style.searchBar} id="discoverSearchBarWideScreen">
                    <ToolbarGroup>
                        <Field
                            name="search"
                            component={renderTextField}
                            inputStyle={searchInputStyle}
                            hintStyle={searchHintStyle}
                            floatingLabelFocusStyle={searchFloatingLabelFocusStyle}
                            floatingLabelStyle={searchFloatingLabelStyle}
                            underlineFocusStyle = {searchUnderlineFocusStyle}
                            label="Search"
                            onChange={event => this.onSearchChange(event.target.value)}
                            value={this.state.searchTerm}
                        />
                    </ToolbarGroup>

                    <ToolbarGroup>
                        <DropDownMenu value={this.state.hiringStage}
                                      onChange={this.handleHiringStageChange}
                                      labelStyle={style.menuLabelStyle}
                                      anchorOrigin={style.anchorOrigin}
                                      style={{fontSize: "20px", marginTop: "11px"}}
                        >
                            <MenuItem value={""} primaryText="Hiring Stage"/>
                            <Divider/>
                            {hiringStageItems}
                        </DropDownMenu>
                        <DropDownMenu value={this.state.pathway}
                                      onChange={this.handlePathwayChange}
                                      labelStyle={style.menuLabelStyle}
                                      anchorOrigin={style.anchorOrigin}
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
                        inputStyle={searchInputStyle}
                        hintStyle={searchHintStyle}
                        floatingLabelFocusStyle={searchFloatingLabelFocusStyle}
                        floatingLabelStyle={searchFloatingLabelStyle}
                        underlineFocusStyle = {searchUnderlineFocusStyle}
                        component={renderTextField}
                        label="Search"
                        onChange={event => this.onSearchChange(event.target.value)}
                        value={this.state.searchTerm}
                    />

                    <br/>

                    <DropDownMenu value={this.state.hiringStage}
                                  onChange={this.handleHiringStageChange}
                                  labelStyle={style.menuLabelStyle}
                                  anchorOrigin={style.anchorOrigin}
                                  style={{fontSize: "20px", marginTop: "11px"}}
                    >
                        <MenuItem value={""} primaryText="Hiring Stage"/>
                        <Divider/>
                        {hiringStageItems}
                    </DropDownMenu>
                    <div><br/></div>
                    <DropDownMenu value={this.state.pathway}
                                  onChange={this.handlePathwayChange}
                                  labelStyle={style.menuLabelStyle}
                                  anchorOrigin={style.anchorOrigin}
                                  style={{fontSize: "20px", marginTop: "11px"}}
                    >
                        <MenuItem value={""} primaryText="Pathway"/>
                        <Divider/>
                        {pathwayItems}
                    </DropDownMenu>
                </div>
            </div>
        );


        return (
            <div className="jsxWrapper blackBackground fillScreen" style={{paddingBottom: "20px"}} ref='myCandidates'>
                <MetaTags>
                    <title>My Candidates | Moonshot</title>
                    <meta name="description" content="View analytical breakdowns and manage your candidates."/>
                </MetaTags>
                <div className="employerHeader"/>
                <div style={style.separator}>
                    <div style={style.separatorLine}/>
                    <div style={style.separatorText}>
                        My Candidates
                    </div>
                </div>

                {searchBar}

                <div>
                    <ul className="horizCenteredList myCandidatesWidth">
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
