"use strict"
import React, {Component} from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {forBusiness, getUsers} from '../../actions/usersActions';
import {TextField, RaisedButton, Paper, CircularProgress, Divider} from 'material-ui';
import {Field, reduxForm} from 'redux-form';
import style from '../../../public/styles';
import axios from 'axios';
import HomepageTriangles from '../miscComponents/HomepageTriangles';

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
    }


    render() {
        console.log(this.state.pathway);
        const deadline = new Date(this.state.pathway.deadline);
        const formattedDeadline = deadline.getMonth() + "/" + deadline.getDate() + "/" + deadline.getYear();
        return (
            <div className="jsxWrapper">
                {this.state.pathway.sponsor !== undefined ?
                    <div>
                        <div className="purpleToBlue">
                            <div className="pathwayPrevListContainer">
                                <ul className="horizCenteredList pathwayPrevList">
                                    <li className="pathwayHeaderText whiteText mediumText noWrap"
                                        style={{zIndex: "20"}}>
                                        {this.state.pathway.name}<br/>
                                        <button className="outlineButton"
                                                style={{backgroundColor: "transparent", border: "2px solid white"}}
                                                onClick={this.handleClick}>
                                            {"Sign Up"}
                                        </button>
                                        <br/>
                                        Sponsored By:
                                        <img
                                            src={this.state.pathway.sponsor.logo}
                                            alt={this.state.pathway.sponsor.name}
                                            height={25}
                                            style={{paddingLeft: '15px'}}
                                        />
                                    </li>
                                    <li className="pathwayHeaderText whiteText mediumText noWrap"
                                        style={{zIndex: "20"}}>
                                        Change Logo Next Time <br/>
                                        <img
                                            src="/images/MoonshotTempLogo.png"
                                            alt="Moonshot Learning"
                                            style={{width: "450px", height: '150px'}}
                                        />
                                    </li>
                                </ul>
                            </div>
                        </div>
                        <div className="greenToBlue">
                            <ul className="horizCenteredList pathwayPrevList whiteText smallText2">
                                <li>
                                    Completion Time<br/>
                                    {this.state.pathway.estimatedCompletionTime}
                                </li>
                                <li>
                                    Complete By<br/>
                                    {formattedDeadline}
                                </li>
                                <li>
                                    Cost<br/>
                                    {this.state.pathway.price}
                                </li>
                            </ul>

                        </div>
                    </div>

                    : <CircularProgress/>}
            </div>
        );
    }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        getUsers,
    }, dispatch);
}

export default connect(null, mapDispatchToProps)(Pathway);
