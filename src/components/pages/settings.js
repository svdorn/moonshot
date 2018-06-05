"use strict"
import React, {Component} from 'react';
import {connect} from 'react-redux';
import {Paper, Menu, MenuItem, Divider, DropDownMenu} from 'material-ui';
import PasswordChange from './passwordchange';
import Account from './account';
import HomepageTriangles from '../miscComponents/HomepageTriangles';
import MetaTags from 'react-meta-tags';
import AddUserDialog from '../childComponents/addUserDialog';

class Settings extends Component {
    constructor(props) {
        super(props);
        this.state = {
            value: 1,
        };
    }

    handleChange = (event, index) => {
        this.setState({value: index})
    };

    //name, email, password, confirm password, signup button
    render() {
        return (
            <div className="fillScreen lightBlackBackground">
                <AddUserDialog />
                <MetaTags>
                    <title>Settings | Moonshot</title>
                    <meta name="description" content="Change your Moonshot account settings." />
                </MetaTags>
                <HomepageTriangles className="blurred" style={{pointerEvents: "none"}} variation="1"/>
                {this.props.notification !== undefined ?
                    <Paper className={"messageHeader " + this.props.notification.type}>
                        {this.props.notification.message}
                    </Paper>
                    :
                    null
                }
                <div className="center">
                    {this.state.value === 1 ?
                        <Account/>
                        :
                        <PasswordChange/>
                    }
                    <br/>
                    <div className="lightBlackForm boxStyle">
                        <Menu value={this.state.value} onChange={this.handleChange} style={{}}>
                            <MenuItem primaryText="Account" className="whiteText" disabled={true}/>
                            <Divider/>
                            <MenuItem value={1} primaryText="Settings"/>
                            <MenuItem value={2} primaryText="Change Password"/>
                        </Menu>
                    </div>
                    {/*<div className="center dropDownSettings">*/}
                        {/*<DropDownMenu value={this.state.value}*/}
                                      {/*onChange={this.handleChange}*/}
                                      {/*style={{fontSize: "20px"}}*/}
                        {/*>*/}
                            {/*<MenuItem primaryText="Category" disabled={true}/>*/}
                            {/*<Divider/>*/}
                            {/*<MenuItem value={1} primaryText="Settings"/>*/}
                            {/*<MenuItem value={2} primaryText="Change Password"/>*/}
                        {/*</DropDownMenu>*/}
                    {/*</div>*/}
                </div>
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {};
}

export default connect(mapStateToProps)(Settings);
