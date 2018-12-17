"use strict";
import React, { Component } from "react";
import { connect } from "react-redux";
import { browserHistory } from "react-router";
import { addNotification } from "../../../actions/usersActions";
import { bindActionCreators } from "redux";
import axios from "axios";
import { CircularProgress, RaisedButton } from "material-ui";

class BusinessPicker extends Component {
    constructor(props) {
        super(props);

        this.state = {
            businesses: undefined
        };
    }

    componentDidMount() {
        const self = this;
        const { currentUser } = this.props;
        if (!currentUser) {
            return this.props.addNotification(
                "You aren't logged in! Try refreshing the page.",
                "error"
            );
        }
        axios
            .get("/api/admin/allBusinesses", {
                params: {
                    userId: currentUser._id,
                    verificationToken: currentUser.verificationToken
                }
            })
            .then(response => {
                self.setState({ businesses: response.data });
            })
            .catch(error => {
                console.log("error: ", error);
                // set businesses to empty array to get rid of loader
                self.setState({ businesses: [] });
                self.props.addNotification("Error getting businesses.", "error");
            });
    }

    goTo(route) {
        // goes to the wanted page
        browserHistory.push(route);
        // goes to the top of the new page
        window.scrollTo(0, 0);
    }

    render() {
        const self = this;
        const { currentUser } = this.props;

        if (!currentUser || !currentUser.admin === true) {
            return null;
        }

        if (!Array.isArray(this.state.businesses)) {
            return (
                <div className="fillScreen">
                    <CircularProgress />
                </div>
            );
        }

        // show all the current businesses
        const businesses = this.state.businesses.map(business => {
            return (
                <div
                    key={business._id}
                    onClick={() => this.goTo(`/admin/businessEditor/${business._id}`)}
                    className="clickable primary-white"
                >
                    {business.name}
                </div>
            );
        });

        // show option to create a new business
        businesses.push(
            <div
                key={"new business"}
                onClick={() => this.goTo(`/admin/businessEditor/new`)}
                className="clickable primary-white"
            >
                {"+ New Business"}
            </div>
        );

        return (
            <div className="fillScreen primary-white" style={{ margin: "30px" }}>
                {businesses}
            </div>
        );
    }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators(
        {
            addNotification
        },
        dispatch
    );
}

function mapStateToProps(state) {
    return {
        currentUser: state.users.currentUser
    };
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(BusinessPicker);
