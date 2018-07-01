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
import {openAddUserModal} from "../../../actions/usersActions";
import {Field, reduxForm} from 'redux-form';
import MetaTags from 'react-meta-tags';
import axios from 'axios';
import EmployeePreview from '../../childComponents/employeePreview';
import AddUserDialog from '../../childComponents/addUserDialog';

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
            status: "",
            position: "",
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
                    positionName: this.state.position,
                    userId: this.props.currentUser._id,
                    status: this.state.status,
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

    handleStatusChange = (event, index, status) => {
        this.setState({status, employees: [], noEmployees: false}, this.search);
    };

    handlePositionChange = (event, index, position) => {
        this.setState({position, employees: [], noEmployees: false}, this.search);
    };

    openAddUserModal() {
        this.props.openAddUserModal();
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
            return <MenuItem value={status} primaryText={status} key={status}/>
        })

        // TODO get companies from DB
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
                        <DropDownMenu value={this.state.status}
                                      onChange={this.handleStatusChange}
                                      labelStyle={style.menuLabelStyle}
                                      anchorOrigin={style.anchorOrigin}
                                      style={{fontSize: "20px", marginTop: "11px"}}
                        >
                            <MenuItem value={""} primaryText="Status"/>
                            <Divider/>
                            {statusItems}
                        </DropDownMenu>
                        <DropDownMenu value={this.state.position}
                                      onChange={this.handlePositionChange}
                                      labelStyle={style.menuLabelStyle}
                                      anchorOrigin={style.anchorOrigin}
                                      style={{fontSize: "20px", marginTop: "11px"}}
                        >
                            <MenuItem value="" primaryText="Position"/>
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

                    <DropDownMenu value={this.state.status}
                                  onChange={this.handleStatusChange}
                                  labelStyle={style.menuLabelStyle}
                                  anchorOrigin={style.anchorOrigin}
                                  style={{fontSize: "20px", marginTop: "11px"}}
                    >
                        <MenuItem value={""} primaryText="Stage"/>
                        <Divider/>
                        {statusItems}
                    </DropDownMenu>
                    <div><br/></div>
                    <DropDownMenu value={this.state.position}
                                  onChange={this.handlePositionChange}
                                  labelStyle={style.menuLabelStyle}
                                  anchorOrigin={style.anchorOrigin}
                                  style={{fontSize: "20px", marginTop: "11px"}}
                    >
                        <MenuItem value={""} primaryText="Position"/>
                        <Divider/>
                        {positionItems}
                    </DropDownMenu>
                </div>
            </div>
        );

        let employeePreviews = (
            <div className="center" style={{color: "rgba(255,255,255,.8)"}}>
                Loading employees...
            </div>
        )
        if (this.state.noEmployees) {
            if (this.state.status == "" && (this.state.term == "" || !this.state.term)) {
            employeePreviews = (
                <div className="center marginTop50px">
                <div className="marginBottom15px font32px font28pxUnder500 clickable blueTextHome" onClick={this.openAddUserModal.bind(this)}>
                    + <bdi className="underline">Add Employees</bdi>
                </div>
                <div className="center" style={{color: "rgba(255,255,255,.8)"}}>
                    No employees
                    {this.state.term ? <bdi> with the given search term</bdi> : null} for the {this.state.position} position
                    {(this.state.status == "Complete" || this.state.status == "Incomplete")
                    ? <bdi> with {this.state.status.toLowerCase()} status</bdi>
                    :null}.
                </div>
                <div className="marginTop15px" style={{color: "rgba(255,255,255,.8)"}}>
                    Add them <bdi className="clickable underline blueTextHome" onClick={this.openAddUserModal.bind(this)}>Here</bdi> so they can get started.
                </div>
                </div>
            );
            } else {
                employeePreviews = (
                    <div className="center" style={{color: "rgba(255,255,255,.8)"}}>
                        No employees
                        {this.state.term ? <bdi> with the given search term</bdi> : null} for the {this.state.position} position
                        {(this.state.status == "Complete" || this.state.status == "Incomplete")
                        ? <bdi> with {this.state.status.toLowerCase()} status</bdi>
                        :null}.
                    </div>
                );
            }
        }

        if (this.state.noPositions) {
            employeePreviews = (
                <div className="center" style={{color: "rgba(255,255,255,.8)"}}>
                    Create a position to select.
                </div>
            );
        }
        if (this.state.position == "" && this.state.loadingDone) {
            employeePreviews = (
                <div className="center" style={{color: "rgba(255,255,255,.8)"}}>
                    Must select a position.
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

        return (
            <div className="jsxWrapper blackBackground fillScreen" style={{paddingBottom: "20px"}} ref='myEmployees'>
                {this.props.currentUser.userType == "accountAdmin" ?
                    <AddUserDialog position={this.state.position} tab="Employee" />
                    : null
                }
                <MetaTags>
                    <title>My Employees | Moonshot</title>
                    <meta name="description" content="Grade your employees and see their results."/>
                </MetaTags>
                <div style={style.separator}>
                    <div style={style.separatorLine}/>
                    <div style={style.separatorText}>
                        My Employees
                    </div>
                </div>

                {searchBar}

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
        openAddUserModal
    }, dispatch);
}

function mapStateToProps(state) {
    return {
        currentUser: state.users.currentUser
    };
}

MyEmployees = reduxForm({
    form: 'myEmployees',
})(MyEmployees);

export default connect(mapStateToProps, mapDispatchToProps)(MyEmployees);
