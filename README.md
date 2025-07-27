# nodejs-mongooseDB-soccerplayer-api

# Player Management (CRUD)
Support for managing football players with full RESTful operations:

Action	Description
Create	Add players with name, position, jersey number, and role (player/coach/manager).
Read	Fetch players (all, by ID, or filtered by position/role).
Update	Modify player details (e.g., change jersey number or role).
Delete	Remove players from the system (requires elevated permissions).

# Authentication & Authorization
JWT-based Authentication: Secure access with Access + Refresh tokens.

Role-Based Access Control (RBAC):

Coach / Manager: Can add, update, or delete player data.

Player: Read-only access to their own profile and permitted data.

Tokens are securely signed and verified using .env secrets.

# AI Chatbot Integration (LangGraph + Vector Search)
An AI assistant has been integrated for intelligent interactions, such as querying player stats, roles, or club-related information using natural language.

LangGraph Agent: Allows contextual conversations with memory via threadId.

MongoDB Vector Search: Embedding-based semantic retrieval (used by the agent).

# Endpoints:

POST /ai/chat → Start a new conversation.

POST /ai/chat/:threadId → Continue a threaded chat session.

# API Endpoints Overview
Method	Endpoint	Description	Access
POST	/api/players	Add a new player	Coach / Manager
GET	/api/players	Get all players (filterable)	Public
GET	/api/players/:id	Get a player by ID	Public
PATCH	/api/players/:id	Update player details	Coach / Manager
DELETE	/api/players/:id	Delete a player	Manager only

# Mongoose (MongoDB ODM)
This project uses Mongoose to interact with MongoDB and enforce data structure.

Schemas: Enforce document shape (e.g., { name: String, role: String }).

Validation: Enforces rules (e.g., jerseyNo must be unique).

Middleware:

Hash passwords before saving (bcrypt).

Auto-generate timestamps or sanitize data.
