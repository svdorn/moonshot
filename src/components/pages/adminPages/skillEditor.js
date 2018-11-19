"use strict";
import React, { Component } from "react";
import { connect } from "react-redux";
import { browserHistory } from "react-router";
import { addNotification } from "../../../actions/usersActions";
import { bindActionCreators } from "redux";
import { CircularProgress, RaisedButton } from "material-ui";
import axios from "axios";

class SkillEditor extends Component {
    constructor(props) {
        super(props);

        this.state = {
            loading: true,
            saving: false,
            error: false
        };
    }

    componentDidMount() {
        const { currentUser } = this.props;
        if (!currentUser) {
            return this.props.addNotification(
                "You aren't logged in! Try refreshing the page.",
                "error"
            );
        }

        // get the skill id from the url
        const skillId = this.props.params.skillId;
        // if user is creating a new skill
        if (skillId === "new") {
            this.setState({
                skill: {
                    name: "",
                    levels: [
                        {
                            levelNumber: 1,
                            questions: [
                                {
                                    // questions are stored in a weird format so that
                                    // they are compatible with the db
                                    body: [{ content: [""], partType: "text", shouldBreak: true }],
                                    options: [
                                        { body: "", isCorrect: false },
                                        { body: "", isCorrect: false }
                                    ]
                                }
                            ]
                        }
                    ]
                },
                loading: false
            });
        }

        // if user is editing an existing skill
        else {
            // get the skill
            axios
                .get("/api/admin/skill", {
                    params: {
                        userId: currentUser._id,
                        verificationToken: currentUser.verificationToken,
                        skillId
                    }
                })
                .then(response => {
                    // map the skill to the format this page expects
                    let skill = response.data;

                    this.setState({ skill, loading: false });
                })
                .catch(error => {
                    console.log("Error getting skill: ", error);
                    this.setState({ loading: false, error: true });
                    this.props.addNotification("Error getting skill.", "error");
                });
        }
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
        const { currentUser } = this.props;
        if (!currentUser) {
            return this.props.addNotification(
                "You aren't logged in! Try refreshing the page.",
                "error"
            );
        }

        // set save-loading spinner to go
        this.setState({ saving: true });

        axios
            .post("/api/admin/saveSkill", {
                userId: currentUser._id,
                verificationToken: currentUser.verificationToken,
                skill: this.state.skill
            })
            .then(response => {
                self.setState({ saving: false }, () => {
                    // go to the new/updated skill's edit page
                    self.goTo(`/admin/skillEditor/${response.data._id}`);
                });
            })
            .catch(error => {
                console.log("error updating skill: ", error);
                self.props.addNotification("Error updating skill.", "error");
            });
    }

    nameChange(e) {
        let skill = Object.assign({}, this.state.skill);
        skill.name = e.target.value;
        this.setState({ skill });
    }

    questionTextChange(e, levelIndex, questionIndex, questionTextIndex) {
        let skill = Object.assign({}, this.state.skill);
        skill.levels[levelIndex].questions[questionIndex].body[questionTextIndex].content[0] =
            e.target.value;
        this.setState({ skill });
    }

    optionChange(e, levelIndex, questionIndex, optionIndex) {
        let skill = Object.assign({}, this.state.skill);
        skill.levels[levelIndex].questions[questionIndex].options[optionIndex].body =
            e.target.value;
        this.setState({ skill });
    }

    markCorrect(levelIndex, questionIndex, optionIndex) {
        let skill = Object.assign({}, this.state.skill);
        // mark all options incorrect
        for (let i = 0; i < skill.levels[levelIndex].questions[questionIndex].options.length; i++) {
            skill.levels[levelIndex].questions[questionIndex].options[i].isCorrect = false;
        }
        skill.levels[levelIndex].questions[questionIndex].options[optionIndex].isCorrect = true;
        this.setState({ skill });
    }

    addQuestionText(levelIndex, questionIndex) {
        let skill = Object.assign({}, this.state.skill);
        skill.levels[levelIndex].questions[questionIndex].body.push({
            content: [""],
            partType: "text",
            shouldBreak: true
        });
        this.setState({ skill });
    }

