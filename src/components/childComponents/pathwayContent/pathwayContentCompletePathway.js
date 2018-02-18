import React, {Component} from 'react';
import {Paper, CircularProgress} from 'material-ui';
import {connect} from 'react-redux';
import axios from 'axios';
import {completePathway} from "../../../actions/usersActions";
import {bindActionCreators} from 'redux';

class PathwayContentCompletePathway extends Component {

    handleClick() {
        const user = {
            userName: this.props.currentUser.name,
            pathway: this.props.pathway.name
        };

        this.props.completePathway(user);

    }

    render() {
        console.log(this.props.pathway);
        return (
            <div className={this.props.className} style={{...this.props.style}}>
                <div className="center" style={{marginBottom: "10px"}}>
                    <h4>Finish</h4>
                    <div style={{marginRight: "20px", marginLeft: "20px"}}>
                        Click this button to complete the pathway and we'll be in contact with you within 48 hours.
                    </div>
                    <button className="outlineButton font30px font20pxUnder500 whiteBlueButton"
                            onClick={this.handleClick.bind(this)}>
                        <div className="blueText">
                            Complete Pathway
                        </div>
                    </button>
                    {this.props.loadingEmailSend ?
                        <div className="center"><CircularProgress style={{marginTop: "20px"}}/></div>
                        : null}
                </div>
            </div>
        );
    }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        completePathway
    }, dispatch);
}

function mapStateToProps(state) {
    return {
        currentUser: state.users.currentUser,
        loadingEmailSend: state.users.loadingSomething
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(PathwayContentCompletePathway);
