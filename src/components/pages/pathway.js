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
import {browserHistory} from 'react-router';

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
                height: "125px",
                width: "100%",
                position: "relative"
            },
            descriptionAndSalaryLi: {
                width: "40%",
                verticalAlign: "top",
                margin: "0px 40px",
                position: "relative"
            },
            descriptionAndSalaryUl: {
                fontSize: "20px"
            },
            descriptionAndSalaryIcon: {
                height: "50px",
                float: "left",
                margin: "12px 20px 0px 0px"
            },
            descriptionAndSalaryText: {
                float: "left",
                maxWidth: "calc(100% - 70px)"
            },
            quote: {
                everything: {
                    textAlign: "center",
                    padding: "20px 0px"
                },
                container: {
                    border: "2px solid blue",
                    fontSize: "30px",
                    padding: "20px"
                },
                leftSide: {
                    width: "35%",
                    display: "inline-block",
                    verticalAlign: "top",
                    marginRight: "5%"
                },
                rightSide: {
                    width: "55%",
                    display: "inline-block",
                    verticalAlign: "top"
                },
                speakerImage: {
                    borderRadius: "50%",
                    height: "50px",
                    width: "50px",
                    position: "absolute"
                },
                speakerInfo: {
                    marginLeft: "60px",
                    fontSize: "20px"
                },
                content: {
                    textAlign: "justify",
                    marginBottom: "20px"
                }

            },
            imageLeftTextRight: {
                position: "relative",
                textAlign: "left"
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
                        <div className="fullHeight purpleToBlue">
                            <HomepageTriangles style={{pointerEvents: "none"}} variation="1"/>

                            <div className="infoBox whiteText mediumText noWrap" style={{zIndex: "20"}}>
                                {pathway.sponsor.pathwayHomepage[0]}<br/>
                                {pathway.sponsor.pathwayHomepage[1]}<br/>
                                {pathway.sponsor.pathwayHomepage[2]}<br/>
                                <button className="outlineButton"
                                        style={{backgroundColor: "transparent", border: "2px solid white"}}
                                        onClick={this.handleClick.bind(this)}>
                                    {"Sign Up"}
                                </button>
                            </div>
                            <br/>
                            <div className="whiteText smallText2 noWrap" style={{textAlign: 'center'}}>
                                Sponsored By:
                                <img
                                    src={pathway.sponsor.logo}
                                    alt={pathway.sponsor.name}
                                    height={40}
                                    style={{paddingLeft: '15px'}}
                                />
                            </div>
                            <ul className="horizCenteredList whiteText smallText2"
                                style={{position: 'absolute', bottom: 0, width:'100%'}}>
                                <li style={{width: '200px'}}>
                                    <i>Completion Time</i><br/>
                                    {pathway.estimatedCompletionTime}
                                </li>
                                <li style={{width: '200px'}}>
                                    <i>Complete By</i><br/>
                                    {formattedDeadline}
                                </li>
                                <li style={{width: '200px'}}>
                                    <i>Cost</i><br/>
                                    {pathway.price}
                                </li>
                            </ul>
                        </div>


                        {pathway.description || pathway.industry ?
                            <div style={style.descriptionAndSalary}>
                                <ul className="horizCenteredList" style={style.descriptionAndSalaryUl}>
                                    {pathway.description ?
                                        <li style={style.descriptionAndSalaryLi}>
                                            <img
                                                src="/icons/GraduationHat.png"
                                                style={style.descriptionAndSalaryIcon}
                                            />
                                            <div style={style.descriptionAndSalaryText}>
                                                {pathway.description}
                                            </div>
                                        </li>
                                        : null}

                                    {pathway.industry ?
                                        <li style={style.descriptionAndSalaryLi}>
                                            <div>
                                                <img
                                                    src="/icons/Price.png"
                                                    style={style.descriptionAndSalaryIcon}
                                                />
                                                <div style={style.descriptionAndSalaryText}>
                                                    Industry average salary<br/>
                                                    for {pathway.industry.title}<br/>
                                                    <i>{pathway.industry.averageSalary}</i>
                                                </div>
                                            </div>
                                        </li>
                                        : null}
                                </ul>
                            </div>
                            : null}

                        <div className="greenToBlue" style={style.quote.everything}>
                            <h1>Sponsor {pathway.sponsor.name}</h1>
                            <div style={style.quote.leftSide}>
                                {pathway.sponsor.description}<br/>
                                {pathway.sponsor.hiring ?
                                    <div>Actively hiring {pathway.sponsor.hiring}<br/></div>
                                    : null}
                                Homepage: <a href={pathway.sponsor.homepage}>{pathway.sponsor.name}</a><br/>
                                {pathway.sponsor.blog ? <a href={pathway.sponsor.blog}>Blog</a> : null}<br/>
                                {pathway.sponsor.demo ? <a href={pathway.sponsor.demo}>Demo</a> : null}<br/>
                            </div>
                            {pathway.sponsor.quote ?
                                <div style={style.quote.rightSide}>
                                    <div style={style.quote.container}>
                                        <div style={style.quote.content}>
                                            {"\""}{pathway.sponsor.quote.body}{"\""}<br/>
                                        </div>

                                        <div style={style.imageLeftTextRight}>
                                            <img
                                                src={pathway.sponsor.quote.speakerImage}
                                                style={style.quote.speakerImage}
                                                alt={""}
                                            />
                                            <div style={style.quote.speakerInfo}>
                                                {pathway.sponsor.quote.speakerName}<br/>
                                                {pathway.sponsor.quote.speakerTitle}
                                            </div>
                                        </div>


                                    </div>
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
