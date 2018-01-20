"use strict"
import React, { Component } from 'react';
import { Chip } from 'material-ui';
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
            name: "",
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
            pathways: [emptyPathway, emptyPathway, emptyPathway]
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
            params: { numPathways: 3 }
        }).then(res => {
            // make sure component is mounted before changing state
            if (this.refs.home) {
                this.setState({ pathways: res.data });
            }
        }).catch(function(err) {
        })
    }

    render(){

        // create the pathway previews
        let pathwayKey = 0;
        let self = this;
        const pathwayPreviews = this.state.pathways.map(function(pathway) {
            pathwayKey++;
            const deadline = new Date(pathway.deadline);
            const formattedDeadline = deadline.getMonth() + "/" + deadline.getDate() + "/" + deadline.getYear();
            return (
                <li style={{verticalAlign: "top"}} key={pathwayKey} onClick={() => self.goTo('/pathway?' + pathway._id)} ><PathwayPreview
                    name = {pathway.name}
                    image = {pathway.previewImage}
                    logo = {pathway.sponsor.logo}
                    sponsorName = {pathway.sponsor.name}
                    completionTime = {pathway.estimatedCompletionTime}
                    deadline = {formattedDeadline}
                    price = {pathway.price}
                    _id = {pathway._id}
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
        //         <img src={"/logos/" + logo.name} key={logo.name} style={{
        //             position: "absolute",
        //             height: logo.height,
        //             left: logo.left,
        //             top: logo.top
        //         }}/>
        //     )
        // })

        const logos = ["Epic.png", "XES.png", "amazon.png", "holosHomepage.png", "Unity.png"];
        const logoBar = logos.map(function(logo) {
            return (
                <img key={logo} src={"/logos/" + logo} className="logoBarLogo"/>
            );
        })

        const skills = [
            "UX Design", "Data Science", "Machine Learning", "Graphic Design", "<br/>",
            "Front End Web Dev", "Virtual Reality", "3D Printing", "Javascript", "<br/>",
            "Agile", "Game Design", "SQL", "IoT", "Cloud", "<br/>",
            "DevOps", "SEO", "Social Media", "Growth Marketing", "<br/>",
            "Google Analytics", "Project Management", "Entrepeneurship"
        ]

        let brKey = -1;
        const exampleSkills = skills.map(function (skill) {
            brKey++;
            if (skill == "<br/>") {
                return <br key={brKey + "br"}/>;
            } else {
                return (
                    <div key={skill + "div"} style={{display: 'inline-block', marginTop: '15px'}}>
                        <Chip key={skill}
                              backgroundColor='#white'
                              labelColor="#00d2ff"
                              labelStyle={{fontSize: '20px'}}
                              style={{marginLeft: '20px', border: "1px solid #00d2ff"}}>
                            {skill}
                        </Chip>
                    </div>
                );
            }
        });

        return(
            <div className='jsxWrapper' ref='home'>
                <div className="fullHeight greenToBlue">
                    <HomepageTriangles style={{pointerEvents:"none"}} variation="1" />

                    <div className="infoBox whiteText mediumText noWrap" style={{zIndex:"20"}}>
                        Skip the resum&eacute;.<br/>
                        Learn the skills that employers want<br/>
                        <i>for free.</i><br/>
                        <button className="outlineButton blueWhiteButton"
                            onClick={() => this.goTo('/signup')}>
                            Get Started
                        </button>
                    </div>
                </div>


                <div className="logoBar">
                    { logoBar }
                </div>

                <div>
                    <div style={{marginBottom: "70px"}}>
                        <HomepageTriangles variation="3"/>
                        <ul className="horizCenteredList homepageBenefitsList">
                            <li style={{marginRight: "14%", marginTop: "14px"}}>
                                <div style={{position: "relative"}}>
                                    <img
                                        src="/icons/CompassGreen.png"
                                        alt="Explore"
                                        className="infoBoxImage"
                                    />
                                    <div className="smallText2">
                                        Explore emerging career<br/>
                                        paths and technologies.
                                    </div>
                                </div>
                            </li>
                            <li>
                                <div style={{position: "relative"}}>
                                    <img
                                        src="/icons/GraduationHat.png"
                                        alt="Portfolio"
                                        className="infoBoxImage"
                                    />
                                    <div className="smallText2">
                                        Employers sponsor<br/>
                                        pathways so you can<br/>
                                        learn new skills for free.
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
                                        className="infoBoxImage"
                                    />
                                    <div className="smallText2">
                                        Compete for open<br/>
                                        positions at sponsor companies<br/>
                                        by completing pathways.
                                    </div>
                                </div>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="homepageSeparatorContainer">
                    <div className="homepageSeparator" style={{marginTop:"40px"}}/>
                </div>


                <div className="center">
                    <h1 className="isolatedHeader">
                        <b>Build a skillset adapted to the speed of technology.</b>
                    </h1>
                    <div>
                        { exampleSkills }
                    </div>
                </div>


                <div className="homepageSeparatorContainer" style={{marginTop: "80px"}}>
                    <div className="homepageSeparator" />
                </div>


                <div className="fullHeight" style={{textAlign:"center"}}>
                    <div className="center mediumText blueText" style={{marginTop: "40px"}}>Pathways</div>
                    <div style={{
                        margin: "0px 160px",
                        height: "60px",
                        fontSize: "15px"
                    }}>
                        Moonshot pathways are organized in pathways and
                        sponsored by<br/> employers hiring for those skills.
                    </div>
                    <div className="pathwayPrevListContainer">
                        <ul className="horizCenteredList pathwayPrevList">
                            {pathwayPreviews}
                        </ul>
                    </div>
                    <button
                        className="outlineButton whiteBlueButton"
                        style={{marginTop:"30px"}}
                        onClick={() => this.goTo('/signup')}>
                        Create your free account
                    </button>
                </div>


                <div className="homepageSeparatorContainer"><div className="homepageSeparator" /></div>









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
