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
            error: false,
            blankPosition: {}
        };
    }


    componentDidMount() {
        this.load();
    }


    componentDidUpdate(prevProps, prevState) {
        if (this.props.params.businessId !== prevProps.params.businessId) {
            this.load();
        }
    }


    load() {
        const self = this;
        // get the business id from the url
        const businessId = self.props.params.businessId;

        // get a blank business object - need to do this because psych test could change
        axios.get("/api/admin/blankPosition", {
            params: {
                userId: self.props.currentUser._id,
                verificationToken: self.props.currentUser.verificationToken
            }
        })
        .then(response => {
            const blankPosition = response.data;
            self.setState({ blankPosition })

            // get every skill
            axios.get("/api/admin/allSkills", {
                params: {
                    userId: self.props.currentUser._id,
                    verificationToken: self.props.currentUser.verificationToken
                }
            })
            .then(response => {
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
                        positions: [ JSON.parse(JSON.stringify(blankPosition)) ]
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
        })
    }




    goTo(route) {
        // goes to the wanted page
        browserHistory.push(route);
        // goes to the top of the new page
        window.scrollTo(0, 0);
    }


    handleSave(e) {
        e.preventDefault();

        const self = this;

        let bizToSave = Object.assign({}, self.state.business);

        // make all of the facet scores into numbers
        for (let positionIndex = 0; positionIndex < bizToSave.positions.length; positionIndex++) {
            let position = bizToSave.positions[positionIndex];
            // go through every ideal factor
            for (let idealFactorIndex = 0; idealFactorIndex < position.idealFactors.length; idealFactorIndex++) {
                let idealFactor = position.idealFactors[idealFactorIndex];
                for (let idealFacetIndex = 0; idealFacetIndex < idealFactor.idealFacets.length; idealFacetIndex++) {
                    idealFactor.idealFacets[idealFacetIndex].score = parseInt(idealFactor.idealFacets[idealFacetIndex].score, 10);
                    // if a score was not given for this facet, show an error
                    if (isNaN(idealFactor.idealFacets[idealFacetIndex].score)) {
                        this.props.addNotification(`'${idealFactor.idealFacets[idealFacetIndex].name}' needs an ideal score`, "error");
                        return;
                    }
                    // otherwise, get rid of the name of the facet for ease of saving in the backend
                    else {
                        idealFactor.idealFacets[idealFacetIndex].name = undefined;
                    }
                }
                // save the factor into the position
                position.idealFactors[idealFactorIndex] = idealFactor;
            }

            // go through every growth factor
            for (let growthFactorIndex = 0; growthFactorIndex < position.growthFactors.length; growthFactorIndex++) {
                let growthFactor = position.growthFactors[growthFactorIndex];
                for (let idealFacetIndex = 0; idealFacetIndex < growthFactor.idealFacets.length; idealFacetIndex++) {
                    growthFactor.idealFacets[idealFacetIndex].score = parseInt(growthFactor.idealFacets[idealFacetIndex].score, 10);
                    // if a score was not given for this facet, show an error
                    if (isNaN(growthFactor.idealFacets[idealFacetIndex].score)) {
                        this.props.addNotification(`'${growthFactor.idealFacets[idealFacetIndex].name}' needs a growth ideal score`, "error");
                        return;
                    }
                    // otherwise, get rid of the name of the facet for ease of saving in the backend
                    else {
                        growthFactor.idealFacets[idealFacetIndex].name = undefined;
                    }
                }
                // save the factor into the position
                position.growthFactors[growthFactorIndex] = growthFactor;
            }

            if (position.longevityActive) {
                // go through every longevity factor
                for (let longevityFactorIndex = 0; longevityFactorIndex < position.longevityFactors.length; longevityFactorIndex++) {
                    let longevityFactor = position.longevityFactors[longevityFactorIndex];
                    for (let idealFacetIndex = 0; idealFacetIndex < longevityFactor.idealFacets.length; idealFacetIndex++) {
                        longevityFactor.idealFacets[idealFacetIndex].score = parseInt(longevityFactor.idealFacets[idealFacetIndex].score, 10);
                        // if a score was not given for this facet, show an error
                        if (isNaN(longevityFactor.idealFacets[idealFacetIndex].score)) {
                            this.props.addNotification(`'${longevityFactor.idealFacets[idealFacetIndex].name}' needs a longevity ideal score`, "error");
                            return;
                        }
                        // otherwise, get rid of the name of the facet for ease of saving in the backend
                        else {
                            longevityFactor.idealFacets[idealFacetIndex].name = undefined;
                        }
                    }
                    // save the factor into the position
                    position.longevityFactors[longevityFactorIndex] = longevityFactor;
                }
            } else {
                position.longevityFactors = undefined;
            }

            bizToSave.positions[positionIndex] = position;
        }

        // set save-loading spinner to go
        this.setState({ saving: true });

        axios.post("/api/admin/saveBusiness", {
            userId: this.props.currentUser._id,
            verificationToken: this.props.currentUser.verificationToken,
            business: bizToSave
        })
        .then(response => {
            console.log("response.data: ", response.data);
            self.setState({ saving: false }, () => {
                // reload the page
                if (self.props.params.businessId.toString() === response.data.toString()) {
                    self.load();
                } else {
                    self.goTo(`/admin/businessEditor/${response.data}`);
                }
            })
        })
        .catch(error => {
            console.log("error updating business: ", error);
            self.props.addNotification(error.response.data + " Please reload the page.", "error");
        })
    }


    nameChange(e) {
        let business = Object.assign({}, this.state.business);
        business.name = e.target.value;
        this.setState({ business });
    }


    addPosition() {
        let business = Object.assign({}, this.state.business);
        business.positions.push( JSON.parse(JSON.stringify(this.state.blankPosition)) );
        this.setState({ business });
    }


    deletePosition(positionIndex) {
        let business = Object.assign({}, this.state.business);
        business.positions.splice(positionIndex, 1);
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
        business.positions[positionIndex].freeResponseQuestions[frqIndex].body = e.target.value;
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


    longevityFacetChange(e, positionIndex, factorIndex, facetIndex) {
        let business = Object.assign({}, this.state.business);
        business.positions[positionIndex].longevityFactors[factorIndex].idealFacets[facetIndex].score = e.target.value;
        this.setState({ business });
    }


    addSkill(positionIndex) {
        let business = Object.assign({}, this.state.business);
        business.positions[positionIndex].skills.push("");
        business.positions[positionIndex].skillNames.push("");
        this.setState({ business });
    }


    deleteSkill(positionIndex, skillIndex) {
        let business = Object.assign({}, this.state.business);
        business.positions[positionIndex].skills.splice(skillIndex, 1);
        business.positions[positionIndex].skillNames.splice(skillIndex, 1);
        this.setState({ business });
    }


    addFrq(positionIndex) {
        let business = Object.assign({}, this.state.business);
        business.positions[positionIndex].freeResponseQuestions.push({body: "", required: true});
        this.setState({ business });
    }


    deleteFrq(positionIndex, frqIndex) {
        let business = Object.assign({}, this.state.business);
        business.positions[positionIndex].freeResponseQuestions.splice(frqIndex, 1);
        this.setState({ business });
    }


    deleteIdealFactor(positionIndex, factorIndex) {
        let business = Object.assign({}, this.state.business);
        business.positions[positionIndex].idealFactors.splice(factorIndex, 1);
        this.setState({ business });
    }


    deleteIdealFacet(positionIndex, factorIndex, facetIndex) {
        let business = Object.assign({}, this.state.business);
        business.positions[positionIndex].idealFactors[factorIndex].idealFacets.splice(facetIndex, 1);
        // delete the containing factor too if all its facets are gone
        if (business.positions[positionIndex].idealFactors[factorIndex].idealFacets.length === 0) {
            business.positions[positionIndex].idealFactors.splice(factorIndex, 1);
        }
        this.setState({ business });
    }


    deleteGrowthFactor(positionIndex, factorIndex) {
        let business = Object.assign({}, this.state.business);
        business.positions[positionIndex].growthFactors.splice(factorIndex, 1);
        this.setState({ business });
    }


    deleteGrowthFacet(positionIndex, factorIndex, facetIndex) {
        let business = Object.assign({}, this.state.business);
        business.positions[positionIndex].growthFactors[factorIndex].idealFacets.splice(facetIndex, 1);
        // delete the containing factor too if all its facets are gone
        if (business.positions[positionIndex].growthFactors[factorIndex].idealFacets.length === 0) {
            business.positions[positionIndex].growthFactors.splice(factorIndex, 1);
        }
        this.setState({ business });
    }


    deleteLongevityFactor(positionIndex, factorIndex) {
        let business = Object.assign({}, this.state.business);
        business.positions[positionIndex].longevityFactors.splice(factorIndex, 1);
        this.setState({ business });
    }


    deleteLongevityFacet(positionIndex, factorIndex, facetIndex) {
        let business = Object.assign({}, this.state.business);
        business.positions[positionIndex].longevityFactors[factorIndex].idealFacets.splice(facetIndex, 1);
        // delete the containing factor too if all its facets are gone
        if (business.positions[positionIndex].longevityFactors[factorIndex].idealFacets.length === 0) {
            business.positions[positionIndex].longevityFactors.splice(factorIndex, 1);
        }
        this.setState({ business });
    }


    addAdmin() {
        let business = Object.assign({}, this.state.business);
        if (!Array.isArray(business.adminsToAdd)) { business.adminsToAdd = []; }
        business.adminsToAdd.push({
            name: "",
            email: "",
            password: "",
            title: ""
        });
        this.setState({ business });
    }


    deleteAdmin(adminIndex) {
        let business = Object.assign({}, this.state.business);
        business.adminsToAdd.splice(adminIndex, 1);
        this.setState({ business });
    }


    adminFieldChange(e, field, adminIndex) {
        let business = Object.assign({}, this.state.business);
        business.adminsToAdd[adminIndex][field] = e.target.value;
        this.setState({ business });
    }


    resetIdealFactors(positionIndex) {
        let business = Object.assign({}, this.state.business);
        business.positions[positionIndex].idealFactors = JSON.parse(JSON.stringify(this.state.blankPosition.idealFactors));
        this.setState({ business });
    }


    resetGrowthFactors(positionIndex) {
        let business = Object.assign({}, this.state.business);
        business.positions[positionIndex].growthFactors = JSON.parse(JSON.stringify(this.state.blankPosition.growthFactors));
        this.setState({ business });
    }


    resetLongevityFactors(positionIndex) {
        let business = Object.assign({}, this.state.business);
        business.positions[positionIndex].longevityFactors = JSON.parse(JSON.stringify(this.state.blankPosition.longevityFactors));
        this.setState({ business });
    }


    toggleLongevity(positionIndex) {
        let business = Object.assign({}, this.state.business);
        business.positions[positionIndex].longevityActive = !business.positions[positionIndex].longevityActive;
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
            return <div className="fillScreen primary-white"><CircularProgress /></div>;
        }

        // if there's an error, don't show all the business info
        if (self.state.error) {
            return <div className="fillScreen primary-white">{"Error"}</div>;
        }

        // get the current state of the business
        const business = self.state.business;

        // create input for name of business
        let nameInput = (
            <input
                value={business.name}
                onChange={(e) => self.nameChange(e)}
                placeholder="Business Name"
                style={{marginBottom: "20px"}}
            />
        );

        // all positions
        let positions = [];

        // create the skills that will be shown for every dropdown
        let skillMenuItems = [
            <MenuItem
                value={-1}
                primaryText={"Choose a skill"}
                key={`Choose a skill`}
            />
        ];
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
                        <div
                            className="deleteButton"
                            style={{margin:"18px 0 0 0"}}
                            onClick={() => self.deleteSkill(positionIndex, skillIndex)}
                        >
                            X
                        </div>
                    </div>
                )
            }
            // button to add a new skill
            skills.push(
                <button
                    style={{marginLeft:"20px",marginBottom:"10px"}}
                    onClick={() => self.addSkill(positionIndex)}
                    key={`position${positionIndex}addSkill`}
                >
                    + Skill
                </button>
            )

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
                        </div>
                        <div
                            className="deleteButton"
                            style={{margin:"0 0 0 8px"}}
                            onClick={() => self.deleteFrq(positionIndex, frqIndex)}
                        >
                            X
                        </div>
                    </div>
                )
            }
            frqs.push(
                <button
                    style={{marginLeft:"20px",marginBottom:"10px"}}
                    onClick={() => self.addFrq(positionIndex)}
                    key={`position${positionIndex}addSkill`}
                >
                    + FRQ
                </button>
            )

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
                                placeholder="NEED"
                            />
                            <div
                                className="deleteButton"
                                style={{marginLeft:"8px"}}
                                onClick={() => self.deleteIdealFacet(positionIndex, factorIndex, facetIndex)}
                            >
                                X
                            </div>
                        </div>
                    );
                }
                idealFactors.push(
                    <div
                        key={`position${positionIndex}idealFactor${factorIndex}`}
                        className="idealFactorInput"
                    >
                        {factor.name}
                        <div
                            className="deleteButton"
                            style={{marginLeft:"8px"}}
                            onClick={() => self.deleteIdealFactor(positionIndex, factorIndex)}
                        >
                            X
                        </div>
                        {idealFacets}
                    </div>
                )
            }

            // create ideal-output inputs
            let growthFactors = [];
            // go through every ideal factor
            for (let factorIndex = 0; factorIndex < position.growthFactors.length; factorIndex++) {
                const factor = position.growthFactors[factorIndex];
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
                                placeholder="NEED"
                            />
                            <div
                                className="deleteButton"
                                style={{marginLeft:"8px"}}
                                onClick={() => self.deleteGrowthFacet(positionIndex, factorIndex, facetIndex)}
                            >
                                X
                            </div>
                        </div>
                    );
                }
                growthFactors.push(
                    <div
                        key={`position${positionIndex}growthFactor${factorIndex}`}
                        className="idealFactorInput"
                    >
                        {factor.name}
                        <div
                            className="deleteButton"
                            style={{marginLeft:"8px"}}
                            onClick={() => self.deleteGrowthFactor(positionIndex, factorIndex)}
                        >
                            X
                        </div>
                        {idealFacets}
                    </div>
                )
            }

            // create ideal-output inputs
            let longevityFactors = [];
            if (position.longevityActive) {
                // go through every ideal factor
                for (let factorIndex = 0; factorIndex < position.longevityFactors.length; factorIndex++) {
                    const factor = position.longevityFactors[factorIndex];
                    let idealFacets = [];
                    // go through every ideal facet
                    for (let facetIndex = 0; facetIndex < factor.idealFacets.length; facetIndex++) {
                        const facet = factor.idealFacets[facetIndex];
                        idealFacets.push(
                            <div
                                key={`position${positionIndex}longevityFactor${factorIndex}facet${facetIndex}`}
                                className="idealFacet"
                            >
                                {facet.name}:
                                <input
                                    className="idealFacetInput"
                                    value={facet.score.toString()}
                                    onChange={(e) => self.longevityFacetChange(e, positionIndex, factorIndex, facetIndex)}
                                    placeholder="NEED"
                                />
                                <div
                                    className="deleteButton"
                                    style={{marginLeft:"8px"}}
                                    onClick={() => self.deleteLongevityFacet(positionIndex, factorIndex, facetIndex)}
                                >
                                    X
                                </div>
                            </div>
                        );
                    }
                    longevityFactors.push(
                        <div
                            key={`position${positionIndex}longevityFactor${factorIndex}`}
                            className="idealFactorInput"
                        >
                            {factor.name}
                            <div
                                className="deleteButton"
                                style={{marginLeft:"8px"}}
                                onClick={() => self.deleteLongevityFactor(positionIndex, factorIndex)}
                            >
                                X
                            </div>
                            {idealFacets}
                        </div>
                    )
                }
            }

            const resetIdealFactorsButton = (
                <button onClick={() => self.resetIdealFactors(positionIndex)} style={{marginTop: "40px"}}>
                    Reset Ideal Factors
                </button>
            );

            const resetGrowthFactorsButton = (
                <button onClick={() => self.resetGrowthFactors(positionIndex)} style={{marginTop: "40px"}}>
                    Reset Growth Factors
                </button>
            );

            const resetLongevityFactorsButton = (
                <button onClick={() => self.resetLongevityFactors(positionIndex)} style={{marginTop: "40px"}}>
                    Reset Growth Factors
                </button>
            );

            const deletePositionButton = (
                position._id ? null :
                <div
                    className="deleteButton"
                    style={{marginLeft:"8px"}}
                    onClick={() => self.deletePosition(positionIndex)}
                >
                    X
                </div>
            );

            const longevityActive = position.longevityActive ?
                <span style={{color:"green"}}>ACTIVE</span>
                :
                <span style={{color:"red"}}>INACTIVE</span>;
            const toggleLongevity = (
                <button onClick={() => self.toggleLongevity(positionIndex)} style={{marginTop: "40px"}}>
                    {position.longevityActive ? "Disable Longevity" : "Enable Longevity"}
                </button>
            )

            positions.push(
                <div key={`position${positionIndex}`} style={{marginTop: "50px"}}>
                    <div style={{width:"100%",height:"20px",backgroundColor:"gray",margin:"0 0 50px -30px"}} />
                    {"Position:"} {positionNameInput} {deletePositionButton}<br/>
                    {"Skills:"} {skills}<br/>
                    {"Free Response Questions: "} {frqs}<br/>
                    {employeeFrqRequirement}<br/>
                    {"Estimated evaluation length (in minutes): "} {lengthInput}<br/>
                    {"Time allowed to candidates for this position (in days): "} {timeAllottedInput}<br/>
                    {"Ideal psych results: "} {resetIdealFactorsButton} {idealFactors}<br/>
                    {"Ideal growth results: "} {resetGrowthFactorsButton} {growthFactors}
                    {"Ideal longevity results: "} {longevityActive} {toggleLongevity} {resetLongevityFactorsButton} {longevityFactors}
                </div>
            );
        }

        // area to add new admins
        const addAdminButton = (
            <button onClick={() => self.addAdmin()} style={{marginBottom:"20px"}}>
                Add admin
            </button>
        );

        // new admins that will be added
        let adminIndex = -1;
        const adminsToAdd = Array.isArray(business.adminsToAdd) ? business.adminsToAdd.map(admin => {
            adminIndex++;
            return (
                <div key={`admin${adminIndex}`}>
                    <input
                        value={admin.name}
                        onChange={(e) => self.adminFieldChange(e, "name", adminIndex)}
                        placeholder="Admin Name"
                    />
                    <input
                        value={admin.email}
                        onChange={(e) => self.adminFieldChange(e, "email", adminIndex)}
                        placeholder="Admin Email"
                    />
                    <input
                        value={admin.password}
                        onChange={(e) => self.adminFieldChange(e, "password", adminIndex)}
                        placeholder="Admin Password"
                    />
                    <input
                        value={admin.title}
                        onChange={(e) => self.adminFieldChange(e, "title", adminIndex)}
                        placeholder="Admin Title"
                    />
                    <div
                        className="deleteButton"
                        style={{marginLeft:"8px"}}
                        onClick={() => self.deleteAdmin(adminIndex)}
                    >
                        X
                    </div>
                </div>
            )
        }) : null;

        // admins that already existed
        const admins = Array.isArray(business.accountAdmins) ? business.accountAdmins.map(admin => {
            return (
                <div key={`oldAdmin${admin.email}`}>
                    <input value={admin.name} disabled />
                    <input value={admin.email} disabled />
                </div>
            )
        }) : null;


        return (
            <div className="fillScreen primary-white businessEditor" style={{margin: "30px"}}>
                {nameInput}<br/>
                {adminsToAdd}
                {addAdminButton}<br/>
                {"Existing admins: "}<br/>
                {admins}
                {positions}
                <button onClick={() => self.addPosition()} style={{marginTop: "40px"}}>
                    Add position
                </button><br/>
                <RaisedButton
                    onClick={self.handleSave.bind(self)}
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
