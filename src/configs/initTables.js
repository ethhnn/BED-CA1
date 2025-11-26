const pool = require("../services/db");

//Drop tables with foreign keys first
//Do not drop tables with primary keys because the other tables might reference them
//Create tables in order of dependencies meaning those with table referencing them first
//Insert data into tables follow the create table order
const SQLSTATEMENT = `
DROP TABLE IF EXISTS UserCompletion;

DROP TABLE IF EXISTS WellnessChallenge;

DROP TABLE IF EXISTS User;

CREATE TABLE User (
  user_id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(255) NOT NULL,
  points INT DEFAULT 0
);

INSERT INTO User (username, points) VALUES
('Annie How', 10),
('Buay Tah Han', 20),
('Carrie Ong', 30),
('Da Bu Liao', 20),
('Ee Zee Lee', 10);

CREATE TABLE WellnessChallenge (
  challenge_id INT AUTO_INCREMENT PRIMARY KEY,
  creator_id INT NOT NULL,
  description TEXT NOT NULL,
  points INT NOT NULL,
);

INSERT INTO WellnessChallenge (creator_id, description, points) VALUES
(1, 'Sleep like a boss – Get 7+ hours of sleep', 10),
(1, 'Stairs over elevator? Respect. – Take the stairs today', 20),
(2, 'Digital detox (mini edition) – No phone for 1 hour', 10),
(2, 'Touch grass IRL – Take a 15-minute walk outside', 10),
(2, 'IRL > DMs – Talk to a friend face-to-face', 20),
(3, 'Declutter your chaos – Clean your desk or room', 20),
(3, 'Help a homie – Assist someone without being asked', 20);

CREATE TABLE UserCompletion (
  completion_id INT AUTO_INCREMENT PRIMARY KEY,
  challenge_id INT NOT NULL,
  user_id INT NOT NULL,
  details TEXT,
);

INSERT INTO UserCompletion (challenge_id, user_id, details) VALUES
(1, 1, 'Slept for 8 hours last night!'),
(2, 2, 'Took the stairs to the 5th floor.'),
(3, 3, 'Stayed off my phone for an hour while studying.'),
(4, 4, 'Went for a walk in the part.'),
(5, 1, 'Had lunch with a friend instead of texting.'),
(6, 2, 'Cleaned my desk and organized my files.'),
(7, 3, 'Helped a colleague with their project.');
`;

pool.query(SQLSTATEMENT, (error, results, fields) => {
  if (error) {
    console.error("Error creating tables:", error);
  } else {
    console.log("Tables created successfully:", results);
  }
  process.exit();
});