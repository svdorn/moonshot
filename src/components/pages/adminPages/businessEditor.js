"use strict"
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { browserHistory } from 'react-router';
import { addNotification } from "../../../actions/usersActions";
import { bindActionCreators } from 'redux';
import { CircularProgress, RaisedButton, DropDownMenu, MenuItem } from 'material-ui';
import axios from 'axios';


class BusinessEditor extends Component {
    constructor(props) {
        super(props);

        this.state = {
            loading: true,
            saving: false,
            allSkills: [],
            error: false
        };
    }


    componentDidMount() {
        const self = this;
        // get the business id from the url
        const businessId = self.props.params.businessId;

        // get every skill
        axios.get("/api/admin/allSkills", {
            params: {
                userId: self.props.currentUser._id,
                verificationToken: self.props.currentUser.verificationToken
            }
        })
        .then(response => {
            console.log("allSkills: ", response.data);
            self.setState({ allSkills: response.data });
        })
        .catch(error => {
            console.log("error: ", error);
            self.props.addNotification("Error getting skills.", "error");
        });

        // if user is creating a new business
        if (businessId === "new") {
            self.setState({
                business: {
                    name: "",
                    positions: []
                },
                loading: false
            })
        }

        // if user is editing an existing business
        else {
            // get the business
            axios.get("/api/admin/business", {params:
                {
                    userId: self.props.currentUser._id,
                    verificationToken: self.props.currentUser.verificationToken,
                    businessId
                }
            })
            .then(response => {
                // map the business to the format this page expects
                let business = response.data;

                console.log(business);

                self.setState({ business, loading: false });
            })
            .catch(error => {
                console.log("Error getting business: ", error);
                self.setState({ loading: false, error: true });
                self.props.addNotification("Error getting business.", "error")
            })
        }
    }


    goTo(route) {
        // goes to the wanted page
        browserHistory.push(route);
        // goes to the top of the new page
        window.scrollTo(0, 0);
    }


    handleSubmit(e) {
        e.preventDefault();

        const self = this;

        // set save-loading spinner to go
        this.setState({ saving: true });

        // TODO: make sure to make all of the facet scores into numbers


        // axios.post("/api/admin/saveBusiness", {
        //     userId: this.props.currentUser._id,
        //     verificationToken: this.props.currentUser.verificationToken,
        //     business: this.state.business
        // })
        // .then(response => {
        //     self.setState({ saving: false }, () => {
        //         // go to the new/updated business's edit page
        //         self.goTo(`/admin/businessEditor/${response.data._id}`);
        //     })
        // })
        // .catch(error => {
        //     console.log("error updating business: ", error);
        //     self.props.addNotification("Error updating business.", "error");
        // })
    }


    nameChange(e) {
        let business = Object.assign({}, this.state.business);
        business.name = e.target.value;
        this.setState({ business });
    }


    addPosition() {
        let business = Object.assign({}, this.state.business);
        // business.positions.push({
        //
        // })
        this.setState({ business });
    }


    positionNameChange(e, positionIndex) {
        let business = Object.assign({}, this.state.business);
        business.positions[positionIndex].name = e.target.value;
        this.setState({ business });
    }


    handleSkillChange(e, index, allSkillsIndex, positionIndex, currentSkillIndex) {
        let business = Object.assign({}, this.state.business);
        business.positions[positionIndex].skills[currentSkillIndex] = this.state.allSkills[allSkillsIndex]._id;
        business.positions[positionIndex].skillNames[currentSkillIndex] = this.state.allSkills[allSkillsIndex].name;
        this.setState({ business });
    }


    frqChange(e, positionIndex, frqIndex) {
        let business = Object.assign({}, this.state.business);
        business.positions[positionIndex].freeResponseQuestions[frqIndex] = e.target.value;
        this.setState({ business });
    }


    handleFrqRequiredChange(positionIndex, frqIndex) {
        let business = Object.assign({}, this.state.business);
        // flip the required status
        business.positions[positionIndex].freeResponseQuestions[frqIndex].required = !business.positions[positionIndex].freeResponseQuestions[frqIndex].required;
        this.setState({ business });
    }


    handleEmployeeFrqsChange(positionIndex) {
        let business = Object.assign({}, this.state.business);
        // flip the required status
        business.positions[positionIndex].employeesGetFrqs = !business.positions[positionIndex].employeesGetFrqs;
        this.setState({ business });
    }


    lengthChange(e, positionIndex) {
        let business = Object.assign({}, this.state.business);
        const parsed = parseInt(e.target.value, 10);
        business.positions[positionIndex].length = isNaN(parsed) ? 0 : parsed;
        this.setState({ business });
    }


