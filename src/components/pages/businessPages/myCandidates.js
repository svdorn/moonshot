"use strict"
import React, { Component } from 'react';
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
    Tabs,
    Tab
} from 'material-ui';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { browserHistory } from 'react-router';
import { closeNotification, openAddUserModal, sawMyCandidatesInfoBox } from "../../../actions/usersActions";
import { Field, reduxForm } from 'redux-form';
import MetaTags from 'react-meta-tags';
import axios from 'axios';
import UpDownArrows from "./upDownArrows";
import AddUserDialog from '../../childComponents/addUserDialog';

const renderTextField = ({input, label, ...custom}) => (
    <TextField
        style={{width: "150px"}}
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
            position: "",
            sortBy: "",
            sortAscending: true,
            hideDismissed: false,
            hideHired: false,
            // unordered candidates list
            candidates: [],
            // the candidates ordered by the user
            sortedCandidates: [],
            // the positions the company has
            positions: [],
            // can be All, Reviewed, Not Reviewed
            tab: "All",
            positionNameFromUrl,
            // true if the business has no positions associated with it
            noPositions: false,
            // true if the position has no candidates associated with it
            noCandidates: false,
            // finished loading in the positions
            loadingDone: false,
            // candidates that have been selected to be moved
            selectedCandidates: {}
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
                let positionId = undefined;
                if (firstPositionName) {
                    // find the position id from the given name
                    try {
                        positionId = positions.find(pos => {
                            return pos.name === firstPositionName;
                        })._id;
                    } catch (getPosIdErr) { /* probably chose the dropdown header */ }
                }

                self.setState({
                    positions,
                    position: firstPositionName,
                    positionId,
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

    onSearchChange(searchTerm) {
        if (this.state.searchTerm !== searchTerm) {
            this.setState({ searchTerm }, this.reorder);
        }
    }

    handlePositionChange = (event, index, position) => {
        // find the position id from the given name
        let positionId = undefined;
        try {
            positionId = this.state.positions.find(pos => {
                return pos.name === position
            })._id;
        } catch (getPosIdErr) { /* probably chose the dropdown header */ }
        this.setState({position, positionId, candidates: [], noCandidates: false}, this.search);
    };

    handleSortByChange(sortBy) {
        // if the user is changing the sort by value
        if (this.state.sortBy !== sortBy) {
            this.setState({ sortBy }, this.reorder);
        }
        // if the user is flipping the direction of the sort
        else {
            this.setState({ sortAscending: !this.state.sortAscending }, this.reorder);
        }
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
                    // searching by position name right now, could search by id if want to
                    positionName: this.state.position,
                    sortBy: this.state.sortBy,
                    sortAscending: this.state.sortAscending,
                    userId: this.props.currentUser._id,
                    verificationToken: this.props.currentUser.verificationToken
                }
            }).then(res => {
                // make sure component is mounted before changing state
                if (this.refs.myCandidates) {
                    if (res.data && res.data.length > 0) {
                        this.setState({ candidates: res.data, noCandidates: false }, this.reorder);
                    } else {
                        this.setState({noCandidates: true, candidates: []})
                    }
                }
            }).catch(function (err) {
                console.log("ERROR: ", err);
            })
        }
    }

    handleTabChange = (tab) => {
        // only switch tabs and re-search if not on the tab that should be switched to
        if (this.state.tab !== tab) {
            this.setState({tab}, this.reorder);
        }
    }


    // change hide dismissed or hide hired
    handleCheckMarkClick(checkMarkField) {
        let state = JSON.parse(JSON.stringify(this.state));
        state[checkMarkField] = !state[checkMarkField];
        this.setState(state, this.reorder);
    }


    // reorder the candidates that are shown and hide/show any that need to be
    // hidden/shown based on options given
    reorder() {
        // get a shallow copy of the candidates array
        let sortedCandidates = this.state.candidates.slice(0);

        // remove candidates that don't match filtering criteria
        sortedCandidates = sortedCandidates.filter(this.filterCandidates.bind(this));

        // sort the array
        sortedCandidates.sort(this.compareCandidates.bind(this));

        // flip the array if sorting in ascending order
        if (this.state.sortAscending) {
            sortedCandidates.reverse();
        }

        // set the state so the candidates can be displayed in order
        this.setState({ sortedCandidates });
    }


    // filter candidates by given user-given filters
    filterCandidates(cand) {
        // filter by tab if not on "All"
        if (this.state.tab === "Reviewed" && cand.reviewed !== true) { return false; }
        else if (this.state.tab === "Not Reviewed" && cand.reviewed === true) { return false; }
        else if (this.state.tab === "Favorites" && cand.favorite !== true) { return false; }

        // filter by dismissed and hired status if wanted
        if (this.state.hideDismissed && cand.isDismissed) { return false; }
        if (this.state.hideHired && cand.hiringStage === "Hired") { return false; }

        // filter by name if name search term provided
        if (this.state.searchTerm) {
            const nameRegExp = new RegExp(this.state.searchTerm, "i");
            if (!nameRegExp.test(cand.name)) { return false; }
        }

        // candidate matches all filters
        return true;
    }


    // function to compare two candidates based on the sorting options
    compareCandidates(candA, candB) {
        switch (this.state.sortBy) {
            case "name":
                if (candA.name < candB.name) { return -1; }
                else if (candA.name > candB.name) { return 1; }
                else { return 0; }
                break;
            case "interest":
                if (!candA.interest && !candB.interest) { return 0; }
                else if (!candA.interest || candA.interest < candB.interest) { return -1; }
                else if (!candB.interest || candA.interest > candB.interest) { return 1; }
                else { return 0; }
                break;
            case "score": return this.compareByScore(candA, candB, "overall"); break;
            case "predicted": return this.compareByScore(candA, candB, "predicted"); break;
            case "skill": return this.compareByScore(candA, candB, "skill"); break;
            case "stage": return this.compareByStage(candA, candB); break;
            // if an invalid sort criteria is given, all candidates are of equal sorting value
            default: return 0; break;
        }
    }


    // compare two candidates by their stage in the hiring process
    compareByStage(candA, candB) {
        // lack of hiring stage < hiring stage exists
        const candAhasHiringStage = !!candA.hiringStage;
        const candBhasHiringStage = !!candB.hiringStage;
        if (!candAhasHiringStage && !candBhasHiringStage) { return 0; }
        else if (!candAhasHiringStage) { return -1; }
        else if (!candBhasHiringStage) { return 1; }
        // dismissed < any hiring stage
        if (candA.isDismissed && candB.isDismissed) { return 0; }
        else if (candA.isDismissed) { return -1; }
        else if (candB.isDismissed) { return 1; }
        // both candidates have a hiring stage
        const candAstageVal = hiringStageValues[candA.hiringStage];
        const candBstageVal = hiringStageValues[candB.hiringStage];
        if (candAstageVal < candBstageVal) { return -1; }
        else if (candAstageVal > candBstageVal) { return 1; }
        else { return 0; }
    }


    // compare two candidates by one of the scores they recieved for the evaluation
    compareByScore(candA, candB, scoreType) {
        const candAhasScore = typeof candA.scores === "object" && typeof candA.scores[scoreType] === "number";
        const candBhasScore = typeof candB.scores === "object" && typeof candB.scores[scoreType] === "number";
        if (!candAhasScore && !candBhasScore) { return 0; }
        else if (!candAhasScore) { return -1; }
        else if (!candBhasScore) { return 1; }
        if (candA.scores[scoreType] < candB.scores[scoreType]) { return -1; }
        else if (candA.scores[scoreType] > candB.scores[scoreType]) { return 1; }
        else { return 0; }
    }


    // select or deselect a candidate to be moved to a different tab
    handleSelectCandidate(candidateId) {
        // what the candidate's selected status should be set to
        let setTo = true;
        // if the candidate has already been selected, set their selected status to undefined
        if (this.state.selectedCandidates[candidateId] === true) { setTo = undefined; }
        // create a shallow copy of the selected candidates object
        let selectedCandidates = Object.assign({}, this.state.selectedCandidates);
        // set the candidate's selected status
        selectedCandidates[candidateId] = setTo;
        // set the state to update the checkmarks
        this.setState({ selectedCandidates });
    }


    makeStars(candidateId, interest) {
        // if interest in a candidate is not valid, set to 0 stars
        if (typeof interest !== "number" || interest < 0 || interest > 5) {
            interest = 0;
        }
        // make sure we have an integer
        interest = Math.round(interest);
        // create 5 stars
        let stars = [];
        for (let starNumber = 1; starNumber <= 5; starNumber++) {
            const colorClass = starNumber <= interest ? "white" : "gray";
            stars.push(
                <div
                    className={"inlineBlock clickableNoUnderline star " + colorClass}
                    onClick={() => this.rateInterest(candidateId, starNumber)}
                    style={{marginRight: "5px"}}
                    key={`${candidateId}star${starNumber}`}
                />
            );
        }
        return (
            <div>
                {stars}
            </div>
        );
    }


    // change how interested the user is in the candidate (number of stars 1-5)
    rateInterest(candidateId, interest) {
        // set the result in the database
        const params = {
            userId: this.props.currentUser._id,
            verificationToken: this.props.currentUser.verificationToken,
            positionId: this.state.positionId,
            candidateId, interest
        }
        axios.post("/api/business/rateInterest", params)
        .catch(error => { console.log("error: ", error); });

        // set the state so that the result is immediately visible
        let candidates = this.state.candidates.slice(0);
        const candIndex = candidates.findIndex(cand => { return cand._id.toString() === candidateId.toString() });
        if (candIndex < 0) { return console.log("Cannot set interest value for candidate that doesn't exist."); }
        candidates[candIndex].interest = interest;
        this.setState({ candidates });
    }


    // move the candidate to Reviewed, Favorites, or Not Reviewed
    handleMoveTo = (event, index, moveTo) => {
        // check for valid input
        if (["Reviewed", "Not Reviewed", "Favorites"].includes(moveTo)) {
            // copy "this"
            const self = this;
            // get the ids of every selected candidate
            const selectedCandidates = this.state.selectedCandidates;
            // loop through the candidate ids to make it into an array
            let candidateIds = [];
            for (let candidateId in selectedCandidates) {
                if (!selectedCandidates.hasOwnProperty(candidateId)) continue;
                candidateIds.push(candidateId);
            }

            // MOVE THE CANDIDATE IN THE BACK END
            const params = {
                userId: this.props.currentUser._id,
                verificationToken: this.props.currentUser.verificationToken,
                positionId: this.state.positionId,
                candidateIds, moveTo
            }
            axios.post("/api/business/moveCandidate", params)
            .then(result => { console.log(result.data); })
            .catch(error => { console.log(error); });

            // MOVE THE CANDIDATES IN THE FRONT END
            // get a shallow editable copy of the candidates array
            let allCandidates = this.state.candidates.slice(0);
            let candidateIndexes = [];
            // find the index of every candidate that is selected within the array
            for (let candIndex = 0; candIndex < allCandidates.length; candIndex++) {
                // if the array of selected ids contains the id of the candidate at the current index ...
                if (candidateIds.includes(allCandidates[candIndex]._id)) {
                    // ... add the current index as a candidate that is selected
                    candidateIndexes.push(candIndex);
                }
            }

            // assume moving to reviewed ...
            let property = "reviewed";
            // ... so the value of reviewed will be true
            let value = true;
            if (moveTo === "Not Reviewed") {
                // if moving to not reviewed, value of reviewed is false
                value = false;
            } else if (moveTo === "Favorites") {
                // if moving to favorites, value of favorite will be true
                property = "favorite";
            }

            // mark these values for every marked candidate
            candidateIndexes.forEach(candIndex => {
                allCandidates[candIndex][property] = value;
            });

            // set the state so the candidates can be reordered
            self.setState({ candidates: allCandidates }, function() {
                // reorder the candidates
                self.reorder();
                // uncheck all checked candidates
                const selectedCandidates = {};
                // save that unchecked-ness
                self.setState({ selectedCandidates });
            });
        }
    }


    seeInfoBox() {
        this.props.sawMyCandidatesInfoBox(this.props.currentUser._id, this.props.currentUser.verificationToken);
    }


    render() {
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

        let self = this;

        if (this.state.noPositions) {
            // TODO: tell them they have no positions, they have to create one
        }
        if (this.state.position == "" && this.state.loadingDone) {
            // TODO: somehow tell them they have to select a position
        }

        let infoBox = null;
        if (!this.props.currentUser.sawMyCandidatesInfoBox) {
            infoBox = (
                <div className="center">
                    <div className="myCandidatesInfoBox font16px font12pxUnder500">
                        Click any candidate name to see results.<br/>
                        Hover over any category for a description.
                        <div className="x" onClick={this.seeInfoBox.bind(this)}>x</div>
                    </div>
                </div>
            )
        }

        let candidateRows = [];

        if (this.state.sortedCandidates.length !== 0) {
            candidateRows = this.state.sortedCandidates.map(candidate => {
                let score = null;
                let predicted = null;
                let skill = null;
                if (typeof candidate.scores === "object") {
                    if (candidate.scores.overall) { score = candidate.scores.overall; }
                    if (candidate.scores.predicted) { predicted = candidate.scores.predicted; }
                    if (candidate.scores.skill) { predicted = candidate.scores.skill; }
                }
                return (
                    <tr className="candidate" key={candidate._id}>
                        <td className="selectCandidateBox inlineBlock" >
                            <div className="checkbox smallCheckbox whiteCheckbox" onClick={() => this.handleSelectCandidate(candidate._id)}>
                                <img
                                    alt="Checkmark icon"
                                    className={"checkMark" + !!this.state.selectedCandidates[candidate._id]}
                                    src={"/icons/CheckMarkRoundedWhite" + this.props.png}
                                />
                            </div>
                        </td>
                        <td className="name">{candidate.name}</td>
                        <td className="score">
                            {Math.round(score)}
                        </td>
                        <td className="interest">{this.makeStars(candidate._id, candidate.interest)}</td>
                        <td className="stage"></td>
                        <td className="predicted">
                            {Math.round(predicted)}
                        </td>
                        <td className="skill">
                            {Math.round(skill)}
                        </td>
                    </tr>
                );
            });

            let headers = ["name", "score", "interest", "stage", "predicted", "skill"].map(sortTerm => {
                return (
                    <td className={sortTerm} key={"tableHeader" + sortTerm}>
                        <div className="inlineBlock clickableNoUnderline" onClick={() => this.handleSortByChange(sortTerm)}>
                            {sortTerm.toUpperCase()}
                            <UpDownArrows
                                selected={this.state.sortBy===sortTerm}
                                sortAscending={this.state.sortAscending}
                                style={{marginLeft: "12px"}}
                            />
                        </div>
                    </td>
                );
            });

            // add in the extra area for selecting a candidate
            headers.unshift(
                <td className="selectCandidateBox" key={`selectAreaBlankHeader`}/>
            )

            // add in the column headers
            candidateRows.unshift(
                <tr className="candidate" key={`tableHeaders`}>
                    { headers }
                </tr>
            )
        }

        const sortByOptions = ["Name", "Score"];
        const sortByItems = sortByOptions.map(function (sortBy) {
            return <MenuItem value={sortBy} primaryText={sortBy} key={sortBy}/>
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

        const tabs = (
            <Tabs
                inkBarStyle={{background: 'white'}}
                className="settingsTabs"
                value={this.state.tab}
                onChange={this.handleTabChange}
            >
                <Tab label="All" value="All" style={{color:"white"}} />
                <Tab label="Favorites" value="Favorites" style={{color:"white"}} />
                <Tab label="Reviewed" value="Reviewed" style={{color:"white"}} />
                <Tab label="Not Reviewed" value="Not Reviewed" style={{color:"white"}} />
            </Tabs>
        );

        // the top options such as search and hide hired candidates
        const anchorOrigin = {
            vertical: "top",
            horizontal: "left"
        };
        const labelStyle = {
            color: "rgba(255,255,255,.8)"
        };
        const topOptions = (
            <div className="topOptions">
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
                <div className="inlineBlock">
                    <DropDownMenu value={"Move To"}
                                  onChange={this.handleMoveTo}
                                  labelStyle={labelStyle}
                                  anchorOrigin={anchorOrigin}
                                  style={{fontSize: "20px", marginTop: "11px", marginRight: "0"}}
                    >
                        <MenuItem value={"Move To"} primaryText="Move To"/>
                        <Divider/>
                        <MenuItem value={"Reviewed"} primaryText="Reviewed" />
                        <MenuItem value={"Not Reviewed"} primaryText="Not Reviewed" />
                        <MenuItem value={"Favorites"} primaryText="Favorites" />
                    </DropDownMenu>
                </div>
                <div className="inlineBlock">
                    <div className="checkbox smallCheckbox whiteCheckbox" onClick={() => this.handleCheckMarkClick("hideDismissed")}>
                        <img
                            alt="Checkmark icon"
                            className={"checkMark" + this.state.hideDismissed}
                            src={"/icons/CheckMarkRoundedWhite" + this.props.png}
                        />
                    </div>
                    <div className="inlineBlock">
                        Hide <i>Dismissed</i> Candidates
                    </div><br/>
                </div>
                <div className="inlineBlock">
                    <div className="checkbox smallCheckbox whiteCheckbox" onClick={() => this.handleCheckMarkClick("hideHired")}>
                        <img
                            alt="Checkmark icon"
                            className={"checkMark" + this.state.hideHired}
                            src={"/icons/CheckMarkRoundedWhite" + this.props.png}
                        />
                    </div>
                    <div style={{display:"inline-block"}}>
                        Hide <i>Hired</i> Candidates
                    </div><br/>
                </div>
            </div>
        );

        const candidatesContainer = (
            <div className="candidatesContainer">
                <table className="candidateTable"><tbody>
                    {candidateRows}
                </tbody></table>
            </div>
        )

        return (
            <div className="jsxWrapper blackBackground fillScreen myCandidates whiteText" style={{paddingBottom: "20px"}} ref='myCandidates'>
                {this.props.currentUser.userType == "accountAdmin" ?
                    <AddUserDialog position={this.state.position} tab={"Candidate"}/>
                    : null
                }
                <MetaTags>
                    <title>My Candidates | Moonshot</title>
                    <meta name="description" content="View analytical breakdowns and manage your candidates."/>
                </MetaTags>

                { tabs }

                { infoBox }

                <div className="center">
                    <div className="candidatesAndOptions">
                        { topOptions }
                        { candidatesContainer }
                    </div>
                </div>

                <div style={{height: "40px"}} />
            </div>
        );
    }
}


// how far along in the hiring process each of the hiring stages is relative to the others
const hiringStageValues = {
    "Dismissed": 0,
    "Uncontacted": 1,
    "Contacted": 2,
    "Interviewing": 3,
    "Offered": 4,
    "Hired": 5
}


function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        closeNotification,
        openAddUserModal,
        sawMyCandidatesInfoBox
    }, dispatch);
}

function mapStateToProps(state) {
    return {
        formData: state.form,
        notification: state.users.notification,
        currentUser: state.users.currentUser,
        png: state.users.png
    };
}

MyCandidates = reduxForm({
    form: 'myCandidates',
})(MyCandidates);

export default connect(mapStateToProps, mapDispatchToProps)(MyCandidates);
