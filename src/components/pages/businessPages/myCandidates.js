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
    Tabs,
    Tab
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
            position: "",
            sortBy: "",
            sortAscending: true,
            hideDismissed: false,
            hideHired: false,
            candidates: [],
            positions: [],
            tab: "All",
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

    onSearchChange(term) {
        this.setState({...this.state, term: term}, () => {
            if (term !== undefined) {
                this.search();
            }
        });
    }

    handlePositionChange = (event, index, position) => {
        this.setState({position, candidates: [], noCandidates: false}, this.search);
    };

    handleSortByChange = (event, index, sortBy) => {
        // if the user is changing the sort by value
        if (this.state.sortBy !== sortBy) {
            this.setState({ sortBy }, this.search);
        }
        // if the user is flipping the direction of the sort
        else {
            this.setState({ sortAscending: !this.state.sortAscending }, this.search);
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

    handleTabChange = (tab) => {
        // only switch tabs and re-search if not on the tab that should be switched to
        if (this.state.tab !== tab) {
            this.setState({tab}. this.search);
        }
    }


    // change hide dismissed or hide hired
    handleCheckMarkClick(checkMarkField) {
        let state = JSON.parse(JSON.stringify(this.state));
        state[checkMarkField] = !state[checkMarkField];
        this.setState(state, this.reorder);
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

        let candidateLis = [];

        if (this.state.candidates.length !== 0) {
            candidateLis = this.state.candidates.map(candidate => {
                return (
                    <li>
                        {candidate.name}
                    </li>
                );
            })
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
                <Tab label="Reviewed" value="Reviewed" style={{color:"white"}} />
                <Tab label="Not Reviewed" value="Not Reviewed" style={{color:"white"}} />
            </Tabs>
        );

        // the top options such as search and hide hired candidates
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
                    {"Move to Not Reviewed"}
                </div>
                <div className="inlineBlock">
                    <div className="checkbox smallCheckbox whiteCheckbox" onClick={() => this.handleCheckMarkClick("hideDismissed")}>
                        <img
                            alt="Checkmark icon"
                            className={"checkMark" + this.state.keepMeLoggedIn}
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
                            className={"checkMark" + this.state.keepMeLoggedIn}
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
        currentUser: state.users.currentUser,
        png: state.users.png
    };
}

MyCandidates = reduxForm({
    form: 'myCandidates',
})(MyCandidates);

export default connect(mapStateToProps, mapDispatchToProps)(MyCandidates);
