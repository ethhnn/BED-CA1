const pool = require("../services/db");

const SQLSTATEMENT = `
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS UserInventory;
DROP TABLE IF EXISTS ShopItem;
DROP TABLE IF EXISTS UserCreature;
DROP TABLE IF EXISTS Creature;
DROP TABLE IF EXISTS UserCompletion;
DROP TABLE IF EXISTS WellnessChallenge;
DROP TABLE IF EXISTS User;

SET FOREIGN_KEY_CHECKS = 1;

-- =================
-- BASELINE TABLES
-- =================

CREATE TABLE User (
  user_id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(255) NOT NULL,
  points INT DEFAULT 0,
  last_leaderboard_claim DATE,
  UNIQUE (username)
);

CREATE TABLE WellnessChallenge (
  challenge_id INT AUTO_INCREMENT PRIMARY KEY,
  creator_id INT NOT NULL,
  description TEXT NOT NULL,
  points INT NOT NULL
);

CREATE TABLE UserCompletion (
  completion_id INT AUTO_INCREMENT PRIMARY KEY,
  challenge_id INT NOT NULL,
  user_id INT NOT NULL,
  details TEXT,
  completed_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ===================
-- GAMIFICATION TABLES
-- ===================

CREATE TABLE Creature (
  creature_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  benefit_type VARCHAR(50) NOT NULL,
  stage2_value INT,
  stage3_value INT
);

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

CREATE TABLE ShopItem (
  item_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  cost_points INT NOT NULL,
  satisfaction_gain INT NOT NULL
);

CREATE TABLE UserInventory (
  inventory_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  item_id INT NOT NULL,
  quantity INT DEFAULT 0,
  UNIQUE (user_id, item_id)
);

-- =================
-- SEED USERS
-- =================
-- IDs:
-- 1 TopOne (top3, can claim)
-- 2 TopTwo (top3, already claimed today -> 409)
-- 3 TopThree (top3, can claim)
-- 4 MidUser (not top3 -> 403 claim)
-- 5 PoorUser (shop insufficient points -> 409)
-- 6 StarterUser (NO creature -> /creature/start success)
-- 7 NoCreatureShopUser (NO creature -> shop 404 active creature)
-- 8 MaxStageUser (stage 3 active -> evolve 409)
-- 9 ResetTrapUser (yesterday satisfaction 100 -> resets to 0 before evolve)
-- 10 NewStarterBlockedUser (not all stage3 -> /creature/new 409)
-- 11 NewStarterAllowedUser (all stage3 -> /creature/new can succeed)
INSERT INTO User (username, points, last_leaderboard_claim) VALUES
('TopOne', 300, NULL),
('TopTwo', 250, CURDATE()),
('TopThree', 200, NULL),
('MidUser', 150, NULL),
('PoorUser', 0, NULL),
('StarterUser', 10, NULL),
('NoCreatureShopUser', 100, NULL),
('MaxStageUser', 120, NULL),
('ResetTrapUser', 120, NULL),
('NewStarterBlockedUser', 120, NULL),
('NewStarterAllowedUser', 120, NULL);

-- =================
-- SEED CHALLENGES
-- =================
-- challenge_id 1..5 have attempts
-- challenge_id 6 has NO attempts -> GET /challenges/6 should 404 (checkAttempts)
INSERT INTO WellnessChallenge (creator_id, description, points) VALUES
(1, 'Sleep like a boss - Get 7+ hours of sleep', 10),
(1, 'Stairs over elevator? Respect. - Take the stairs today', 20),
(2, 'Digital detox (mini edition) - No phone for 1 hour', 10),
(2, 'Touch grass IRL - Take a 15-minute walk outside', 10),
(3, 'Declutter your chaos - Clean your desk or room', 20),
(3, 'No Attempts Challenge', 15);

-- =========================
-- SEED COMPLETIONS (CONTROL)
-- =========================
-- For milestone testing: MidUser (user_id 4) has 4 completions already.
-- If MidUser uses Terranox stage2 with N=5, next completion triggers milestone bonus.
INSERT INTO UserCompletion (challenge_id, user_id, details, completed_at) VALUES
(1, 4, 'seed', '2025-01-01 08:00:00'),
(2, 4, 'seed', '2025-01-01 09:00:00'),
(3, 4, 'seed', '2025-01-01 10:00:00'),
(4, 4, 'seed', '2025-01-01 11:00:00'),

(1, 1, 'seed', '2025-01-02 08:00:00'),
(2, 2, 'seed', '2025-01-02 09:00:00'),
(3, 3, 'seed', '2025-01-02 10:00:00');

-- =================
-- SEED CREATURES
-- =================
-- Keep EXACTLY your 5 creatures + your benefit_type strings
-- Make Zephyra stage2 crit chance 100 for deterministic testing
INSERT INTO Creature (name, description, benefit_type, stage2_value, stage3_value) VALUES
('Sproutling', 'Flat bonus points on every challenge completed', 'CHALLENGE_BONUS', 5, 10),
('Aquafin', 'Discount on every shop purchase (reduce cost)', 'SHOP_DISCOUNT', 2, 4),
('Flameling', 'Multiplier on challenge points (percentage boost)', 'CHALLENGE_MULTIPLIER', 20, 50),
('Zephyra', 'Chance to get extra bonus points when completing a challenge (luck)', 'CHALLENGE_CRIT_CHANCE', 100, 100),
('Terranox', 'Extra bonus points every N completed challenges (milestone)', 'CHALLENGE_MILESTONE', 5, 3);

-- ==========================
-- SEED USERCREATURE (TESTING)
-- ==========================
-- TopOne: Aquafin stage2 active -> shop discount test
-- TopTwo: Sproutling stage2 active -> completion CHALLENGE_BONUS test + claim 409
-- TopThree: Flameling stage2 active -> completion MULTIPLIER test
-- MidUser: Terranox stage2 active -> milestone triggers on next completion (already has 4 completions)
-- PoorUser: Zephyra stage2 active -> crit always triggers but shop will 409 insufficient points
-- MaxStageUser: stage3 active -> evolve 409
-- ResetTrapUser: stage1 active yesterday with satisfaction 100 -> daily reset makes evolve 409
-- NewStarterBlockedUser: owns 2 creatures, one stage2 -> /creature/new 409
-- NewStarterAllowedUser: owns 2 creatures, both stage3 -> /creature/new can succeed, and also test "already owns this creature" 409
INSERT INTO UserCreature
(user_id, creature_id, stage, daily_satisfaction, evo_challenge_count, last_reset_date, is_active)
VALUES
(1, 2, 2, 0, 0, CURDATE(), 1),

(2, 1, 2, 0, 0, CURDATE(), 1),

(3, 3, 2, 0, 0, CURDATE(), 1),

(4, 5, 2, 100, 9, CURDATE(), 1),

(5, 4, 2, 0, 0, CURDATE(), 1),

(8, 1, 3, 100, 50, CURDATE(), 1),

(9, 1, 1, 100, 10, DATE_SUB(CURDATE(), INTERVAL 1 DAY), 1),

(10, 2, 2, 0, 0, CURDATE(), 1),
(10, 3, 1, 0, 0, CURDATE(), 0),

(11, 4, 3, 0, 0, CURDATE(), 1),
(11, 5, 3, 0, 0, CURDATE(), 0);

-- =================
-- SEED SHOP ITEMS
-- =================
-- IMPORTANT: claim maps #1->item 3, #2->item 2, #3->item 1
INSERT INTO ShopItem (name, description, cost_points, satisfaction_gain) VALUES
('Snack', 'Small food item', 5, 10),
('Toy', 'Fun toy', 10, 25),
('Deluxe Meal', 'High quality food', 20, 50);

-- =====================
-- SEED USER INVENTORIES
-- =====================
-- For /creature/useitem:
-- TopOne has Snack qty 1 (use success, then next use -> 409 if qty request > have)
-- TopThree has Toy qty 0 (exists row, but quantity 0 -> 409 on use)
-- PoorUser has nothing for item_id 1 -> 404 item not in inventory
-- NewStarterAllowedUser has Snack qty 2 (multi-quantity use test)
INSERT INTO UserInventory (user_id, item_id, quantity) VALUES
(1, 1, 1),
(3, 2, 0),
(11, 1, 2);
`;

pool.query(SQLSTATEMENT, (error, results, fields) => {
  if (error) {
    console.error("Error creating tables:", error);
  } else {
    console.log("Tables created successfully:", results);
  }
  process.exit();
});