    addOption(levelIndex, questionIndex) {
        let skill = Object.assign({}, this.state.skill);
        skill.levels[levelIndex].questions[questionIndex].options.push({
            body: "",
            isCorrect: false
        });
        this.setState({ skill });
    }

    addQuestion(levelIndex) {
        let skill = Object.assign({}, this.state.skill);
        skill.levels[levelIndex].questions.push({
            body: [{ content: [""], partType: "text", shouldBreak: true }],
            options: [{ body: "", isCorrect: false }, { body: "", isCorrect: false }]
        });
        this.setState({ skill });
    }

    addLevel() {
        const self = this;
        let skill = Object.assign({}, this.state.skill);
        skill.levels.push({
            levelNumber: self.state.skill.levels.length + 1,
            questions: [
                {
                    body: [{ content: [""], partType: "text", shouldBreak: true }],
                    options: [{ body: "", isCorrect: false }, { body: "", isCorrect: false }]
                }
            ]
        });
        this.setState({ skill });
    }

    deleteLevel(levelIndex) {
        const self = this;
        let skill = Object.assign({}, this.state.skill);
        skill.levels.splice(levelIndex, 1);
        this.setState({ skill });
    }

    deleteQuestion(levelIndex, questionIndex) {
        const self = this;
        let skill = Object.assign({}, this.state.skill);
        skill.levels[levelIndex].questions.splice(questionIndex, 1);
        this.setState({ skill });
    }

    deleteQuestionText(levelIndex, questionIndex, questionTextIndex) {
        const self = this;
        let skill = Object.assign({}, this.state.skill);
        skill.levels[levelIndex].questions[questionIndex].body.splice(questionTextIndex, 1);
        this.setState({ skill });
    }

    deleteOption(levelIndex, questionIndex, optionIndex) {
        const self = this;
        let skill = Object.assign({}, this.state.skill);
        skill.levels[levelIndex].questions[questionIndex].options.splice(optionIndex, 1);
        this.setState({ skill });
    }

    changePartType(levelIndex, questionIndex, questionTextIndex) {
        const self = this;
        let skill = Object.assign({}, this.state.skill);
        const currentValue =
            skill.levels[levelIndex].questions[questionIndex].body[questionTextIndex].partType;
        const nextValue = currentValue === "code" ? "text" : "code";
        skill.levels[levelIndex].questions[questionIndex].body[
            questionTextIndex
        ].partType = nextValue;
        this.setState({ skill });
    }

