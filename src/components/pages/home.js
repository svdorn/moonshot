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
import MetaTags from 'react-meta-tags';

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
            pathways: [emptyPathway, emptyPathway, emptyPathway, emptyPathway, emptyPathway, emptyPathway],
            open: false,
            dialogPathway: null,
        }

        // capture referral code in cookie, if it exists
        if (props.location && props.location.query && props.location.query.referralCode) {
            this.captureCode();
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
        if (!pathway.comingSoon) {
            let currentUser = this.props.currentUser;
            if (!currentUser || currentUser === "no user") {
                this.goTo('/pathway?pathway=' + pathway.url);
            } else {
                // if the user has the pathway, go straight to the content page
                if (currentUser.pathways.some(function(path) {
                    return path.pathwayId == pathway._id;
                })) {
                    this.goTo('/pathwayContent?pathway=' + pathway.url)
                }
                // otherwise go to the pathway landing page
                else {
                    this.goTo('/pathway?pathway=' + pathway.url);
                }
            }
        } else {
            // tell the user they are preregistered if logged in
            const currentUser = this.props.currentUser;
            if (currentUser && currentUser != "no user") {
                const user = {
                    name: currentUser.name,
                    email: currentUser.email,
                    pathway: pathway.name,
                }
                const signedIn = true;
                this.props.comingSoon(user, signedIn);
                this.setState({open: true});
            }
            // if not logged in, prompt for user info
            else {
                this.setState({open: true, dialogPathway: pathway.name});
            }
        }
    };

    handleClose = () => {
        this.setState({open: false, dialogPathway: null});
    };

    componentDidMount() {
        axios.get("/api/pathway/topPathways", {
            params: {numPathways: 6}
        }).then(res => {
            // make sure component is mounted before changing state
            if (this.refs.home) {
                this.setState({pathways: res.data})
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
        const pathwayPreviews = this.state.pathways.map(function (pathway) {
            pathwayKey++;
            let formattedDeadline = "";
            if (pathway.deadline) {
                const deadline = new Date(pathway.deadline);
                formattedDeadline = deadline.getMonth() + "/" + deadline.getDate() + "/" + deadline.getYear();
            }

            const pathwayName = pathway.name ? pathway.name : "";
            const pathwayImage = pathway.previewImage ? pathway.previewImage : "";
            const pathwayAltTag = pathway.imageAltTag ? pathway.imageAltTag : pathwayName + " Preview Image";
            const pathwayLogo = pathway.sponsor && pathway.sponsor.logoForLightBackground ? pathway.sponsor.logoForLightBackground : "";
            const pathwaySponsorName = pathway.sponsor && pathway.sponsor.name ? pathway.sponsor.name : "";
            const pathwayCompletionTime = pathway.estimatedCompletionTime ? pathway.estimatedCompletionTime : "";
            const pathwayPrice = pathway.price ? pathway.price : "";
            const pathwayId = pathway._id ? pathway._id : undefined;
            const pathwayComingSoon = pathway.comingSoon ? pathway.comingSoon : false;
            const pathwayShowComingSoonBanner = pathway.showComingSoonBanner ? pathway.showComingSoonBanner : false;

            return (
                <li style={{verticalAlign: "top"}}
                    className="pathwayPreviewLi explorePathwayPreview"
                    key={pathwayKey}
                    onClick={() => self.handleOpen(pathway)}
                ><PathwayPreview
                    name={pathwayName}
                    image={pathwayImage}
                    imageAltTag={pathwayAltTag}
                    logo={pathwayLogo}
                    sponsorName={pathwaySponsorName}
                    completionTime={pathwayCompletionTime}
                    deadline={formattedDeadline}
                    price={pathwayPrice}
                    _id={pathwayId}
                    comingSoon={pathwayComingSoon}
                    showComingSoonBanner={pathwayShowComingSoonBanner}
                /></li>
            );
        });


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
        //         <img alt="Partner Company Logo"
        //             src={"/logos/" + logo.name} key={logo.name} style={{
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
        //         <img alt="Partner Company Logo" key={logo} src={"/logos/" + logo} className="logoBarLogo"/>
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
                <MetaTags>
                    <title>Moonshot</title>
                    <meta name="description" content="Moonshot helps you get a job for your skills, not your GPA. Find the perfect job for you." />
                </MetaTags>
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
                            Your modern resume.<br/>We{"'"}ll help you get hired for<br/>who you are.<br/>
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
                                    alt="Lightbulb Icon"
                                    title="Lightbulb Icon"
                                    className="homepageTrajectoryTextLeftIcon onHome"
                                />
                                <div className="homepageTrajectoryTextLeftDiv onHome font18px font16pxUnder800">
                                    <h2 className="greenText font28px font24pxUnder800 font22pxUnder500">Complete Pathways To Get Evaluated For Open Positions</h2>
                                      Pathways are 30 to 45 minute position evaluations given by employers.

                                </div>
                            </div>
                            <div className="homepageTrajectoryImagesRight onHome">
                                <div className="homepageImgBackgroundRight greenGradient" />
                                <img
                                    alt="Man Using Virtual Reality"
                                    src="/images/VRGuy.jpg"
                                />
                            </div>
                        </div>

                        <br/>

                        <div className="homepageTrajectory">
                            <div className="homepageTrajectoryTextRight onHome pushDownAbove800">
                                <img
                                    src="/icons/Person.png"
                                    alt="Person Icon"
                                    title="Person Icon"
                                    className="homepageTrajectoryTextRightIcon personIcon onHome"
                                />
                                <div className="homepageTrajectoryTextRightDiv onHome font18px font16pxUnder800">
                                    <h2 className="blueText font28px font24pxUnder800 font22pxUnder500">Build Your Cred</h2>
                                    Complete a psychometric analysis to prove your potential and earn Skill IQs with short quizzes.
                                </div>
                            </div>
                            <div className="homepageTrajectoryImagesLeft">
                                <div className="homepageImgBackgroundLeft blueGradient"/>
                                <img
                                    alt="Two People Collaborating In Office"
                                    src="/images/TwoPeopleInOffice.jpg"
                                />
                            </div>
                        </div>

                        <br/>

                        <div className="homepageTrajectory">
                            <div className="homepageTrajectoryTextLeft onHome pushDownSlightlyAbove800">
                                <img
                                    src="/icons/Badge.png"
                                    alt="Badge Icon"
                                    title="Badge Icon"
                                    className="homepageTrajectoryTextLeftIcon onHome smallerWidthIcon"
                                />
                                <div className="homepageTrajectoryTextLeftDiv onHome font18px font16pxUnder800">
                                    <h2 className="purpleText font28px font24pxUnder800 font22pxUnder500">Get Hired by<br/>Innovative Companies</h2>
                                    Compete for open positions by excelling in
                                    Pathways and building your credentials.
                                </div>
                            </div>
                            <div className="homepageTrajectoryImagesRight">
                                <div className="homepageImgBackgroundRight purpleToRed"/>
                                <img
                                    alt="Happy Guy With Beard"
                                    src="/images/HappyBeardGuy.jpeg"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="purpleToGreenSpacer" id="picturesToPathwaysHomepageSpacer"/>

                    <div className="topMarginOnSmallScreen" style={{textAlign: "center"}}>
                        <div className="center font34px font32pxUnder800 font26pxUnder500 blueText clickableNoUnderline inlineBlock" onClick={() => this.goTo("/discover")}>Pathways</div>
                        <div className="homePathwaysDesc font18px font16pxUnder800" style={{padding: "0 20px"}}>
                            Online evaluations given by employers to assess you for an open position.
                        </div>

                        <ul className="horizCenteredList pathwayPrevList" style={{minHeight:"400px", maxHeight:"779px", overflow:"hidden", maxWidth:"1000px"}}>
                            {pathwayPreviews}
                        </ul>

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
                                style={{marginTop: "65px"}}
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


    /************************ REFERRAL COOKIE FUNCTIONS *******************************/
    //this is the name of the cookie on the users machine
    cookieName = "ReferralCodeCookie";
    //the name of the url paramater you are expecting that holds the code you wish to capture
    //for example, http://www.test.com?couponCode=BIGDISCOUNT your URL Parameter would be
    //couponCode and the cookie value that will be stored is BIGDISCOUNT
    URLParameterName = "referralCode";
    //how many days you want the cookie to be valid for on the users machine
    cookiePersistDays = 7;

    // Extract the code from the URL based on the defined parameter name
    captureCode() {
        var q = this.getParameterByName(this.URLParameterName);
        if (q != null && q != "") {
            this.eraseCookie(this.cookieName);
            this.createCookie(this.cookieName, q, this.cookiePersistDays);
        }
    }

    createCookie(name, value, days) {
        let expires = ""
        if (days) {
            let date = new Date();
            date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
            let expires = "; expires=" + date.toGMTString();
        }
        document.cookie = name + "=" + value + expires + "; path=/";
    }

    eraseCookie(name) {
        this.createCookie(name, "", -1);
    }

    //Retrieve a query string parameter
    getParameterByName(name) {
        let value = undefined;
        try {
            value = this.props.location.query[name];
        } catch (e) {
            // don't need to do anything if the query doesn't exist
        }
        return value;
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
