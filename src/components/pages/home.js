"use strict"
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { browserHistory } from 'react-router';
import PathwayPreview from '../childComponents/pathwayPreview';
import HomepageTriangles from '../miscComponents/HomepageTriangles';
import { closeNotification } from "../../actions/usersActions";
import axios from 'axios';

class Home extends Component{

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
            pathways2: undefined
        }
    }

    goTo (route)  {
        // closes any notification
        this.props.closeNotification();
        // goes to the wanted page
        browserHistory.push(route);
        // goes to the top of the new page
        window.scrollTo(0, 0);
    }

    componentDidMount() {
        axios.get("/api/topPathways", {
            params: { numPathways: 12 }
        }).then(res => {
            // make sure component is mounted before changing state
            if (this.refs.home) {
                const returnedPathways = res.data;
                let pathways2 = undefined;
                let pathways1 = [];
                if (returnedPathways.length >= 6) {
                    const halfwayPoint = returnedPathways.length / 2;
                    pathways2 = returnedPathways.slice(halfwayPoint);
                    pathways1 = returnedPathways.slice(0, halfwayPoint);
                } else {
                    pathways1 = returnedPathways;
                }
                this.setState({ pathways1, pathways2 });
            }
        }).catch(function(err) {
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

    render(){

        // const style = {
        //     hiringPartners: {
        //         fontSize: "12px",
        //         color: "gray",
        //         marginBottom: "30px"
        //     }, leftLi: {
        //         float: "left",
        //         textAlign: "left",
        //         position: "relative",
        //         marginLeft: "100px",
        //         clear: "both"
        //     }, rightLi: {
        //         float: "right",
        //         textAlign: "left",
        //         position: "relative",
        //         marginRight: "100px",
        //         clear: "both"
        //     }
        // }

        // create the pathway previews
        let pathwayKey = 0;
        let self = this;
        const pathwayPreviews1 = this.state.pathways1.map(function(pathway) {
            pathwayKey++;
            const deadline = new Date(pathway.deadline);
            const formattedDeadline = deadline.getMonth() + "/" + deadline.getDate() + "/" + deadline.getYear();
            return (
                <li style={{verticalAlign: "top"}} key={pathwayKey} onClick={() => self.goTo('/pathway?' + pathway._id)} ><PathwayPreview
                    name = {pathway.name}
                    image = {pathway.previewImage}
                    //<!-- logo = {pathway.sponsor.logo} -->
                    //<!-- sponsorName = {pathway.sponsor.name} -->
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
            pathwayPreviews2 = this.state.pathways2.map(function(pathway) {
                pathwayKey++;
                const deadline = new Date(pathway.deadline);
                const formattedDeadline = deadline.getMonth() + "/" + deadline.getDate() + "/" + deadline.getYear();
                return (
                    <li style={{verticalAlign: "top"}} key={pathwayKey} onClick={() => self.goTo('/pathway?' + pathway._id)} ><PathwayPreview
                        name = {pathway.name}
                        image = {pathway.previewImage}
                        //<!-- logo = {pathway.sponsor.logo} -->
                        //<!-- sponsorName = {pathway.sponsor.name} -->
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


        // <div className="logoBar">
        //     <h3 style={style.hiringPartners}>Our Hiring Partners</h3>
        //     { logoBar }
        // </div>

        return (
            <div className='jsxWrapper' ref='home'>
                <div className="fullHeight greenToBlue">
                    <HomepageTriangles style={{pointerEvents:"none"}} variation="1" />

                    <div className="infoBox whiteText mediumText" style={{zIndex:"20", width:"100%"}}>
                        Skip the resum&eacute;.<br/> Learn skills that employers<div className="from500to600only under400only br"><br/></div> need<div className="outside500to600only above400only br"><br/></div> <i>for free, forever.</i><br/>
                        <button className="outlineButton blueWhiteButton"
                            onClick={() => this.goTo('/signup')}>
                            Get Started
                        </button>
                        <br/>
                        <img
                            className="scrollDownButton"
                            src="/icons/Scroll.png"
                            onClick={() => this.scrollDown()}
                        />
                    </div>
                </div>

                <div className="homepageTrajectoryContainer" style={{marginTop:"30px"}}>
                    <div className="homepageTrajectory">
                        <div className="homepageTrajectoryTextLeft onHome">
                            <img
                                src="/icons/Lightbulb.png"
                                alt="Lightbulb"
                                title="Lightbulb icon"
                                className="homepageTrajectoryTextRightIcon onHome"
                            />
                            <div className="smallText2 homepageTrajectoryTextLeftDiv onHome">
                                <h2 className="greenText">Complete Pathways<br/>And Learn Skills</h2>
                                Pathways are a series of courses
                                designed to teach you skills
                                demanded by the market.
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
                        <div className="homepageTrajectoryTextRight onHome">
                            <img
                                src="/icons/Person.png"
                                alt="Person icon"
                                title="Person icon"
                                className="homepageTrajectoryTextRightIcon onHome"
                            />
                            <div className="smallText2 homepageTrajectoryTextRightDiv onHome">
                                <h2 className="blueText">Build Your Profile</h2>
                                Add your skills, completed projects and
                                finished pathways. Prove yourself through
                                your profile.
                            </div>
                        </div>
                        <div className="homepageTrajectoryImagesLeft">
                            <div className="homepageImgBackgroundLeft blueGradient" />
                            <img
                                src="/images/TwoPeopleInOffice.jpg"
                            />
                        </div>
                    </div>

                    <br />

                    <div className="homepageTrajectory">
                        <div className="homepageTrajectoryTextLeft onHome">
                            <img
                                src="/icons/Badge.png"
                                alt="Badge icon"
                                title="Badge icon"
                                className="homepageTrajectoryTextLeftIcon smallerWidthIcon"
                            />
                            <div className="smallText2 homepageTrajectoryTextLeftDiv onHome">
                                <h2 className="purpleText">Get Hired By Companies<br/>Leading The Future</h2>
                                Compete for open positions with
                                sponsor employers by excelling in
                                pathways and strengthening your profile.
                            </div>
                        </div>
                        <div className="homepageTrajectoryImagesRight">
                            <div className="homepageImgBackgroundRight purpleToRed" />
                            <img
                                src="/images/HappyBeardGuy.jpeg"
                            />
                        </div>
                    </div>
                </div>

                <div className="purpleToGreenSpacer" id="picturesToPathwaysHomepageSpacer" />

                <div className="topMarginOnSmallScreen" style={{textAlign:"center"}}>
                    <div className="center mediumText blueText homePathwaysTitle">Pathways</div>
                    <div className="homePathwaysDesc">
                        Moonshot courses are organized in pathways and
                        sponsored by<br/> employers hiring for those skills.
                    </div>
                    <div className="pathwayPrevListContainer">
                        <ul className="horizCenteredList pathwayPrevList">
                            {pathwayPreviews1}
                        </ul>
                    </div>
                    {pathwayPreviews2 ?
                        <div className="pathwayPrevListContainer">
                            <ul className="horizCenteredList pathwayPrevList">
                                {pathwayPreviews2}
                            </ul>
                        </div>
                        : null
                    }
                    <button className="blueGradientButtonExterior bigButton"
                            onClick={() => this.goTo('/signup')}
                            style={{marginTop: "40px"}}
                    >
                        <div className="invertColorOnHover gradientBorderButtonInterior">
                            Create Account
                        </div>
                    </button>
                    <div className="smallText blueText" style={{margin:"10px 0 55px"}}><i>{"Don't worry, it's free."}</i></div>
                </div>

                <div className="purpleToGreenSpacer" />

                <div className="center" style={{marginBottom:"50px"}}>
                    <div className="mediumText purpleText homePathwaysTitle">Build Your Skillset</div>

                    <div id="exampleSkillsContainer">
                        { exampleSkills }
                    </div>

                    <button className="purpleToPinkButtonExterior bigButton"
                            onClick={() => this.goTo('/signup')}
                            style={{marginTop: "40px"}}
                    >
                        <div className="invertColorOnHover gradientBorderButtonInterior">
                            Start Profile
                        </div>
                    </button>
                </div>
            </div>
        );
    }
}

// <div className="fullHeight" >
//     <div style={{textAlign:"center", width: "50%"}}>
//         <ul className="horizCenteredList homepageBenefitsList">
//             <li style={{marginRight:"14%"}}>
//                 <div style={{position:"relative"}}>
//                     <img
//                         src="/icons/Tree.png"
//                         alt="Tree"
//                         style={{
//                             height:"90px",
//                             position:"absolute",
//                             marginTop:"20px",
//                             marginLeft:"-200px"
//                         }}
//                     />
//                     <img
//                         src="/icons/BlockyPerson.png"
//                         alt="Profile"
//                         style={{
//                             height:"70px",
//                             position:"absolute",
//                             marginTop:"300px",
//                             marginLeft:"-190px"
//                         }}
//                     />
//                     <div className="smallText2">
//                         Free
//
//                         <div style={{height:"100px"}} />
//
//                         Relevant to your future<br/>
//                         and on pace with technology<br/>
//                     </div>
//                 </div>
//             </li>
//             <li>
//                 <div style={{position:"relative"}}>
//                     <img
//                         src="/icons/Price.png"
//                         alt="Price"
//                         style={{
//                             height:"90px",
//                             position:"absolute",
//                             marginTop:"20px",
//                             marginLeft:"-190px"
//                         }}
//                     />
//                     <img
//                         src="/icons/PaperAndPencil.png"
//                         alt="Contracting"
//                         style={{
//                             height:"80px",
//                             position:"absolute",
//                             marginTop:"290px",
//                             marginLeft:"-195px"
//                         }}
//                     />
//                     <div className="smallText2">
//                         Prepare for the Future<br/>
//                         at no cost to you.<br/>
//                         Learn skills from courses<br/>
//                         paid for by the employer.
//                     </div>
//
//                     <div style={{height:"100px"}} />
//
//                     <div className="smallText2">
//                         <h2 style={{fontSize:"30px", color:"#b769ff"}}>
//                             <strong>CONTRACTING</strong>
//                         </h2>
//                         Still in school or too busy<br/>
//                         For a full-time job?<br/>
//                         Credential yourself for employers<br/>
//                         looking for contractors.
//                     </div>
//                 </div>
//             </li>
//         </ul>
//
//         <button className="outlineButton" style={{
//             color:"#b769ff",
//             border:"3px solid #b769ff",
//             marginTop:"30px" }}
//             onClick={() => this.goTo('/signup')}>
//             {"I'm Ready For"}<br/>
//             {"The Future"}
//         </button>
//     </div>
// </div>
























// <div className="fullHeight">
//     <div className="infoBox greenText bigText nowrap">
//         <i>Companies are searching<br/>
//         for people to spearhead<br/>
//         the future of technology.</i><br/>
//         <div className="dividerSmall" />
//         <button className="outlineButton whiteBlueButton"
//             onClick={() => this.goTo('/signup')}>
//             Join the Movement
//         </button>
//         <p  className="clickable blueText smallText"
//             style={{marginTop:"10px"}}
//             onClick={() => this.goTo('/forBusiness')}>
//             <i>Are you an employer? Click here.</i>
//         </p>
//     </div>
//
//     {backgroundLogos}
//
// </div>


// <div className="halfHeight purpleToBlue">
//     <div className="infoBox whiteText mediumText" style={{paddingTop:"100px"}}>
//         We work with employers to create course pathways that
//         teach you the skills they want you to know.
//     </div>
// </div>


// <div className="homepageSeparatorContainer"><div className="homepageSeparator" /></div>
//
// <div className="fullHeight" style={{textAlign:"center"}}>
//     <HomepageTriangles variation="2" />
//     <div style={{zIndex: 0}}>
//         <img
//             src="/images/TheMoonshotTrajectory.png"
//             alt="Pathways"
//             style={{marginTop:"45px", marginBottom:"15px", width:"700px"}}
//         /><br/>
//         <div style={{
//             float:"left",
//             textAlign:"left",
//             position:"relative",
//             marginLeft:"100px"
//         }}>
//             <img
//                 src="/icons/Lightbulb.png"
//                 alt="Lightbulb"
//                 style={{height:"90px", position:"absolute", top:"50%", marginTop:"-45px"}}
//             />
//             <div className="smallText2" style={{float:"right", marginLeft:"140px"}}>
//                 <h2 className="greenText" style={{fontSize:"32px"}}>
//                     Complete Pathways<br/>
//                     And Learn Skills<br/>
//                 </h2>
//                 We work directly with the most<br/>
//                 innovative companies to curate<br/>
//                 pathways that consist of courses to<br/>
//                 teach you the skills that they look for.
//             </div>
//         </div>
//         <div style={{
//             float:"right",
//             textAlign:"left",
//             position:"relative",
//             marginRight:"100px",
//             clear:"both"
//         }}>
//             <img
//                 src="/icons/Person.png"
//                 alt="Person"
//                 style={{height:"90px", position:"absolute", top:"50%", marginTop:"-45px"}}
//             />
//             <div className="smallText2" style={{float:"right", marginLeft:"140px"}}>
//                 <h2 style={{fontSize:"32px", color:"#2ab6ff"}}>
//                     Build Your Profile<br/>
//                 </h2>
//                 Earn badges by completing pathways.<br/>
//                 Add them to your profile to make yourself<br/>
//                 more attractive to employers.<br/>
//             </div>
//         </div>
//         <div style={{
//             float:"left",
//             textAlign:"left",
//             position:"relative",
//             marginLeft:"100px",
//             clear:"both"
//         }}>
//             <img
//                 src="/icons/Badge.png"
//                 alt="Badge"
//                 style={{height:"90px", position:"absolute", top:"50%", marginTop:"-45px"}}
//             />
//             <div className="smallText2" style={{float:"right", marginLeft:"140px"}}>
//                 <h2 style={{fontSize:"32px", color:"#b25fff"}}>
//                     Get Hired By The Most<br/>
//                     Innovative Companies<br/>
//                 </h2>
//                 Get hired for full-time, part-time,<br/>
//                 internship and contract positions by<br/>
//                 the most forward-thinking companies.
//             </div>
//         </div>
//     </div>
// </div>


// <div className="homepageSeparatorContainer"><div className="homepageSeparator" /></div>
//
// <div className="fullHeight" style={{textAlign:"center"}}>
//
//     <ul className="horizCenteredList homepageBenefitsList">
//         <li style={{marginRight:"14%"}}>
//             <div style={{position:"relative"}}>
//                 <img
//                     src="/icons/Tree.png"
//                     alt="Tree"
//                     style={{
//                         height:"90px",
//                         position:"absolute",
//                         marginTop:"20px",
//                         marginLeft:"-200px"
//                     }}
//                 />
//                 <img
//                     src="/icons/BlockyPerson.png"
//                     alt="Profile"
//                     style={{
//                         height:"70px",
//                         position:"absolute",
//                         marginTop:"300px",
//                         marginLeft:"-190px"
//                     }}
//                 />
//                 <div className="smallText2">
//                     <h2 style={{fontSize:"30px", color:"#b769ff"}}>
//                         <strong>PATHWAYS</strong>
//                     </h2>
//                     Pathways of courses<br/>
//                     chosen by employers,<br/>
//                     curated by us,<br/>
//                     completed by you.
//
//                     <div style={{height:"100px"}} />
//
//                     <h2 style={{fontSize:"30px", color:"#b769ff"}}>
//                         <strong>PROFILE</strong>
//                     </h2>
//                     See how you stack up<br/>
//                     against other applicants.<br/>
//                     View your courses, badges, and stats.<br/>
//                 </div>
//             </div>
//         </li>
//         <li>
//             <div style={{position:"relative"}}>
//                 <img
//                     src="/icons/Price.png"
//                     alt="Price"
//                     style={{
//                         height:"90px",
//                         position:"absolute",
//                         marginTop:"20px",
//                         marginLeft:"-190px"
//                     }}
//                 />
//                 <img
//                     src="/icons/PaperAndPencil.png"
//                     alt="Contracting"
//                     style={{
//                         height:"80px",
//                         position:"absolute",
//                         marginTop:"290px",
//                         marginLeft:"-195px"
//                     }}
//                 />
//                 <div className="smallText2">
//                     <h2 style={{fontSize:"30px", color:"#b769ff"}}>
//                         <strong>LEARN FOR FREE</strong>
//                     </h2>
//                     Prepare for the Future<br/>
//                     at no cost to you.<br/>
//                     Learn skills from courses<br/>
//                     paid for by the employer.
//                 </div>
//
//                 <div style={{height:"100px"}} />
//
//                 <div className="smallText2">
//                     <h2 style={{fontSize:"30px", color:"#b769ff"}}>
//                         <strong>CONTRACTING</strong>
//                     </h2>
//                     Still in school or too busy<br/>
//                     For a full-time job?<br/>
//                     Credential yourself for employers<br/>
//                     looking for contractors.
//                 </div>
//             </div>
//         </li>
//     </ul>
//
//     <button className="outlineButton" style={{
//         color:"#b769ff",
//         border:"3px solid #b769ff",
//         marginTop:"30px" }}
//         onClick={() => this.goTo('/signup')}>
//         {"I'm Ready For"}<br/>
//         {"The Future"}
//     </button>
//
//     <img
//         src="/images/BottomLeftTriangles.png"
//         style={{
//             height: "490px",
//             position: "absolute",
//             bottom: "0px",
//             left: "0px",
//             zIndex: "-10"
//         }}
//     />
// </div>






function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        closeNotification
    }, dispatch);
}

function mapStateToProps(state) {
    return {};
}

export default connect(mapStateToProps, mapDispatchToProps)(Home);
