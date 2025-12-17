const pool = require('../services/db');

module.exports.createNewChallenge = (data, callback) =>
{
    const SQLSTATEMENT = `
    INSERT INTO wellnesschallenge (description,creator_id,points)
    VALUES (?,?,?);
    `;
    const VALUES = [data.description,data.user_id,data.points];

    pool.query(SQLSTATEMENT, VALUES, callback);
}
module.exports.getAllChallenges = (callback) =>{
    const SQLSTATEMENT = `
    SELECT * FROM wellnesschallenge
    `;
    pool.query(SQLSTATEMENT, callback);
}
module.exports.deleteChallengeById = (data, callback) =>
{
    const SQLSTATEMENT = `
    DELETE FROM wellnesschallenge
    WHERE challenge_id = ?;
    `;
    const VALUES = [data.challenge_id];

    pool.query(SQLSTATEMENT, VALUES, callback);
}
module.exports.checkOwner = (data, callback) =>{
    const SQLSTATEMENT = `
    SELECT creator_id
    FROM wellnesschallenge
    WHERE challenge_id =?;
    `
    const VALUES = [data.challenge_id]
    pool.query(SQLSTATEMENT, VALUES, callback);
}
module.exports.updateChallengeById = (data, callback) =>{
    const SQLSTATEMENT = `
    UPDATE wellnesschallenge 
    SET  description =? ,points=?
    WHERE challenge_id = ?;
    `;
    const VALUES = [ data.description, data.points,data.challenge_id];

    pool.query(SQLSTATEMENT, VALUES, callback);
}

