"use strict"
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { browserHistory } from 'react-router';
import { addNotification } from "../../../actions/usersActions";
import { bindActionCreators } from 'redux';
import { CircularProgress, RaisedButton } from 'material-ui';
import axios from 'axios';


class BusinessEditor extends Component {
    constructor(props) {
        super(props);

        this.state = {
            loading: true,
            saving: false,
            error: false
        };
    }


    componentDidMount() {
        // get the business id from the url
        const businessId = this.props.params.businessId;
        // if user is creating a new business
        if (businessId === "new") {
            this.setState({
                business: {
                    name: "",
                    skills: [],
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
                    userId: this.props.currentUser._id,
                    verificationToken: this.props.currentUser.verificationToken,
                    businessId
                }
            })
            .then(response => {
                // map the business to the format this page expects
                let business = response.data;

                console.log(business);

                this.setState({ business, loading: false });
            })
            .catch(error => {
                console.log("Error getting business: ", error);
                this.setState({ loading: false, error: true });
                this.props.addNotification("Error getting business.", "error")
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

        axios.post("/api/admin/saveBusiness", {
            userId: this.props.currentUser._id,
            verificationToken: this.props.currentUser.verificationToken,
            business: this.state.business
        })
        .then(response => {
            self.setState({ saving: false }, () => {
                // go to the new/updated business's edit page
                self.goTo(`/admin/businessEditor/${response.data._id}`);
            })
        })
        .catch(error => {
            console.log("error updating business: ", error);
            self.props.addNotification("Error updating business.", "error");
        })
    }


    nameChange(e) {
        let business = Object.assign({}, this.state.business);
        business.name = e.target.value;
        this.setState({ business });
    }


    questionTextChange(e, levelIndex, questionIndex, questionTextIndex) {
        let business = Object.assign({}, this.state.business);
        business.levels[levelIndex].questions[questionIndex].body[questionTextIndex].content[0] = e.target.value;
        this.setState({ business });
    }


    optionChange(e, levelIndex, questionIndex, optionIndex) {
        let business = Object.assign({}, this.state.business);
        business.levels[levelIndex].questions[questionIndex].options[optionIndex].body = e.target.value;
        this.setState({ business });
    }


    markCorrect(levelIndex, questionIndex, optionIndex) {
        let business = Object.assign({}, this.state.business);
        // mark all options incorrect
        for (let i = 0; i < business.levels[levelIndex].questions[questionIndex].options.length; i++) {
            business.levels[levelIndex].questions[questionIndex].options[i].isCorrect = false;
        }
        business.levels[levelIndex].questions[questionIndex].options[optionIndex].isCorrect = true;
        this.setState({ business });
    }


    addQuestionText(levelIndex, questionIndex) {
        let business = Object.assign({}, this.state.business);
        business.levels[levelIndex].questions[questionIndex].body.push({ content: [""], shouldBreak: true });
        this.setState({ business });
    }


    addOption(levelIndex, questionIndex) {
        let business = Object.assign({}, this.state.business);
        business.levels[levelIndex].questions[questionIndex].options.push({body: "", isCorrect: false});
        this.setState({ business });
    }


    addQuestion(levelIndex) {
        let business = Object.assign({}, this.state.business);
        business.levels[levelIndex].questions.push({
            body: [{ content: [""], shouldBreak: true }],
            options: [
                {body: "", isCorrect: false},
                {body: "", isCorrect: false}
            ]
        });
        this.setState({ business });
    }

    addLevel() {
        const self = this;
        let business = Object.assign({}, this.state.business);
        business.levels.push({
            levelNumber: self.state.business.levels.length + 1,
            questions: [{
                body: [{ content: [""], shouldBreak: true }],
                options: [
                    {body: "", isCorrect: false},
                    {body: "", isCorrect: false}
                ]
            }]
        });
        this.setState({ business });
    }


    deleteLevel(levelIndex) {
        const self = this;
        let business = Object.assign({}, this.state.business);
        business.levels.splice(levelIndex, 1);
        this.setState({ business });
    }


    deleteQuestion(levelIndex, questionIndex) {
        const self = this;
        let business = Object.assign({}, this.state.business);
        business.levels[levelIndex].questions.splice(questionIndex, 1);
        this.setState({ business });
    }


    deleteQuestionText (levelIndex, questionIndex, questionTextIndex) {
        const self = this;
        let business = Object.assign({}, this.state.business);
        business.levels[levelIndex].questions[questionIndex].body.splice(questionTextIndex, 1);
        this.setState({ business });
    }


    deleteOption(levelIndex, questionIndex, optionIndex) {
        const self = this;
        let business = Object.assign({}, this.state.business);
        business.levels[levelIndex].questions[questionIndex].options.splice(optionIndex, 1);
        this.setState({ business });
    }


    render() {
        const self = this;

        if (!self.props.currentUser.admin === true) {
            return null;
        }

        // if loading the business
        if (self.state.loading) {
            return <div className="fillScreen whiteText"><CircularProgress /></div>;
        }

        if (self.state.error) {
            return <div className="fillScreen whiteText">{"Error"}</div>;
        }

        let nameInput = (
            <input
                value={self.state.business.name}
                onChange={(e) => self.nameChange(e)}
                placeholder="Business Name"
            />
        );
        let levels = [];

        const business = self.state.business;
        const numLevels = business.levels.length;
        // go through every current level
        for (let levelIndex = 0; levelIndex < numLevels; levelIndex++) {
            const level = business.levels[levelIndex];

            let questions = [];

            const numQuestions = level.questions.length;
            // go through every question
            for (let questionIndex = 0; questionIndex < numQuestions; questionIndex++) {
                const question = level.questions[questionIndex];

                let questionBody = [];

                const numQuestionParts = question.body.length;
                for (let questionTextIndex = 0; questionTextIndex < numQuestionParts; questionTextIndex++) {
                    questionBody.push(
                        <textarea
                            value={question.body[questionTextIndex].content[0]}
                            placeholder={"Question line " + (questionTextIndex+1)}
                            onChange={(e) => self.questionTextChange(e, levelIndex, questionIndex, questionTextIndex)}
                            key={"level"+levelIndex+"question"+questionIndex+"part"+questionTextIndex}
                        />
                    );
                    if (questionTextIndex > 0) {
                        questionBody.push(<div key={"level"+levelIndex+"question"+questionIndex+"part"+questionTextIndex+"delete"} className="deleteButton" onClick={() => self.deleteQuestionText(levelIndex, questionIndex, questionTextIndex)}>X</div>)
                    }
                    questionBody.push(<br key={"level"+levelIndex+"question"+questionIndex+"part"+questionTextIndex+"br"} />)
                }

                let options = [];
                const numOptions = question.options.length;
                for (let optionIndex = 0; optionIndex < numOptions; optionIndex++) {
                    const correctnessClass = question.options[optionIndex].isCorrect ? "correct" : "incorrect";
                    const deleteOptionButton = optionIndex === 0 ? null : <div className="deleteButton" onClick={() => self.deleteOption(levelIndex, questionIndex, optionIndex)}>X</div>;
                    options.push(
                        <div key={"level"+levelIndex+"question"+questionIndex+"option"+optionIndex}>
                            <div
                                className={"correctIndicator " + correctnessClass}
                                onClick={() => self.markCorrect(levelIndex, questionIndex, optionIndex)}
                            />
                            <textarea
                                placeholder={"option option " + (optionIndex+1)}
                                value={question.options[optionIndex].body}
                                onChange={(e) => self.optionChange(e, levelIndex, questionIndex, optionIndex)}
                            />
                            {deleteOptionButton}
                        </div>
                    );
                }

                const deleteQuestionButton = questionIndex === 0 ? null : <div className="deleteButton" onClick={() => self.deleteQuestion(levelIndex, questionIndex)}>X</div>;

                questions.push(
                    <div key={"level"+levelIndex+"question"+questionIndex} style={{marginBottom: "5px"}}>
                        {`Question ${questionIndex+1}:`} {deleteQuestionButton}
                        <br/>
                        {questionBody}
                        <button onClick={() => self.addQuestionText(levelIndex, questionIndex)} style={{marginBottom:"10px"}}>Add line to question</button><br/>
                        {options}
                        <button onClick={() => self.addOption(levelIndex, questionIndex)}>Add option</button>
                    </div>
                )
            }

            const deleteLevelButton = levelIndex === 0 ? null : <div className="deleteButton" onClick={() => self.deleteLevel(levelIndex)}>X</div>;

            // add the questions and button to add another question to the level
            levels.push(
                <div key={"level"+levelIndex} style={{margin: "20px 0px"}}>
                    {"Level " + level.levelNumber} {deleteLevelButton}
                    <div style={{margin: "10px 20px"}}>{questions}</div>
                    <button onClick={() => self.addQuestion(levelIndex)}>Add question</button>
                </div>
            );
        }

        return (
            <div className="fillScreen whiteText businessEditor" style={{margin: "30px"}}>
                {nameInput}
                {levels}
                <button onClick={() => self.addLevel()}>Add level</button><br/>
                <RaisedButton
                    onClick={this.handleSubmit.bind(this)}
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
        loadingCreateBusiness: state.users.loadingSomething
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(BusinessEditor);
