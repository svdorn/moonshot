// set the environment to know it is in testing mode
process.env.NODE_ENV = 'test';

const chai = require('chai');
const expect = chai.expect;
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

// const {
//
// } = require('../apis/userApis');
