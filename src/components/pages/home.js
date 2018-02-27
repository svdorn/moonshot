"use strict"
import React, {Component} from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {browserHistory} from 'react-router';
import PathwayPreview from '../childComponents/pathwayPreview';
import HomepageTriangles from '../miscComponents/HomepageTriangles';
import {closeNotification, comingSoon} from "../../actions/usersActions";
import {TextField, RaisedButton, Paper, CircularProgress, Dialog, FlatButton} from 'material-ui';
import ComingSoonForm from '../childComponents/comingSoonForm';
import axios from 'axios';

class Home extends Component {

    constructor(props) {
        super(props);

        let emptyPathway = {
            name: "Loading...",
            previewImage: "",
            sponsor: {name: "", logo: ""},
            estimatedCompletionTime: "",
            deadline: "",
            price: "",
            _id: undefined
        }

        this.state = {
            // three empty pathways until we get the top three pathways from
            // the backend
            pathways1: [emptyPathway, emptyPathway, emptyPathway, emptyPathway],
            pathways2: undefined,
            open: false,
            dialogPathway: null,
        }
    }

    goTo(route) {
        // closes any notification
        this.props.closeNotification();
        // goes to the wanted page
        browserHistory.push(route);
        // goes to the top of the new page
        window.scrollTo(0, 0);
    }

    handleOpen = (pathway) => {
        // tell the user they are preregistered if logged in
        const currentUser = this.props.currentUser;
        if (currentUser && currentUser != "no user") {
            const user = {
                name: currentUser.name,
                email: currentUser.email,
                pathway: pathway,
            }
            const signedIn = true;
            this.props.comingSoon(user, signedIn);
            this.setState({open: true});
        }
        // if not logged in, prompt for user info
        else {
            this.setState({open: true, dialogPathway: pathway});
        }
    };

    handleClose = () => {
        this.setState({open: false, dialogPathway: null});
    };

    componentDidMount() {
        axios.get("/api/topPathways", {
            params: {numPathways: 6}
        }).then(res => {
            // make sure component is mounted before changing state
            if (this.refs.home) {
                const returnedPathways = res.data;
                let pathways2 = undefined;
                let pathways1 = [];
                if (returnedPathways.length >= 4) {
                    const halfwayPoint = returnedPathways.length / 2;
                    pathways2 = returnedPathways.slice(halfwayPoint);
                    pathways1 = returnedPathways.slice(0, halfwayPoint);
                } else {
                    pathways1 = returnedPathways;
                }
                this.setState({pathways1, pathways2});
            }
        }).catch(function (err) {
        })
    }

    scrollDown() {
        const scrollPosTop = window.innerWidth > 500 ? 710 : 550;
        window.scroll({
            top: scrollPosTop,
            left: 0,
            behavior: 'smooth'
        });
    }

