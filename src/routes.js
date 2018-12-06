"use strict";
import React from "react";
import { render } from "react-dom";

//REACT_ROUTER
import { Router, Route, IndexRoute, browserHistory, Redirect } from "react-router";

import Login from "./components/pages/login";
import Signup from "./components/pages/signup";
import Introduction from "./components/pages/introduction";
import MyCandidates from "./components/pages/businessPages/myCandidates";
import MyEmployees from "./components/pages/businessPages/myEmployees";
import MyEvaluations from "./components/pages/myEvaluations/myEvaluations";
import EmployeeResults from "./components/pages/businessPages/employeeResults";
import Billing from "./components/pages/businessPages/billing";

import BusinessHome from "./components/pages/businessHome/businessHome";
import Influencer from "./components/pages/influencer";
import Main from "./main";
import AuthenticatedComponent from "./components/authenticatedComponent/authenticatedComponent";
import Settings from "./components/pages/settings/settings";
import Ease from "./components/pages/ease";
import Pricing from "./components/pages/pricing";
import ApplyContainer from "./components/pages/applyContainer";
import GeneralApply from "./components/pages/generalApply";
import Apply from "./components/pages/apply";
import VerifyEmail from "./components/pages/verifyEmail";
import ForgotPassword from "./components/pages/forgotpassword";
import ChangePassword from "./components/pages/changepasswordforgot";
import Error404 from "./components/pages/errors/error404";
import Unsubscribe from "./components/pages/unsubscribe";
import Admin from "./components/pages/admin";
import PrivacyPolicy from "./components/policies/privacyPolicy";
import TermsOfUse from "./components/policies/termsOfUse";
import ServiceLevelAgreement from "./components/policies/serviceLevelAgreement";
import AffiliateAgreement from "./components/policies/affiliateAgreement";
import Listing from "./components/pages/listing";

import Dashboard from "./components/pages/dashboard/dashboard";
import Explore from "./components/pages/dashboard/leadDashboard";

// position evaluation - contains all components (psych, gca, admin questions)
import Evaluation from "./components/pages/evaluation/evaluation";
import FinishEvaluation from "./components/pages/finishEvaluation";

import AdminPages from "./components/pages/adminPages/adminPages";
import BusinessEditor from "./components/pages/adminPages/businessEditor";
import BusinessPicker from "./components/pages/adminPages/businessPicker";
import SkillEditor from "./components/pages/adminPages/skillEditor";
import SkillPicker from "./components/pages/adminPages/skillPicker";
import DataDisplay from "./components/pages/adminPages/dataDisplay/dataDisplay";
import PsychDataDisplay from "./components/pages/adminPages/dataDisplay/psych";
import GCADataDisplay from "./components/pages/adminPages/dataDisplay/gca";

import { MuiThemeProvider, createMuiTheme } from "@material-ui/core";
const theme = createMuiTheme({
    palette: {
        primary: {
            main: "#FFFFFF"
        },
        secondary: {
            main: "#76defe"
        }
    }
});

import ReactGA from "react-ga";
ReactGA.initialize("UA-105560654-1");

function fireTracking() {
    ReactGA.pageview(window.location.pathname + window.location.search);
}

const accountAdmin = ["accountAdmin"];

const routes = (
    <MuiThemeProvider theme={theme}>
        <Router onUpdate={fireTracking} history={browserHistory}>
            <Route path="/" component={Main}>
                <IndexRoute component={BusinessHome} />
                <Route path="login" component={Login} />
                <Route path="employerLogin" component={Login} />
                <Route path="signup" component={Signup} />
                <Route path="introduction" component={Introduction} />
                <Route
                    path="myCandidates"
                    component={AuthenticatedComponent}
                    page={<MyCandidates />}
                    userType={accountAdmin}
                />
                <Route
                    path="myEmployees"
                    component={AuthenticatedComponent}
                    page={<MyEmployees />}
                    userType={accountAdmin}
                />
                <Route
                    path="myEvaluations"
                    component={AuthenticatedComponent}
                    page={<MyEvaluations />}
                />
                <Route
                    path="dashboard"
                    component={AuthenticatedComponent}
                    page={<Dashboard />}
                    userType={accountAdmin}
                />
                <Route
                    path="explore"
                    component={AuthenticatedComponent}
                    page={<Explore />}
                    userType={"lead"}
                    show403={false}
                    accountAdminRedirect="/dashboard"
                    candidateRedirect="/myEvaluations"
                    employeeRedirect="/myEvaluations"
                />
                <Route
                    path="employeeResults/:employeeId/:positionId"
                    component={AuthenticatedComponent}
                    page={<EmployeeResults />}
                    userType={accountAdmin}
                />
                <Route
                    path="billing"
                    component={AuthenticatedComponent}
                    page={<Billing />}
                    userType={accountAdmin}
                />
                <Route path="pricing" component={Pricing} />
                <Route path="ease" component={Ease} />
                <Route path="settings" component={AuthenticatedComponent} page={<Settings />} />
                <Route path="listing" component={Listing} />
                <Route path="influencer" component={Influencer} />
                <Route path="verifyEmail" component={VerifyEmail} />
                <Route path="forgotPassword" component={ForgotPassword} />
                <Route path="changePassword" component={ChangePassword} />
                <Route path="unsubscribe" component={Unsubscribe} />
                <Route path="privacyPolicy" component={PrivacyPolicy} standalone={true} />
                <Route path="termsOfUse" component={TermsOfUse} standalone={true} />
                <Route path="affiliateAgreement" component={AffiliateAgreement} standalone={true} />
                <Route
                    path="serviceLevelAgreement"
                    component={ServiceLevelAgreement}
                    standalone={true}
                />

                <Route path="apply" page={<ApplyContainer />}>
                    <IndexRoute component={GeneralApply} />
                    <Route path=":company" component={Apply} />
                </Route>

                <Route
                    path="evaluation/:businessId/:positionId"
                    component={AuthenticatedComponent}
                    page={<Evaluation />}
                />
                <Route
                    path="finishEvaluation"
                    component={AuthenticatedComponent}
                    page={<FinishEvaluation />}
                />

                <Route
                    path="admin"
                    component={AuthenticatedComponent}
                    page={<Admin />}
                    userType={["admin", "candidate"]}
                >
                    <IndexRoute component={AdminPages} />
                    <Route path="businessPicker" component={BusinessPicker} />
                    <Route path="businessEditor/:businessId" component={BusinessEditor} />
                    <Route path="skillPicker" component={SkillPicker} />
                    <Route path="skillEditor/:skillId" component={SkillEditor} />
                    <Route path="dataDisplay" component={DataDisplay}>
                        <IndexRoute component={PsychDataDisplay} />
                        <Route path="psych" component={PsychDataDisplay} />
                        <Route path="gca" component={GCADataDisplay} />
                    </Route>
                </Route>

                <Route path="*" component={Error404} />
            </Route>
        </Router>
    </MuiThemeProvider>
);

export default routes;
