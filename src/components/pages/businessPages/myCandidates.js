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
import { qualifierFromScore } from '../../../miscFunctions';
import HoverTip from "../../miscComponents/hoverTip";

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

        // bind 'this' to the resize and keyup functions
        this.bound_handleResize = this.handleResize.bind(this);
        this.bound_handleKeyPress = this.handleKeyPress.bind(this);

        this.state = {
            // what is entered in the name search bar
            searchTerm: "",
            // which position we should see candidates for
            position: "",
            // can sort by Name, Score, Hiring Stage, etc...
            sortBy: "stage",
            // the direction to sort in
            sortAscending: false,
            // hide candidates that have been dismissed?
            hideDismissed: false,
            // hide candidates that have been hired?
            hideHired: false,
            // unordered candidates list
            candidates: [],
            // the candidates ordered by the user
            sortedCandidates: [],
            // the positions the company has
            positions: [],
            // can be All, Reviewed, Not Reviewed
            tab: "All",
            // if the url already has a position name
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
            fullScreenResults: false,
            // if the user should see the mobile version instead of the desktop version
            mobile: window.innerWidth <= 800
        }
    }

    componentDidMount() {
        let self = this;
        // set an event listener for key presses
        document.addEventListener('keyup', this.bound_handleKeyPress);
        // set an event listener for window resizing to see if mobile or desktop
        // view should be shown
        window.addEventListener("resize", this.bound_handleResize);
        // get the open positions that this business has
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


    // remove all event listeners
    componentWillUnmount() {
        document.removeEventListener('keyup', this.bound_handleKeyPress);
        window.removeEventListener("resize", this.bound_handleResize);
    }


    goTo(route) {
        // closes any notification
        this.props.closeNotification();
        // goes to the wanted page
        browserHistory.push(route);
        // goes to the top of the new page
        window.scrollTo(0, 0);
    }


    // switch between mobile and desktop views if necessary
    handleResize() {
        // mobile view at and under 800px
        if (window.innerWidth <= 800) {
            if (!this.state.mobile) { this.setState({ mobile: true }); }
        }
        // desktop view above 800px
        else {
            if (this.state.mobile) { this.setState({ mobile: false }); }
        }
    }


    // when user types into the search bar
    onSearchChange(searchTerm) {
        if (this.state.searchTerm !== searchTerm) {
            this.setState({ searchTerm }, this.reorder);
        }
    }


    // change the position whose candidates are being viewed
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
            loadingCandidates: true,
            showResults: false,
            resultsCandidateId: undefined,
            resultsCandidateIndex: undefined,
            fullScreenResults: false
        }, this.findCandidates);
    };


    // change what is being sorted by
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


    // get candidates for the current position from the back end
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


    // switch between All, Reviewed, Not Reviewed, Favorites
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
            resultsCandidateIndex = sortedCandidates.findIndex(candidate => {
                return candidate._id === this.state.resultsCandidateId;
            });
        }

        // set the state so the candidates can be displayed in order
        this.setState({
            sortedCandidates,
            resultsCandidateIndex
        });
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
        // dismissed > any hiring stage
        if (candA.isDismissed && candB.isDismissed) { return 0; }
        else if (candA.isDismissed) { return 1; }
        else if (candB.isDismissed) { return -1; }
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


    // escape out of a results page if escape button pressed
    handleKeyPress(e) {
        // only do any of these actions if the results popover is showing
        if (!this.state.showResults) { return; }
        // get the code of the key that was pressed
        var key = e.which || e.keyCode;
        // if escape key was pressed ...
        if (key === 27) {
            // ... get rid of the results popover
            this.exitResults();
        }
        // if right key was pressed ...
        else if (key === 39) {
            // go to the next candidate's results
            this.nextPreviousResults(true)
        }
        // if the left key was pressed ...
        else if (key === 37) {
            // go to the previous candidate's results
            this.nextPreviousResults(false);
        }
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
            <div key={`${candidateId}stars`}>
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
        // set the new interest level
        candidates[candIndex].interest = interest;
        // set as reviewed if wasn't already
        candidates[candIndex].reviewed = true;
        this.setState({ candidates });
    }


    // create the dropdown for a candidate's hiring stage
    makeHiringStage(candidateId, hiringStage, isDismissed) {
        const stageNames = ["Not Contacted", "Contacted", "Interviewing", "Offered", "Hired", "Dismissed"];
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
                    root: "selectRootWhite myCandidatesSelect",
                    icon: "selectIconWhiteImportant"
                }}
                value={hiringStage}
                onChange={this.handleChangeHiringStage(candidateId)}
                key={`${candidateId}hiringStage`}
            >
                { stages }
            </Select>
        );
    }


    // change a candidate's hiring stage
    hiringStageChange(candidateId, hiringStage) {
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
        // set as reviewed if wasn't already
        candidates[candIndex].reviewed = true;
        // make the changes visible
        this.setState({ candidates });
    }


    // handle a click on a hiring stage
    handleChangeHiringStage = candidateId => event => {
        const hiringStage = event.target.value;
        this.hiringStageChange(candidateId, hiringStage);
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
            } else if (moveTo === "Non-Favorites") {
                // if out of favorites, value of favorite will be false
                property = "favorite";
                value = false;
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
        if (["Reviewed", "Not Reviewed", "Favorites", "Non-Favorites"].includes(moveTo)) {
            this.moveCandidates(moveTo);
        }
    }


    // record that the user has seen the information box at the top of the screen
    seeInfoBox() {
        this.props.sawMyCandidatesInfoBox(this.props.currentUser._id, this.props.currentUser.verificationToken);
    }


    // gets the qualifier for a score and tells the user the candidate hasn't finished
    // if that is the case
    getQualifier(score, type) {
        const qualifier = qualifierFromScore(score, type);
        if (qualifier === "N/A") {
            return (
                <div>
                    <div>{ "N/A" }</div>
                    <HoverTip text="Candidate has not finished the evaluation." />
                </div>
            )
        } else {
            return qualifier;
        }
    }


    // takes a score, makes sure it is actually a score, and rounds it
    makePretty(score) {
        // if the candidate doesn't have a score, tell the user that this doesn't apply
        if (score === undefined || score === null) {
            return (
                <div>
                    <div>{ "N/A" }</div>
                    <HoverTip text="Candidate has not finished the evaluation." />
                </div>
            );
        }
        // return a rounded version of the score
        return Math.round(score);
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
                <div key="candidatesTable">
                    <CircularProgress color="#76defe" style={style.noCandidatesMessage} />
                </div>
            )
        }

        else if (this.state.noPositions) {
            return (
                <div key="no open evals">
                    Your business has no open evaluations.<br/>
                    Contact us at support@moonshotinsights.io to get your first one set up.
                </div>
            );
        }
        else if (this.state.position == "" && !this.state.loadingPositions) {
            return (
                <div style={style.noCandidatesMessage} key="select a position">
                    Select a position.
                </div>
            );
        }
        else if (this.state.candidates.length === 0) {
            return (
                <div style={style.noCandidatesMessage} key="no candidates started">
                    <div className="marginBottom15px font32px font28pxUnder500 clickable primary-cyan" onClick={this.openAddUserModal.bind(this)}>
                        + <span className="underline">Add Candidates</span>
                    </div>
                    No candidates have started this evaluation.
                    <div className="marginTop15px" style={{color: "rgba(255,255,255,.8)"}}>
                        Add them <span className="clickable underline primary-cyan" onClick={this.openAddUserModal.bind(this)}>here</span> so they can get started.
                    </div>
                </div>
            )
        }
        // if there are candidates in this position, but none meet the criteria
        else if (this.state.sortedCandidates.length === 0) {
            const noCandidatesClass = this.state.showResults ? "resultsOpenNoCandidates" : "";
            return (
                <div
                    style={style.noCandidatesMessage}
                    className={noCandidatesClass}
                    key="none meet criteria"
                >
                    No candidates meet these criteria.
                </div>
            )
        }

        // there are candidates that meet these criteria, make them
        let candidateRows = [];

        // the position of the candidate within the sorted/filtered candidates array
        candidateRows = this.state.sortedCandidates.map(candidate => {
            const isSelected = this.state.resultsCandidateId === candidate._id;
            let score = null;
            let predicted = null;
            let skill = null;
            if (typeof candidate.scores === "object") {
                if (candidate.scores.overall) { score = candidate.scores.overall; }
                if (candidate.scores.predicted) { predicted = candidate.scores.predicted; }
                if (candidate.scores.skill) { skill = candidate.scores.skill; }
            }

            // mobile view
            if (this.state.mobile) {
                return (
                    <tr className={"mobileCandidate"  + (isSelected ? " selected" : "")} key={candidate._id}>
                        <td>
                            <div
                                style={{marginBottom: "8px"}}
                                onClick={() => this.showResults(candidate._id)}
                                className="pointer"
                            >
                                <span className={candidate.reviewed ? "secondary-gray" : "bold"}>{candidate.name}</span>
                            </div>
                            <br/>
                            <div className="interest">
                                {this.makeStars(candidate._id, candidate.interest)}
                            </div>
                            <div className="stage">
                                {this.makeHiringStage(candidate._id, candidate.hiringStage, candidate.isDismissed)}
                            </div>
                            <br/><div style={{height:"8px",display:"block"}}/>
                            <div className="predicted">
                                {"Predicted"}<br/>
                                {this.getQualifier(predicted, "predicted")}
                            </div>
                            <div className={"score"}>
                                {"Score"}<br/>
                                {this.makePretty(score)}
                            </div>
                            <div className="skill">
                                {"Skill"}<br/>
                                {this.getQualifier(skill, "skill")}
                            </div>
                        </td>
                    </tr>
                )
            }

            // desktop view
            return (
                <tr className={"candidate"  + (isSelected ? " selected" : "")} key={candidate._id}>
                    <td className="selectCandidateBox inlineBlock">
                        <div className="checkbox smallCheckbox whiteCheckbox" onClick={() => this.handleSelectCandidate(candidate._id)}>
                            <img
                                alt="Checkmark icon"
                                className={"checkMark" + !!this.state.selectedCandidates[candidate._id]}
                                src={"/icons/CheckMarkRoundedWhite" + this.props.png}
                            />
                        </div>
                    </td>
                    <td className={"name pointer"} onClick={() => this.showResults(candidate._id)}>
                        <span className={candidate.reviewed ? "secondary-gray" : "bold"}>{candidate.name}</span>
                    </td>
                    <td className={"score"}>
                        {this.makePretty(score)}
                    </td>
                    <td className="interest">
                        {this.makeStars(candidate._id, candidate.interest)}
                    </td>
                    <td className="stage">
                        {this.makeHiringStage(candidate._id, candidate.hiringStage, candidate.isDismissed)}
                    </td>
                    <td className="predicted">
                        {this.makePretty(predicted)}
                    </td>
                    <td className="skill">
                        {this.makePretty(skill)}
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
        );


        // add in the column headers on desktop view
        if (!this.state.mobile) {
            candidateRows.unshift(
                <tr className="candidate" key={`tableHeaders`}>
                    { headers }
                </tr>
            );
        }

        return (
            <table className="candidateTable" key="candidateTable"><tbody>
                {candidateRows}
            </tbody></table>
        );
    }


    // show a candidate's results
    showResults(candidateId) {
        let candidateIndex = this.state.sortedCandidates.findIndex(candidate => {
            return candidate._id === candidateId;
        });
        if (candidateIndex < 0) { candidateIndex = undefined; }
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
                    key={`${tabName}tab`}
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
                    root: "position-select-root selectRootWhite myCandidatesSelect",
                    icon: "selectIconWhiteImportant"
                }}
                value={this.state.position}
                onChange={this.handlePositionChange}
                key="position selector"
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
                <div className="center" key="info box">
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


        let menuItems = ["Reviewed", "Not Reviewed", "Favorites", "Non-Favorites"].map(menuItem => {
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
                root: "myCandidatesSelect" + colorClass,
                icon: selectionsExist ? "selectIconWhiteImportant" : "selectIconGrayImportant"
            },
            value: "Move To",
            onChange: this.handleMoveTo
        };

        return (
            <div className="topOptions" key="top options">
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
                {/*<div className={"inlineBlock" + colorClass + cursorClass}>
                    {"Contact"}
                </div>*/}
                <div className="inlineBlock">
                    <div className="checkbox smallCheckbox whiteCheckbox" onClick={() => this.handleCheckMarkClick("hideDismissed")}>
                        <img
                            alt="Checkmark icon"
                            className={"checkMark" + this.state.hideDismissed}
                            src={"/icons/CheckMarkRoundedWhite" + this.props.png}
                        />
                    </div>
                    <div className="inlineBlock">
                        {"Hide "}<i>{"Dismissed"}</i><span className="above1000only">{" Candidates"}</span>
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
                        {"Hide "}<i>{"Hired"}</i><span className="above1000only">{" Candidates"}</span>
                    </div><br/>
                </div>
            </div>
        );
    }


    mobileTopOptions() {
        return (
            <div>
                <div className="mobile-top-options">
                    { this.positionSelector() }
                    { this.mobileSortByDropdown() }
                </div>
                <div
                    className="add-candidate primary-cyan pointer font16px font14pxUnder500 font12pxUnder400"
                    onClick={this.props.openAddUserModal}
                >
                    + <span className="underline">Add Candidate</span>
                </div>
            </div>
        );
    }


    // lets you choose the filters for the candidates you see on mobile
    mobileSortByDropdown() {
        let sortItems = ["Name", "Score", "Interest", "Stage", "Predicted", "Skill"].map(sortTerm => {
            const lowercaseSortTerm = sortTerm.toLowerCase();
            return (
                <MenuItem
                    value={lowercaseSortTerm}
                    key={`position${sortTerm}`}
                    classes={{
                        root: "default-select-root",
                        selected: "default-select-selected"
                    }}
                >
                    { sortTerm }
                    <UpDownArrows
                        selected={this.state.sortBy===lowercaseSortTerm}
                        sortAscending={this.state.sortAscending}
                        style={{marginLeft: "12px"}}
                    />
                </MenuItem>
            );
        });
        // add the item that says Sort By
        sortItems.unshift(
            <MenuItem
                disabled
                value={"sort by"}
                key={"candidates mobile sort by"}
            >
                { "Sort By" }
            </MenuItem>
        );

        return (
            <Select
                disableUnderline={true}
                classes={{
                    root: "selectRootWhite myCandidatesSelect",
                    icon: "selectIconWhiteImportant"
                }}
                className="bigBamBoom"
                value={"sort by"}
                onChange={this.handleMobileSortByChange}
                key="sort selector"
            >
                { sortItems }
            </Select>
        );
    }


    // handle a click on a hiring stage
    handleMobileSortByChange = event => {
        const sortTerm = event.target.value;
        if (sortTerm !== "sort by") {
            this.handleSortByChange(sortTerm)
        }
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
        this.setState({
            showResults: false,
            fullScreenResults: false,
            resultsCandidateId: undefined,
            resultsCandidateIndex: undefined
        });
    }


    // go to the next or previous candidate
    nextPreviousResults(next) {
        if (!this.state.showResults) { return; }

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
        const currentUser = this.props.currentUser;
        let positionId = this.state.positionId;

        const tabs = (
            <div className="center" style={{position:"relative", marginTop:"10px"}}>
                <div className="myCandidatesTabs">
                    { this.tabParts() }
                </div>
            </div>
        );

        const resultsWidthClass = this.state.fullScreenResults ? "fullScreen" : "halfScreen";
        const candidateResultsClass = "candidateResults " + resultsWidthClass;
        const leftArrowContainerClass = "left arrowContainer " + resultsWidthClass;
        const rightArrowContainerClass = "right arrowContainer " + resultsWidthClass;
        // if the candidate is at the top of the list or not in the current list, disable the left arrow
        const leftArrowClass = "left circleArrowIcon" + (typeof this.state.resultsCandidateIndex === "number" && this.state.resultsCandidateIndex > 0 ? "" : " disabled");
        // if the candidate is in the list but is the last candidate OR if there
        // are no candidates that meet the criteria, disable the right button
        const rightArrowClass = "right circleArrowIcon" + (this.state.sortedCandidates.length === 0 || (typeof this.state.resultsCandidateIndex === "number" && this.state.resultsCandidateIndex >= this.state.sortedCandidates.length - 1) ? " disabled" : "");
        // adds a 'mobile' class if on mobile
        const mobileClass = this.state.mobile ? " mobile" : ""

        return (
            <div className={"jsxWrapper blackBackground fillScreen myCandidates primary-white" + mobileClass} style={{paddingBottom: "20px"}} ref='myCandidates'>
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
                        {this.state.mobile ? null :
                            <div className="my-candidates-position-selector">
                                { this.positionSelector() }
                                <br/>
                                <div
                                    className="add-candidate primary-cyan pointer"
                                    onClick={this.props.openAddUserModal}
                                >
                                    + <span className="underline">Add Candidate</span>
                                </div>
                            </div>
                        }
                        { this.state.mobile ? this.mobileTopOptions() : this.topOptions() }
                        <div className="candidatesContainer">
                            <div>
                                { this.createCandidatesTable(positionId) }
                            </div>
                            { this.state.showResults ?
                                <div>
                                    <CandidateResults
                                        className={candidateResultsClass}
                                        candidateId={this.state.resultsCandidateId}
                                        positionId={this.state.positionId}
                                        toggleFullScreen={this.toggleFullScreen.bind(this)}
                                        exitResults={this.exitResults.bind(this)}
                                        rateInterest={this.rateInterest.bind(this)}
                                        hiringStageChange={this.hiringStageChange.bind(this)}
                                        fullScreen={this.state.fullScreenResults}
                                        mobile={this.state.mobile}
                                        interest={this.state.interest}
                                    />
                                    <div className={leftArrowContainerClass} onClick={() => this.nextPreviousResults(false)}>
                                        <div className={leftArrowClass} />
                                    </div>
                                    <div className={rightArrowContainerClass} onClick={() => this.nextPreviousResults(true)}>
                                        <div className={rightArrowClass} />
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
    "Not Contacted": 1,
    "Contacted": 2,
    "Interviewing": 3,
    "Offered": 4,
    "Hired": 5,
    "Dismissed": 6
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
