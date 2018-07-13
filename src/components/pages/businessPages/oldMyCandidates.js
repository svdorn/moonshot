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
    CircularProgress,
    Tab,
    Tabs
} from 'material-ui';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {browserHistory} from 'react-router';
import {closeNotification,openAddUserModal} from "../../../actions/usersActions";
import {Field, reduxForm} from 'redux-form';
import MetaTags from 'react-meta-tags';
import axios from 'axios';
import CandidatePreview from '../../childComponents/candidatePreview';
import AddUserDialog from '../../childComponents/addUserDialog';

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

        // if a url query is telling us which position should be selected first
        let positionNameFromUrl = props.location.query && props.location.query.position ? props.location.query.position : undefined;

        this.state = {
            searchTerm: "",
            hiringStage: "",
            position: "",
            sortBy: "",
            candidates: [],
            positions: [],
            positionNameFromUrl,
            // true if the business has no positions associated with it
            noPositions: false,
            // true if the position has no candidates associated with it
            noCandidates: false,
            loadingDone: false
        }
    }

    componentDidMount() {
        let self = this;
        axios.get("/api/business/positions", {
            params: {
                userId: this.props.currentUser._id,
                verificationToken: this.props.currentUser.verificationToken
            }
        })
        .then(function (res) {
            let positions = res.data.positions;
            if (Array.isArray(positions) && positions.length > 0) {
                // if the url gave us a position to select first, select that one
                // otherwise, select the first one available
                let firstPositionName = positions[0].name;
                if (self.state.positionNameFromUrl && positions.some(position => {
                    return position.name === self.state.positionNameFromUrl;
                })) {
                    firstPositionName = self.state.positionNameFromUrl;
                }

                // select this position from the dropdown if it is valid
                if (firstPositionName) {
                    let selectedPosition = firstPositionName;
                }

                self.setState({
                    positions: positions,
                    position: firstPositionName,
                    loadingDone: true
                },
                    // search for candidates of first position
                    self.search
                );
            } else {
                self.setState({
                    noPositions: true,
                    loadingDone: true
                })
            }
        })
        .catch(function (err) {
            // console.log("error getting positions: ", err);
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


    // go between All, Reviewed, and Not Reviewed
    handleTabChange = (tab) => {
        this.setState({tab})
    }


    onSearchChange(term) {
        this.setState({...this.state, term: term}, () => {
            if (term !== undefined) {
                this.search();
            }
        });
    }

    handleHiringStageChange = (event, index, hiringStage) => {
        this.setState({hiringStage, candidates: [], noCandidates: false}, this.search);
    };

    handlePositionChange = (event, index, position) => {
        this.setState({position, candidates: [], noCandidates: false}, this.search);
    };

    handleSortByChange = (event, index, sortBy) => {
        this.setState({sortBy}, () => {
            // only search if the user put in a new search term
            if (sortBy !== "") { this.search(); }
        });
    };

    openAddUserModal() {
        this.props.openAddUserModal();
    }

    search() {
        // need a position to search for
        if (!this.state.noPositions && this.state.position) {
            axios.get("/api/business/candidateSearch", {
                params: {
                    searchTerm: this.state.term,
                    hiringStage: this.state.hiringStage,
                    // searching by position name right now, could search by id if want to
                    positionName: this.state.position,
                    sortBy: this.state.sortBy,
                    userId: this.props.currentUser._id,
                    verificationToken: this.props.currentUser.verificationToken
                }
            }).then(res => {
                // make sure component is mounted before changing state
                if (this.refs.myCandidates) {
                    if (res.data && res.data.length > 0) {
                        this.setState({ candidates: res.data, noCandidates: false });
                    } else {
                        this.setState({noCandidates: true, candidates: []})
                    }
                }
            }).catch(function (err) {
                // console.log("ERROR: ", err);
            })
        }
    }


    render() {
        const style = {
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
            return (
                <div className="blackBackground fillScreen" />
            );
        }

        // find the id of the currently selected position
        let positionId = "";
        try {
            positionId = this.state.positions.find(pos => {
                return pos.name === this.state.position;
            })._id;
        } catch (getPosIdErr) { /* probably just haven't chosen a position yet */ }

        // create the candidate previews
        let key = 0;
        let self = this;

        let candidatePreviews = (
            <div className="center" style={{color: "rgba(255,255,255,.8)"}}>
                Loading candidates...
            </div>
        );

        if (this.state.noCandidates) {
            if (this.state.hiringStage == "" && (this.state.term == "" || !this.state.term)) {
            candidatePreviews = (
                <div className="center marginTop50px">
                <div className="marginBottom15px font32px font28pxUnder500 clickable primary-cyan" onClick={this.openAddUserModal.bind(this)}>
                    + <bdi className="underline">Add Candidates</bdi>
                </div>
                <div style={{color: "rgba(255,255,255,.8)"}}>
                    No candidates
                    {this.state.term ? <bdi> with the given search term</bdi> : null} for the {this.state.position} position
                    {(this.state.hiringStage == "Not Contacted" || this.state.hiringStage == "Contacted" || this.state.hiringStage == "Interviewing" || this.state.hiringStage == "Hired")
                    ? <bdi> with {this.state.hiringStage.toLowerCase()} for the hiring stage</bdi>
                    :null}.
                </div>
                <div className="marginTop15px" style={{color: "rgba(255,255,255,.8)"}}>
                    Add them <bdi className="clickable underline primary-cyan" onClick={this.openAddUserModal.bind(this)}>Here</bdi> so they can get started.
                </div>
                </div>
            )
            } else {
                candidatePreviews = (
                    <div style={{color: "rgba(255,255,255,.8)"}}>
                        No candidates
                        {this.state.term ? <bdi> with the given search term</bdi> : null} for the {this.state.position} position
                        {(this.state.hiringStage == "Not Contacted" || this.state.hiringStage == "Contacted" || this.state.hiringStage == "Interviewing" || this.state.hiringStage == "Hired")
                        ? <bdi> with {this.state.hiringStage.toLowerCase()} for the hiring stage</bdi>
                        :null}.
                    </div>
                );
            }
        }

        if (this.state.noPositions) {
            candidatePreviews = (
                <div className="center" style={{color: "rgba(255,255,255,.8)"}}>
                    Create a position to select.
                </div>
            );
        }
        if (this.state.position == "" && this.state.loadingDone) {
            candidatePreviews = (
                <div className="center" style={{color: "rgba(255,255,255,.8)"}}>
                    Must select a position.
                </div>
            );
        }

        if (this.state.candidates.length !== 0) {
            candidatePreviews = this.state.candidates.map(candidate => {
                key++;

                return (
                    <li style={{marginTop: '15px'}} key={key} >
                        <CandidatePreview
                            candidate={candidate}
                            positionId={positionId}
                            editHiringStage={true}
                            disabled={candidate.disabled === true}
                        />
                    </li>
                );
            });

        }

        const sortByOptions = ["Name", "Score"];
        const sortByItems = sortByOptions.map(function (sortBy) {
            return <MenuItem value={sortBy} primaryText={sortBy} key={sortBy}/>
        })

        const hiringStages = ["Not Contacted", "Contacted", "Interviewing", "Hired"];
        const hiringStageItems = hiringStages.map(function (hiringStage) {
            return <MenuItem value={hiringStage} primaryText={hiringStage} key={hiringStage}/>
        })

        const positions = this.state.positions;
        const positionItems = positions.map(function (position) {
            return <MenuItem value={position.name} primaryText={position.name} key={position.name}/>
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
                        <DropDownMenu value={this.state.sortBy}
                                      onChange={this.handleSortByChange}
                                      labelStyle={style.menuLabelStyle}
                                      anchorOrigin={style.anchorOrigin}
                                      style={{fontSize: "20px", marginTop: "11px", marginRight: "0"}}
                        >
                            <MenuItem value={""} primaryText="Sort By"/>
                            <Divider/>
                            {sortByItems}
                        </DropDownMenu>
                        <DropDownMenu value={this.state.hiringStage}
                                      onChange={this.handleHiringStageChange}
                                      labelStyle={style.menuLabelStyle}
                                      anchorOrigin={style.anchorOrigin}
                                      style={{fontSize: "20px", marginTop: "11px", marginRight: "0"}}
                        >
                            <MenuItem value={""} primaryText="Hiring Stage"/>
                            <Divider/>
                            {hiringStageItems}
                        </DropDownMenu>
                        <DropDownMenu value={this.state.position}
                                      onChange={this.handlePositionChange}
                                      labelStyle={style.menuLabelStyle}
                                      anchorOrigin={style.anchorOrigin}
                                      style={{fontSize: "20px", marginTop: "11px", marginRight: "0"}}
                        >
                            <MenuItem value={""} primaryText="Position"/>
                            <Divider/>
                            {positionItems}
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

                    <DropDownMenu value={this.state.sortBy}
                                  onChange={this.handleSortByChange}
                                  labelStyle={style.menuLabelStyle}
                                  anchorOrigin={style.anchorOrigin}
                                  style={{fontSize: "20px", marginTop: "11px", marginRight: "0"}}
                    >
                        <MenuItem value={""} primaryText="Sort By"/>
                        <Divider/>
                        {sortByItems}
                    </DropDownMenu>
                    <br/>
                    <DropDownMenu value={this.state.hiringStage}
                                  onChange={this.handleHiringStageChange}
                                  labelStyle={style.menuLabelStyle}
                                  anchorOrigin={style.anchorOrigin}
                                  style={{fontSize: "20px", marginTop: "11px", marginRight: "0"}}
                    >
                        <MenuItem value={""} primaryText="Hiring Stage"/>
                        <Divider/>
                        {hiringStageItems}
                    </DropDownMenu>
                    <br/>
                    <DropDownMenu value={this.state.position}
                                  onChange={this.handlePositionChange}
                                  labelStyle={style.menuLabelStyle}
                                  anchorOrigin={style.anchorOrigin}
                                  style={{fontSize: "20px", marginTop: "11px", marginRight: "0"}}
                    >
                        <MenuItem value={""} primaryText="Position"/>
                        <Divider/>
                        {positionItems}
                    </DropDownMenu>
                </div>
            </div>
        );


        return (
            <div className="jsxWrapper blackBackground fillScreen" style={{paddingBottom: "20px"}} ref='myCandidates'>
                {this.props.currentUser.userType == "accountAdmin" ?
                    <AddUserDialog position={this.state.position} tab={"Candidate"}/>
                    : null
                }
                <MetaTags>
                    <title>My Candidates | Moonshot</title>
                    <meta name="description" content="View analytical breakdowns and manage your candidates."/>
                </MetaTags>

                {searchBar}

                <div>
                    <ul className="horizCenteredList myCandidatesWidth">
                        {candidatePreviews}
                    </ul>
                </div>

                <div style={{height: "40px"}} />
            </div>
        );
    }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        closeNotification,
        openAddUserModal
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
