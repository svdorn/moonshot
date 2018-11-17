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
import Select from '@material-ui/core/Select';
import SelectMenuItem from '@material-ui/core/MenuItem';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {browserHistory} from 'react-router';
import {openAddUserModal, hidePopups, openAddPositionModal} from "../../../actions/usersActions";
import {Field, reduxForm} from 'redux-form';
import MetaTags from 'react-meta-tags';
import axios from 'axios';
import EmployeePreview from '../../childComponents/employeePreview';
import AddUserDialog from '../../childComponents/addUserDialog';
import AddPositionDialog from '../../childComponents/addPositionDialog';
import HoverTip from "../../miscComponents/hoverTip";
import { button } from "../../../classes.js";

import './myEmployees.css';

const renderTextField = ({input, label, ...custom}) => (
    <TextField
        hintText={label}
        floatingLabelText={label}
        {...input}
        {...custom}
    />
);

class MyEmployees extends Component {
    constructor(props) {
        super(props);

        let positionNameFromUrl = props.location.query && props.location.query.position ? props.location.query.position : undefined;

        this.state = {
            searchTerm: "",
            status: "Status",
            position: "Position",
            positionNameFromUrl,
            employees: [],
            questions: [],
            positions: [],
            // true if the business has no positions associated with it
            noPositions: false,
            // true if the position has no employees associated with it
            noEmployees: false,
            loadingDone: false
        }
    }



    componentDidMount() {
        let self = this;

        axios.get("/api/business/positions", {
            params: {
                userId: self.props.currentUser._id,
                verificationToken: self.props.currentUser.verificationToken
            }
        })
        .then(function (res) {
            let positions = res.data.positions;
            let firstPositionName = "";
            let noPositions = false;
            if (Array.isArray(positions) && positions.length > 0) {
                // if the url gave us a position to select first, select that one
                // otherwise, select the first one available
                firstPositionName = positions[0].name;
                if (self.state.positionNameFromUrl && positions.some(position => {
                    return position.name === self.state.positionNameFromUrl;
                })) {
                    firstPositionName = self.state.positionNameFromUrl;
                }

                // select this position from the dropdown if it is valid
                if (firstPositionName) {
                    let selectedPosition = firstPositionName;
                }
            } else {
                noPositions = true;
            }

            axios.get("/api/business/employeeQuestions", {
                params: {
                    userId: self.props.currentUser._id,
                    verificationToken: self.props.currentUser.verificationToken
                }
            })
            .then (function (response) {
                const questions = response.data.employeeQuestions;
                self.setState({
                    positions: positions,
                    position: firstPositionName,
                    questions: questions,
                    noPositions: noPositions,
                    loadingDone: true
                },
                // search for candidates of first position
                self.search
            );
            })
            .catch(function(err) {
                // console.log("error getting the employee questions: ", err);
            })
        })
        .catch (function(error) {
            // console.log("error getting the positions: ", error);
        })
    }

    search() {
        // need a position to search for
        if (!this.state.noPositions && this.state.position) {
            axios.get("/api/business/employeeSearch", {
                params: {
                    searchTerm: this.state.term,
                    // searching by position name right now, could search by id if want to
                    positionName: this.state.position === "Position" ? "" : this.state.position,
                    userId: this.props.currentUser._id,
                    status: this.state.status === "Status" ? "" : this.state.status,
                    verificationToken: this.props.currentUser.verificationToken
                }
            }).then(res => {
                // make sure component is mounted before changing state
                if (this.refs.myEmployees) {
                    if (res.data && res.data.length > 0) {
                        this.setState({ employees: res.data, noEmployees: false });
                    } else {
                        this.setState({noEmployees: true, employees: []})
                    }
                }
            }).catch(function (err) {
                // console.log("ERROR with Employee search: ", err);
            })
        }
    }

    onSearchChange(term) {
        this.setState({...this.state, term: term}, () => {
            if (term !== undefined) {
                this.search();
            }
        });
    }

    // open the modal to add a new position
    openAddPositionModal = () => {
        this.props.openAddPositionModal();
    }

    handleStatusChange = event => {
        this.setState({status: event.target.value, employees: [], noEmployees: false}, this.search);
    };

    handlePositionChange = event => {
        this.setState({position: event.target.value, employees: [], noEmployees: false}, this.search);
    };

    openAddUserModal() {
        this.props.openAddUserModal();
    }

