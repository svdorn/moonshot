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
            quesions: [],
            positions: [],
            // true if the business has no positions associated with it
            noEmployees: false
        }
    }

    componentDidMount() {
        let self = this;
        axios.get("/api/business/employees", {
            params: {
                userId: this.props.currentUser._id,
                verificationToken: this.props.currentUser.verificationToken
            }
        })
        .then(function (res) {
            let employeeData = res.data;
            if (Array.isArray(employeeData.employees) && employeeData.employees.length > 0) {
                self.setState({
                    employees: employeeData.employees,
                    questions: employeeData.employeeQuestions
                })
            } else {
                self.setState({
                    noEmployees: true,
                    questions: employeeData.employeeQuestions
                })
            }
        })
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
        // this.setState({position}, () => {
        //     this.search();
        // })
    };

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

        const stages = ["Complete", "Incomplete"];
        const stageItems = stages.map(function (stage) {
            return <MenuItem value={stage} primaryText={stage} key={stage}/>
        })

        // TODO get companies from DB
        const positions = ["Financial Represenatative", "Web Developer"]
        const positionItems = positions.map(function (position) {
            return <MenuItem value={position} primaryText={position} key={position}/>
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
                    <ul className="horizCenteredList">
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
