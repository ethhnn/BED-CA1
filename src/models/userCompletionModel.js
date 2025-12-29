const pool = require('../services/db');

// Check if a user exists by user_id
module.exports.checkUserExists = (data,callback) =>{
    const SQLSTATEMENT=`
    SELECT * FROM user WHERE user_id = ?;
    `
    const VALUES = [data.user_id];
    pool.query(SQLSTATEMENT, VALUES, callback);
}

// Check if a challenge exists and retrieve its points
module.exports.checkChallengeExistsAndExtractPoints = (data,callback) =>{
    const SQLSTATEMENT=`
    SELECT points
    FROM wellnesschallenge
    WHERE challenge_id=?;
    `
    const VALUES = [data.challenge_id]
    pool.query(SQLSTATEMENT, VALUES, callback);
}

// Add points to a user after completing a challenge
module.exports.addPoints = (data,callback) =>{
    const SQLSTATEMENT=`
    UPDATE user
    SET points = points + ?
    WHERE user_id = ?;
    `
    const VALUES = [data.points,data.user_id];
    pool.query(SQLSTATEMENT, VALUES, callback);
}

// Create a completion record for a challenge attempt
module.exports.createCompletionRecord = (data,callback) =>{
    const SQLSTATEMENT=`
    INSERT INTO usercompletion (challenge_id,user_id,details)
    VALUES (?,?,?);
    `
    const VALUES = [data.challenge_id,data.user_id,data.details];
    pool.query(SQLSTATEMENT, VALUES, callback);
}

// Check if a challenge has any completion attempts
module.exports.checkAttempts = (data, callback) => {
    const SQLSTATEMENT = `
    SELECT *
    FROM usercompletion
    WHERE challenge_id = ?;
    `;

    const VALUES = [data.challenge_id];

    pool.query(SQLSTATEMENT, VALUES, callback);
};

// Retrieve users and details for a specific challenge
module.exports.getChallengeById = (data, callback) => {
    const SQLSTATEMENT = `
    SELECT user_id, details
    FROM usercompletion
    WHERE challenge_id = ?;
    `;

    const VALUES = [data.challenge_id];

    pool.query(SQLSTATEMENT, VALUES, callback);
};

// Delete all completion records for a challenge
module.exports.deleteCompletionById = (data, callback) => {
    const SQLSTATEMENT = `
    DELETE FROM usercompletion
    WHERE challenge_id = ?;
    `;
    const VALUES = [data.challenge_id];

    pool.query(SQLSTATEMENT, VALUES, callback);
}

// Retrieve all completed challenges by a user
module.exports.getCompletionsByUserId = (data, callback) => {
  const SQLSTATEMENT = `
    SELECT
      uc.completion_id,
      uc.challenge_id,
      wc.description,
      wc.points,
      uc.details,
      uc.completed_at
    FROM usercompletion uc
    INNER JOIN wellnesschallenge wc
      ON uc.challenge_id = wc.challenge_id
    WHERE uc.user_id = ?
    ORDER BY uc.completed_at DESC, uc.completion_id DESC;
  `;
  const VALUES = [data.user_id];

  pool.query(SQLSTATEMENT, VALUES, callback);
};