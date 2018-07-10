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
                    <b className="font20px font18pxUnder700">MOONSHOT AFFILIATE AGREEMENT</b>

                    <br/><br/>Last updated: 3/12/2018

                    <br/><br/>THIS IS A LEGAL AGREEMENT BETWEEN YOU AND MOONSHOT LEARNING, INC. (MOONSHOTINSIGHTS.IO)

                    <br/><br/>BY ACCEPTING THIS AGREEMENT, YOU ARE AGREEING THAT YOU HAVE READ AND UNDERSTAND THE TERMS AND CONDITIONS OF THIS AGREEMENT AND THAT YOU AGREE TO BE LEGALLY RESPONSIBLE FOR EACH AND EVERY TERM AND CONDITION.

                    <br/><br/><b>1. Overview</b>

                    <br/><br/>This Agreement contains the complete terms and conditions that apply to you becoming an
                    affiliate or referrer in Moonshot’s Affiliate Program (“Moonshot” refers to Moonshot Learning, Inc.
                    and the corresponding site, moonshotinsights.io). The purpose of this Agreement is to allow HTML
                    linking between your web site and the moonshotinsights.io web site. Please note that throughout this
                    Agreement, "we," "us," and "our" refer to Moonshot Learning, Inc., moonshotinsights.io or Moonshot,
                    and "you," "your," and "yours" refer to the affiliate or referrer.

                    <br/><br/><b>2. Affiliate Obligations</b>

                    <br/><br/>2.1. We may reject your request at our sole discretion. We may cancel your application if
                    we determine that your site and outreach is unsuitable for our Program, including if it:
                    <br/><br/>2.1.1. Promotes sexually explicit materials
                    <br/><br/>2.1.2. Promotes violence
                    <br/><br/>2.1.3. Promotes discrimination based on race, sex, religion, nationality, disability, sexual
                    orientation, or age
                    <br/><br/>2.1.4. Promotes illegal activities
                    <br/><br/>2.1.5. Incorporates any materials which infringe or assist others to infringe on any copyright,
                    trademark or other intellectual property rights or to violate the law
                    <br/><br/>2.1.6. Includes {'"'}Moonshot{'"'} or variations or misspellings thereof in its domain name
                    <br/><br/>2.1.7. Is otherwise in any way unlawful, harmful, threatening, defamatory, obscene, harassing,
                    or racially, ethnically or otherwise objectionable to us in our sole discretion.
                    <br/><br/>2.1.8. Contains software downloads that potentially enable diversions of commission from other
                    affiliates in our program.
                    <br/><br/>2.1.9. You may not create or design your website or any other website that you operate,
                    explicitly or implied in a manner which resembles our website nor design your website in a manner which
                    leads customers to believe you are moonshotinsights.io or any other affiliated business.
                    <br/><br/>2.2. Moonshot reserves the right, at any time, to review your placement and approve the use of
                    Your Links and require that you change the placement or use to comply with the guidelines provided to you.
                    <br/><br/>2.3. The maintenance and the updating of your site and outreach channels will be your responsibility.
                    We may monitor your site and outreach channels as we feel necessary to make sure that it is up-to-date and
                    to notify you of any changes that we feel should enhance your performance.
                    <br/><br/>2.4. It is entirely your responsibility to follow all applicable intellectual property and other
                    laws that pertain to your site. You must have express permission to use any person{"'"}s copyrighted material,
                    whether it be a writing, an image, or any other copyrightable work. We will not be responsible (and you will
                    be solely responsible) if you use another person{"'"}s copyrighted material or other intellectual property
                    in violation of the law or any third party rights.


                    <br/><br/><b>3. Moonshot Rights and Obligations</b>

                    <br/><br/>3.1. We have the right to monitor your site at any time to determine if you are following the terms
                    and conditions of this Agreement. We may notify you of any changes to your site that we feel should be made,
                    or to make sure that your links to our web site are appropriate and to notify further you of any changes that
                    we feel should be made. If you do not make the changes to your site that we feel are necessary, we reserve the
                    right to terminate your participation in the Moonshot Affiliate Program.
                    <br/><br/>3.2. Moonshot reserves the right to terminate this Agreement and your participation in the Moonshot
                    Affiliate Program immediately and without notice to you should you commit fraud in your use of the Moonshot
                    Affiliate Program or should you abuse this program in any way. If such fraud or abuse is detected, Moonshot
                    shall not be liable to you for any commissions for such fraudulent sales.
                    <br/><br/>3.3. This Agreement will begin upon our acceptance of your Affiliate request, and will continue unless
                    terminated hereunder.


                    <br/><br/><b>4. Termination</b>

                    <br/><br/>Either you or we may end this Agreement AT ANY TIME, with or without cause, by giving the other party
                    written notice. Written notice can be in the form of mail, email or fax. In addition, this Agreement will terminate
                    immediately upon any breach of this Agreement by you.

                    <br/><br/><b>5. Modification</b>

                    <br/><br/>We may modify any of the terms and conditions in this Agreement at any time at our sole discretion. In
                    such event, you will be notified by email. Modifications may include, but are not limited to, changes in the payment
                    procedures and Moonshot{"'"}s Affiliate Program rules. If any modification is unacceptable to you, your only option
                    is to end this Agreement. Your continued participation in Moonshot{"'"}s Affiliate Program following the posting of
                    the change notice or new Agreement on our site will indicate your agreement to the changes.

                    <br/><br/><b>6. Payment</b>

                    <br/><br/>Moonshot will pay you the proper fees and commission through PayPal. You must provide your PayPal account
                    to receive the funds.

                    <br/><br/><b>7. Affiliate Account Updates</b>

                    <br/><br/>To receive an update on your affiliate activity, you can email support@moonshotlearning.org requesting an update.


                    <br/><br/><b>8. Promotion Restrictions</b>

                    <br/><br/>8.1. You are free to promote your own web sites, but naturally any promotion that mentions Moonshot could
                    be perceived by the public or the press as a joint effort. You should know that certain forms of advertising are always
                    prohibited by Moonshot. For example, advertising commonly referred to as "spamming" is unacceptable to us and could
                    cause damage to our name. Other generally prohibited forms of advertising include the use of unsolicited commercial
                    email (UCE), postings to non-commercial newsgroups and cross-posting to multiple newsgroups at once. In addition, you
                    may not advertise in any way that effectively conceals or misrepresents your identity, your domain name, or your return
                    email address. You may use mailings to customers to promote Moonshot so long as the recipient is already a customer or
                    subscriber of your services or web site, and recipients have the option to remove themselves from future mailings. Also,
                    you may post to newsgroups to promote Moonshot so long as the news group specifically welcomes commercial messages. At
                    all times, you must clearly represent yourself and your web sites as independent from Moonshot. If it comes to our attention
                    that you are spamming, we will consider that cause for immediate termination of this Agreement and your participation
                    in the Moonshot Affiliate Program. Any pending balances owed to you will not be paid if your account is terminated due
                    to such unacceptable advertising or solicitation.

                    <br/><br/>8.2. Affiliates that among other keywords or exclusively bid in their Pay-Per-Click campaigns on keywords
                    such as moonshotinsights.io, Moonshot, www.moonshot, www.moonshotinsights.io, and/or any misspellings or similar
                    alterations of these – be it separately or in combination with other keywords – and do not direct the traffic from such
                    campaigns to their own website prior to re-directing it to ours, will be considered trademark violators, and will be banned
                    from Moonshot’s Affiliate Program. We will do everything possible to contact the affiliate prior to the ban. However, we
                    reserve the right to expel any trademark violator from our affiliate program without prior notice, and on the first
                    occurrence of such PPC bidding behavior.

                    <br/><br/>8.3. Affiliates are not prohibited from keying in prospect’s information into the lead form as long as the prospects’
                    information is real and true, and these are valid leads (i.e. sincerely interested in Moonshot’s service).

                    <br/><br/>8.4. Affiliate shall not transmit any so-called “interstitials,” “Parasiteware™,” “Parasitic Marketing,”
                    “Shopping Assistance Application,” “Toolbar Installations and/or Add-ons,” “Shopping Wallets” or “deceptive pop-ups and/or
                    pop-unders” to consumers from the time the consumer clicks on a qualifying link until such time as the consumer has fully
                    exited Moonshot’s site (i.e., no page from our site or any Moonshot’s content or branding is visible on the end-user’s screen).
                    As used herein a. “Parasiteware™” and “Parasitic Marketing” shall mean an application that (a) through accidental or direct
                    intent causes the overwriting of affiliate and non affiliate commission tracking cookies through any other means than a
                    customer initiated click on a qualifying link on a web page or email; (b) intercepts searches to redirect traffic through
                    an installed software, thereby causing, pop ups, commission tracking cookies to be put in place or other commission tracking
                    cookies to be overwritten where a user would under normal circumstances have arrived at the same destination through the
                    results given by the search (search engines being, but not limited to, Google, MSN, Yahoo, Overture, AltaVista, Hotbot and
                    similar search or directory engines); (c) set commission tracking cookies through loading of Moonshot site in IFrames,
                    hidden links and automatic pop ups that open moonshotinsights.io’s site; (d) targets text on web sites, other than those
                    web sites 100% owned by the application owner, for the purpose of contextual marketing; (e) removes, replaces or blocks
                    the visibility of Affiliate banners with any other banners, other than those that are on web sites 100% owned by the owner
                    of the application.


                    <br/><br/><b>9. Grant of Licenses</b>

                    <br/><br/>9.1. We grant to you a non-exclusive, non-transferable, revocable right to (i) access our site through HTML links
                    solely in accordance with the terms of this Agreement and (ii) solely in connection with such links, to use our logos, trade
                    names, trademarks, and similar identifying material (collectively, the {'"'}Licensed Materials{'"'}) that we provide to you or authorize
                    for such purpose. You are only entitled to use the Licensed Materials to the extent that you are a member in good standing of
                    Moonshot{"'"}s Affiliate Program. You agree that all uses of the Licensed Materials will be on behalf of Moonshot and the good
                    will associated therewith will inure to the sole benefit of Moonshot.
                    <br/><br/>9.2. Each party agrees not to use the other{"'"}s proprietary materials in any manner that is disparaging, misleading,
                    obscene or that otherwise portrays the party in a negative light. Each party reserves all of its respective rights in the proprietary
                    materials covered by this license. Other than the license granted in this Agreement, each party retains all right, title, and
                    interest to its respective rights and no right, title, or interest is transferred to the other.


                    <br/><br/><b>10. Disclaimer</b>

                    <br/><br/>MOONSHOT MAKES NO EXPRESS OR IMPLIED REPRESENTATIONS OR WARRANTIES REGARDING MOONSHOTINSIGHTS.IO SERVICE AND WEB SITE
                    OR THE PRODUCTS OR SERVICES PROVIDED THEREIN, ANY IMPLIED WARRANTIES OF MOONSHOT ABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND
                    NON-INFRINGEMENT ARE EXPRESSLY DISCLAIMED AND EXCLUDED. IN ADDITION, WE MAKE NO REPRESENTATION THAT THE OPERATION OF OUR SITE WILL
                    BE UNINTERRUPTED OR ERROR FREE, AND WE WILL NOT BE LIABLE FOR THE CONSEQUENCES OF ANY INTERRUPTIONS OR ERRORS.

                    <br/><br/><b>11. Representations and Warranties</b>

                    <br/><br/>You represent and warrant that:
                    <br/><br/>11.1. This Agreement has been duly and validly executed and delivered by you and constitutes your legal, valid, and binding
                    obligation, enforceable against you in accordance with its terms;
                    <br/><br/>11.2. You have the full right, power, and authority to enter into and be bound by the terms and conditions of this Agreement
                    and to perform your obligations under this Agreement, without the approval or consent of any other party;
                    <br/><br/>11.3. You have sufficient right, title, and interest in and to the rights granted to us in this Agreement.


                    <br/><br/><b>12. Limitations of Liability</b>

                    <br/><br/>WE WILL NOT BE LIABLE TO YOU WITH RESPECT TO ANY SUBJECT MATTER OF THIS AGREEMENT UNDER ANY CONTRACT, NEGLIGENCE, TORT,
                    STRICT LIABILITY OR OTHER LEGAL OR EQUITABLE THEORY FOR ANY INDIRECT, INCIDENTAL, CONSEQUENTIAL, SPECIAL OR EXEMPLARY DAMAGES
                    (INCLUDING, WITHOUT LIMITATION, LOSS OF REVENUE OR GOODWILL OR ANTICIPATED PROFITS OR LOST BUSINESS), EVEN IF WE HAVE BEEN ADVISED
                    OF THE POSSIBILITY OF SUCH DAMAGES. FURTHER, NOTWITHSTANDING ANYTHING TO THE CONTRARY CONTAINED IN THIS AGREEMENT, IN NO EVENT SHALL
                    MOONSHOTS CUMULATIVE LIABILITY TO YOU ARISING OUT OF OR RELATED TO THIS AGREEMENT, WHETHER BASED IN CONTRACT, NEGLIGENCE, STRICT LIABILITY,
                    TORT OR OTHER LEGAL OR EQUITABLE THEORY, EXCEED THE TOTAL COMMISSION FEES PAID TO YOU UNDER THIS AGREEMENT.

                    <br/><br/><b>13. Indemnification</b>

                    <br/><br/>You hereby agree to indemnify and hold harmless Moonshot, and its subsidiaries and affiliates, and their directors, officers,
                    employees, agents, shareholders, partners, members, and other owners, against any and all claims, actions, demands, liabilities, losses,
                    damages, judgments, settlements, costs, and expenses (including reasonable attorneys{"'"} fees) (any or all of the foregoing hereinafter
                    referred to as {'"'}Losses{'"'}) insofar as such Losses (or actions in respect thereof) arise out of or are based on (i) any claim that
                    our use of the affiliate trademarks infringes on any trademark, trade name, service mark, copyright, license, intellectual property, or
                    other proprietary right of any third party, (ii) any misrepresentation of a representation or warranty or breach of a covenant and agreement
                    made by you herein, or (iii) any claim related to your site, including, without limitation, content therein not attributable to us.

                    <br/><br/><b>14. Confidentiality</b>

                    <br/><br/>All confidential information, including, but not limited to, any business, technical, financial, and customer information,
                    disclosed by one party to the other during negotiation or the effective term of this Agreement which is marked {'"'}Confidential,{'"'} will
                    remain the sole property of the disclosing party, and each party will keep in confidence and not use or disclose such proprietary information
                    of the other party without express written permission of the disclosing party.

                    <br/><br/><b>15. Miscellaneous</b>

                    <br/><br/>15.1. You agree that you are an independent contractor, and nothing in this Agreement will create any partnership, joint venture,
                    agency, franchise, sales representative, or employment relationship between you and Moonshot. You will have no authority to make or accept any
                    offers or representations on our behalf. You will not make any statement, whether on Your Site or any other of Your Site or otherwise, that
                    reasonably would contradict anything in this Section.
                    <br/><br/>15.2. Neither party may assign its rights or obligations under this Agreement to any party, except to a party who obtains all or
                    substantially all of the business or assets of a third party.
                    <br/><br/>15.3. This Agreement shall be governed by and interpreted in accordance with the laws of the State of Wisconsin without regard to
                    the conflicts of laws and principles thereof.
                    <br/><br/>15.4. You may not amend or waive any provision of this Agreement unless in writing and signed by both parties.
                    <br/><br/>15.5. This Agreement represents the entire agreement between us and you, and shall supersede all prior agreements and communications
                    of the parties, oral or written.
                    <br/><br/>15.6. The headings and titles contained in this Agreement are included for convenience only, and shall not limit or otherwise affect
                    the terms of this Agreement.
                    <br/><br/>15.7. If any provision of this Agreement is held to be invalid or unenforceable, that provision shall be eliminated or limited to the
                    minimum extent necessary such that the intent of the parties is effectuated, and the remainder of this agreement shall have full force and effect.
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