    render() {
        // create the pathway previews
        let pathwayKey = 0;
        let self = this;
        const pathwayPreviews1 = this.state.pathways1.map(function (pathway) {
            pathwayKey++;
            let formattedDeadline = "";
            if (pathway.deadline) {
                const deadline = new Date(pathway.deadline);
                formattedDeadline = deadline.getMonth() + "/" + deadline.getDate() + "/" + deadline.getYear();
            }

            return (
                <li style={{verticalAlign: "top"}} key={pathwayKey}
                    //<!-- onClick={() => self.goTo('/pathway?' + pathway._id)}-->
                    onClick={() => self.handleOpen(pathway.name)}
                ><PathwayPreview
                    name={pathway.name}
                    image={pathway.previewImage}
                    logo = {pathway.sponsor.logoForLightBackground}
                    sponsorName = {pathway.sponsor.name}
                    completionTime = {pathway.estimatedCompletionTime}
                    deadline = {formattedDeadline}
                    price = {pathway.price}
                    _id = {pathway._id}
                    comingSoon = {pathway.comingSoon}
                /></li>
            );
        });

        let pathwayPreviews2 = undefined;
        if (this.state.pathways2) {
            pathwayKey = 100;
            pathwayPreviews2 = this.state.pathways2.map(function (pathway) {
                pathwayKey++;
                let formattedDeadline = "";
                if (pathway.deadline) {
                    const deadline = new Date(pathway.deadline);
                    formattedDeadline = deadline.getMonth() + "/" + deadline.getDate() + "/" + deadline.getYear();
                }

                return (
                    <li style={{verticalAlign: "top"}} key={pathwayKey}
                        //<!-- onClick={() => self.goTo('/pathway?' + pathway._id)}-->
                        onClick={() => self.handleOpen(pathway.name)}
                    ><PathwayPreview
                        name={pathway.name}
                        image={pathway.previewImage}
                        logo = {pathway.sponsor.logoForLightBackground}
                        sponsorName = {pathway.sponsor.name}
                        completionTime = {pathway.estimatedCompletionTime}
                        deadline = {formattedDeadline}
                        price = {pathway.price}
                        _id = {pathway._id}
                        comingSoon = {pathway.comingSoon}
                    /></li>
                );
            });
        }


        // const logosInfo = [
        //     {name: "amazon.png", height:"90px", left:"55%", top:"80%"},
        //     {name: "ArchVirtual.png", height:"50px", left:"70%", top:"57%"},
        //     {name: "Epic.png", height:"70px", left:"7%", top:"55%"},
        //     {name: "holosHomepage.png", height:"50px", left:"85%", top:"70%"},
        //     {name: "Singlewire.png", height:"80px", left:"20%", top:"10%"},
        //     {name: "Unity.png", height:"60px", left:"70%", top:"12%"},
        //     {name: "XES.png", height:"100px", left:"20%", top:"77%"}
        // ]
        //
        // const backgroundLogos = logosInfo.map(function(logo) {
        //     return (
        //         <img src={"/logos/" + logo.name} key={logo.name} style={{
        //             position: "absolute",
        //             height: logo.height,
        //             left: logo.left,
        //             top: logo.top
        //         }}/>
        //     )
        // })

        // const logos = [all the company images e.g. "Moonshot.png"];
        // const logoBar = logos.map(function(logo) {
        //     return (
        //         <img key={logo} src={"/logos/" + logo} className="logoBarLogo"/>
        //     );
        // })

        const skills = [
            "UX Design", "Data Science", "Machine Learning", "Graphic Design",
            "Front End Web Dev", "Virtual Reality", "3D Printing", "Javascript",
            "Agile", "Game Design", "SQL", "IoT", "Cloud",
            "DevOps", "SEO", "Social Media", "Growth Marketing",
            "Google Analytics", "Project Management", "Entrepeneurship"
        ]

        let brKey = -1;
        const exampleSkills = skills.map(function (skill) {
            brKey++;
            return (
                <div key={skill + "div"}
                     style={{display: 'inline-block', marginTop: '15px'}}
                     className="gradientBorderPurpleToPinkChip"
                >
                    <div key={skill} className="purpleText">
                        {skill}
                    </div>
                </div>
            );
        });

        let blurredClass = '';
        if (this.state.open) {
            blurredClass = 'dialogForBizOverlay';
        }
        const actions = [
            <FlatButton
                label="Close"
                primary={true}
                onClick={this.handleClose}
            />,
        ];


        // <div className="logoBar">
        //     <h3 style={style.hiringPartners}>Our Hiring Partners</h3>
        //     { logoBar }
        // </div>

        return (
            <div className='jsxWrapper' ref='home'>
                <div className={blurredClass}>
                    <Dialog
                        actions={actions}
                        modal={false}
                        open={this.state.open}
                        onRequestClose={this.handleClose}
                        autoScrollBodyContent={true}
                        paperClassName="dialogForBiz"
                        contentClassName="center"
                        overlayClassName="dialogOverlay"
                    >
                        {this.props.currentUser && this.props.currentUser != "no user" ?
                            <div>
                                {this.props.loadingEmailSend ?
                                    <div className="center"><CircularProgress style={{marginTop: "20px"}}/></div>
                                    :
                                    <div style={{color:"#00c3ff"}}>Your spot has been reserved!</div>
                                }
                            </div>
                            :
                            <ComingSoonForm
                                pathway={this.state.dialogPathway}
                                onSubmit={this.handleClose}
                            />
                        }
                    </Dialog>
                    <div className="fullHeight greenToBlue">
                        <HomepageTriangles style={{pointerEvents: "none"}} variation="1"/>

                        <div className="infoBox whiteText font40px font30pxUnder700 font24pxUnder500 font20pxUnder400 font18pxUnder350">
                            Skip the resum&eacute;.<br/>Learn skills that employers need<br/><i>and get paid to do it.</i><br/>
                            <button className="outlineButton font30px font20pxUnder500 blueWhiteButton"
                                    onClick={() => this.scrollDown()}>
                                Get Started
                            </button>
                            <br/>


                            <div className="scrollDownButton" onClick={() => this.scrollDown()}>
                                <div>
                                    <div/><div/>
                                </div>
                                <div>
                                    <div/><div/>
                                </div>
                            </div>


                            </div>
                            </div>

                            <div className="homepageTrajectoryContainer" style={{marginTop:"30px"}}>
                            <div className="homepageTrajectory">
                            <div className="homepageTrajectoryTextLeft onHome pushDownAbove800">
                                <img
                                    src="/icons/Lightbulb.png"
                                    alt="Lightbulb"
                                    title="Lightbulb icon"
                                    className="homepageTrajectoryTextLeftIcon onHome"
                                />
                                <div className="homepageTrajectoryTextLeftDiv onHome font18px font16pxUnder800">
                                    <h2 className="greenText font28px font24pxUnder800 font22pxUnder500">Complete Pathways<br/>And Learn Skills</h2>
                                      Pathways are a series of free courses
                                      designed to teach you skills that employers actually want.
                                      Who cares if you know how photosynthesis works?
                                </div>
                            </div>
                            <div className="homepageTrajectoryImagesRight onHome">
                                <div className="homepageImgBackgroundRight greenGradient" />
                                <img
                                    src="/images/VRGuy.jpg"
                                />
                            </div>
                        </div>

                        <br/>

                        <div className="homepageTrajectory">
                            <div className="homepageTrajectoryTextRight onHome pushDownAbove800">
                                <img
                                    src="/icons/Person.png"
                                    alt="Person icon"
                                    title="Person icon"
                                    className="homepageTrajectoryTextRightIcon personIcon onHome"
                                />
                                <div className="homepageTrajectoryTextRightDiv onHome font18px font16pxUnder800">
                                    <h2 className="blueText font28px font24pxUnder800 font22pxUnder500">Build Your Profile</h2>
                                    Add your skills, completed projects and
                                    finished pathways. The modern resumé – the
                                    B you got in history shouldn’t affect your
                                    chances of getting a tech job.
                                </div>
                            </div>
                            <div className="homepageTrajectoryImagesLeft">
                                <div className="homepageImgBackgroundLeft blueGradient"/>
                                <img
                                    src="/images/TwoPeopleInOffice.jpg"
                                />
                            </div>
                        </div>

                        <br/>

                        <div className="homepageTrajectory">
                            <div className="homepageTrajectoryTextLeft onHome pushDownSlightlyAbove800">
                                <img
                                    src="/icons/Badge.png"
                                    alt="Badge icon"
                                    title="Badge icon"
                                    className="homepageTrajectoryTextLeftIcon onHome smallerWidthIcon"
                                />
                                <div className="homepageTrajectoryTextLeftDiv onHome font18px font16pxUnder800">
                                    <h2 className="purpleText font28px font24pxUnder800 font22pxUnder500">Get Paid and Get Hired by<br/>Innovative Companies</h2>
                                    Compete for open positions with sponsor
                                    companies by excelling in pathways and
                                    demonstrating your skills. Score an
                                    interview with them and we’ll pay you $100.
                                </div>
                            </div>
                            <div className="homepageTrajectoryImagesRight">
                                <div className="homepageImgBackgroundRight purpleToRed"/>
                                <img
                                    src="/images/HappyBeardGuy.jpeg"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="purpleToGreenSpacer" id="picturesToPathwaysHomepageSpacer"/>

                    <div className="topMarginOnSmallScreen" style={{textAlign: "center"}}>
                        <div className="center font34px font32pxUnder800 font26pxUnder500 blueText">Pathways</div>
                        <div className="homePathwaysDesc font18px font16pxUnder800">
                            Moonshot courses are organized in<div className="br under500only"><br/></div> pathways and
                            sponsored<br/>by employers hiring for those skills.
                        </div>
                        <div className="pathwayPrevListContainer">
                            <ul className="horizCenteredList pathwayPrevList oneLinePathwayPrevList">
                                {pathwayPreviews1}
                            </ul>
                        </div>
                        {pathwayPreviews2 ?
                            <div className="pathwayPrevListContainer" style={{marginTop: '20px'}}>
                                <ul className="horizCenteredList pathwayPrevList oneLinePathwayPrevList">
                                    {pathwayPreviews2}
                                </ul>
                            </div>
                            : null
                        }
                        <div className="pathwayPrevListContainer pathwayPrevMobileThird">
                            <ul className="horizCenteredList pathwayPrevList oneLinePathwayPrevList">
                                {pathwayPreviews1[2]}
                            </ul>
                        </div>
                        <button className="blueGradientButtonExterior bigButton"
                                onClick={() => this.goTo('/signup')}
                                style={{marginTop: "40px"}}
                        >
                            <div className="invertColorOnHover gradientBorderButtonInterior">
                                Create Account
                            </div>
                        </button>
                        <div className="font14px font12pxUnder500 blueText" style={{margin: "10px 0 55px"}}>
                            <i>{"Don't worry, it's free."}</i></div>
                    </div>

                    <div className="purpleToGreenSpacer"/>

                    <div className="center" style={{marginBottom: "50px"}}>
                        <div className="font28px font24pxUnder800 font22pxUnder500 purpleText homePathwaysTitle">Build Your Skillset</div>

                        <div id="exampleSkillsContainer">
                            {exampleSkills}
                        </div>

                        <button className="purpleToPinkButtonExterior bigButton"
                                onClick={() => this.goTo('/signup')}
                                style={{marginTop: "40px"}}
                        >
                            <div className="invertColorOnHover gradientBorderButtonInterior">
                                Start Profile
                            </div>
                        </button>
                        <div className="clickable purpleText underline" style={{marginTop: '10px'}} onClick={() => this.goTo('/forBusiness')}><i>Are you an employer?</i></div>
                    </div>
                </div>
            </div>
        );
    }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        closeNotification,
        comingSoon
    }, dispatch);
}

function mapStateToProps(state) {
    return {
        currentUser: state.users.currentUser,
        loadingEmailSend: state.users.loadingSomething
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(Home);
