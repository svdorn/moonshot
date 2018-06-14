// set the environment to know it is in testing mode
process.env.NODE_ENV = 'test';

const expect = require('chai').expect;
const {
    sanitize,
    removeEmptyFields,
    verifyUser,
    removePassword,
    printUsersFromPathway,
    getUserByQuery,
    sendEmail,
    safeUser,
    userForAdmin,
    getFirstName,
    removeDuplicates
} = require('../apis/helperFunctions');

describe('getFirstName()', function() {
    it('should get the first name from a full name string', function() {
        // ARRANGE
        const fullName = "Austin McJangus Meyer";

        // ACT
        const firstName = getFirstName(fullName);

        // ASSERT
        expect(firstName).to.be.equal("Austin");
    });
});
