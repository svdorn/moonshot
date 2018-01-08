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
                position: "relative",
                height: "150px"
            },
            descriptionAndSalaryIcon: {
                height: "50px",
                position: "absolute",
                top: "0",
                bottom: "0",
                right: "80%",
                margin: "auto"
            },
            descriptionAndSalaryText: {
                width: "50%",
                fontSize: "20px",
                right: "0",
                left: "0",
                margin: "auto",
                textAlign: "center",
                position: "absolute",
                top: "50%",
                transform: "translateY(-50%)"
            },
            descriptionAndSalaryHalf: {
                width: "50%",
                float: "left",
                position: "relative",
                height: "150px"
            },
            descriptionAndSalaryFull: {
                width: "100%",
                position: "relative",
                height: "150px"
            },
            quote: {
                everything: {
                    textAlign: "center",
                    padding: "20px 0px"
                },
                container: {
                    border: "2px solid #B869FF",
                    fontSize: "30px",
                    padding: "20px",
                    textAlign: "center",
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
                    marginBottom: "20px"
                }

            },
            infoBoxes: {
                image: {
                    height: "70px",
                    position: "absolute",
                    top: "0",
                    bottom: "0",
                    margin: "auto -200px auto"
                },
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
            },
            textIcons: {
                height: "100px",
                float: "left",
                margin: "12px 20px 0px 0px"
            },
            text: {
                float: "left",
            },
            textComponent: {
                marginTop: '20px',
            },
            textComponentLi: {
                width: "50%",
                verticalAlign: "top",
                display: 'inline-block',
            },
            textComponentUl: {
                fontSize: "20px",
                textAlign: 'center',
            },
        }

        console.log(this.state.pathway);

        const pathway = this.state.pathway;
        const deadline = new Date(this.state.pathway.deadline);
        const formattedDeadline = deadline.getMonth() + "/" + deadline.getDate() + "/" + deadline.getYear();

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
                            </div><br/>
                            { this.props.loading ? <div className="center"><CircularProgress color="white" style={{marginTop:"20px"}}/><br/></div> : "" }
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
                                {pathway.description ?
                                    <div style={pathway.industry ?
                                        style.descriptionAndSalaryHalf
                                        :
                                        style.descriptionAndSalaryFull
                                    }>
                                        <img
                                            src="/icons/GraduationHat.png"
                                            style={style.descriptionAndSalaryIcon}
                                        />
                                        <div style={style.descriptionAndSalaryText}>
                                            {pathway.description}
                                        </div>
                                    </div>
                                    : null}

                                {pathway.industry ?
                                    <div style={pathway.description ?
                                        style.descriptionAndSalaryHalf
                                        :
                                        style.descriptionAndSalaryFull
                                    }>
                                        <img
                                            src="/icons/Price.png"
                                            style={style.descriptionAndSalaryIcon}
                                        />
                                        <div style={style.descriptionAndSalaryText}>
                                            Industry average salary for {pathway.industry.title}<br/>
                                            <i>{pathway.industry.averageSalary}</i>
                                        </div>
                                    </div>
                                    : null}
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
                                    <a href={pathway.sponsor.homepage} target="_blank" style={style.infoLinks}
                                       className="smallText2">Website</a>
                                    {pathway.sponsor.blog ?
                                        <a href={pathway.sponsor.blog} target="_blank" style={style.infoLinks}
                                           className="smallText2">Blog</a> : null}
                                    {pathway.sponsor.demo ?
                                        <a href={pathway.sponsor.demo} target="_blank" style={style.infoLinks}
                                           className="smallText2">Demo</a> : null}
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
                            {pathway.sponsor ?
                                <div style={{marginBottom: "70px"}}>
                                    <HomepageTriangles variation="3" />
                                    <ul className="horizCenteredList homepageBenefitsList">
                                        <li style={{marginRight: "14%"}}>
                                            <div style={{position: "relative"}}>
                                                <img
                                                    src="/icons/NoMoney.png"
                                                    alt="Free"
                                                    style={style.infoBoxes.image}
                                                />
                                                <div className="smallText2">
                                                    It{"'"}s free.<br/>
                                                    {pathway.sponsor.name} provides scholarships<br/>
                                                    to pay for your pathway.
                                                </div>
                                            </div>
                                        </li>
                                        <li>
                                            <div style={{position: "relative"}}>
                                                <img
                                                    src="/icons/Portfolio.png"
                                                    alt="Portfolio"
                                                    style={style.infoBoxes.image}
                                                />
                                                <div className="smallText2">
                                                    Learn {pathway.sponsor.learn}<br/>
                                                    and build<br/>
                                                    your {pathway.sponsor.type} portfolio.
                                                </div>
                                            </div>
                                        </li>
                                    </ul>
                                    <ul className="horizCenteredList homepageBenefitsList">
                                        <li>
                                            <div style={{position: "relative"}}>
                                                <img
                                                    src="/icons/CheckMark.png"
                                                    alt="Check Mark"
                                                    style={style.infoBoxes.image}
                                                />
                                                <div className="smallText2">
                                                    Get evaluated by {pathway.sponsor.name}<br/>
                                                    and other {pathway.sponsor.type} employers<br/>
                                                    based on your performance.
                                                </div>
                                            </div>
                                        </li>
                                    </ul>
                                </div>


                                : null}
                        </div>


                        < div className="homepageSeparatorContainer">
                            < div className="homepageSeparator"/>
                        </div>

                        < div className="center">
                            < b style={{color: '#B869FF'}} className="mediumText">COURSE OVERVIEW</ b>
                            {pathway.steps ?
                                <ul className="horizCenteredList homepageBenefitsList">
                                    <li style={{marginRight: "14%"}}>
                                        <div style={{position: "relative"}}>
                                            <img
                                                src="/icons/1.png"
                                                alt="Free"
                                                style={style.infoBoxes.image}
                                            />
                                            <div className="smallText2" style={{color:'#B869FF'}}>
                                                Step 1
                                            </div>
                                            <div className="smallText2">
                                                {pathway.steps[0].name}
                                            </div>
                                        </div>
                                    </li>
                                    <li>
                                        <div style={{position: "relative"}}>
                                            <img
                                                src="/icons/2.png"
                                                alt="Portfolio"
                                                style={style.infoBoxes.image}
                                            />
                                            <div className="smallText2" style={{color:'#B869FF'}}>
                                                Step 2
                                            </div>
                                            <div className="smallText2">
                                                {pathway.steps[1].name}
                                            </div>
                                        </div>
                                    </li>
                                </ul>
                                : null}
                        </ div>

                        <div className="homepageSeparatorContainer">
                            < div className="homepageSeparator"/>
                        </ div>

                        {pathway.extraInfo ?
                            <div className="center">
                                <p className="smallText2">
                                    {pathway.extraInfo}
                                </p>
                            </div>
                            : null
                        }
                        <div className="center" style={{marginBottom: "20px"}}>
                            <button className="outlineButton"
                                    style={{
                                        backgroundColor: "transparent",
                                        border: "2px solid #B869FF",
                                        color: "#B869FF"
                                    }}
                                    onClick={this.handleClick.bind(this)}>
                                {"Get Started"}
                            </button>
                            { this.props.loading ? <div><br/><CircularProgress color="#B869FF" style={{marginTop:"20px"}}/></div> : "" }
                        </div>
                    </div>
                    :
                    <CircularProgress/>
                }

            </div>
        )
            ;
    }
}

function mapStateToProps(state) {
    return {
        currentUser: state.users.currentUser,
        isFetching: state.users.isFetching,
        loading: state.users.loadingSomething,
    };
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        getUsers,
        registerForPathway,
    }, dispatch);
}


export default connect(mapStateToProps, mapDispatchToProps)(Pathway);