    hideMessage() {
        let popups = this.props.currentUser.popups;
        if (popups) {
            popups.employees = false;
        } else {
            popups = {};
            popups.employees = false;
        }

        const userId = this.props.currentUser._id;
        const verificationToken = this.props.currentUser.verificationToken;

        this.props.hidePopups(userId, verificationToken, popups);
    }

    popup() {
        if (this.props.currentUser && this.props.currentUser.popups && this.props.currentUser.popups.employees) {
            return (
                <div className="center" key="popup box">
                    <div className="popup-box font16px font14pxUnder700 font12pxUnder500">
                        <div className="popup-frame" style={{paddingBottom:"20px"}}>
                            <div>
                                <img
                                    alt="Alt"
                                    src={"/icons/employeesBanner" + this.props.png}
                                />
                            </div>
                            <div style={{marginTop:"20px"}}>
                                <div className="primary-cyan font20px font18pxUnder700 font16pxUnder500">Improve Your Predictive Model</div>
                                <div>
                                Invite employees to complete an evaluation and then complete a two-minute evaluation of each employee to
                                customize your predictive model and enable Longevity/tenure and Culture Fit predictions for your candidates.
                                </div>
                            </div>
                        </div>
                        <div className="hide-message font14px font12pxUnder700" onClick={this.hideMessage.bind(this)}>Hide Message</div>
                    </div>
                </div>
            );
        } else {
            return null;
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

        const statuses = ["Complete", "Incomplete"];
        const statusItems = statuses.map(function (status) {
            return <SelectMenuItem value={status} key={status}>{ status }</SelectMenuItem>
        })

        const positions = this.state.positions;
        const positionItems = positions.map(function (position) {
            return <SelectMenuItem value={position.name} key={position.name}>{ position.name }</SelectMenuItem>
        })

        // the hint that shows up when search bar is in focus
        const searchHintStyle = { color: "rgba(255, 255, 255, .3)" }
        const searchInputStyle = { color: "rgba(255, 255, 255, .8)" }

        const searchFloatingLabelFocusStyle = { color: "rgb(117, 220, 252)" }
        const searchFloatingLabelStyle = searchHintStyle;
        const searchUnderlineFocusStyle = searchFloatingLabelFocusStyle;

        const searchBar = (
            <div className="search-fields">
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

                    <ToolbarGroup style={{alignItems: "flex-end"}}>
                        <Select
                            disableUnderline={true}
                            classes={{
                                root: "position-select-root selectRootWhite",
                                icon: "selectIconWhiteImportant"
                            }}
                            value={this.state.status}
                            onChange={this.handleStatusChange}
                            key="status selector"
                            style={{marginRight:"30px"}}
                        >
                            <SelectMenuItem value={"Status"}>{"Status"}</SelectMenuItem>
                            <Divider/>
                            {statusItems}
                        </Select>

                        <Select
                            disableUnderline={true}
                            classes={{
                                root: "position-select-root selectRootWhite",
                                icon: "selectIconWhiteImportant"
                            }}
                            value={this.state.position}
                            onChange={this.handlePositionChange}
                            key="position selector"
                        >
                            <SelectMenuItem value="Position">{"Position"}</SelectMenuItem>
                            <Divider/>
                            {positionItems}
                        </Select>
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

                    <Select
                        disableUnderline={true}
                        classes={{
                            root: "position-select-root selectRootWhite",
                            icon: "selectIconWhiteImportant"
                        }}
                        value={this.state.status}
                        onChange={this.handleStatusChange}
                        key="status selector"
                    >
                        <SelectMenuItem value={"Status"}>{"Status"}</SelectMenuItem>
                        <Divider/>
                        {statusItems}
                    </Select>
                    <div><br/></div>
                    <Select
                        disableUnderline={true}
                        classes={{
                            root: "position-select-root selectRootWhite",
                            icon: "selectIconWhiteImportant"
                        }}
                        value={this.state.position}
                        onChange={this.handlePositionChange}
                        key="position selector"
                    >
                        <SelectMenuItem value="Position">{"Position"}</SelectMenuItem>
                        <Divider/>
                        {positionItems}
                    </Select>
                </div>
            </div>
        );

        let employeePreviews = (
            <div className="center employeesBox" style={{color: "rgba(255,255,255,.8)"}}>
                <div
                    className="add-employee primary-cyan pointer font16px center marginTop20px"
                    onClick={this.props.openAddUserModal}
                >
                    + <span className="underline">Add Employees</span>
                </div>
                Loading employees...
            </div>
        )
        if (this.state.noEmployees) {
            employeePreviews = (
                <div className="center secondary-gray employeesBox">
                    <div className="marginTop20px marginBottom15px font32px font28pxUnder500 clickable primary-cyan" onClick={this.props.openAddUserModal}>
                        + <span className="underline">Add Employees</span>
                    </div>
                    Improve your predictive model with employee data.
                    <div className="marginTop15px" style={{color: "rgba(255,255,255,.8)"}}>
                        Add employees <span className="clickable underline primary-cyan" onClick={this.props.openAddUserModal}>here</span> so they can get started.
                        <div className="info-hoverable">i</div>
                        <HoverTip
                            className="font12px secondary-gray"
                            style={{marginTop: "18px", marginLeft: "-6px"}}
                            text="Employees complete a 22-minute evaluation and their manager completes a two-minute evaluation of the employee to improve predictions. Enable Longevity and Culture Fit predictions for candidates after 16 employee evaluations."
                        />
                    </div>
                </div>
            )
        }

        if (this.state.position == "" && this.state.loadingDone) {
            employeePreviews = (
                <div className="center employeesBox" style={{color: "rgba(255,255,255,.8)"}}>
                    <div
                        className="add-employee primary-cyan pointer font16px center marginTop20px"
                        onClick={this.props.openAddUserModal}
                    >
                        + <span className="underline">Add Employees</span>
                    </div>
                    Must select a position.
                </div>
            );
        }
        if (this.state.noPositions) {
            employeePreviews = (
                <div className="center employeesBox" style={{color: "rgba(255,255,255,.8)"}}>
                    <div
                        className="add-employee primary-cyan pointer font16px center marginTop20px"
                        onClick={this.props.openAddUserModal}
                    >
                        + <span className="underline">Add Employees</span>
                    </div>
                    <div className="marginTop10px">
                        Create a position to select.
                    </div>
                    <div
                        className={
                            "primary-white font18px font16pxUnder900 font14pxUnder600 marginTop20px " +
                            button.cyanRound
                        }
                        onClick={this.openAddPositionModal}
                    >
                        + Add Position
                    </div>
                </div>
            );
        }

        let self = this;

        // find the id of the currently selected position
        let positionId = "";
        try {
            positionId = this.state.positions.find(pos => {
                return pos.name === this.state.position;
            })._id;
        } catch (getPosIdErr) { /* probably just haven't chosen a position yet */ }

        // create the employee previews
        let key = 0;
        if (this.state.employees.length !== 0) {
            employeePreviews = this.state.employees.map(employee => {
                key++;

                const score = employee.scores && employee.scores.overall ? employee.scores.overall : undefined;

                return (
                    <li style={{marginTop: '15px'}}
                        key={key}
                    >
                        <EmployeePreview
                            gradingComplete={employee.gradingComplete}
                            answers={employee.answers}
                            name={employee.name}
                            score={score}
                            employeeId={employee._id}
                            profileUrl={employee.profileUrl}
                            questions={this.state.questions}
                            position={this.state.position}
                            positionId={positionId}
                        />
                    </li>
                );
            });

        }

        const blurredClass = this.props.blurModal ? "dialogForBizOverlay" : "";

        return (
            <div className={"jsxWrapper blackBackground fillScreen my-employees " + blurredClass} style={{paddingBottom: "20px"}} ref='myEmployees'>
                {this.props.currentUser.userType == "accountAdmin" ?
                    <AddUserDialog position={this.state.position} tab="Employee" />
                    : null
                }
                <MetaTags>
                    <title>My Employees | Moonshot</title>
                    <meta name="description" content="Grade your employees and see their results."/>
                </MetaTags>

                <AddPositionDialog />

                <div className="page-line-header"><div/><div>Employees</div></div>

                { this.popup() }

                { searchBar }

                <div>
                    <ul className="horizCenteredList myEmployeesWidth">
                        {employeePreviews}
                    </ul>
                </div>

            </div>
        );
    }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        openAddUserModal,
        hidePopups,
        openAddPositionModal
    }, dispatch);
}

function mapStateToProps(state) {
    return {
        currentUser: state.users.currentUser,
        loading: state.users.loadingSomething,
        png: state.users.png,
        blurModal: state.users.lockedAccountModal
    };
}

MyEmployees = reduxForm({
    form: 'myEmployees',
})(MyEmployees);

export default connect(mapStateToProps, mapDispatchToProps)(MyEmployees);
