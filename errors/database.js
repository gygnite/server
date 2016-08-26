'use strict';

function generalDatabaseError(res) {
    return res.status(500).json({
        message: 'Error saving to database, please try again.'
    });
}

module.exports = {
    generalDatabaseError: generalDatabaseError
};
