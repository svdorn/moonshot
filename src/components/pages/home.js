"use strict"
import React, { Component } from 'react';
import { Paper, RaisedButton } from 'material-ui';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { browserHistory } from 'react-router';
import PathwayPreview from '../childComponents/pathwayPreview';
import HomepageTriangles from '../miscComponents/HomepageTriangles';
import { closeNotification } from "../../actions/usersActions";

class Home extends Component{

    goTo (route)  {
        // closes any notification
        this.props.closeNotification();
        // goes to the wanted page
        browserHistory.push(route);
        // goes to the top of the new page
        window.scrollTo(0, 0);
    }

    render(){
        const logosInfo = [
            {name: "amazon.png", height:"90px", left:"55%", top:"80%"},
            {name: "ArchVirtual.png", height:"50px", left:"70%", top:"57%"},
            {name: "Epic.png", height:"70px", left:"7%", top:"55%"},
            {name: "holos.png", height:"50px", left:"85%", top:"70%"},
            {name: "Singlewire.png", height:"80px", left:"20%", top:"10%"},
            {name: "Unity.png", height:"60px", left:"70%", top:"12%"},
            {name: "XES.png", height:"100px", left:"20%", top:"77%"}
        ]

        const backgroundLogos = logosInfo.map(function(logo) {
            return (
                <img src={"/logos/" + logo.name} key={logo.name} style={{
                    position: "absolute",
                    height: logo.height,
                    left: logo.left,
                    top: logo.top
                }}/>
            )
        })

        return(
            <div className='jsxWrapper'>
                <div className="fullHeight greenToBlue">
                    <HomepageTriangles style={{pointerEvents:"none"}} variation="1" />

                    <div className="infoBox whiteText mediumText noWrap" style={{zIndex:"20"}}>
                        Skip the resum&eacute;.<br/>
                        Learn skills for the future<br/>
                        that employers want now,<br/>
                        <i>for free.</i><br/>
                        <button className="outlineButton blueWhiteButton"
                            onClick={() => this.goTo('/signup')}>
                            Get Started
                        </button>
                    </div>
                </div>


                <div className="fullHeight">
                    <div className="infoBox greenText bigText nowrap">
                        <i>Companies are searching<br/>
                        for people to spearhead<br/>
                        the future of technology.</i><br/>
                        <div className="dividerSmall" />
                        <button className="outlineButton whiteBlueButton"
                            onClick={() => this.goTo('/signup')}>
                            Join the Movement
                        </button>
                        <p  className="clickable blueText smallText"
                            style={{marginTop:"10px"}}
                            onClick={() => this.goTo('/forBusiness')}>
                            <i>Are you an employer? Click here.</i>
                        </p>
                    </div>

                    {backgroundLogos}

                </div>

                <div className="halfHeight purpleToBlue">
                    <div className="infoBox whiteText mediumText" style={{paddingTop:"100px"}}>
                        We work with employers to create course pathways that
                        teach you the skills they want you to know.
                    </div>
                </div>

                <div className="fullHeight" style={{textAlign:"center"}}>
                    <img
                        src="/images/PathwaysText.png"
                        alt="Pathways"
                        style={{marginTop:"100px", marginBottom:"15px", width:"265px"}}
                    /><br/>
                    <div style={{
                        margin: "0px 160px",
                        height: "100px",
                        fontSize: "24px"
                    }}>
                        Complete to build your portfolio, be found by
                        employers, qualify for contract projects and be evaluated
                        by the sponsor company.
                    </div>
                    <div className="pathwayPrevListContainer">
                        <ul className="horizCenteredList pathwayPrevList">
                            <li><PathwayPreview /></li>
                            <li><PathwayPreview /></li>
                            <li><PathwayPreview /></li>
                        </ul>
                    </div>
                </div>

                <div className="homepageSeparatorContainer"><div className="homepageSeparator" /></div>

                <div className="fullHeight" style={{textAlign:"center"}}>
                    <HomepageTriangles variation="2" />
                    <div style={{zIndex: 0}}>
                        <img
                            src="/images/TheMoonshotTrajectory.png"
                            alt="Pathways"
                            style={{marginTop:"45px", marginBottom:"15px", width:"700px"}}
                        /><br/>
                        <div style={{
                            float:"left",
                            textAlign:"left",
                            position:"relative",
                            marginLeft:"100px"
                        }}>
                            <img
                                src="/icons/Lightbulb.png"
                                alt="Lightbulb"
                                style={{height:"90px", position:"absolute", top:"50%", marginTop:"-45px"}}
                            />
                            <div className="smallText2" style={{float:"right", marginLeft:"140px"}}>
                                <h2 className="greenText" style={{fontSize:"32px"}}>
                                    Complete Pathways<br/>
                                    And Learn Skills<br/>
                                </h2>
                                We work directly with the most<br/>
                                innovative companies to curate<br/>
                                pathways that consist of courses to<br/>
                                teach you the skills that they look for.
                            </div>
                        </div>
                        <div style={{
                            float:"right",
                            textAlign:"left",
                            position:"relative",
                            marginRight:"100px",
                            clear:"both"
                        }}>
                            <img
                                src="/icons/Person.png"
                                alt="Person"
                                style={{height:"90px", position:"absolute", top:"50%", marginTop:"-45px"}}
                            />
                            <div className="smallText2" style={{float:"right", marginLeft:"140px"}}>
                                <h2 style={{fontSize:"32px", color:"#2ab6ff"}}>
                                    Build Your Profile<br/>
                                </h2>
                                Earn badges by completing pathways.<br/>
                                Add them to your profile to make yourself<br/>
                                more attractive to employers.<br/>
                            </div>
                        </div>
                        <div style={{
                            float:"left",
                            textAlign:"left",
                            position:"relative",
                            marginLeft:"100px",
                            clear:"both"
                        }}>
                            <img
                                src="/icons/Badge.png"
                                alt="Badge"
                                style={{height:"90px", position:"absolute", top:"50%", marginTop:"-45px"}}
                            />
                            <div className="smallText2" style={{float:"right", marginLeft:"140px"}}>
                                <h2 style={{fontSize:"32px", color:"#b25fff"}}>
                                    Get Hired By The Most<br/>
                                    Innovative Companies<br/>
                                </h2>
                                Get hired for full-time, part-time,<br/>
                                internship and contract positions by<br/>
                                the most forward-thinking companies.
                            </div>
                        </div>
                    </div>
                </div>

                <div className="homepageSeparatorContainer"><div className="homepageSeparator" /></div>

                <div className="fullHeight" style={{textAlign:"center"}}>

                    <ul className="horizCenteredList homepageBenefitsList">
                        <li style={{marginRight:"14%"}}>
                            <div style={{position:"relative"}}>
                                <img
                                    src="/icons/Tree.png"
                                    alt="Tree"
                                    style={{
                                        height:"90px",
                                        position:"absolute",
                                        marginTop:"20px",
                                        marginLeft:"-190px"
                                    }}
                                />
                                <img
                                    src="/icons/BlockyPerson.png"
                                    alt="Profile"
                                    style={{
                                        height:"70px",
                                        position:"absolute",
                                        marginTop:"300px",
                                        marginLeft:"-190px"
                                    }}
                                />
                                <div className="smallText2">
                                    <h2 style={{fontSize:"30px", color:"#b769ff"}}>
                                        <strong>PATHWAYS</strong>
                                    </h2>
                                    Pathways of courses<br/>
                                    chosen by employers,<br/>
                                    curated by us,<br/>
                                    completed by you.

                                    <div style={{height:"100px"}} />

                                    <h2 style={{fontSize:"30px", color:"#b769ff"}}>
                                        <strong>PROFILE</strong>
                                    </h2>
                                    See how you stack up<br/>
                                    against other applicants.<br/>
                                    View your courses, badges, and stats.<br/>
                                </div>
                            </div>
                        </li>
                        <li>
                            <div style={{position:"relative"}}>
                                <img
                                    src="/icons/Price.png"
                                    alt="Price"
                                    style={{
                                        height:"90px",
                                        position:"absolute",
                                        marginTop:"20px",
                                        marginLeft:"-190px"
                                    }}
                                />
                                <img
                                    src="/icons/PaperAndPencil.png"
                                    alt="Contracting"
                                    style={{
                                        height:"80px",
                                        position:"absolute",
                                        marginTop:"290px",
                                        marginLeft:"-195px"
                                    }}
                                />
                                <div className="smallText2">
                                    <h2 style={{fontSize:"30px", color:"#b769ff"}}>
                                        <strong>LEARN FOR FREE</strong>
                                    </h2>
                                    Prepare for the Future<br/>
                                    at no cost to you.<br/>
                                    Learn skills from courses<br/>
                                    paid for by the employer.
                                </div>

                                <div style={{height:"100px"}} />

                                <div className="smallText2">
                                    <h2 style={{fontSize:"30px", color:"#b769ff"}}>
                                        <strong>CONTRACTING</strong>
                                    </h2>
                                    Still in school or too busy<br/>
                                    For a full-time job?<br/>
                                    Credential yourself for employers<br/>
                                    looking for contractors.
                                </div>
                            </div>
                        </li>
                    </ul>

                    <button className="outlineButton" style={{
                        color:"#b769ff",
                        border:"3px solid #b769ff",
                        marginTop:"30px" }}
                        onClick={() => this.goTo('/signup')}>
                        {"I'm Ready For"}<br/>
                        {"The Future"}
                    </button>

                    <img
                        src="/images/BottomLeftTriangles.png"
                        style={{
                            height: "490px",
                            position: "absolute",
                            bottom: "0px",
                            left: "0px",
                            zIndex: "-10"
                        }}
                    />
                </div>



            </div>
        );
    }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        closeNotification
    }, dispatch);
}

function mapStateToProps(state) {
    return {
        notification: state.users.notification
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(Home);
