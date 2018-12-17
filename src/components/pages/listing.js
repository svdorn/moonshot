"use strict";
import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import {} from "../../actions/usersActions";

class Listing extends Component {
    constructor(props) {
        super(props);

        this.state = {};
    }

    render() {
        return (
            <div
                itemscope
                itemtype="http://schema.org/JobPosting"
                className="secondary-gray marginLeft10px"
            >
                <meta itemprop="specialCommitments" content="VeteranCommit" />
                <h2 itemprop="title">Full-Stack Engineer</h2>
                <span>
                    <p>
                        <strong>Location:</strong>{" "}
                        <span itemprop="jobLocation" itemscope itemtype="http://schema.org/Place">
                            <span
                                itemprop="address"
                                itemscope
                                itemtype="http://schema.org/PostalAddress"
                            >
                                <span itemprop="addressLocality">Mexico City</span>,{" "}
                                <span itemprop="addressCountry">Mexico</span>
                            </span>
                        </span>
                    </p>
                </span>
                <p>
                    <strong>Industry:</strong> <span itemprop="industry">Computer Software</span>
                    <br />
                    <strong>Hours:</strong> <span itemprop="employmentType">Full-time</span>
                    <br />
                    <strong>Salary:</strong> <span itemprop="salaryCurrency">USD</span>{" "}
                    <span itemprop="baseSalary">30000</span>
                </p>
                <p itemprop="description">
                    <strong>Description:</strong>{" "}
                    <span
                        itemprop="hiringOrganization"
                        itemscope
                        itemtype="http://schema.org/Organization"
                    >
                        <span itemprop="name">Da-Mas</span> is a crowdfunding platform which enables
                        primary and high school teachers to raise charitable donations for projects
                        in their classrooms. The technology will initially be deployed with the
                        start of the 2018-19 school year in Mexico across 100 schools in 8 states
                        partnered with Teach for Mexico and supported in advisory capacity by
                        DonorsChoose.org. What we’re building right now: - web app (www.da-mas.org)
                        The website allows teachers to fundraise for projects in their classrooms.
                        The projects could be anything from new blackboards to chemistry kits to
                        lego sets, depending on what the school most needs and the projects the
                        teacher wants to make with the students. Donors can choose the projects they
                        feel most passionate about and will receive updates as the products get
                        delivered to the classroom and put to use. - admin dashboard We’re building
                        a business intelligence dashboard for the organization, to enable more
                        effective decision making for non-technical & technical staff.
                    </span>
                </p>
                <p>
                    <strong>Educational requirements:</strong>
                </p>
                <ul itemprop="educationRequirements">
                    <li>Relevant education is a plus (ie. computer science, data science) </li>
                </ul>
                <p>
                    <strong>Experience requirements:</strong>
                </p>
                <ul itemprop="experienceRequirements">
                    <li>2+ years of professional software development experience </li>
                </ul>
                <p>
                    <strong>Desired Skills:</strong>
                </p>
                <ul itemprop="skills">
                    <li>Javascript</li>
                    <li>Node.js</li>
                    <li>Coffeescript</li>
                    <li>Git</li>
                    <li>DevOps</li>
                    <li>SCSS / SASS</li>
                    <li>Express.js</li>
                    <li>Grunt</li>
                    <li>Bookshelf.js</li>
                    <li>Gulp</li>
                    <li>Webpack</li>
                    <li>KnexJS</li>
                    <li>Pug (formerly Jade)/J2EE</li>
                </ul>
                <p>
                    <strong>Qualifications:</strong>
                </p>
                <ul itemprop="qualifications">
                    <li>
                        Used to working with remote teams, either having worked in a fully remote
                        team or having worked with remote team members in a professional setting{" "}
                    </li>
                    <li> Fluency in English (spoken and written) required </li>
                    <li>Additional fluency in Spanish considered a plus</li>
                </ul>
                <p>
                    <strong>Benefits:</strong>
                </p>
                <p>
                    <strong>Incentives:</strong>
                </p>
                <ul>
                    <li>
                        <span itemprop="incentiveCompensation">0-2% Equity</span>
                    </li>
                </ul>
                <p>
                    Date Posted: <span itemprop="datePosted">2018-09-5</span>
                </p>
                <br />
                <strong>Occupational Category:</strong>{" "}
                <span itemprop="occupationalCategory">
                    15-1132.00 Software Developers, Application
                </span>
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {};
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({}, dispatch);
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Listing);
