// set the environment to know it is in testing mode
process.env.NODE_ENV = 'test';

const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const expect = chai.expect;
const assert = chai.assert;
chai.should();
chai.use(sinonChai);

const { mockReq, mockRes } = require('sinon-express-mock');
const mongoose = require('mongoose');
const Mockgoose = require('mockgoose').Mockgoose;
const mockgoose = new Mockgoose(mongoose);

// connect to the fake db
before(function(done) {
	mockgoose.prepareStorage().then(function() {
		mongoose.connect('mongodb://example.com/TestingDB', function(err) {
			done(err);
		});
	});
});

const {
	POST_createReferralCode,
    POST_unsubscribeEmail,
    POST_resumeScorer_uploadResume
} = require('../apis/miscApis');

// describe('POST_createReferralCode()', function() {
//     it('should create a referral code', function() {
// 		// ARRANGE
// 		const request = {
// 			body: {
// 				name: "Jangus",
// 				email: "jangus@krangus.com"
// 			}
// 	    }
// 		const req = mockReq(request);
// 		const res = mockRes();
//
// 		// ACT
//         POST_createReferralCode(req, res)
// 		.then(result => {
// 			console.log(result);
// 		});
//
// 		// ASSERT
// 		//assert(res.json.calledOnce);
// 		// res.json.should.have.been.calledWith("jangus");
// 		//console.log(res.json.getCall(0).args[0]);
// 		//expect(res.json.getCall(0).args[0]).to.be.equal("string");
//     });
// });
