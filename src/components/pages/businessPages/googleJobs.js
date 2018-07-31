"use strict"
import React, { Component } from "react";
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import axios from "axios";
import { CircularProgress } from "material-ui";
import Dialog from '@material-ui/core/Dialog';
import {  } from '../../../actions/usersActions';

class GoogleJobs extends Component {
    constructor(props) {
        super(props);

        this.state = {
            jobs: [""],
        }
    }

    handleNext() {
        let self = this;
        axios.post("/api/business/googleJobsLinks", {
            params: {
                jobs: self.state.jobs,
                businessId: self.props.currentUser.businessInfo.businessId
            }
        })
        self.props.next();
    }

    onChange(e, key) {
        let jobs = this.state.jobs;
        jobs[key-1] = e.target.value;
        this.setState({jobs});
    }

    handleAdd() {
        let jobs = this.state.jobs;
        jobs.push("");
        this.setState({jobs});
    }

    render() {
        var key = 0;
        const jobs = this.state.jobs.map(job => {
            key++;
            return (
                <div className="font16px font14pxUnder900 marginTop10px">
                    <input className="blackInput googleJobs getStarted" type="text" placeholder="Paste Job Description URL here (Optional)" name="job"
                    value={job} onChange={(e) => this.onChange(e, key)}/>
                    {this.state.jobs.length === key ?
                        <div
                            className="button noselect round-4px background-primary-cyan inlineBlock marginLeft10px" style={{padding: "3px 7px"}}
                            onClick={this.handleAdd.bind(this)}
                        >
                            + Add
                        </div>
                    : null}
                </div>
            )
        })
        return (
            <div className="primary-white center">
                <div className="secondary-gray font16px font14pxUnder700" style={{width: "80%", margin:"0 auto 10px", minWidth: "200px", textAlign: "left"}}>
                    We&#39;ve integrated with Google Jobs so you don&#39;t have to spend the development time.
                </div>
                <div className="secondary-gray font16px font14pxUnder700" style={{width: "80%", margin:"auto", minWidth: "200px", textAlign: "left"}}>
                    Paste the URL of your job description for your selected position to generate exposure to applicants.
                </div>
                <div className="center marginTop20px">
                    {jobs}
                </div>
                <div className="previous-next-area primary-white font18px center marginTop20px marginBottom30px">
                    <div
                        className="previous noselect clickable underline inlineBlock"
                        onClick={this.props.previous}
                    >
                        Previous
                    </div>
                    <div
                        className="button noselect round-4px background-primary-cyan inlineBlock"
                        onClick={this.handleNext.bind(this)}
                    >
                        Next
                    </div>
                </div>
            </div>
        );
    }
}


function mapStateToProps(state) {
    return {
        currentUser: state.users.currentUser,
        png: state.users.png
    };
}


function mapDispatchToProps(dispatch) {
    return bindActionCreators({
    }, dispatch);
}


export default connect(mapStateToProps, mapDispatchToProps)(GoogleJobs);
