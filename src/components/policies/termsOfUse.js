"use strict"
import React, {Component} from 'react';
import {Paper} from 'material-ui';

class TermsOfUse extends Component {
    render() {
        // if the component is its own page or within a different page
        let standalone = false;

        try {
            standalone = this.props.route.standalone;
        } catch(e) {
            // if that doesn't work it means this is embedded in something else
        }

        let containerStyle = standalone ? {padding:"20px"} : {}

        console.log("here");

        return (
            <div>
                {standalone ?
                    <div className="lightBlackBackground headerDiv" />
                    : null
                }

                <div style={containerStyle}>

                    <b className="font20px font18pxUnder700px">Terms of Use Agreement</b>

                    <br/><br/> Last updated: 6/10/2018

                    <br/><br/><b>Introduction</b>

                    <br/><br/> Moonshot Learning, Inc. (“Moonshot,” “us,” “our,” or “we”)
                    operates MoonshotInsights.io (the “Website”), a career networking platform
                    which allows for users in search of employment (“Applicants”) to show off
                    their skills to, and connect with, employers (“Employers”) looking to hire
                    Applicants in various areas of expertise. Applicants and Employers
                    (collectively, “Users”) connect through Employer sponsored courses designed
                    to test an Applicant’s skills in a specialized area (“Pathways”).

                    <br/><br/> This Terms of Use Agreement ("Agreement"), which may be modified
                    at any time, constitutes legally binding terms and applies to your use of the
                     Website (including online and mobile versions), and any software made available
                     by Moonshot and/or its subsidiaries, including your use of widgets, interactive
                     features, plug-ins, applications, downloads, content, or any other tools or
                     features which may post a link invoking this Agreement. You are authorized to
                     use the Website only if you agree to abide by all applicable laws, rules and
                     regulations (“Applicable Law”) and the terms of this Agreement, regardless of
                     whether your access or use is intentional. In consideration for becoming a User
                     and/or making use of the Website, you must indicate your acceptance of this Agreement.

                     <br/><br/> By using the website, you acknowledge and accept our Privacy Policy and consent to the
                     collection and use of your data in accordance with the Privacy Policy.

                    <br/><br/> <b>1. Notices</b>

                    <br/><br/> Prior to your use of the Website, you acknowledge and accept that:
                    <br/>1.     Moonshot simply provides a space for Applicants and Employers to network, interact, and engage in the career evaluation and recruitment process.
                    <br/>2.     Moonshot makes no guarantee that participation in Pathways or any interviews made with Employers will lead to the hiring of an Applicant.
                    <br/>3.     Nothing expressed by Moonshot, or made available on the Website shall constitute legal, advice.

                    <br/><br/> <b>2. Eligibility</b>

                    <br/><br/> Use of MoonshotInsights.io and registration to be an authorized User of the Website (“Membership”) is void where prohibited. By using the Website, you represent and warrant that:
                    <br/>1.     All registration information you submit is truthful and accurate;
                    <br/>2.     You will maintain the information’s accuracy;
                    <br/>3.     You have received an invitation to register;
                    <br/>4.     You are 18 years of age or older; and
                    <br/>5.     Your use of the Website does not violate any Applicable Law.

                    <br/><br/>We reserve the right to delete your account and/or terminate your Membership if we believe that any of the above representations are not accurate.

                    <br/><br/> <b>3. Interview Incentive</b>

                    <br/><br/> If an Applicant is offered an interview by an Employer after the completion of certain eleigible Pathways, the Applicant may be eligible to receive a cash payment in the amount of $100 from us (the “Incentive”). In order to claim the Incentive, the Applicant must: be offered the opportunity to interview with a registered Employer following the completion of an eligible Pathway, schedule an interview with the Employer, and attend and complete the interview. The Incentive will be sent to the Applicant upon our receipt of confirmation of a completed interview from the Employer. The Incentive can only be redeemed once per Applicant and is non-transferable.

                    <br/><br/> <b>4. Referral Incentive</b>

                    <br/><br/> If a currently registered Applicant refers a new User to register as an Applicant on the Website, and the new Applicant offers, accepts and completes an interview with an Employer following their completion of a Pathway, the current Applicant responsible for the referral may be eligible to receive a cash payment of $300 following the successful referral. The referral incentive will be sent to the eligible User upon receipt of confirmation of a completed interview from an Employer. A user is only eligible to receive up to one Referral Incentive from us. The Referral Incentive is non-transferable.

                    <br/><br/> <b>5. Signing Bonus</b>

                    <br/><br/> If an Applicant accepts an offer of employment from an Employer registered with us, following the successful completion of certain eligible Pathways and subsequent interviews with the Employer, the Applicant may be eligible to receive a Signing Bonus from us, a cash payment of $100. The Signing Bonus will be sent to the Applicant upon us receiving confirmation of an accepted offer of employment from the Employer. The Signing Bonus is non-transferable.

                    <br/><br/> <b>6. Duration</b>

                    <br/><br/> This Agreement, and any revisions to this Agreement, will be in full force and effect while you use MoonshotInsights.io or are a registered User. This Agreement shall remain in effect even after Membership is terminated. You may terminate your Membership at any time, for any reason, by following the instructions posted on the Website, or by sending an email to info@MoonshotInsights.io requesting termination of your Membership. We may terminate your Membership at any time, for any or no reason, without prior notice or explanation, and without liability. Furthermore, we reserve the right, in our sole discretion, to reject, refuse to post or remove any posting (including, without limitation, job postings, Pathways, private messages, and emails (collectively, “Messages”)) by you, or to deny, restrict, suspend, or terminate your access to all or any part of the Website at any time, for any or no reason, without prior notice or explanation, and without liability. In addition, Moonshot expressly reserves the right to remove your account and/or deny, restrict, suspend, or terminate your access to all or any part of the Website if we determine, in our sole discretion, that you have violated this Agreement or pose a threat to us, our employees, business partners, Users and/or the public.

                    <br/><br/> <b>7. Fees</b>

                    <br/><br/> You acknowledge that Moonshot reserves the right to charge for any portion of the Website and to change our fees, if any, from time to time at our discretion. If we terminate your Membership because you have breached this Agreement, you shall not be entitled to the refund of any unused portion of fees or payments. Some Employers will have agreed upon fee structures with us in separately contracted agreements. This Section does not apply to any such Employers or any such agreements.

                    <br/><br/> <b>8. Password Security</b>

                    <br/><br/> When you register to become a User, you will also be asked to choose a password. You are entirely responsible for maintaining the confidentiality of your password. You agree not to knowingly use the account, username, email address or password of another User at any time or to disclose your password to any third-party. You agree to notify us immediately if you suspect any unauthorized use of your account or access to your password. You are solely responsible for any and all use of your account.

                    <br/><br/> <b>9. Use by Registered Users</b>

                    <br/><br/> MoonshotInsights.io is for the use of registered Users and may only be used for the direct commercial purposes that are specifically endorsed or authorized by us. We reserve the right to remove unauthorized content in our sole discretion. Illegal and/or unauthorized use of the Website including, without limitation, collecting usernames, user ID numbers, and/or email addresses of Members by electronic or other means for the purpose of sending unsolicited Messages, or making unauthorized solicitations or unauthorized framing of or linking to MoonshotInsights.io, or employing third-party promotional sites or software to promote accounts for money, is prohibited. Commercial advertisements, affiliate links, and other forms of unauthorized data collection or solicitation may be removed from User profiles without notice or explanation and may result in termination of User privileges. Moonshot reserves the right to take appropriate legal action, including, without limitation, referral to law enforcement, for any illegal or unauthorized use of the Website.

                    <br/><br/> <b>10. Content Posted</b>

                    <br/><br/> 1.     Upon granting an invitation to register to a User, we may populate your user account and pages associated with your user account with information you provide to us when creating your account, and information you provide to us when completing any or all parts of any Pathways. This information may be shared with other Users. By using the Website, you agree to allow us to input and display sand share such information to the extent we are able. In the event that we are not able to fully populate your account, you agree to post any and all outstanding information.
                    <br/>2.     By posting or otherwise posting content to the Website, you grant us a non-exclusive, worldwide, perpetual, irrevocable, royalty-free, sublicensable (through multiple tiers) right to exercise any and all copyright, trademark, publicity, and database rights (but no other rights) you have in the content, in any media known now or in the future. You acknowledge and agree that:
                    <br/><pre>&#9;</pre>    a.     We act only as a portal for the online distribution and publication of User content. We make no warranty that User content is made available on the Website. We have the right (but not the obligation) to take any action deemed appropriate by us with respect to User content. Moonshot has no responsibility or liability for the deletion of or failure to store any content, regardless of whether the content was actually made available on the Website or not; and
                    <br/><pre>&#9;</pre>    b.     any and all content submitted to the Website is subject to the approval of Moonshot. We may reject, approve or modify your User content at our sole discretion.
                    <br/>3.     You acknowledge and agree that we may transfer your personal information to a related corporate body and your information may be transferred outside of the United States. If you wish to withdraw your consent, you acknowledge and agree that we may be unable to provide you with access to the Website and as a result may close your Account.
                    <br/>4.     The Website may contain general information about legal, financial, and other matters. This information is not advice and should not be treated as such. You must not rely on the information on MoonshotInsights.io as an alternative to professional advice. If you have specific questions about any matter you should consult a professional advisor.
                    <br/>5.     Moonshot may provide unmonitored access to third party content, including User feedback and articles with original content and opinions (or links to such third-party content). We act only as a portal and therefore have no liability based on, or related to, third party content on the Website, whether arising under the laws of copyright or other intellectual property, defamation, libel, privacy, obscenity, or any other legal discipline.
                    <br/>6.     The Website may contain links to other third-party websites. We do not control the websites that are linked from the Website. We do not endorse the content, products, services, practices, policies or performance of the websites that are linked from MoonshotInsights.io. Use of third party content, links, or websites is done at the risk of the User.

                    <br/><br/> <b>11. Proprietary Rights in the Content of Others</b>

                    <br/><br/> 1.     Moonshot owns and retains all rights in its Content and the Website. The Content is protected by copyright, trademark, patent, trade secret, and other laws. Moonshot hereby grants you a limited, revocable, non-sublicensable license to reproduce and display our Content (excluding any software code) solely for your personal use in connection with viewing and using the Website.
                    <br/>2.     The Website contains Content of Users and other Moonshot licensors. Except as provided within this Agreement, you may not copy, modify, translate, publish, broadcast, transmit, distribute, display, sell or otherwise use any Content appearing on or relating to the Website.

                    <br/><br/> <b>12. Technical Use of Content</b>

                    <br/><br/> We perform technical functions necessary to operate the Website, including, but not limited to, the technical processing and transmission of Messages, and transcoding and/or reformatting Content to allow its use throughout MoonshotInsights.io. In addition, we may, at the request of Employers, collect, aggregate, compile, and present anonymized data of Users affiliated with such Employers in order to provide Employers and Users with statistics regarding Applicants and employees in various fields.

                    <br/><br/> <b>13. Messages from Moonshot</b>

                    <br/><br/> You agree and acknowledge that we may send Messages including but not limited to notifications, special offers, promotions, commercial advertisements, and marketing materials in connection with MoonshotInsights.io services and registered Employers. You can control what type of communications you receive from us by logging into your account and choosing the appropriate notification settings.

                    <br/><br/> <b>14. Content Prohibited</b>

                    <br/><br/> The following are examples of the kind of Content that is illegal or prohibited to post on or in connection with MoonshotInsights.io. We reserve the right to investigate and take appropriate legal action against anyone who, in our sole discretion, violates this provision, including, without limitation, removing the offending Content from the Website, terminating the Membership of such violators and/or reporting such Content to law enforcement authorities. Prohibited Content includes, but is not limited to, Content that:

                    <br/><br/>1.     Infringes upon or misappropriates any copyright, patent, trademark, trade secret, or other intellectual property right or proprietary right or right of publicity or privacy of any person;
                    <br/>2.     Violates any law or regulation;
                    <br/>3.     Is defamatory or libelous;
                    <br/>4.     Is obscene or contains child pornography;
                    <br/>5.     Contains the development, design, manufacture or production of missiles, or nuclear, chemical or biological weapons;
                    <br/>6.     Contains material linked to terrorist activities;
                    <br/>7.     Includes incomplete, false or inaccurate information about User or any other individual;
                    <br/>8.     Promotes the direct solicitation or sale of securities; or
                    <br/>9.     Contains any viruses or other computer programming routines that are intended to damage, detrimentally interfere with, surreptitiously intercept or expropriate any system, data or personal information.

                    <br/><br/> <b>15. Activities Prohibited</b>

                    <br/><br/> The following are examples of the kind of activity that is illegal or prohibited on the Website. We reserve the right to investigate and take appropriate legal action against anyone who, in our sole discretion, violates this provision, including, without limitation, terminating your Membership and/or reporting such activity to law enforcement authorities. Prohibited activity includes, but is not limited to:

                    <br/><br/>1.     Criminal or tortious activity including child pornography, fraud, trafficking in obscene material, drug dealing, gambling, harassment, defamation, stalking, spamming, spimming, sending of viruses or other harmful files, copyright infringement, patent infringement, or theft of trade secrets;
                    <br/>2.     Advertising to, or solicitation of, any User to buy or sell any products or services through the unauthorized or impermissible use of the Website. You may not transmit any chain letters or junk email to other Users. In order to protect Users from such advertising or solicitation, Moonshot reserves the right to restrict the number of emails that a User may send to other Users in any 24-hour period. If you breach this Agreement and send or cause to be sent (directly or indirectly) unsolicited bulk messages or other unauthorized commercial communications of any kind through the Website, you acknowledge that you will have caused substantial harm to us and that the amount of such harm would be extremely difficult to ascertain.
                    <br/>3.     Circumventing or modifying, attempting to circumvent or modify, or encouraging or assisting any other person in circumventing or modifying any security technology or software that is part of the Website;
                    <br/>4.     Activity that involves the use of viruses, bots, worms, or any other computer code, files or programs that interrupt, destroy or limit the functionality of any computer software or hardware, or otherwise permit the unauthorized use of or access to a computer or a computer network;
                    <br/>5.     Modifying, copying, distributing, downloading, scraping or transmitting in any form or by any means, in whole or in part, any Content from MoonshotInsights.io other than your Content which you legally post on or in connection with the Website;
                    <br/>6.     Providing or using “tracking” or monitoring functionality in connection with the Website including identifying other Users’ views, actions or other activities;
                    <br/>7.     Covering or obscuring the banner advertisements and/or safety features of any MoonshotInsights.io page via HTML/CSS or any other means;
                    <br/>8.     Any automated use of the system, such as using scripts with third parties to add friends or send comments, messages, status or mood updates, blogs or bulletins;
                    <br/>9.     Interfering with, disrupting, or creating an undue burden on the Website or the networks or services connected with us;
                    <br/>10.  Impersonating or attempting to impersonate Moonshot or a Moonshot employee, administrator or moderator, another User, or person or entity (including, without limitation, the use of email addresses of or associated with any of the foregoing);
                    <br/>11.  Using the account, username, or password of another User at any time or disclosing your password to any third-party or permitting any third-party to access your account;
                    <br/>12.  Using any information obtained from the Website in order to harass, abuse, or harm another person or entity, or distributing information obtained from the Website to another party attempting to do the same;
                    <br/>13.  Displaying an unauthorized commercial advertisement on your postings, or accepting payment or anything of value from a third person in exchange for your performing any commercial activity through the unauthorized or impermissible use of the Website on behalf of that person, such as posting commercial content unrelated to your business conducted on the Website, links to e-commerce sites not authorized by us, or sending messages with a commercial purpose other than one authorized by us;
                    <br/>14.  Relaying email from a third-party’s mail server without the permission of that third-party;
                    <br/>15.  Using invalid or forged headers to disguise the origin of any Content transmitted to or through our computer systems, or otherwise misrepresenting yourself or the source of any Message or Content;
                    <br/>16.  Using any automated system, including, but not limited to, scripts or bots in order to harvest email addresses or other data from the Website for the purposes of sending unsolicited or unauthorized material;
                    <br/>17.  Engaging in, either directly or indirectly, or encouraging others to engage in, click-throughs generated in any manner that could be reasonably interpreted as coercive, incentivized, misleading, malicious, or otherwise fraudulent; or
                    <br/>18.  Using the Website in a manner inconsistent with any and all Applicable Law.

                    <br/><br/> <b>16. Protecting Intellectual Property</b>

                    <br/><br/> Moonshot respects the intellectual property of others and requires that Users do the same. You may not upload, embed, post, email, transmit or otherwise make available any material that infringes any copyright, patent, trademark, trade secret or other proprietary rights of any person or entity.

                    <br/><br/> <b>17. Communication with Other Users</b>

                    <br/><br/> You must not post your email address or other contact information on the Website, except in the "email" field of the signup form, at the request of Moonshot, or as otherwise prompted or permitted by the Website.

                    <br/><br/> <b>18. Messenger Service</b>

                    <br/><br/> Moonshot provides a Messenger Service on the Website that allows for Users to interact with each other via private messaging. By using this Messenger Service, you acknowledge and accept that the Messenger Service is for the exchange of information relating to general marketing, networking, employment opportunities, and contact information only. We reserve the right to terminate your Membership should we be made aware that you are using the Messenger Service in a manner that violates this Section, or either of the above Content Prohibited and Activities Prohibited Sections.

                    <br/><br/> <b>19. Identity</b>

                    <br/><br/> You authorize us, either directly or through third parties, to make any inquiries we may consider necessary to validate your identity. You must, at our request:

                    <br/><br/>1.     Provide us with further information, which may include your date of birth and other information that will allow us to reasonably identify you;
                    <br/>2.     Take steps to confirm ownership of your email address or financial instruments; or
                    <br/>3.     Verify your information against third party databases or through other sources.

                    <br/><br/> You must also, at our request, provide copies of identification documents (such as your drivers license). We may also ask you to provide live photographic verification. Moonshot reserves the right to close, suspend, or limit access to your Account, the Website and/or any Services in the event we are unable to obtain or satisfactorily verify the information which may be requested under this section. Other restrictions may also apply.

                    <br/><br/> <b>20. Disputes</b>

                    <br/><br/> Any dispute arising with respect to this Agreement, its making or validity, its interpretation, or its breach may, at the discretion of Moonshot, be settled by arbitration in Madison, Wisconsin, by a single arbitrator mutually agreed to by the disputing parties pursuant to the then obtaining rules of the American Arbitration Association, but without any requirement that the parties utilize the arbitration services of the American Arbitration Association. Such arbitration shall be the sole and exclusive remedy for such disputes except as otherwise provided in this Agreement.  Any award rendered shall be final and conclusive upon the parties, and a judgment may be entered in any court having jurisdiction.

                    <br/><br/> <b>21. Privacy</b>

                    <br/><br/> Use of the Website is also governed by our Privacy Policy, which is incorporated into this Agreement by this reference.

                    <br/><br/> <b>22. Disclaimers</b>

                    <br/><br/> These terms and conditions are governed by the laws of the United States of America and the
                    laws of the State of Wisconsin.

                    <br/><br/> <b>22. Disclaimers</b>

                    <br/><br/> 1.     Moonshot is not responsible for and makes no warranties, express or implied, as to the User Content or the accuracy and reliability of the User Content posted through or in connection with the Website or any third-party add-ons, tools, or supplementary services used by the Website (“Partner Services”), by Users of the Website or Partner Services. Such User Content does not necessarily reflect the opinions or policies of Moonshot. In addition, we are not responsible for any damage, injury or loss caused by Users of the Website or by any of the equipment or programming associated with or utilized in MoonshotInsights.io or Partner Services.
                    <br/> 2.     Accounts and Partner Services created and posted by Users on or in connection with the Website may contain links to other websites or services. We are not responsible for the Content, accuracy or opinions expressed on such websites and services, and such websites and services are not necessarily investigated, monitored or checked for accuracy or completeness by us. Inclusion of any linked website or service on the Website does not imply approval or endorsement of the linked website or service by us. When you access these third-party sites and services, you do so at your own risk.
                    <br/> 3.     We take no responsibility for third-party advertisements or Partner Services that are posted on or in connection with MoonshotInsights.io or Partner Services, nor do we take any responsibility for the goods or services provided by these third-parties.
                    <br/> 4.     Moonshot is not responsible for the conduct, whether online or offline, of any User of MoonshotInsights.io or Partner Services.
                    <br/> 5.     We assume no responsibility for any error, omission, interruption, deletion, defect, delay in operation or transmission, communications line failure, theft or destruction or unauthorized access to, or alteration of, any User communication or any User Content. We are not responsible for any problems or technical malfunction of any telephone network or lines, computer online systems, servers or providers, computer equipment, software, failure of any email due to technical problems or traffic congestion on the Internet or on MoonshotInsights.io or Partner Services or combination thereof, including, without limitation, any injury or damage to Users or to any persons computer related to or resulting from participation or downloading materials in connection with the Website or Partner Services.
                    <br/> 6.     Under no circumstances shall we be responsible for any loss or damage, including, without limitation, personal injury or death, resulting from use of the Website or Partner Services, from any User Content posted on or through MoonshotInsights.io or Partner Services, or from the conduct of any Users of the Website, whether online or offline.
                    <br/> 7.     MoonshotInsights.io and Partner Services are provided "AS IS" and “AS AVAILABLE” and we EXPRESSLY DISCLAIM ANY WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, QUALITY OF INFORMATION, NON-INFRINGEMENT, OR QUIET ENJOYMENT. We cannot guarantee and do not promise any specific results from use of the Website or Partner Services. We also cannot guarantee the accuracy of information posted on the Website.


                    <br/><br/> <b>23. Limitation on Liability</b>

                    <br/><br/> IN NO EVENT SHALL MOONSHOT BE LIABLE TO YOU OR ANY THIRD-PARTY FOR ANY INDIRECT, CONSEQUENTIAL, EXEMPLARY, INCIDENTAL, SPECIAL OR PUNITIVE DAMAGES, INCLUDING, WITHOUT LIMITATION, LOST PROFIT DAMAGES ARISING FROM YOUR USE OF MOONSHOTINSIGHTS.IO OR PARTNER SERVICES, EVEN IF MOONSHOT HAS BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES. NOTWITHSTANDING ANYTHING TO THE CONTRARY CONTAINED HEREIN, MOONSHOT'S LIABILITY TO YOU FOR ANY CAUSE WHATSOEVER AND REGARDLESS OF THE FORM OF THE ACTION, WILL AT ALL TIMES BE LIMITED TO THE AMOUNT PAID, IF ANY, BY YOU TO US FOR USING THE WEBSITE DURING THE TERM OF MEMBERSHIP.

                    <br/><br/> <b>24. Indemnification</b>

                    <br/><br/> You agree to indemnify and hold Moonshot, its parents, subsidiaries, affiliates, subcontractors and other partners, and their respective owners, officers, agents, partners and employees, harmless from any loss, liability, claim, or demand, including, but not limited to, reasonable attorneys&#39; fees, made by any third-party due to or arising out of your use of MoonshotInsights.io in violation of this Agreement and/or arising from a breach of this Agreement and/or any breach of your representations and warranties set forth in this Agreement and/or any Content that you post on or in connection with the Website.

                    <br/><br/> <b>25. Other</b>

                    <br/><br/> This Agreement is accepted upon your use of MoonshotInsights.io and is further affirmed by you becoming a User. Your agreement with us will always include this Agreement at a minimum. Your access and use of certain portions of the Website will require you to accept additional terms and conditions applicable to those portions of the website, in addition to this Agreement, and may require you to download Software or Content.

                    <br/><br/>The failure of Moonshot to exercise or enforce any right or provision of this Agreement shall not operate as a waiver of such right or provision. The section titles in this Agreement are for convenience only and have no legal or contractual effect.

                    <br/><br/>This Agreement operates to the fullest extent permissible by law. If any provision of this Agreement is unlawful, void or unenforceable, that provision is deemed severable from this Agreement and does not affect the validity and enforceability of any remaining provisions.

                    <br/><br/>To contact us with any questions or concerns about this Agreement, please contact us at support@MoonshotInsights.io.

                    <br/><br/>I HAVE READ THIS AGREEMENT AND AGREE TO ALL OF THE PROVISIONS CONTAINED ABOVE. I UNDERSTAND THAT NOT READING THIS AGREEMENT AND/OR CLAIMING IGNORANCE IS NOT A DEFENSE AND I WILL BE BOUND BY ITS CONDITIONS REGARDLESS.

                </div>

                {standalone ?
                    <div style={{marginBottom: "20px"}} />
                    : null
                }
            </div>
        );
    }
}

export default TermsOfUse;
