const pool = require("../services/db");

//Drop tables with foreign keys first
//Do not drop tables with primary keys because the other tables might reference them
//Create tables in order of dependencies meaning those with table referencing them first
//Insert data into tables follow the create table order
const SQLSTATEMENT = `
DROP TABLE IF EXISTS LeaderboardRewardLog;

DROP TABLE IF EXISTS UserInventory;

DROP TABLE IF EXISTS ShopItem;

DROP TABLE IF EXISTS UserCreature;

DROP TABLE IF EXISTS Creature;

DROP TABLE IF EXISTS UserCompletion;

DROP TABLE IF EXISTS WellnessChallenge;

DROP TABLE IF EXISTS User;

-- ===============
-- BASELINE TABLES
-- ===============

CREATE TABLE User (
  user_id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(255) NOT NULL,
  points INT DEFAULT 0,
  last_leaderboard_claim DATE
);

INSERT INTO User (username, points, last_leaderboard_claim) VALUES
('Annie How', 10, NULL),
('Buay Tah Han', 20, NULL),
('Carrie Ong', 30, NULL),
('Da Bu Liao', 20, NULL),
('Ee Zee Lee', 10, NULL),
('Ha Lo Wold', 40, NULL);

CREATE TABLE WellnessChallenge (
  challenge_id INT AUTO_INCREMENT PRIMARY KEY,
  creator_id INT NOT NULL,
  description TEXT NOT NULL,
  points INT NOT NULL
);

INSERT INTO WellnessChallenge (creator_id, description, points) VALUES
(1, 'Sleep like a boss - Get 7+ hours of sleep', 10),
(1, 'Stairs over elevator? Respect. - Take the stairs today', 20),
(2, 'Digital detox (mini edition) - No phone for 1 hour', 10),
(2, 'Touch grass IRL - Take a 15-minute walk outside', 10),
(2, 'IRL > DMs - Talk to a friend face-to-face', 20),
(3, 'Declutter your chaos - Clean your desk or room', 20),
(3, 'Help a homie - Assist someone without being asked', 20);

CREATE TABLE UserCompletion (
  completion_id INT AUTO_INCREMENT PRIMARY KEY,
  challenge_id INT NOT NULL,
  user_id INT NOT NULL,
  details TEXT,
  completed_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO UserCompletion (challenge_id, user_id, details, completed_at) VALUES
(1, 1, 'Slept for 8 hours last night!', '2025-01-01 08:00:00'),
(2, 2, 'Took the stairs to the 5th floor.', '2025-01-01 09:00:00'),
(3, 3, 'Stayed off my phone for an hour while studying.', '2025-01-01 10:00:00'),
(4, 4, 'Went for a walk in the park.', '2025-01-01 11:00:00'),
(5, 1, 'Had lunch with a friend instead of texting.', '2025-01-01 12:00:00'),
(6, 2, 'Cleaned my desk and organized my files.', '2025-01-01 13:00:00'),
(7, 3, 'Helped a colleague with their project.', '2025-01-01 14:00:00');

-- ===================
-- GAMIFICATION TABLES
-- ===================

-- Creature (species / type)
CREATE TABLE Creature (
  creature_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  benefit_type VARCHAR(50) NOT NULL,
  stage2_value INT,
  stage3_value INT
);
INSERT INTO Creature (name, description, benefit_type, stage2_value, stage3_value) VALUES
('Sproutling', 'Flat bonus points on every challenge completed', 'CHALLENGE_BONUS', 5, 10),
('Aquafin', 'Discount on every shop purchase (reduce cost)', 'SHOP_DISCOUNT', 2, 4),
('Flameling', 'Multiplier on challenge points (percentage boost)', 'CHALLENGE_MULTIPLIER', 20, 50),
('Zephyra', 'Chance to get extra bonus points when completing a challenge (luck)', 'CHALLENGE_CRIT_CHANCE', 20, 40),
('Terranox', 'Extra bonus points every N completed challenges (milestone)', 'CHALLENGE_MILESTONE', 5, 3);

-- UserCreature (progress + active creature)
CREATE TABLE UserCreature (
  user_creature_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  creature_id INT NOT NULL,
  stage INT DEFAULT 1,
  daily_satisfaction INT DEFAULT 0,
  evo_challenge_count INT DEFAULT 0,
  last_reset_date DATE,
  is_active TINYINT DEFAULT 1,
  UNIQUE (user_id, creature_id)
);
INSERT INTO UserCreature
(user_id, creature_id, stage, daily_satisfaction, evo_challenge_count, last_reset_date, is_active)
VALUES

-- User 1: Sproutling (Stage 2 ACTIVE)
(1, 1, 2, 0, 12, CURDATE(), 1),

-- User 2: Aquafin (Stage 3 ACTIVE)
(2, 2, 3, 0, 35, CURDATE(), 1),

-- User 3: Flameling (Stage 2 ACTIVE)
(3, 3, 2, 0, 18, CURDATE(), 1),

-- User 4: Zephyra (Stage 1 ACTIVE)
(4, 4, 1, 0, 2, CURDATE(), 1),

-- User 5: Terranox (Stage 3 ACTIVE)
(5, 5, 3, 0, 50, CURDATE(), 1),

-- ========= INACTIVE CREATURES (for switching tests) =========

-- User 1 extra
(1, 2, 1, 0, 0, CURDATE(), 0),

-- User 2 extra
(2, 1, 3, 0, 0, CURDATE(), 0),

-- User 3 extra
(3, 4, 1, 0, 0, CURDATE(), 0),

-- User 4 extra
(4, 5, 2, 0, 10, CURDATE(), 0);

-- ShopItem
CREATE TABLE ShopItem (
  item_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  cost_points INT NOT NULL,
  satisfaction_gain INT NOT NULL
);
INSERT INTO ShopItem (name, description, cost_points, satisfaction_gain) VALUES
('Snack', 'Small food item', 5, 10),
('Toy', 'Fun toy', 10, 25),
('Deluxe Meal', 'High quality food', 20, 50);

-- UserInventory
CREATE TABLE UserInventory (
  inventory_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  item_id INT NOT NULL,
  quantity INT DEFAULT 0
);
INSERT INTO UserInventory (user_id, item_id, quantity) VALUES
(1, 1, 3),  -- Annie: 3 Snacks
(1, 2, 1),  -- Annie: 1 Toy

(2, 2, 2),  -- Buay Tah Han: 2 Toys
(2, 3, 1),  -- Buay Tah Han: 1 Deluxe Meal

(3, 1, 5),  -- Carrie: 5 Snacks

(4, 3, 2),  -- Da Bu Liao: 2 Deluxe Meals

(5, 1, 2),  -- Ee Zee Lee: 2 Snacks
(5, 2, 2);  -- Ee Zee Lee: 2 Toys
`;

pool.query(SQLSTATEMENT, (error, results, fields) => {
  if (error) {
    console.error("Error creating tables:", error);
  } else {
    console.log("Tables created successfully:", results);
  }
  process.exit();
});