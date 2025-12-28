# Pet Guardians – Gamified Wellness REST API

## Description

This is a robust backend application built for the **ST0503 Backend Web Development CA1** assignment. It is a gamified wellness platform where users complete real-life challenges to earn points and care for digital creatures.

The system uses a **Pet Evolution mechanic** and **Leaderboard** to encourage healthy habits. By evolving pets, users unlock unique gameplay benefits like point multipliers and shop discounts.

## Key Features

* **User Management:** Registration, point tracking, and profile updates.
* **Wellness Challenges:** Full CRUD functionality with history tracking for completed activities.
* **Pet Guardians System:** Starter selection, active pet management, and multi-stage evolution (Stages 1-3).
* **Shop & Inventory:** Purchase items to feed pets, increasing their satisfaction to unlock evolution.
* **Dynamic Benefits:** Pets provide bonuses such as flat bonuses, multipliers, or critical hit chances.
* **Leaderboard:** Ranking system with a daily reward claim for the top 3 players.

## Project Setup

### Prerequisites

* Node.js (v18+)
* MySQL Server

### Installation Steps

1. **Clone & Install:**
```bash
git clone [YOUR_REPO_URL]
cd bed-ca1-EthanChuwaSiXuan
npm install

```


2. **Database Configuration:**
Create a `.env` file in the root directory with your MySQL credentials:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_DATABASE=bed_ca1_wellness

```


3. **Initialize Database:**
```bash
npm run init_tables

```


4. **Start Server:**
```bash
npm start

```
**Development Mode (Hot Reload):**
```bash
npm run dev
```
---

## API Endpoints (Postman Guide)

### 1. User & Leaderboard (`/users`)

| Feature | Method | URL | Request Body | Notes |
| --- | --- | --- | --- | --- |
| **Register** | POST | `/users` | `{"username": "string"}` | Create a new user. |
| **Get All** | GET | `/users` | None | List all users and details. |
| **Get User** | GET | `/users/:user_id` | None | Get details for a specific user. |
| **Update User** | PUT | `/users/:user_id` | `{"username": "string", "points": number}` | Update user details. |
| **Leaderboard** | GET | `/users/leaderboard/top10` | None | Top 10 players. |
| **Claim Reward** | PUT | `/users/claim` | `{"user_id": number}` | Top 3 users claim daily items. |
| **Inventory** | GET | `/users/:user_id/inventory` | None | View items owned by the user. |
| **View History** | GET | `/users/:user_id/completions` | None | List of user's past completions. |

### 2. Wellness Challenges (`/challenges`)

| Feature | Method | URL | Request Body | Notes |
| --- | --- | --- | --- | --- |
| **Create** | POST | `/challenges` | `{"user_id": number, "description": "string", "points": number}` | Create a new wellness challenge. |
| **Get All** | GET | `/challenges` | None | Get all available challenges. |
| **Get Attempts** | GET | `/challenges/:challenge_id` | None | Get user attempts for a challenge. |
| **Update** | PUT | `/challenges/:challenge_id` | `{"user_id": number, "description": "string", "points": number}` | Update challenge (Creator only). |
| **Delete** | DELETE | `/challenges/:challenge_id` | None | Delete challenge and completions. |
| **Complete** | POST | `/challenges/:challenge_id` | `{"user_id": number, "details": "string"}` | Complete challenge and trigger benefits. |

### 3. Pet Guardians (`/creature`)

| Feature | Method | URL | Request Body | Notes |
| --- | --- | --- | --- | --- |
| **Catalog** | GET | `/creature` | None | Get all available creature types. |
| **Active Pet** | GET | `/creature/:user_id` | None | Get current active creature for a user. |
| **Owned Pets** | GET | `/creature/all/:user_id` | None | Get all creatures owned by a user. |
| **Pick Starter** | POST | `/creature/start` | `{"user_id": number, "creature_id": number}` | Choose the first starter creature. |
| **Use Item** | PUT | `/creature/useitem` | `{"user_id": number, "item_id": number, "quantity": number}` | Feed item to increase satisfaction. |
| **Evolve** | PUT | `/creature/evolve` | `{"user_id": number}` | Evolve to next stage (Requirements apply). |
| **New Starter** | POST | `/creature/new` | `{"user_id": number, "creature_id": number}` | Get new starter if all others are stage 3. |
| **Switch Pet** | PUT | `/creature/switch` | `{"user_id": number, "creature_id": number}` | Activate a different owned pet. |

### 4. Shop System (`/shop`)

| Feature | Method | URL | Request Body | Notes |
| --- | --- | --- | --- | --- |
| **Catalog** | GET | `/shop/items` | None | View items and point costs. |
| **Buy Item** | POST | `/shop/buy` | `{"user_id": number, "item_id": number, "quantity": number}` | Purchase item (Applies Aquafin discount). |

---

## Gamification Mechanics

### Evolution Requirements

To evolve a creature to the next stage, a user must meet two conditions:

1. **Satisfaction:** Reach **100 points** via feeding/caring (resets daily).
2. **Experience:** Complete **10 challenges** for Stage 2 or **30 challenges** for Stage 3.

### Creature Perks (Stage 2+)

* **Sproutling:** Flat points bonus (`CHALLENGE_BONUS`).
* **Flameling:** Percentage multiplier boost (`CHALLENGE_MULTIPLIER`).
* **Aquafin:** Shop item cost reduction (`SHOP_DISCOUNT`).
* **Zephyra:** Random "Critical Hit" point bonus (`CHALLENGE_CRIT_CHANCE`).
* **Terranox:** Milestone reward points every N completions (`CHALLENGE_MILESTONE`).

## Architecture Notes

* **Strict MVC Pattern:** Separation between Routes, Controllers, and Models.
* **No Promises:** Asynchronous operations use the Callback pattern exclusively.
* **Middleware-Driven:** Validation and ownership checks handled via Express middleware.

## Author

**Ethan Chuwa Si Xuan** DAAA/FT/1B/04
ST0503 Backend Web Development CA1
GitHub: [https://github.com/ST0503-BED/bed-ca1-EthanChuwaSiXuan]