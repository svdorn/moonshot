"use strict"
import React, { Component } from 'react';
import { Paper, RaisedButton } from 'material-ui';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { browserHistory } from 'react-router';
import PathwayPreview from '../childComponents/pathwayPreview'

class Home extends Component{

    goTo (route)  {
        browserHistory.push(route);
    }

    render(){
        return(
            <div className='jsxWrapper'>
                <div>
                    {this.props.emailSentMessage ?
                        <Paper className="messageHeader infoHeader">
                            {this.props.emailSentMessage}
                        </Paper>
                        :
                        null
                    }
                </div>


                <div className="fullHeight greenToBlue">
                    <div className="infoBox whiteText mediumText noWrap">
                        Skip the resum&eacute;.<br/>
                        Learn skills for the future<br/>
                        that employers want now,<br/>
                        <i>for free.</i><br/>
                        <button className="outlineButton blueWhiteButton">
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
                        <button className="outlineButton whiteBlueButton">
                            Join the Movement
                        </button>
                        <p  className="clickable blueText smallText"
                            style={{marginTop:"10px"}}
                            onClick={() => this.goTo('/forBusiness')}>
                            <i>Are you an employer? Click here.</i>
                        </p>
                    </div>
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

                <div className="homepageSeparatorContainer"><div className="homepageSeparator" /></div>

                <div className="fullHeight">

                    <ul className="horizCenteredList homepageBenefitsList">
                        <li>
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
                                <div className="smallText2">
                                    <h2 style={{fontSize:"30px", color:"#b769ff"}}>
                                        <strong>PATHWAYS</strong>
                                    </h2>
                                    Pathways of courses<br/>
                                    chosen by employers,<br/>
                                    curated by us,<br/>
                                    completed by you.
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
                                <div className="smallText2">
                                    <h2 style={{fontSize:"30px", color:"#b769ff"}}>
                                        <strong>LEARN FOR FREE</strong>
                                    </h2>
                                    Prepare for the Future<br/>
                                    at no cost to you.<br/>
                                    Learn skills from courses<br/>
                                    paid for by the employer.
                                </div>
                            </div>
                        </li>
                    </ul>
                </div>



            </div>
        );
    }
}

// function mapDispatchToProps(dispatch) {
//     return bindActionCreators({
//         postUser,
//         getUsers
//     }, dispatch);
// }

function mapStateToProps(state) {
    return {
        emailSentMessage: state.users.emailSentMessage
    };
}

export default connect(mapStateToProps)(Home);
