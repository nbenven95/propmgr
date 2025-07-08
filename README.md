# propmgr

## Backend
- MongoDB
  - Database: `propmgr`
  - Collections: `properties`, `documents`, `users`; (more?)

      use propmgr
      db.dummyCollection.insertOne({foo:"bar"}) # Insert dummy data to save new database

  - **TODO:**
    - Set up MongoDB docker container instead of running as a global service
    - Create models, then set up `properties`, `documents`, `users`, etc. collections
