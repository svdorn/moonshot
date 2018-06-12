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

        this.state = {
            searchTerm: "",
            status: "",
            position: "",
            employees: [],
            questions: [],
            positions: [],
            // true if the business has no positions associated with it
            noPositions: false
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
                console.log(response.data);
                const questions = response.data.employeeQuestions;
                console.log(questions);
                self.setState({
                    positions: positions,
                    position: firstPositionName,
                    questions: questions,
                    noPositions: noPositions
                },
                // search for candidates of first position
                self.search
            );
            })
            .catch(function(err) {
                console.log("error getting the employee questions: ", err);
            })
        })
        .catch (function(error) {
            console.log("error getting the positions: ", error);
        })
            // let employeeData = res.data;
            // if (Array.isArray(employeeData.employees) && employeeData.employees.length > 0) {
            //     self.setState({
            //         employees: employeeData.employees,
            //         questions: employeeData.employeeQuestions
            //     })
            // } else {
            //     self.setState({
            //         noEmployees: true,
            //         questions: employeeData.employeeQuestions
            //     })
            // }
    }

    search() {
        // need a position to search for
        if (!this.state.noPositions && this.state.position) {
            axios.get("/api/business/candidateSearch", {
                params: {
                    searchTerm: this.state.term,
                    // searching by position name right now, could search by id if want to
                    positionName: this.state.position,
                    userId: this.props.currentUser._id,
                    status: this.state.status,
                    verificationToken: this.props.currentUser.verificationToken
                }
            }).then(res => {
                console.log("res.data: ", res.data);
                // make sure component is mounted before changing state
                if (this.refs.myEmployees) {
                    this.setState({ employees: res.data });
                }
            }).catch(function (err) {
                console.log("ERROR with Employee search: ", err);
            })
        }
    }

    onSearchChange(term) {
        // this.setState({...this.state, term: term}, () => {
        //     if (term !== undefined) {
        //     }
        // });
    }

    handleStageChange = (event, index, stage) => {
        // this.setState({stage}, () => {
        //     this.search();
        // })
    };

    handlePositionChange = (event, index, position) => {
        this.setState({position})
        // this.setState({position}, () => {
        //     this.search();
        // })
    };

    render() {
        console.log("state: ", this.state);
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

        const stages = ["Complete", "Incomplete"];
        const stageItems = stages.map(function (stage) {
            return <MenuItem value={stage} primaryText={stage} key={stage}/>
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
                                      onChange={this.handleStageChange}
                                      labelStyle={style.menuLabelStyle}
                                      anchorOrigin={style.anchorOrigin}
                                      style={{fontSize: "20px", marginTop: "11px"}}
                        >
                            <MenuItem value={""} primaryText="Status"/>
                            <Divider/>
                            {stageItems}
                        </DropDownMenu>
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
                                  onChange={this.handleStageChange}
                                  labelStyle={style.menuLabelStyle}
                                  anchorOrigin={style.anchorOrigin}
                                  style={{fontSize: "20px", marginTop: "11px"}}
                    >
                        <MenuItem value={""} primaryText="Stage"/>
                        <Divider/>
                        {stageItems}
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

        // create the employee previews
        let key = 0;
        let self = this;

        if (this.state.employees.length !== 0) {
            employeePreviews = this.state.employees.map(employee => {
                key++;

                return (
                    <li style={{marginTop: '15px'}}
                        key={key}
                    >
                        <EmployeePreview
                            gradingComplete={employee.gradingComplete}
                            answers={employee.answers}
                            name={employee.name}
                            employeeId={employee.employeeId}
                            employeeUrl={employee.employeeUrl}
                            questions={this.state.questions}
                        />
                    </li>
                );
            });

        }

        return (
            <div className="jsxWrapper blackBackground fillScreen" style={{paddingBottom: "20px"}} ref='myCandidates'>
                <AddUserDialog />
                <MetaTags>
                    <title>My Employees | Moonshot</title>
                    <meta name="description" content="Grade your employees and see their results."/>
                </MetaTags>
                <div className="employerHeader"/>
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