    timeAllottedChange(e, positionIndex) {
        let business = Object.assign({}, this.state.business);
        const parsed = parseInt(e.target.value, 10);
        business.positions[positionIndex].timeAllotted = isNaN(parsed) ? 0 : parsed;
        this.setState({ business });
    }


    idealFacetChange(e, positionIndex, factorIndex, facetIndex) {
        let business = Object.assign({}, this.state.business);
        business.positions[positionIndex].idealFactors[factorIndex].idealFacets[facetIndex].score = e.target.value;
        this.setState({ business });
    }


    growthFacetChange(e, positionIndex, factorIndex, facetIndex) {
        let business = Object.assign({}, this.state.business);
        business.positions[positionIndex].growthFactors[factorIndex].idealFacets[facetIndex].score = e.target.value;
        this.setState({ business });
    }


    render() {
        const self = this;

        // if you're not an admin, get up on outta here
        if (!self.props.currentUser.admin === true) {
            return null;
        }

        // if loading the business
        if (self.state.loading) {
            return <div className="fillScreen whiteText"><CircularProgress /></div>;
        }

        // if there's an error, don't show all the business info
        if (self.state.error) {
            return <div className="fillScreen whiteText">{"Error"}</div>;
        }

        // get the current state of the business
        const business = self.state.business;

        // create input for name of business
        let nameInput = (
            <input
                value={business.name}
                onChange={(e) => self.nameChange(e)}
                placeholder="Business Name"
            />
        );

        // all positions
        let positions = [];

        // create the skills that will be shown for every dropdown
        let skillMenuItems = [];
        for (let skillIndex = 0; skillIndex < self.state.allSkills.length; skillIndex++) {
            skillMenuItems.push(
                <MenuItem
                    value={skillIndex}
                    primaryText={self.state.allSkills[skillIndex].name}
                    key={`skill${skillIndex}`}
                />
            );
        }

        // create everything needed for each position
        for (let positionIndex = 0; positionIndex < business.positions.length; positionIndex++) {
            // get the current state of the position
            const position = business.positions[positionIndex];

            // create name input
            const positionNameInput = (
                <input
                    value={business.positions[positionIndex].name}
                    onChange={(e) => self.positionNameChange(e, positionIndex)}
                    placeholder="Position Name"
                />
            );

            // create skills dropdown menus
            let skills = [];
            for (let skillIndex = 0; skillIndex < position.skills.length; skillIndex++) {
                let skill = position.skills[skillIndex];
                // the value of the dropdown menu is the index of the
                // skill within the allSkills array in state
                skills.push(
                    <div key={`position${positionIndex}skill${skillIndex}`}>
                        <DropDownMenu
                            value={self.state.allSkills.findIndex(s => {return s._id.toString() === skill.toString()})}
                            onChange={(e, index, allSkillsIndex) => this.handleSkillChange(e, index, allSkillsIndex, positionIndex, skillIndex)}
                            labelStyle={{color: "rgba(255,255,255,.8)"}}
                        >
                            {skillMenuItems}
                        </DropDownMenu>
                    </div>
                )
            }

            // create the frqs
            let frqs = [];
            for (let frqIndex = 0; frqIndex < position.freeResponseQuestions.length; frqIndex++) {
                const frq = position.freeResponseQuestions[frqIndex];
                frqs.push(
                    <div key={`position${positionIndex}frq${frqIndex}`}>
                        <textarea
                            placeholder={"Frq " + (frqIndex+1)}
                            value={frq.body}
                            onChange={(e) => self.frqChange(e, positionIndex, frqIndex)}
                        />
                        <div
                            className="checkbox smallCheckbox whiteCheckbox"
                            onClick={() => this.handleFrqRequiredChange(positionIndex, frqIndex)}
                            style={{verticalAlign: "top", marginLeft: "20px", marginTop: "6px"}}
                        >
                            <img
                                alt="Checkmark icon"
                                className={"checkMark" + frq.required}
                                src={"/icons/CheckMarkRoundedWhite" + this.props.png}
                            />
                        </div>
                        <div style={{display: "inline-block", verticalAlign: "top"}}>
                            {"Question is required"}
                        </div><br/>
                    </div>
                )
            }

            // create the checkmark determining whether employees should answer frqs
            const employeeFrqRequirement = (
                <div>
                    <div
                        className="checkbox smallCheckbox whiteCheckbox"
                        onClick={() => this.handleEmployeeFrqsChange(positionIndex)}
                        style={{verticalAlign: "top", marginLeft: "20px", marginTop: "6px"}}
                    >
                        <img
                            alt="Checkmark icon"
                            className={"checkMark" + position.employeesGetFrqs}
                            src={"/icons/CheckMarkRoundedWhite" + this.props.png}
                        />
                    </div>
                    <div style={{display: "inline-block", verticalAlign: "top"}}>
                        {"Employees must answer frqs"}
                    </div><br/>
                </div>
            )

            // create input for estimated length of evaluation
            let lengthInput = (
                <input
                    value={position.length.toString()}
                    onChange={(e) => self.lengthChange(e, positionIndex)}
                    placeholder="Length in minutes"
                />
            );

            // create input for how much time candidates get to finish the eval
            let timeAllottedInput = (
                <input
                    value={position.timeAllotted.toString()}
                    onChange={(e) => self.timeAllottedChange(e, positionIndex)}
                    placeholder="Length in minutes"
                />
            );

            // create ideal-output inputs
            let idealFactors = [];
            // go through every ideal factor
            for (let factorIndex = 0; factorIndex < position.idealFactors.length; factorIndex++) {
                const factor = position.idealFactors[factorIndex];
                let idealFacets = [];
                // go through every ideal facet
                for (let facetIndex = 0; facetIndex < factor.idealFacets.length; facetIndex++) {
                    const facet = factor.idealFacets[facetIndex];
                    idealFacets.push(
                        <div
                            key={`position${positionIndex}idealFactor${factorIndex}facet${facetIndex}`}
                            className="idealFacet"
                        >
                            {facet.name}:
                            <input
                                className="idealFacetInput"
                                value={facet.score.toString()}
                                onChange={(e) => self.idealFacetChange(e, positionIndex, factorIndex, facetIndex)}
                                placeholder=""
                            />
                        </div>
                    );
                }
                idealFactors.push(
                    <div
                        key={`position${positionIndex}idealFactor${factorIndex}`}
                        className="idealFactorInput"
                    >
                        {factor.name} {idealFacets}
                    </div>
                )
            }

            // create ideal-output inputs
            let growthFactors = [];
            // go through every ideal factor
            for (let factorIndex = 0; factorIndex < position.growthFactors.length; factorIndex++) {
                const factor = position.growthFactors[factorIndex];
                console.log("factor: ", factor);
                let idealFacets = [];
                // go through every ideal facet
                for (let facetIndex = 0; facetIndex < factor.idealFacets.length; facetIndex++) {
                    const facet = factor.idealFacets[facetIndex];
                    idealFacets.push(
                        <div
                            key={`position${positionIndex}growthFactor${factorIndex}facet${facetIndex}`}
                            className="idealFacet"
                        >
                            {facet.name}:
                            <input
                                className="idealFacetInput"
                                value={facet.score.toString()}
                                onChange={(e) => self.growthFacetChange(e, positionIndex, factorIndex, facetIndex)}
                                placeholder="NEEDED"
                            />
                        </div>
                    );
                }
                growthFactors.push(
                    <div
                        key={`position${positionIndex}growthFactor${factorIndex}`}
                        className="idealFactorInput"
                    >
                        {factor.name} {idealFacets}
                    </div>
                )
            }

            positions.push(
                <div key={`position${positionIndex}`} style={{marginTop: "50px"}}>
                    {"Position:"} {positionNameInput}<br/>
                    {"Skills:"} {skills}<br/>
                    {"Free Response Questions: "} {frqs}<br/>
                    {employeeFrqRequirement}<br/>
                    {"Estimated evaluation length (in minutes): "} {lengthInput}<br/>
                    {"Time allowed to candidates for this position (in days): "} {timeAllottedInput}<br/>
                    {"Ideal psych results: "} {idealFactors}<br/>
                    {"Ideal growth results: "} {growthFactors}
                </div>
            );
        }



        return (
            <div className="fillScreen whiteText businessEditor" style={{margin: "30px"}}>
                {nameInput}
                {positions}
                <button onClick={() => self.addPosition()}>Add position</button><br/>
                <RaisedButton
                    onClick={() => self.handleSubmit.bind(self)}
                    label="Save"
                    className="raisedButtonBusinessHome"
                    style={{margin: '10px 0'}}
                />
                <br/>
                {this.state.saving ? <CircularProgress/> : null}
            </div>
        );
    }
}


function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        addNotification
    }, dispatch);
}

function mapStateToProps(state) {
    return {
        currentUser: state.users.currentUser,
        loadingCreateBusiness: state.users.loadingSomething,
        png: state.users.png
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(BusinessEditor);
