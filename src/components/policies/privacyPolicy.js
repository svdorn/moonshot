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
                {standalone ?
                    <div className="greenToBlue headerDiv" />
                    : null
                }

                <div style={containerStyle}>
                    <b className="font20px font18pxUnder700">Moonshot’s Privacy Policy</b>

                    <br/><br/>Last updated: 3/2/2018

                    <br/><br/>Moonshot Learning, Inc. ("us", "we", or "our") operates moonshotlearning.org ("website",
                    "site"). This Privacy Policy informs you of our policies regarding the collection, use and disclosure of
                    Personal Information we receive from users of the site.

                    <br/><br/>By using this site, you agree to the collection and use of information in accordance with this
                    policy.

                    <br/><br/><b>Information Collection and Use</b>

                    <br/><br/>While using our site, we may ask you to provide us with certain personally identifiable
                    information that can be used to contact or identify you. Personally identifiable information may
                    include, but is not limited to your name, email address and phone number.

                    <br/><br/><b>Log Data</b>

                    <br/><br/>Like many site operators, we collect information that your browser sends whenever you visit
                    our site (“Log Data”). This Log Data may include information such as your computer’s Internet Protocol
                    (“IP”) address, browser type, browser version, the pages of our site that you visit, the time and date
                    you visit, the time spent on those pages and other statistics.

                    <br/><br/><b>Communications</b>

                    <br/><br/>We may use your Personal Information to contact you with newsletters, marketing or promotional
                    materials and other information.

                    <br/><br/><b>Cookies</b>

                    <br/><br/>Cookies are files with small amount of data, which may include an anonymous unique identifier.
                    Cookies are sent to your browser from a web site and stored on your computer{"'"}s hard drive.

                    <br/><br/>Like many sites, we use "cookies" to collect information. You can instruct your browser to
                    refuse all cookies or to indicate when a cookie is being sent. However, if you do not accept cookies,
                    you may not be able to use some portions of our Site.

                    <br/><br/><b>Security</b>

                    <br/><br/>The security of your Personal Information is important to us. We are responsible for the
                    accuracy and security of your personally identifiable data. We use commercially acceptable means to
                    protect your Personal Information to ensure unauthorized parties cannot access your data.

                    <br/><br/><b>Changes To This Privacy Policy</b>

                    <br/><br/>This Privacy Policy will remain in effect except with respect to any changes in its provisions
                    in the future, which will be in effect immediately after being posted on this page.

                    <br/><br/>We reserve the right to update or change our Privacy Policy at any time and you should check
                    this Privacy Policy periodically. Your continued use of our Site after we post any modifications to the
                    Privacy Policy on this page will constitute your acknowledgment of the modifications and your consent to
                    abide and be bound by the modified Privacy Policy.

                    <br/><br/>If we make any material changes to this Privacy Policy, we will notify you either through the
                    email address you have provided us, or by placing a prominent notice on our website.

                    <br/><br/><b>Links</b>

                    <br/><br/>This website contains links to other sites. Please be aware that we are not responsible for
                    the content or privacy practices of such other sites. We encourage our users to be aware when they leave
                    our site and to read the privacy statements of any other site that collects personally identifiable
                    information.

                    <br/><br/><b>Data Collection and Use</b>

                    <br/><br/>We collect your name, phone number, email, other personally identifiable information and data
                    collected through commission of you completing Moonshot pathways. Data is protected by being stored on
                    secure servers and databases.

                    <br/><br/>We collect this information through your submission on our site and by completing pathways,
                    engaging with other content and sources through our site. By accepting this agreement, you allow us to
                    collect your data as you engage with content on and linked to our site.

                    <br/><br/>All of this data will only be used, in our sole discretion, to advance the chances of you and
                    other users on the site to receive employment opportunities with our existing and potential hiring
                    partners. The purpose of the data is employment so you allow us to share your data with various
                    employers, organizations and other stakeholders to technology and the workforce.

                    <br/><br/><b>Control Over Your Data</b>

                    <br/><br/>You can control your basic data in profile settings, exercise choice over what data we
                    collect, contact us to see and contest all of the personally identifiable data that Moonshot has
                    collected from you and request for all of your data on Moonshot to be deleted, at any time, by
                    contacting support@moonshotlearning.org.

                    <br/><br/><b>Contact Us</b>

                    <br/><br/>If you have any questions about this Privacy Policy, please contact us at
                    support@moonshotlearning.org.
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
