"use strict"
import React, {Component} from 'react';
import {Paper} from 'material-ui';

class ServiceLevelAgreement extends Component {
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
                    <div className="lightBlackBackground headerDiv" />
                    : null
                }

                <div style={containerStyle} className="whiteText">

                    <b className="font20px font18pxUnder700px">Service Level Agreement</b>

                    <br/><br/> Effective Starting: 6/10/2018

                    <br/><br/> The Moonshot Insights Service Level Agreement (the “Agreement”) is between you and Moonshot Learning, Inc. (“Moonshot Insights” or “We” or “Company”). If you are agreeing to this Agreement on behalf of your company, then “Customer” or “you” or “customer’s company” means your company and you are binding your company to this Agreement. By accessing the Services on behalf of your company, you represent that you are authorized to accept this Agreement on behalf of your company. Moonshot Insights may modify this Agreement from time to time, subject to the terms in section 10.
By clicking on the “I agree” (or similar button) that is presented to you at the time of your Order, or by using or accessing Moonshot Insights products, you indicate your assent to be bound by this Agreement.

                    <br/><br/> <b>A.	Moonshot Insights Services</b>

                    <br/><br/> Moonshot Insights offers software-as-a-service solutions to provide candidate assessments for given positions. Predictions offered by Moonshot Insights should be seen as predictions and not statements of fact.

                    <br/><br/> <b>B. 	Service Fees</b>

                    <br/><br/> Moonshot Insights’ fees are based on “active position evaluations” or a position (e.g. Business Analyst) at a customer’s company that has a Moonshot Insights evaluation to assess candidates for that position and is under subscription term. The first active position evaluation for customers is free. Each additional active position evaluation is subject to the following subscription terms:
                    <br/>(1)     Free subscription for your first active position evaluation.
                    <br/>(2)     $79 for an annual subscription to one active position evaluation.
                    <br/>(3)     $89 for a six-month subscription to one active position evaluation.
                    <br/>(4)     $99 for a three-month subscription to one active position evaluation.
                    <br/>You can have multiple types of subscriptions concurrently and multiple active position evaluations concurrently.

                    <br/><br/> <b>C. 	Service Change Requests</b>

                    <br/><br/> You can request that one of your active position evaluations be changed to another position for any reason (e.g. change your Business Analyst evaluation under a six-month subscription to a Content Marketer evaluation for the remainder of the subscription term for the previous position). To submit a request, you must email support@moonshotinsights.io outlining your current active position under a specific subscription term and your proposed change to a new position under the same subscription. You cannot submit a change request for your free subscription for your first active position evaluation. We can, in our sole discretion, deny any request by a customer to change the position that is being evaluated for that subscription term. If we accept the change request, we have thirty [30] business days from the date of our express written acceptance to change the evaluation to the proposed position. As a note, the content of the evaluation will be active within thirty [30] business days of express written consent of the change; this does not guarantee that the predictions will be active for the new position within that period as ample data is necessary to generate predictions for new positions. Importantly, the subscription term does not stall in the process of service change requests to switch positions for an active evaluation subscription (e.g. an annual subscription maintains the same expiration date as without a service change request). You can always purchase another subscription term to initiate a new position.

                    <br/><br/> <bdi className="font18px">TERMS AND CONDITIONS</bdi>

                    <br/><br/> <b>1.    SAAS SERVICES AND SUPPORT</b>

                    <br/><br/> <b>1.1            Subject to the terms of this Agreement, Moonshot Insights will use commercially reasonable efforts to provide Customer the Services outlined in section A. As part of the registration process, Customer will identify an administrative user name and password for Customer’s Moonshot Insights account.  Moonshot Insights reserves the right to refuse registration of, or cancel passwords it deems inappropriate.</b>

                    <br/><br/><b>1.2            Subject to the terms hereof, Moonshot Insights will provide Customer with reasonable technical support services in accordance with Moonshot Insights’ standard practices.</b>

                    <br/><br/> <b>2.    RESTRICTIONS AND RESPONSIBILITIES</b>

                    <br/><br/> <b>2.1            Customer will not, directly or indirectly: reverse engineer, decompile, disassemble or otherwise attempt to discover the source code, object code or underlying structure, ideas, know-how or algorithms relevant to the Services or any software, documentation or data related to the Services (“Software”); modify, translate, or create derivative works based on the Services or any Software (except to the extent expressly permitted by Moonshot Insights or authorized within the Services); use the Services or any Software for timesharing or service bureau purposes or otherwise for the benefit of a third; or remove any proprietary notices or labels. </b>

                    <br/><br/> <b>2.2            Further, Customer may not remove or export from the United States or allow the export or re-export of the Services, Software or anything related thereto, or any direct product thereof in violation of any restrictions, laws or regulations of the United States Department of Commerce, the United States Department of Treasury Office of Foreign Assets Control, or any other United States or foreign agency or authority.  As defined in FAR section 2.101, the Software and documentation are “commercial items” and according to DFAR section 252.227‑7014(a)(1) and (5) are deemed to be “commercial computer software” and “commercial computer software documentation.”  Consistent with DFAR section 227.7202 and FAR section 12.212, any use modification, reproduction, release, performance, display, or disclosure of such commercial software or commercial software documentation by the U.S. Government will be governed solely by the terms of this Agreement and will be prohibited except to the extent expressly permitted by the terms of this Agreement.</b>

                    <br/><br/> <b>2.3            Customer represents, covenants, and warrants that Customer will use the Services only in compliance with Moonshot Insights’ standard published policies then in effect (the “Policy”) and all applicable laws and regulations.  [Customer hereby agrees to indemnify and hold harmless Moonshot Insights against any damages, losses, liabilities, settlements and expenses (including without limitation costs and attorneys’ fees) in connection with any claim or action that arises from an alleged violation of the foregoing or otherwise from Customer’s use of Services. Although Moonshot Insights has no obligation to monitor Customer’s use of the Services, Moonshot Insights may do so and may prohibit any use of the Services it believes may be (or alleged to be) in violation of the foregoing.</b>

                    <br/><br/> <b>2.4            Customer shall be responsible for obtaining and maintaining any equipment and ancillary services needed to connect to, access or otherwise use the Services, including, without limitation, modems, hardware, servers, software, operating systems, networking, web servers and the like (collectively, “Equipment”).  Customer shall also be responsible for maintaining the security of the Equipment, Customer account, passwords (including but not limited to administrative and user passwords) and files, and for all uses of Customer account or the Equipment with or without Customer’s knowledge or consent.</b>

                    <br/><br/> <b>3.    CONFIDENTIALITY; PROPRIETARY RIGHTS</b>

                    <br/><br/> <b>3.1            Each party (the “Receiving Party”) understands that the other party (the “Disclosing Party”) has disclosed or may disclose business, technical or financial information relating to the Disclosing Party’s business (hereinafter referred to as “Proprietary Information” of the Disclosing Party).  Proprietary Information of Moonshot Insights includes non-public information regarding features, functionality and performance of the Service.  Proprietary Information of Customer includes non-public data provided by Customer to Moonshot Insights to enable the provision of the Services (“Customer Data”). The Receiving Party agrees: (i) to take reasonable precautions to protect such Proprietary Information, and (ii) not to use (except in performance of the Services or as otherwise permitted herein) or divulge to any third person any such Proprietary Information.  The Disclosing Party agrees that the foregoing shall not apply with respect to any information after five (5) years following the disclosure thereof or any information that the Receiving Party can document (a) is or becomes generally available to the public, or (b) was in its possession or known by it prior to receipt from the Disclosing Party, or (c) was rightfully disclosed to it without restriction by a third party, or (d) was independently developed without use of any Proprietary Information of the Disclosing Party or (e) is required to be disclosed by law. </b>

                    <br/><br/> <b>3.2            Moonshot Insights shall own and retain all right, title and interest in and to (a) the Services and Software, all improvements, enhancements or modifications thereto, (b) any software, applications, inventions or other technology developed in connection with Implementation Services or support, and (c) all intellectual property rights related to any of the foregoing.    </b>

                    <br/><br/> <b>3.3            [Notwithstanding anything to the contrary, Moonshot Insights shall have the right collect and analyze data and other information relating to the provision, use and performance of various aspects of the Services and related systems and technologies (including, without limitation, information concerning Customer Data and data derived therefrom), and  Company will be free (during and after the term hereof) to (i) use such information and data to improve and enhance the Services and for other development, diagnostic and corrective purposes in connection with the Services and other Moonshot Insights offerings, and (ii) disclose such data solely in aggregate or other de-identified form in connection with its business. No rights or licenses are granted except as expressly set forth herein.  </b>

                    <br/><br/> <b>4.    PAYMENT OF FEES</b>

                    <br/><br/> <b>4.1            Customer will pay Moonshot Insights the then applicable fees selected for the Services in accordance with the terms therein (the “Fees”).  Moonshot Insights reserves the right to change the Fees or applicable charges and to institute new charges and Fees at the end of the Initial Service Term or then‑current renewal term, upon thirty (30) days prior notice to Customer (which may be sent by email). If Customer believes that Moonshot Insights has billed Customer incorrectly, Customer must contact Moonshot Insights no later than 60 days after the closing date on the first billing statement in which the error or problem appeared, in order to receive an adjustment or credit.  Inquiries should be directed to support@moonshotinsights.io.</b>

                    <br/><br/> <b>4.2            Moonshot Insights may choose to bill through an invoice, in which case, full payment for invoices issued in any given month must be received by Company thirty (30) days after the mailing date of the invoice.  Unpaid amounts are subject to a finance charge of 1.5% per month on any outstanding balance, or the maximum permitted by law, whichever is lower, plus all expenses of collection and may result in immediate termination of Service. Customer shall be responsible for all taxes associated with Services other than U.S. taxes based on Moonshot Insights’ net income. </b>

                    <br/><br/> <b>5.    TERM AND TERMINATION</b>

                    <br/><br/> <b>5.1            Subject to earlier termination as provided below, this Agreement is for the Initial Service Term as selected by the subscription term(s), and shall be automatically renewed for additional periods of the same duration as the Initial Service Term (collectively, the “Term”), unless either party requests termination at least five (5) days prior to the end of the then-current term.</b>

                    <br/><br/> <b>5.2            In addition to any other remedies it may have, either party may also terminate this Agreement upon thirty (30) days’ notice (or without notice in the case of nonpayment), if the other party materially breaches any of the terms or conditions of this Agreement.  Customer will pay in full for the Services up to and including the last day on which the Services are provided. Upon any termination, Moonshot Insights will make all Customer Data available to Customer for electronic retrieval for a period of thirty (30) days, but thereafter Moonshot Insights may, but is not obligated to, delete stored Customer Data. All sections of this Agreement which by their nature should survive termination will survive termination, including, without limitation, accrued rights to payment, confidentiality obligations, warranty disclaimers, and limitations of liability.</b>

                    <br/><br/> <b>6.    WARRANTY AND DISCLAIMER</b>

                    <br/><br/> Moonshot Insights shall use reasonable efforts consistent with prevailing industry standards to maintain the Services in a manner which minimizes errors and interruptions in the Services.  Services may be temporarily unavailable for scheduled maintenance or for unscheduled emergency maintenance, either by Moonshot Insights or by third-party providers, or because of other causes beyond Moonshot Insights’ reasonable control, but Moonshot Insights shall use reasonable efforts to provide advance notice in writing or by e-mail of any scheduled service disruption.  However, MOONSHOT INSIGHTS does not warrant that the Services will be uninterrupted or error free; nor does it make any warranty as to the results that may be obtained from use of the Services.  EXCEPT AS EXPRESSLY SET FORTH IN THIS SECTION, THE SERVICES AND IMPLEMENTATION SERVICES ARE PROVIDED “AS IS” AND MOONSHOT INSIGHTS DISCLAIMS ALL WARRANTIES, EXPRESS OR IMPLIED, INCLUDING, BUT NOT LIMITED TO, IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE AND NON-INFRINGEMENT.

                    <br/><br/> <b>7.    INDEMNITY</b>

                    <br/><br/> Moonshot Insights shall hold Customer harmless from liability to third parties resulting from infringement by the Service of any United States patent or any copyright or misappropriation of any trade secret, provided Moonshot Insights is promptly notified of any and all threats, claims and proceedings related thereto and given reasonable assistance and the opportunity to assume sole control over defense and settlement; Moonshot Insights will not be responsible for any settlement it does not approve in writing.  The foregoing obligations do not apply with respect to portions or components of the Service (i) not supplied by Moonshot Insights, (ii) made in whole or in part in accordance with Customer specifications, (iii) that are modified after delivery by Moonshot Insights, (iv) combined with other products, processes or materials where the alleged infringement relates to such combination, (v) where Customer continues allegedly infringing activity after being notified thereof or after being informed of modifications that would have avoided the alleged infringement, or (vi) where Customer’s use of the Service is not strictly in accordance with this Agreement.  If, due to a claim of infringement, the Services are held by a court of competent jurisdiction to be or are believed by Moonshot Insights to be infringing, Moonshot Insights may, at its option and expense (a) replace or modify the Service to be non-infringing provided that such modification or replacement contains substantially similar features and functionality, (b) obtain for Customer a license to continue using the Service, or (c) if neither of the foregoing is commercially practicable, terminate this Agreement and Customer’s rights hereunder and provide Customer a refund of any prepaid, unused fees for the Service.

                    <br/><br/> <b>8.    LIMITATION OF LIABILITY</b>

                    <br/><br/> NOTWITHSTANDING ANYTHING TO THE CONTRARY, EXCEPT FOR BODILY INJURY OF A PERSON, MOONSHOT INSIGHTS AND ITS SUPPLIERS (INCLUDING BUT NOT LIMITED TO ALL EQUIPMENT AND TECHNOLOGY SUPPLIERS), OFFICERS, AFFILIATES, REPRESENTATIVES, CONTRACTORS AND EMPLOYEES SHALL NOT BE RESPONSIBLE OR LIABLE WITH RESPECT TO ANY SUBJECT MATTER OF THIS AGREEMENT OR TERMS AND CONDITIONS RELATED THERETO UNDER ANY CONTRACT, NEGLIGENCE, STRICT LIABILITY OR OTHER THEORY: (A) FOR ERROR OR INTERRUPTION OF USE OR FOR LOSS OR INACCURACY OR CORRUPTION OF DATA OR COST OF PROCUREMENT OF SUBSTITUTE GOODS, SERVICES OR TECHNOLOGY OR LOSS OF BUSINESS; (B) FOR ANY INDIRECT, EXEMPLARY, INCIDENTAL, SPECIAL OR CONSEQUENTIAL DAMAGES; (C) FOR ANY MATTER BEYOND MOONHSOT INSIGHTS’ REASONABLE CONTROL; OR (D) FOR ANY AMOUNTS THAT, TOGETHER WITH AMOUNTS ASSOCIATED WITH ALL OTHER CLAIMS, EXCEED THE FEES PAID BY CUSTOMER TO COMPANY FOR THE SERVICES UNDER THIS AGREEMENT IN THE 12 MONTHS PRIOR TO THE ACT THAT GAVE RISE TO THE LIABILITY, IN EACH CASE, WHETHER OR NOT COMPANY HAS BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.

                    <br/><br/> <b>9.    MISCELLANEOUS</b>

                    <br/><br/> If any provision of this Agreement is found to be unenforceable or invalid, that provision will be limited or eliminated to the minimum extent necessary so that this Agreement will otherwise remain in full force and effect and enforceable.  This Agreement is not assignable, transferable or sublicensable by Customer except with Moonshot Insights’ prior written consent.  Moonshot Insights may transfer and assign any of its rights and obligations under this Agreement without consent.  This Agreement is the complete and exclusive statement of the mutual understanding of the parties and supersedes and cancels all previous written and oral agreements, communications and other understandings relating to the subject matter of this Agreement, and that all waivers and modifications must be in a writing signed by both parties, except as otherwise provided herein.  No agency, partnership, joint venture, or employment is created as a result of this Agreement and Customer does not have any authority of any kind to bind Moonshot Insights in any respect whatsoever.  In any action or proceeding to enforce rights under this Agreement, the prevailing party will be entitled to recover costs and attorneys’ fees.  All notices under this Agreement will be in writing and will be deemed to have been duly given when received, if personally delivered; when receipt is electronically confirmed, if transmitted by facsimile or e-mail; the day after it is sent, if sent for next day delivery by recognized overnight delivery service; and upon receipt, if sent by certified or registered mail, return receipt requested.  This Agreement shall be governed by the laws of the State of Wisconsin without regard to its conflict of laws provisions.

                    <br/><br/><b>10.    CHANGES TO THIS AGREEMENT</b>

                    <br/><br/>We may update or modify this Agreement from time to time. If a revision meaningfully reduces your rights, we will use reasonable efforts to notify you (by, for example, sending an email to the billing or technical contact you designate in the applicable Order, or in the Product itself). If we modify the Agreement during your License Term or Subscription Term, the modified version will be effective upon your next renewal of a Subscription Term, as applicable. In this case, if you object to the updated Agreement, as your exclusive remedy, you may choose not to renew, including cancelling any terms set to auto-renew. With respect to No-Charge Products, accepting the updated Agreement is required for you to continue using the No-Charge Products. You may be required to click through the updated Agreement to show your acceptance. If you do not agree to the updated Agreement after it becomes effective, you will no longer have a right to use No-Charge Products. For the avoidance of doubt, any Order is subject to the version of the Agreement in effect at the time of the Order.

                </div>

                {standalone ?
                    <div style={{marginBottom: "20px"}} />
                    : null
                }
            </div>
        );
    }
}

export default ServiceLevelAgreement;
