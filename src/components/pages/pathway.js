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
                marginTop: '20px',
            },
            descriptionAndSalaryLi: {
                width: "50%",
                verticalAlign: "top",
                display : 'inline-block',
            },
            descriptionAndSalaryUl: {
                fontSize: "20px",
                textAlign: 'center',
            },
            descriptionAndSalaryIcon: {
                height: "50px",
                float: "left",
                margin: "12px 20px 0px 0px"
            },
            descriptionAndSalaryText: {
                float: "left",
                width: '50%',
            },
            quote: {
                everything: {
                    textAlign: "center",
                    padding: "20px 0px"
                },
                container: {
                    border: "2px solid #B869FF",
                    fontSize: "30px",
                    padding: "20px"
                },
                leftSide: {
                    width: "55%",
                    display: "inline-block",
                    verticalAlign: "top",
                    marginRight: "5%"
                },
                rightSide: {
                    width: "35%",
                    display: "inline-block",
                    verticalAlign: "top",
                    justifyContent: "center",
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
                    textAlign: "center",
                    marginBottom: "20px"
                }

            },
            imageLeftTextRight: {
                position: "relative",
                textAlign: "left"
            },
            iconsLeft: {
                height: "45px",
                marginRight: '10px',
                position: 'relative',
                top: '-15px',
            },
            infoLinks: {
                marginLeft: '10px',
                color: 'black',
            },
            spaceTop: {
                marginTop: '20px',
            },
            title: {
                width: "50%",
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

                            <div className="infoBox whiteText mediumText" style={{zIndex: "20", width: '40%'}}>
                                {pathway.sponsor.pathwayHomepage}<br/>
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
                                style={{position: 'absolute', bottom: 0, width: '100%'}}>
                                <li style={{width: '300px'}}>
                                    <img src="/icons/ClockWhite.png" className="pathwayLandingIcons"/>
                                    <div style={{display: 'inline-block'}}>
                                        <i>Completion Time</i><br/>
                                        {pathway.estimatedCompletionTime}
                                    </div>
                                </li>
                                <li style={{width: '300px'}}>
                                    <img src="/icons/CalendarWhite.png" className="pathwayLandingIcons"/>
                                    <div style={{display: 'inline-block'}}>
                                        <i>Complete By</i><br/>
                                        {formattedDeadline}
                                    </div>
                                </li>
                                <li style={{width: '300px'}}>
                                    <img src="/icons/DollarSignWhite.png" className="pathwayLandingIcons"/>
                                    <div style={{display: 'inline-block'}}>
                                        <i>Cost</i><br/>
                                        {pathway.price}
                                    </div>
                                </li>
                            </ul>
                        </div>


                        {pathway.description || pathway.industry ?
                            <div style={style.descriptionAndSalary}>
                                <ul style={style.descriptionAndSalaryUl}>
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
                                                    Industry average salary for {pathway.industry.title}<br/>
                                                    <i>{pathway.industry.averageSalary}</i>
                                                </div>
                                            </div>
                                        </li>
                                        : null}
                                </ul>
                            </div>
                            : null}

                        <div className="homepageSeparatorContainer">
                            <div className="homepageSeparator"/>
                        </div>

                        <div style={style.quote.everything}>
                            <h1>Sponsored by <img
                                src={pathway.sponsor.logo}
                                alt={pathway.sponsor.name}
                                height={70}
                            /></h1>
                            <div style={style.quote.leftSide}>
                                <div>
                                    <img
                                        src="/icons/Information.png"
                                        style={style.iconsLeft}
                                    />
                                    <b style={{color: '#B869FF'}} className="mediumText">ABOUT</b>
                                </div>
                                <div className="smallText2">
                                    {pathway.sponsor.description}
                                </div>
                                {pathway.sponsor.hiring ?
                                    <div style={style.spaceTop}>
                                        <img
                                            src="/icons/Employee.png"
                                            style={style.iconsLeft}
                                        />
                                        <b style={{color: '#B869FF'}} className="mediumText">OPEN POSITIONS</b><br/>
                                        <div className="smallText2">- {pathway.sponsor.hiring}</div>
                                    </div>
                                    : null}
                                <div style={style.spaceTop}>
                                    <img
                                        src="/icons/www.png"
                                        style={style.iconsLeft}
                                    />
                                    <b style={{color: '#B869FF'}}
                                       className="mediumText">{pathway.sponsor.name.toUpperCase()} LINKS</b><br/>
                                    <a href={pathway.sponsor.homepage} style={style.infoLinks} className="smallText2">Website</a>
                                    {pathway.sponsor.blog ?
                                        <a href={pathway.sponsor.blog} style={style.infoLinks} className="smallText2">Blog</a> : null}
                                    {pathway.sponsor.demo ?
                                        <a href={pathway.sponsor.demo} style={style.infoLinks} className="smallText2">Demo</a> : null}
                                </div>
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

                        <div className="homepageSeparatorContainer">
                            <div className="homepageSeparator"/>
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
