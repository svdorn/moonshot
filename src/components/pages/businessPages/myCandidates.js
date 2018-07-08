"use strict"
import React, { Component } from 'react';
import {
    TextField,
    Divider,
    Toolbar,
    ToolbarGroup,
    Dialog,
    FlatButton,
    CircularProgress,
    Tabs,
    Tab
} from 'material-ui';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { browserHistory } from 'react-router';
import { closeNotification, openAddUserModal, sawMyCandidatesInfoBox } from "../../../actions/usersActions";
import { Field, reduxForm } from 'redux-form';
import MetaTags from 'react-meta-tags';
import axios from 'axios';
import UpDownArrows from "./upDownArrows";
import CandidateResults from "./candidateResults";
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
            // if we are currently loading the positions
            loadingPositions: true,
            // if we are currently loading candidates
            loadingCandidates: true,
            // candidates that have been selected to be moved
            selectedCandidates: {},
            // whether the results page on the right should be shown
            showResults: false,
            // the id of the candidate we want to see results for
            resultsCandidateId: undefined,
            // the index within the sorted array of candidates; used for going
            // to the results of the next or previous candidate
            resultsCandidateIndex: undefined,
            // if the results component shoud take up the entire candidates table
            fullScreenResults: false
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
                    loadingPositions: false,
                    loadingCandidates: true
                },
                    // search for candidates of first position
                    self.findCandidates
                );
            } else {
                self.setState({
                    noPositions: true,
                    loadingPositions: false,
                    loadingCandidates: false
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

    handlePositionChange = event => {
        // find the position id from the given name
        let positionId = undefined;
        const position = event.target.value;
        try {
            positionId = this.state.positions.find(pos => {
                return pos.name === position
            })._id;
        } catch (getPosIdErr) {
            // chose the dropdown header
            return this.setState({
                position,
                positionId: undefined,
                candidates: []
            });
        }
        this.setState({
            position,
            positionId,
            candidates: [],
            loadingCandidates: true
        }, this.findCandidates);
    };

    handleSortByChange(sortBy) {
        // if the user is changing the sort by value
        if (this.state.sortBy !== sortBy) {
            // will always switch to sorting ascending if switching sorting value
            this.setState({ sortBy, sortAscending: true }, this.reorder);
        }
        // if the user is flipping the direction of the sort
        else {
            this.setState({ sortAscending: !this.state.sortAscending }, this.reorder);
        }
    };

    openAddUserModal() {
        this.props.openAddUserModal();
    }

    findCandidates() {
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
                if (res.data && res.data.length > 0) {
                    this.setState({
                        candidates: res.data,
                        loadingCandidates: false
                    }, () => {
                        this.reorder()
                    });
                } else {
                    this.setState({
                        candidates: [],
                        loadingCandidates: false
                    })
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

        // find the index of the selected candidate
        let resultsCandidateIndex = undefined;
        if (this.state.resultsCandidateId) {
            resultsCandidateIndex = this.state.sortedCandidates.findIndex(candidate => {
                return candidate._id === this.state.resultsCandidateId;
            });
        }

        // set the state so the candidates can be displayed in order
        this.setState({
            sortedCandidates,
            resultsCandidateIndex
        });

        console.log(sortedCandidates);
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
                if (candA.name > candB.name) { return -1; }
                else if (candA.name < candB.name) { return 1; }
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


    // create the dropdown for a candidate's hiring stage
    makeHiringStage(candidateId, hiringStage, isDismissed) {
        const stageNames = ["Dismissed", "Not Contacted", "Contacted", "Interviewing", "Offered", "Hired"];
        // if no stage is recorded, assume the candidate has not been contacted
        if (!hiringStage) { hiringStage = "Not Contacted" }
        // if the candidate is dismissed, show that
        if (isDismissed) { hiringStage = "Dismissed"; }

        // create the stage name menu items
        const stages = stageNames.map(stage => {
            return (
                <MenuItem
                    value={stage}
                    key={`${candidateId}hiringStage${stage}`}
                >
                    { stage }
                </MenuItem>
            )
        });

        return (
            <Select
                disableUnderline={true}
                classes={{
                    root: "selectRootWhite",
                    icon: "selectIconWhiteImportant"
                }}
                value={hiringStage}
                onChange={this.handleChangeHiringStage(candidateId)}
            >
                { stages }
            </Select>
        );
    }


    // change a candidate's hiring stage
    handleChangeHiringStage = candidateId => event => {
        const hiringStage = event.target.value;
        // CHANGE HIRING STAGE IN BACK END
        const params = {
            userId: this.props.currentUser._id,
            verificationToken: this.props.currentUser.verificationToken,
            positionId: this.state.positionId,
            candidateId, hiringStage
        }
        axios.post("/api/business/changeHiringStage", params)
        .catch(error => { console.log("error: ", error); });

        // CHANGE HIRING STAGE IN FRONT END
        let candidates = this.state.candidates.slice(0);
        const candIndex = candidates.findIndex(cand => { return cand._id.toString() === candidateId.toString() });
        if (candIndex < 0) { return console.log("Cannot set interest value for candidate that doesn't exist."); }
        if (hiringStage === "Dismissed") {
            candidates[candIndex].isDismissed = true;
        } else {
            candidates[candIndex].isDismissed = false;
            candidates[candIndex].hiringStage = hiringStage;
        }
        this.setState({ candidates });
    }


    moveCandidates(moveTo) {
        // check if there are any candidates to move
        if (!this.candidatesSelected()) {
            return;
        }

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
        axios.post("/api/business/moveCandidates", params)
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

        // dismissing candidate
        if (moveTo === "Dismissed") {
            // dismiss every marked candidate
            candidateIndexes.forEach(candIndex => {
                allCandidates[candIndex].isDismissed = true;
            });
        }
        // changing reviewed or favorited status
        else {
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
        }

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


    // move the candidate to Reviewed, Favorites, or Not Reviewed
    handleMoveTo = event => {
        const moveTo = event.target.value;
        // check for valid input
        if (["Reviewed", "Not Reviewed", "Favorites"].includes(moveTo)) {
            this.moveCandidates(moveTo);
        }
    }


    // record that the user has seen the information box at the top of the screen
    seeInfoBox() {
        this.props.sawMyCandidatesInfoBox(this.props.currentUser._id, this.props.currentUser.verificationToken);
    }


    // creates the table with all the candidates
    createCandidatesTable(positionId) {
        // copy this
        const self = this;

        // will contain the table of candidates
        let candidatesContainer = null;

        // loading in positions or candidates
        if (this.state.loadingPositions || this.state.loadingCandidates) {
            return (
                <div>
                    <CircularProgress color="#FB553A" style={style.noCandidatesMessage} />
                </div>
            )
        }

        else if (this.state.noPositions) {
            return (
                <div>
                    Your business has no open evaluations.<br/>
                    Contact us at support@moonshotinsights.io to get your first one set up.
                </div>
            );
        }
        else if (this.state.position == "" && !this.state.loadingPositions) {
            return (
                <div style={style.noCandidatesMessage}>
                    Select a position.
                </div>
            );
        }
        else if (this.state.candidates.length === 0) {
            return (
                <div style={style.noCandidatesMessage}>
                    No candidates have started this evaluation.
                </div>
            )
        }
        // if there are candidates in this position, but none meet the criteria
        else if (this.state.sortedCandidates.length === 0) {
            return (
                <div style={style.noCandidatesMessage}>
                    No candidates meet these criteria.
                </div>
            )
        }

        // there are candidates that meet these criteria, make them
        let candidateRows = [];

        // the position of the candidate within the sorted/filtered candidates array
        let candidateIndex = -1;
        candidateRows = this.state.sortedCandidates.map(candidate => {
            candidateIndex++;
            let score = null;
            let predicted = null;
            let skill = null;
            if (typeof candidate.scores === "object") {
                if (candidate.scores.overall) { score = candidate.scores.overall; }
                if (candidate.scores.predicted) { predicted = candidate.scores.predicted; }
                if (candidate.scores.skill) { skill = candidate.scores.skill; }
            }
            return (
                <tr className="candidate" key={candidate._id}>
                    <td className="selectCandidateBox inlineBlock">
                        <div className="checkbox smallCheckbox whiteCheckbox" onClick={() => this.handleSelectCandidate(candidate._id)}>
                            <img
                                alt="Checkmark icon"
                                className={"checkMark" + !!this.state.selectedCandidates[candidate._id]}
                                src={"/icons/CheckMarkRoundedWhite" + this.props.png}
                            />
                        </div>
                    </td>
                    <td className="name pointer" onClick={() => this.showResults(candidate._id, candidateIndex)}>
                        {candidate.name}
                    </td>
                    <td className="score">
                        {Math.round(score)}
                    </td>
                    <td className="interest">
                        {this.makeStars(candidate._id, candidate.interest)}
                    </td>
                    <td className="stage">
                        {this.makeHiringStage(candidate._id, candidate.hiringStage, candidate.isDismissed)}
                    </td>
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
        );

        return (
            <table className="candidateTable"><tbody>
                {candidateRows}
            </tbody></table>
        );
    }


    // show a candidate's results
    showResults(candidateId, candidateIndex) {
        this.setState({
            showResults: true,
            resultsCandidateId: candidateId,
            resultsCandidateIndex: candidateIndex
        });
    }


    // the tabs at the top that say All, Favorites, etc...
    tabParts() {
        const tabNames = ["All", "Favorites", "Reviewed", "Not Reviewed"];
        return tabNames.map(tabName => {
            const isSelected = tabName === this.state.tab;
            return (
                <div
                    onClick={() => this.handleTabChange(tabName)}
                    className={"myCandidatesTab" + (isSelected ? " selected" : "")}
                >
                    { tabName.toUpperCase() }
                </div>
            );
        });
    }



    // lets the user switch between positions
    positionSelector() {
        const positions = this.state.positions;
        const positionItems = positions.map(position => {
            return (
                <MenuItem
                    value={position.name}
                    key={`position${position.name}`}
                >
                    { position.name }
                </MenuItem>
            );
        })
        return (
            <Select
                disableUnderline={true}
                classes={{
                    root: "selectRootWhite",
                    icon: "selectIconWhiteImportant"
                }}
                value={this.state.position}
                onChange={this.handlePositionChange}
            >
                { positionItems }
            </Select>
        );
    }


    // create the box at the top of the screen that shows only for new users
    // and tells them how to see candidate results
    infoBox() {
        if (!this.props.currentUser.sawMyCandidatesInfoBox) {
            return (
                <div className="center">
                    <div className="myCandidatesInfoBox font16px font12pxUnder500">
                        Click any candidate name to see results.<br/>
                        Hover over any category for a description.
                        <div className="x" onClick={this.seeInfoBox.bind(this)}>x</div>
                    </div>
                </div>
            );
        } else {
            return null;
        }
    }


    candidatesSelected() {
        const selections = this.state.selectedCandidates;
        // go through every property
        for (let candidateId in selections) {
            // if it's a custom property, check if the candidate is selected
            if (selections.hasOwnProperty(candidateId) && selections[candidateId]) {
                // if so, at least one candidate has been selected
                return true;
            }
        }
        // no candidates have been selected
        return false;
    }


    topOptions() {
        // the hint that shows up when search bar is in focus
        const searchHintStyle = { color: "rgba(255, 255, 255, .3)" }
        const searchInputStyle = { color: "rgba(255, 255, 255, .8)" }
        const searchFloatingLabelFocusStyle = { color: "rgb(117, 220, 252)" }
        const searchFloatingLabelStyle = searchHintStyle;
        const searchUnderlineFocusStyle = searchFloatingLabelFocusStyle;


        let menuItems = ["Reviewed", "Not Reviewed", "Favorites"].map(menuItem => {
            return (
                <MenuItem
                    value={menuItem}
                    key={`moveTo${menuItem}`}
                >
                    { menuItem }
                </MenuItem>
            );
        });
        menuItems.unshift( <Divider key="moveToDivider"/> );
        menuItems.unshift( <MenuItem key="moveToName" value={"Move To"}>{"Move To"}</MenuItem> );

        const selectionsExist = this.candidatesSelected();

        const colorClass = selectionsExist ? " topOptionWhite" : " topOptionGray";
        const cursorClass = selectionsExist ? " pointer" : " defaultCursor";

        let selectAttributes = {
            disableUnderline: true,
            classes: {
                root: colorClass,
                icon: selectionsExist ? "selectIconWhiteImportant" : "selectIconGrayImportant"
            },
            value: "Move To",
            onChange: this.handleMoveTo
        };

        return (
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
                    {selectionsExist ?
                        <Select {...selectAttributes}>{menuItems}</Select>
                        : <Select disabled {...selectAttributes}>{menuItems}</Select>
                    }

                </div>
                <div
                    className={"inlineBlock" + colorClass + cursorClass}
                    onClick={() => this.moveCandidates("Dismissed")}
                >
                    {"Dismiss"}
                </div>
                <div className={"inlineBlock" + colorClass + cursorClass}>
                    {"Contact"}
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
    }


    // set the results page to be full screen
    // pass in an activate boolean if you want to set full screen to true or false,
    // or pass in nothing to set it to its opposite state
    toggleFullScreen(fullScreen) {
        if (typeof activate !== "boolean") {
            fullScreen = !this.state.fullScreenResults;
        }
        this.setState({ fullScreenResults: fullScreen });
    }


    // exits the candidate results popover
    exitResults() {
        this.setState({ showResults: false });
    }


    // go to the next or previous candidate
    nextPreviousResults(next) {
        let newIndex = 0;
        // if the candidate whose results we are seeing is within the current
        // page sorted candidates ...
        if (this.state.resultsCandidateIndex !== undefined) {
            // ... get the index of the candidate whose results we want to see
            newIndex = next ? this.state.resultsCandidateIndex + 1 : this.state.resultsCandidateIndex - 1;
        } else {
            // if there are no candidates, do nothing
            if (this.state.sortedCandidates.length === 0) { return console.log("no candidates here!"); }
            // if there are candidates, select the first one (so keep the default)
        }

        // make sure the new index is valid
        if (newIndex < 0 || newIndex >= this.state.sortedCandidates.length) {
            return console.log("invalid index");
        }

        console.log("new candidate index: ", newIndex);

        this.setState({
            resultsCandidateId: this.state.sortedCandidates[newIndex]._id,
            resultsCandidateIndex: newIndex
        });
    }


    render() {
        console.log("rendering with candidate index: ", this.state.resultsCandidateId);
        const currentUser = this.props.currentUser;
        let positionId = this.state.positionId;

        const tabs = (
            <div className="center" style={{position:"relative", marginTop:"10px"}}>
                <div className="myCandidatesTabs">
                    { this.tabParts() }
                </div>
                <div className="myCandidatesPositionSelector">
                    { this.positionSelector() }
                </div>
            </div>
        );

        let resultsWidthClass = this.state.fullScreenResults ? "fullScreen" : "halfScreen";
        let candidateResultsClass = "candidateResults " + resultsWidthClass;
        let leftArrowClass = "left clickable arrowContainer " + resultsWidthClass;
        let rightArrowClass = "right clickable arrowContainer " + resultsWidthClass;

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

                { this.infoBox() }

                <div className="center">
                    <div className="candidatesAndOptions">
                        { this.topOptions() }
                        <div className="candidatesContainer">
                            { this.createCandidatesTable(positionId) }
                            { this.state.showResults ?
                                <div>
                                    <CandidateResults
                                        className={candidateResultsClass}
                                        candidateId={this.state.resultsCandidateId}
                                        positionId={this.state.positionId}
                                        toggleFullScreen={this.toggleFullScreen.bind(this)}
                                        exitResults={this.exitResults.bind(this)}
                                        fullScreen={this.state.fullScreenResults}
                                    />
                                    <div className={leftArrowClass} onClick={() => this.nextPreviousResults(false)}>
                                        <div className="left circleArrowIcon" />
                                    </div>
                                    <div className={rightArrowClass} onClick={() => this.nextPreviousResults(true)}>
                                        <div className="right circleArrowIcon" />
                                    </div>
                                </div>
                                : null
                            }
                        </div>
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
    "Not Contacted": 1,
    "Contacted": 2,
    "Interviewing": 3,
    "Offered": 4,
    "Hired": 5
}


const style = {
    // the top options such as search and hide hired candidates
    anchorOrigin: {
        vertical: "top",
        horizontal: "left"
    },
    labelStyle: {
        color: "rgba(255,255,255,.8)"
    },
    noCandidatesMessage: {marginTop: "20px"}
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
