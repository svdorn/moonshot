"use strict"
import React, {Component} from 'react';
import {Paper} from 'material-ui';

class PrivacyPolicy extends Component {
    render() {
        // if the component is its own page or within a different page
        let standalone = false;

        try {
            standalone = this.props.route.standalone;
        } catch(e) {
            // if that doesn't work it means this is embedded in something else
        }

        let containerStyle = standalone ? {padding:"20px"} : {}

        return (
            <div>
                <div style={containerStyle} className="whiteText">
                    <b className="font20px font18pxUnder700">Privacy Policy</b>

                    <br/><br/>Last updated: 6/10/2018

                    <br/><br/><b>Introduction</b>

                    <br/><br/>Moonshot Learning, Inc. (“Moonshot”, “Moonshot Insights”, “we”, “us”) takes your privacy seriously. At Moonshot we pledge to follow the provisions of this privacy policy in order to protect your privacy rights.

                    <br/><br/>This privacy policy (the “Policy”) outlines our general policy and practices for protecting your private information.  It includes the types of information we gather, how we use it, and the choices individuals have regarding our use of their information. Private information can broadly be broken down into two categories: information which cannot be used to identify you (“Non-Personal Information”) and information which can be used to identify you (“Personal Information”). This Policy applies to all Personal and Non-Personal Information received by us whether in electronic, written, or verbal format.

                    <br/><br/>Moonshot reserves the right to modify this Policy at any time and will do so from time to time.  Each modification shall be effective upon making use of MoonshotInsights.io (the “Website”). Your continued use of the Website following any such modification constitutes your acceptance of any changes to this Policy. It is therefore important that you review this Policy regularly. If you have any questions concerning this Policy, please contact us at support@MoonshotInsights.io.

                    <br/><br/><b>1. Scope.</b>

                    <br/><br/>This Policy covers all of MoonshotInsights.io. However, it does not apply to entities that we do not own or control including advertisers or developers of content.  It also does not cover sites with posted links on the Website. These entities are governed by their own privacy policies and not this Policy. Please check the privacy policy of any entity you interact with on or off the Website.   .

                    <br/><br/><b>2. Non-Personal Information.</b>

                    <br/><br/>1. 	When you access the Website from a computer, mobile phone, or other device, we may collect information from that device about your browser type, location, and IP address, as well as the pages you visit.
                    <br/>2.     We may collect information from postings or links you click on when using the Website.  We may also keep track of links you click on in emails you receive from us. This is done to increase the relevancy of the posts or advertisements you see.


                    <br/><br/><b>3. Personal Information.</b>

                    <br/><br/>1.     As part of the process to become a User, we require you provide your name, age, gender, and email address. You may also be prompted to input your address, phone number, and other contact information.
                    <br/>2.     While using the Website you may provide text, files, images, photos, video, or any other materials (collectively "Content") to the Website by uploading, posting, or publishing the Content on the Website.
                    <br/>3.     When you interact with others on the Website you may provide other information about yourself such as personal information, or any relevant business information. Please use care when disclosing private information to other Users.
                    <br/>4.     We may retain the details of connections or transactions you make with us on the Website.
                    <br/>5.     We may collect information about you derived from information other Users provide to us in their Content. Some of this information may contain Personal Information.

                    <br/><br/><b>4. How Moonshot Uses Your Personal Information.</b>

                    <br/><br/>1.     Moonshot uses the information you are required to provide to become a registered User in order to ensure you are over the age of 18. MoonshotInsights.io is not meant to be used by anyone under the age of 18.
                    <br/>2.     We may contact you with service-related announcements from time to time. You may opt-out of all communications except essential updates. We may include Content from the Website in the emails we send to you.
                    <br/>3.     We may allow other Users to use contact information they have about you, such as your email address, to find you.
                    <br/>4.     We may, at the request of Employers, aggregate, compile, and analyze anonymized data of Users affiliated with such Employers in order to provide Employers with statistical data regarding employment in certain fields and professions.
                    <br/>5.     Certain software applications and applets transmit data to us.  We may not make a formal disclosure if we believe our collection of and use of the information is the obvious purpose of the application.  If it is not obvious that we are collecting or using such information, we will disclose our collection to you the first time you provide us with the information.
                    <br/>6.     Moonshot does not share or disclose any financial information related to you or to any business or entity whose presence on the Website you represent. We do not take responsibility for any such information you choose to display on your profile or choose to share with other Users in the course of your use of the Website or communications with such Users.

                    <br/><br/><b>5. How Moonshot Uses Your Non-Personal Information.</b>

                    <br/><br/>1.     Moonshot will use the information we collect to provide services and features to you.  Moonshot will also use the information to measure and improve the Website, and to provide you with customer support.
                    <br/>2.     We can use the information we collect to prevent potential illegal activities. We also use a variety of methods to detect and address anomalous activity and screen content to prevent abuse.
                    <br/>3.     We may use your information to serve you personalized advertising.  We don’t share your information with advertisers without your consent. We allow advertisers to choose the characteristics of Users who will see their advertisements. We may use any of the non-personally identifiable attributes we have collected in any fashion to select the appropriate audience. Any advertisement posted on the Website will only refer to other Users of the Website.

                    <br/><br/><b>6. How Moonshot Shares Your Information. </b>

                    <br/><br/>Moonshot shares your Personal and Non-Personal Information with third-parties when we believe the sharing is permitted by you, is reasonably necessary to offer our services, or when we are legally required to do so. We will not share your information with third-parties in a way we think violates your privacy. The following are examples of the ways we share your information; however, this list is informative not exhaustive.

                    <br/><br/>1.     When you invite or refer another User to join the Website, the invitation will contain information which will allow the User to identify you. The invitation or referral may contain information about other Users.
                    <br/>2.     Certain information you provide to us will be shared by using the Website’s search function. This allows other Users to locate your profile, and any postings or Content you have posted on the Website.
                    <br/>3.     We provide some public information to search engines. This information allows search engines to locate MoonshotInsights.io. This does not mean all information you post on the Website can be accessed using a search engine.
                    <br/>4.     We may provide information to third-parties based on your interaction with them on the Website. This access will only be sufficient to conduct the interaction and will only be done in the event the interaction provides a possible networking opportunity. We will not disclose any financial information to other Users or third-parties.
                    <br/>5.     We may also share information when we have a good faith belief it is necessary to prevent fraud or other illegal activity, to prevent imminent bodily harm, or to protect ourselves and you from people violating the Terms of Use Agreement of MoonshotInsights.io. This may include sharing information with other companies, lawyers, and courts or other government entities.
                    <br/>6.     We may disclose information pursuant to subpoenas, court orders, or other requests (including criminal and civil matters) if we have a good faith belief that such a response is required by law. This may include requests from jurisdictions outside of the United States if we have a good faith belief that the response is required by law under the local laws in that jurisdiction, is applicable to users from that jurisdiction, and is consistent with generally accepted international standards.

                    <br/><br/><b>7. Sharing Your Information on MoonshotInsights.io.</b>

                    <br/><br/>Use of MoonshotInsights.io is based on you posting information about yourself, your completed Pathways, business or company on the Website. Personal details such as contact information is not viewable to anyone who is not a registered User of the Website. In addition, any information contained in private messages is not made available to any party not involved in a certain conversation.

                    <br/><br/><b>8. Collection of Information from Children and COPPA.</b>

                    <br/><br/>MoonshotInsights.io is not targeted toward children. We do not knowingly collect or retain any Personal Information from children under the age of thirteen. If you believe some person or User has submitted information about an individual under the age of thirteen, contact us and we will remove the information as soon as possible.

                    <br/><br/><b>9. Miscellaneous.</b>

                    <br/><br/>1.     Unless stated otherwise, our current Policy applies to all information which we have about you and your account.
                    <br/>2.     By using MoonshotInsights.io, you consent to having your personal data transferred to and processed in the United States.
                    <br/>3.     You may obtain a copy of the information we have collected about you by contacting us at support@MoonshotInsights.io
                    <br/>4.     All terms used in this document have the same meaning as in the Terms of Use Agreement unless obviously limited by context. If any term is unclear, please refer to the Terms of Use Agreement.
                </div>

                {standalone ?
                    <div style={{marginBottom: "20px"}} />
                    : null
                }
            </div>
        );
    }
}

export default PrivacyPolicy;