    render() {
        const self = this;

        if (!self.props.currentUser.admin === true) {
            return null;
        }

        // if loading the skill
        if (self.state.loading) {
            return (
                <div className="fillScreen primary-white">
                    <CircularProgress />
                </div>
            );
        }

        if (self.state.error) {
            return <div className="fillScreen primary-white">{"Error"}</div>;
        }

        let nameInput = (
            <input
                value={self.state.skill.name}
                onChange={e => self.nameChange(e)}
                placeholder="Skill Name"
            />
        );
        let levels = [];

        const skill = self.state.skill;
        const numLevels = skill.levels.length;
        // go through every current level
        for (let levelIndex = 0; levelIndex < numLevels; levelIndex++) {
            const level = skill.levels[levelIndex];

            let questions = [];

            const numQuestions = level.questions.length;
            // go through every question
            for (let questionIndex = 0; questionIndex < numQuestions; questionIndex++) {
                const question = level.questions[questionIndex];

                let questionBody = [];

                const numQuestionParts = question.body.length;
                for (
                    let questionTextIndex = 0;
                    questionTextIndex < numQuestionParts;
                    questionTextIndex++
                ) {
                    const isCode = question.body[questionTextIndex].partType === "code";
                    questionBody.push(
                        <div
                            className={"question-part-type"}
                            onClick={() =>
                                this.changePartType(levelIndex, questionIndex, questionTextIndex)
                            }
                        >
                            {question.body[questionTextIndex].partType}
                        </div>
                    );
                    questionBody.push(
                        <textarea
                            value={question.body[questionTextIndex].content[0]}
                            placeholder={"Question line " + (questionTextIndex + 1)}
                            onChange={e =>
                                self.questionTextChange(
                                    e,
                                    levelIndex,
                                    questionIndex,
                                    questionTextIndex
                                )
                            }
                            key={
                                "level" +
                                levelIndex +
                                "question" +
                                questionIndex +
                                "part" +
                                questionTextIndex
                            }
                        />
                    );

                    if (questionTextIndex > 0) {
                        questionBody.push(
                            <div
                                key={
                                    "level" +
                                    levelIndex +
                                    "question" +
                                    questionIndex +
                                    "part" +
                                    questionTextIndex +
                                    "delete"
                                }
                                className="deleteButton"
                                onClick={() =>
                                    self.deleteQuestionText(
                                        levelIndex,
                                        questionIndex,
                                        questionTextIndex
                                    )
                                }
                            >
                                X
                            </div>
                        );
                    }
                    questionBody.push(
                        <br
                            key={
                                "level" +
                                levelIndex +
                                "question" +
                                questionIndex +
                                "part" +
                                questionTextIndex +
                                "br"
                            }
                        />
                    );
                }

                let options = [];
                const numOptions = question.options.length;
                for (let optionIndex = 0; optionIndex < numOptions; optionIndex++) {
                    const correctnessClass = question.options[optionIndex].isCorrect
                        ? "correct"
                        : "incorrect";
                    const deleteOptionButton =
                        optionIndex === 0 ? null : (
                            <div
                                className="deleteButton"
                                onClick={() =>
                                    self.deleteOption(levelIndex, questionIndex, optionIndex)
                                }
                            >
                                X
                            </div>
                        );
                    options.push(
                        <div
                            key={
                                "level" +
                                levelIndex +
                                "question" +
                                questionIndex +
                                "option" +
                                optionIndex
                            }
                        >
                            <div
                                className={"correctIndicator " + correctnessClass}
                                onClick={() =>
                                    self.markCorrect(levelIndex, questionIndex, optionIndex)
                                }
                            />
                            <textarea
                                placeholder={"Option " + (optionIndex + 1)}
                                value={question.options[optionIndex].body}
                                onChange={e =>
                                    self.optionChange(e, levelIndex, questionIndex, optionIndex)
                                }
                            />
                            {deleteOptionButton}
                        </div>
                    );
                }

                const deleteQuestionButton =
                    questionIndex === 0 ? null : (
                        <div
                            className="deleteButton"
                            onClick={() => self.deleteQuestion(levelIndex, questionIndex)}
                        >
                            X
                        </div>
                    );

                questions.push(
                    <div
                        key={"level" + levelIndex + "question" + questionIndex}
                        style={{ marginBottom: "5px" }}
                    >
                        {`Question ${questionIndex + 1}:`} {deleteQuestionButton}
                        <br />
                        {questionBody}
                        <button
                            onClick={() => self.addQuestionText(levelIndex, questionIndex)}
                            style={{ marginBottom: "10px" }}
                        >
                            Add line to question
                        </button>
                        <br />
                        {options}
                        <button onClick={() => self.addOption(levelIndex, questionIndex)}>
                            Add option
                        </button>
                    </div>
                );
            }

            const deleteLevelButton =
                levelIndex === 0 ? null : (
                    <div className="deleteButton" onClick={() => self.deleteLevel(levelIndex)}>
                        X
                    </div>
                );

            // add the questions and button to add another question to the level
            levels.push(
                <div key={"level" + levelIndex} style={{ margin: "20px 0px" }}>
                    {"Level " + level.levelNumber} {deleteLevelButton}
                    <div style={{ margin: "10px 20px" }}>{questions}</div>
                    <button onClick={() => self.addQuestion(levelIndex)}>Add question</button>
                </div>
            );
        }

        return (
            <div className="fillScreen primary-white skillEditor" style={{ margin: "30px" }}>
                {nameInput}
                {levels}
                <button onClick={() => self.addLevel()}>Add level</button>
                <br />
                <RaisedButton
                    onClick={this.handleSave.bind(this)}
                    label="Save"
                    className="raisedButtonBusinessHome"
                    style={{ margin: "10px 0" }}
                />
                <br />
                {this.state.saving ? <CircularProgress /> : null}
            </div>
        );
    }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators(
        {
            addNotification
        },
        dispatch
    );
}

function mapStateToProps(state) {
    return {
        currentUser: state.users.currentUser,
        loadingCreateSkill: state.users.loadingSomething
    };
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(SkillEditor);
