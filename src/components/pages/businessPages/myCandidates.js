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
import axios from 'axios';
import CandidatePreview from '../../childComponents/candidatePreview';
import styles from '../../../../public/styles';

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
        }

        this.state = {
            searchTerm: "",
            hiringStage: "",
            pathway: "",
            candidates: [emptyCandidate],
            pathways: []
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
            .then(function(res) {
                self.setState({
                    pathways: res.data
                });
            })
            .catch(function(err) {
                console.log("error getting pathways: ", err);
            });

        // populate initial candidates
        this.search();
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


    render() {
        const style = {
            separator1: {
                width: "70%",
                margin: "12px auto 0px",
                position: "relative",
                height: "40px",
                textAlign: "center"
            },
            separatorLineLeft: {
                left: 0,
                width: "calc(50% - 85px);",
                height: "3px",
                backgroundColor: "white",
                position: "absolute",
                top: "12px"
            },
            separatorLineRight: {
                right: 0,
                width: "calc(50% - 85px);",
                height: "3px",
                backgroundColor: "white",
                position: "absolute",
                top: "12px"
            },
            separatorText1: {
                padding: "0px 40px",
                backgroundColor: "transparent",
                display: "inline-block",
                position: "relative",
                fontSize: "23px",
                color: "white"
            },
            separator: {
                width: "70%",
                margin: "25px auto 0px",
                position: "relative",
                height: "40px",
                textAlign: "center"
            },
            separatorText: {
                padding: "0px 40px",
                backgroundColor: "white",
                display: "inline-block",
                position: "relative",
                fontSize: "23px",
                color: "#b37bfe"
            },
            separatorLine: {
                width: "100%",
                height: "3px",
                backgroundColor: "#b37bfe",
                position: "absolute",
                top: "12px"
            },
            searchBar: {
                width: "80%",
                margin: "auto",
                marginTop: "0px",
                marginBottom: "30px"
            }
        }

        // create the pathway previews
        let key = 0;
        let self = this;
        const candidatePreviews = this.state.candidates.map(function (candidate) {
            key++;

            return (
                <li style={{marginTop: '15px'}}
                    key={key}
                >
                    <CandidatePreview
                        editHiringStage={true}
                        name={candidate.name}
                        email={candidate.email}
                    />
                </li>
            );
        });

        const hiringStages = ["Not Contacted", "Contacted", "Interviewing", "Hired", "Dismissed"];
        const hiringStageItems = hiringStages.map(function (hiringStage) {
            return <MenuItem value={hiringStage} primaryText={hiringStage} key={hiringStage}/>
        })

        // TODO get companies from DB
        const pathways = this.state.pathways;
        const pathwayItems = pathways.map(function (pathway) {
            return <MenuItem value={pathway} primaryText={pathway} key={pathway}/>
        })


        return (
            <div className={"jsxWrapper"} ref='myCandidates'>
                <div style={style.separator}>
                    <div style={style.separatorLine}/>
                    <div style={style.separatorText}>
                        My Candidates
                    </div>
                </div>

                <Toolbar style={style.searchBar} id="discoverSearchBarWideScreen">
                    <ToolbarGroup>
                        <Field
                            name="search"
                            component={renderTextField}
                            label="Search"
                            onChange={event => this.onSearchChange(event.target.value)}
                            value={this.state.searchTerm}
                        />
                    </ToolbarGroup>

                    <ToolbarGroup>
                        <DropDownMenu value={this.state.hiringStage}
                                      onChange={this.handleHiringStageChange}
                                      underlineStyle={styles.underlineStyle}
                                      anchorOrigin={styles.anchorOrigin}
                                      style={{fontSize: "20px", marginTop: "11px"}}
                        >
                            <MenuItem value={""} primaryText="Hiring Stage"/>
                            <Divider/>
                            {hiringStageItems}
                        </DropDownMenu>
                        <DropDownMenu value={this.state.pathway}
                                      onChange={this.handlePathwayChange}
                                      underlineStyle={styles.underlineStyle}
                                      anchorOrigin={styles.anchorOrigin}
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
                        component={renderTextField}
                        label="Search"
                        onChange={event => this.onSearchChange(event.target.value)}
                        value={this.state.searchTerm}
                    />

                    <br/>

                    <DropDownMenu value={this.state.hiringStage}
                                  onChange={this.handleHiringStageChange}
                                  underlineStyle={styles.underlineStyle}
                                  anchorOrigin={styles.anchorOrigin}
                                  style={{fontSize: "20px", marginTop: "11px"}}
                    >
                        <MenuItem value={""} primaryText="Hiring Stage"/>
                        <Divider/>
                        {hiringStageItems}
                    </DropDownMenu>
                    <div><br/></div>
                    <DropDownMenu value={this.state.pathway}
                                  onChange={this.handlePathwayChange}
                                  underlineStyle={styles.underlineStyle}
                                  anchorOrigin={styles.anchorOrigin}
                                  style={{fontSize: "20px", marginTop: "11px"}}
                    >
                        <MenuItem value={""} primaryText="Pathway"/>
                        <Divider/>
                        {pathwayItems}
                    </DropDownMenu>
                </div>


                <div>
                    <ul className="center" id="aboutMeAreas">
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
