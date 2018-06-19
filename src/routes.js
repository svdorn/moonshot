'use strict'
import React from 'react';
import { render } from 'react-dom';
//import credentials from '../credentials.js';

//REACT_ROUTER
import { Router, Route, IndexRoute, browserHistory, Redirect } from 'react-router';


import Login from './components/pages/login';
import EmployerLogin from "./components/pages/employerLogin";
import Signup from './components/pages/signup';
import MyCandidates from './components/pages/businessPages/myCandidates';
import MyEmployees from './components/pages/businessPages/myEmployees';
import MyEvaluations from './components/pages/businessPages/myEvaluations';
import Results from './components/pages/businessPages/results';
import EmployeeResults from './components/pages/businessPages/employeeResults';
import Billing from './components/pages/businessPages/billing';
import BusinessHome from './components/pages/businessHome';
import Main from './main';
import AuthenticatedComponent from './components/authenticatedComponent/authenticatedComponent';
import Settings from './components/pages/settings';
import VerifyEmail from './components/pages/verifyEmail';
import ForgotPassword from './components/pages/forgotpassword';
import ChangePassword from './components/pages/changepasswordforgot';
import ContactUs from './components/pages/contactUs';
import Error404 from './components/pages/error404';
import Unsubscribe from './components/pages/unsubscribe';
import Admin from './components/pages/admin';
import PrivacyPolicy from './components/policies/privacyPolicy';
import TermsOfUse from './components/policies/termsOfUse';
import ServiceLevelAgreement from './components/policies/serviceLevelAgreement';
import AffiliateAgreement from './components/policies/affiliateAgreement';

import PsychAnalysis from './components/pages/psychAnalysis/psychAnalysis';

import SkillTest from './components/pages/skillTest/skillTest';
import AdminQuestions from './components/pages/adminQuestions/adminQuestions';
import PositionSignup from './components/pages/positionSignup';
import FreeResponse from "./components/pages/freeResponse";
import EvaluationIntro from "./components/pages/evaluationIntro";

import AdminPages from './components/pages/adminPages/adminPages'
import ViewUser from './components/pages/adminPages/viewUser';
import UserResponses from './components/pages/adminPages/userResponses';
import CreateBusinessAccount from './components/pages/adminPages/createBusinessAccount';
import EditBusiness from './components/pages/adminPages/editBusiness';

import ReactGA from 'react-ga';
ReactGA.initialize('UA-105560654-1');

function fireTracking() {
    ReactGA.pageview(window.location.pathname + window.location.search);
}

const businessAdminUserTypes = ["accountAdmin"];
const adminUserTypes = ["admin", "candidate"];

const routes = (
    <Router onUpdate={fireTracking} history={browserHistory}>
        <Route path="/" component={Main}>
            <IndexRoute component={BusinessHome} />
            <Route path='login' component={Login} />
            <Route path="signup" component={Signup} />
            <Route path='employerLogin' component={EmployerLogin} />
            <Route path="myCandidates" component={AuthenticatedComponent} page={<MyCandidates/>} userType={businessAdminUserTypes} />
            <Route path="myEmployees" component={AuthenticatedComponent} page={<MyEmployees/>} userType={businessAdminUserTypes} />
            <Route path="myEvaluations" component={AuthenticatedComponent} page={<MyEvaluations/>} />
            <Route path="results/:profileUrl/:positionId" component={AuthenticatedComponent} page={<Results />} userType={businessAdminUserTypes} />
            <Route path="employeeResults" component={AuthenticatedComponent} page={<EmployeeResults />} userType={businessAdminUserTypes} />
            <Route path="billing" component={AuthenticatedComponent} page={<Billing />} userType={businessAdminUserTypes} />
            <Route path="settings" component={AuthenticatedComponent} page={<Settings/>}/>
            <Route path="verifyEmail" component={VerifyEmail} />
            <Route path="forgotPassword" component={ForgotPassword} />
            <Route path="changePassword" component={ChangePassword} />
            <Route path="contactUs" component={ContactUs} />
            <Route path="unsubscribe" component={Unsubscribe} />
            <Route path="privacyPolicy" component={PrivacyPolicy} standalone={true} />
            <Route path="termsOfUse" component={TermsOfUse} standalone={true} />
            <Route path="affiliateAgreement" component={AffiliateAgreement} standalone={true} />
            <Route path="serviceLevelAgreement" component={ServiceLevelAgreement} standalone={true} />

            <Route path="psychometricAnalysis" component={AuthenticatedComponent} page={<PsychAnalysis/>} />

            <Route path="skillTest/:skillUrl" component={AuthenticatedComponent} page={<SkillTest/>} />
            <Route path="adminQuestions" component={AuthenticatedComponent} page={<AdminQuestions/>} />
            <Route path="positionSignup" component={PositionSignup} />
            <Route path="freeResponse" component={AuthenticatedComponent} page={<FreeResponse/>} />
            <Route path="evaluationIntro" component={AuthenticatedComponent} page={<EvaluationIntro/>} />

            <Route path="admin" component={AuthenticatedComponent} page={<Admin/>} userType={adminUserTypes}>
                <IndexRoute component={AdminPages} />
                <Route path="createBusinessAccount" component={CreateBusinessAccount} />
                <Route path="editBusiness" component={EditBusiness} />
                <Route path="userResponses" component={UserResponses} />
                <Route path="viewUser" component={ViewUser} />
            </Route>

            <Route path='*' component={Error404} />
        </Route>
    </Router>
);

export default routes;
