const pool = require('../services/db');

module.exports.checkIfUserExists = (data, callback) =>
{ 
    const SQLSTATEMENT = `
    SELECT * FROM user
    WHERE username = ?;
    `;
    const VALUES = [data.username];

    pool.query(SQLSTATEMENT, VALUES, callback);
}
module.exports.createNewUser = (data, callback) =>
{
    const SQLSTATEMENT = `
    INSERT INTO user (username)
    VALUES (?);
    `;
    const VALUES = [data.username];

    pool.query(SQLSTATEMENT, VALUES, callback);
}

module.exports.getAllUser = (callback) =>{
    const SQLSTATEMENT = `
    SELECT * FROM user
    `;
    pool.query(SQLSTATEMENT, callback);
}
module.exports.checkUserExists = (data, callback) =>
{ 
    const SQLSTATEMENT = `
    SELECT * FROM user
    WHERE user_id = ?;
    `;
    const VALUES = [data.user_id];

    pool.query(SQLSTATEMENT, VALUES, callback);
}
module.exports.getUserById = (data,callback) =>{
    const SQLSTATEMENT = `
    SELECT * FROM user
    WHERE user_id = ?
    `;
    const VALUES = [data.user_id]
    pool.query(SQLSTATEMENT,VALUES, callback);
}
module.exports.updateUserById = (data,callback) =>{
    const SQLSTATEMENT = `
    UPDATE user 
    SET username = ?, points =? 
    WHERE user_id = ?;
    `;
    const VALUES = [data.username, data.points, data.user_id];

    pool.query(SQLSTATEMENT, VALUES, callback);
}