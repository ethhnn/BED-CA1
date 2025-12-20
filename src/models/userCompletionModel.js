const pool = require('../services/db');

module.exports.checkUserExists = (data,callback) =>{
    const SQLSTATEMENT=`
    SELECT * FROM user WHERE user_id = ?;
    `
    const VALUES = [data.user_id];
    pool.query(SQLSTATEMENT, VALUES, callback);
}
module.exports.checkChallengeExistsAndExtractPoints = (data,callback) =>{
    const SQLSTATEMENT=`
    SELECT points
    FROM wellnesschallenge
    WHERE challenge_id=?;
    `
    const VALUES = [data.challenge_id]
    pool.query(SQLSTATEMENT, VALUES, callback);
}
module.exports.addPoints = (data,callback) =>{
    const SQLSTATEMENT=`
    UPDATE user
    SET points = points + ?
    WHERE user_id = ?;
    `
    const VALUES = [data.points,data.user_id];
    pool.query(SQLSTATEMENT, VALUES, callback);
}
module.exports.createCompletionRecord = (data,callback) =>{
    const SQLSTATEMENT=`
    INSERT INTO usercompletion (challenge_id,user_id,details)
    VALUES (?,?,?);
    `
    const VALUES = [data.challenge_id,data.user_id,data.details];
    pool.query(SQLSTATEMENT, VALUES, callback);
}
module.exports.checkAttempts = (data, callback) => {
    const SQLSTATEMENT = `
    SELECT *
    FROM usercompletion
    WHERE challenge_id = ?;
    `;

    const VALUES = [data.challenge_id];

    pool.query(SQLSTATEMENT, VALUES, callback);
};
module.exports.getChallengeById = (data, callback) => {
    const SQLSTATEMENT = `
    SELECT user_id, details
    FROM usercompletion
    WHERE challenge_id = ?;
    `;

    const VALUES = [data.challenge_id];

    pool.query(SQLSTATEMENT, VALUES, callback);
};
module.exports.deleteCompletionById = (data, callback) => {
    const SQLSTATEMENT = `
    DELETE FROM usercompletion
    WHERE challenge_id = ?;
    `;
    const VALUES = [data.challenge_id];

    pool.query(SQLSTATEMENT, VALUES, callback);
}