"use strict"
import React, {Component} from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {registerForPathway, getUsers} from '../../actions/usersActions';
import {TextField, RaisedButton, Paper, CircularProgress, Divider} from 'material-ui';
import {Field, reduxForm} from 'redux-form';
import style from '../../../public/styles';
import axios from 'axios';
import HomepageTriangles from '../miscComponents/HomepageTriangles';
import { browserHistory } from 'react-router';

class Pathway extends Component {
    constructor(props) {
        super(props);
        this.state = {
            pathway: {},
        }
    }

    componentDidMount() {
        const id = this.props.params._id;

        axios.get("/api/getPathwayById", {
            params: {
                _id: id
            }
        }).then(res => {
            this.setState({pathway: res.data});
        }).catch(function (err) {
            console.log("error getting searched for pathw");
        })
    }

    handleClick() {
        console.log("in handle click");
        if (this.props.currentUser) {
            console.log(this.props.currentUser);
            const user = {
                pathway: this.state.pathway.name,
                name: this.props.currentUser.name,
                email: this.props.currentUser.email,
            };
            this.props.registerForPathway(user);
        } else {
            // Not logged in
            browserHistory.push('/login');
        }
    }


    render() {

        const style = {
            descriptionAndSalary: {
                height: "80px",
                width: "100%",
                position: "relative"
            },
            descriptionAndSalaryLi: {
                width: "40%",
                verticalAlign: "top",
                margin: "0px 20px",
                position: "relative"
            },
            descriptionAndSalaryUl: {
                fontSize: "20px"
            }
        }

        console.log(this.state.pathway);
        const deadline = new Date(this.state.pathway.deadline);
        const formattedDeadline = deadline.getMonth() + "/" + deadline.getDate() + "/" + deadline.getYear();

        const pathway = this.state.pathway;



        return (
            <div className="jsxWrapper">
                {pathway.sponsor !== undefined ?
                    <div>
                        <div className="purpleToBlue">
                            <div className="pathwayPrevListContainer">
                                <ul className="horizCenteredList pathwayPrevList">
                                    <li className="pathwayHeaderText whiteText mediumText noWrap"
                                        style={{zIndex: "20"}}>
                                        {pathway.name}<br/>
                                        <button className="outlineButton"
                                                style={{backgroundColor: "transparent", border: "2px solid white"}}
                                                onClick={this.handleClick.bind(this)}>
                                            {"Sign Up"}
                                        </button>
                                        <br/>
                                        Sponsored By:
                                        <img
                                            src={pathway.sponsor.logo}
                                            alt={pathway.sponsor.name}
                                            height={25}
                                            style={{paddingLeft: '15px'}}
                                        />
                                    </li>
                                    <li className="pathwayHeaderText whiteText mediumText noWrap"
                                        style={{zIndex: "20"}}>
                                        Change Logo Next Time <br/>
                                        <img
                                            src="/images/MoonshotTempLogo.png"
                                            alt="Moonshot Learning"
                                            style={{width: "450px", height: '150px'}}
                                        />
                                    </li>
                                </ul>
                            </div>
                        </div>
                        <div className="greenToBlue">
                            <ul className="horizCenteredList pathwayPrevList whiteText smallText2">
                                <li>
                                    Completion Time<br/>
                                    {pathway.estimatedCompletionTime}
                                </li>
                                <li>
                                    Complete By<br/>
                                    {formattedDeadline}
                                </li>
                                <li>
                                    Cost<br/>
                                    {pathway.price}
                                </li>
                            </ul>
                        </div>

                        { pathway.description || pathway.industry ?
                            <div style={style.descriptionAndSalary}>
                                <ul className="horizCenteredList" style={style.descriptionAndSalaryUl}>
                                    { pathway.description ?
                                        <li style={style.descriptionAndSalaryLi}>
                                            { pathway.description }
                                        </li>
                                    : null }

                                    { pathway.industry ?
                                        <li style={style.descriptionAndSalaryLi}>

                                            Industry average salary<br/>
                                            { pathway.industry.averageSalary }<br/>
                                            { pathway.industry.title }
                                        </li>
                                    : null}
                                </ul>
                            </div>
                        : null }

                        <div>
                            <div>
                                <h1>Sponsor {pathway.sponsor.name}</h1>
                                {pathway.sponsor.description}
                                Homepage: <a href={pathway.sponsor.homepage}>{pathway.sponsor.name}</a>
                                {pathway.sponsor.blog ? <a href={pathway.sponsor.blog}>Blog</a> : null}
                                {pathway.sponsor.demo ? <a href={pathway.sponsor.demo}>Demo</a> : null}
                            </div>
                            {pathway.sponsor.quote ?
                                <div>
                                    {pathway.sponsor.quote.body}
                                    {pathway.sponsor.quote.speakerImage}
                                    {pathway.sponsor.quote.speakerName}
                                    {pathway.sponsor.quote.speakerTitle}
                                </div>
                                : null
                            }
                        </div>

                        <div>
                            Course overview
                        </div>

                        {pathway.extraInfo ?
                            <div>
                                {pathway.extraInfo}
                            </div>
                            : null
                        }
                    </div>
                    : <CircularProgress/>}
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        currentUser: state.users.currentUser,
        isFetching: state.users.isFetching
    };
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        getUsers,
        registerForPathway,
    }, dispatch);
}


export default connect(mapStateToProps, mapDispatchToProps)(Pathway);
