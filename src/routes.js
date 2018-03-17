'use strict'
import React from 'react';
import { render } from 'react-dom';
import credentials from '../credentials.js';

//REACT_ROUTER
import { Router, Route, IndexRoute, browserHistory, Redirect } from 'react-router';


import Login from './components/pages/login';
import Signup from './components/pages/signup';
import Main from './main';
import AuthenticatedComponent from './components/AuthenticatedComponent';
import Home from './components/pages/home';
import ForBusiness from './components/pages/forBusiness';
import Profile from './components/pages/profile';
import Settings from './components/pages/settings';
import VerifyEmail from './components/pages/verifyEmail';
import ForgotPassword from './components/pages/forgotpassword';
import ChangePassword from './components/pages/changepasswordforgot';
import Discover from './components/pages/discover';
import Pathway from './components/pages/pathway';
import PathwayContent from './components/pages/pathwayContent';
import ContactUs from './components/pages/contactUs';
import MyPathways from './components/pages/myPathways';
import Onboarding from './components/pages/onboarding';
import Error404 from './components/pages/error404';
import Email from './components/pages/email';
import Unsubscribe from './components/pages/unsubscribe';
import ReferralCode from './components/pages/referralCode';
import Admin from './components/pages/admin';
import AdminUserView from './components/pages/adminUserView';
import PrivacyPolicy from './components/policies/privacyPolicy';
import TermsOfUse from './components/policies/termsOfUse';
import AffiliateAgreement from './components/policies/affiliateAgreement';
import ReactGA from 'react-ga';
ReactGA.initialize(credentials.googleAnalyticsTrackingNumber);

function fireTracking() {
    ReactGA.pageview(window.location.pathname + window.location.search);
}

const routes = (
  <Router onUpdate={fireTracking} history={browserHistory}>
    <Route path="/" component={Main}>
        <IndexRoute component={Home} />
        <Route path='login' component={Login} />
        <Route path="signup" component={Signup} />
        <Route path='forBusiness' component={ForBusiness} />
        <Route path="profile" component={Profile} />
        <Route path="settings" component={AuthenticatedComponent} page={<Settings/>}/>
        <Route path="verifyEmail" component={VerifyEmail} />
        <Route path="forgotPassword" component={ForgotPassword}/>
        <Route path="changePassword" component={ChangePassword} />
        <Route path="discover" component={Discover} />
        <Route path="contactUs" component={ContactUs} />
        <Route path="myPathways" component={AuthenticatedComponent} page={<MyPathways/>} />
        <Route path="onboarding" component={AuthenticatedComponent} page={<Onboarding/>}/>
        <Route path="pathway" component={Pathway} />
        <Route path="pathwayContent" component={AuthenticatedComponent} page={<PathwayContent/>} />
        <Route path="email" component={Email}/>
        <Route path="admin" component={AuthenticatedComponent} page={<Admin/>} />
        <Route path="adminUserView" component={AuthenticatedComponent} page={<AdminUserView/>} />
        <Route path="unsubscribe" component={Unsubscribe} />
        <Route path="referral" component={ReferralCode} />
        <Route path="privacyPolicy" component={PrivacyPolicy} standalone={true} />
        <Route path="termsOfUse" component={TermsOfUse} standalone={true} />
        <Route path="affiliateAgreement" component={AffiliateAgreement} standalone={true} />
        <Route path='*' component={Error404} />
    </Route>
  </Router>
);

export default routes;
