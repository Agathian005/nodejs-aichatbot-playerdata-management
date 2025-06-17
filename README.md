# nodejs-mongooseDB-soccerplayer-api

# Player Management
  Create: Add players with details like name, position, jerseyNo, role (player/coach/manager).
  Read: Fetch players (all, by ID, or filtered by position/role).
  Update: Modify player data (e.g., change position or jersey number).
  Delete: Remove players from the database.

# Authentication & Authorization
  JWT-based login for secure access.
  Role-based permissions:
  Coaches/Managers: Can add/delete players.
  Players: Read-only access to their own profiles.

# API Endpoints

  #   Method	Endpoint	Description	               Access
    POST	/api/players	Add a new player	      Coach/Manager
    GET	/api/players	Get all players(filterable)	Public
    GET	/api/players/:id	Get a player by ID	    Public
    PATCH	/api/players/:id	Update player details Coach/Manager
    DELETE	/api/players/:id	Delete a player	    Manager only
# Auth
  # Method	Endpoint	Description
    POST	/api/auth/login	Login (returns JWT token)

 # Mongoose: MongoDB + Structure
  Mongoose is an ODM (Object Data Modeling) library for MongoDB in Node.js. It adds:
  Schemas: Enforce structure on documents (e.g., name: String).
   Validation: Ensure data integrity (e.g., jerseyNo is unique).
   Middleware: Execute logic before/after operations (e.g., hash passwords pre-save).

