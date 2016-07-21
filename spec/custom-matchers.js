"use strict";

module.exports = {
    toBeInstanceOf : function (util, customEqualityTesters) {
        return {
            compare: function(actual, expected) {

                if (expected === undefined) {
                    expected = '';
                }

                let result = {};
                result.pass = actual instanceof expected;

                if (!result.pass) {
                    result.message = "Expected object to be an instanceof "+expected;
                }
                else { // for .not.toBeInstanceOf
                    result.message = "Expected object to not be an instanceof "+expected;
                }

                return result;
            }
        };
    }
};
