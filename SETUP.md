TODO: Update this file with final package.json setup

# 1 Environment setup

## 1.1 NVM (Node Version Manager)

    sudo apt update
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
    exec bash # Reload ~/.bashrc
**Note:** if you have a global `nodejs` installation, uninstall it first: `sudo apt remove nodejs`

### 1.1.1 Install some JavaScript versions

    nvm ls-remote           # Check available versions
    nvm install <version>   # If this is the first version you've installed, it will be set as the default
    nvm ls                  # View locally installed JS versions
    nvm use <version>       # Not needed if <version> is the first version you've installed
    node -v                 # Should output <version>

### 1.1.2 Define which version of JS to use for our project

    cd project
    touch .nvmrc
    echo 'X.Y.Z' >> .nvmrc
Run `nvm use` from the project dir to switch to the desired version.

### 1.1.3 *(Optional)* Add snippet to ~/.bashrc to automate
`~/.bashrc`

    _nvmrc_hook() {
        # Return if we haven't changed dirs
        [[ $PWD == $PREV_PWD ]] && return || PREV_PWD=$PWD
        # If current dir contains .nvmrc, run `nvm use`
        [[ -f ".nvmrc" ]] && nvm use
    }

    # PROMPT_COMMAND forces _nvmrc_hook to run every time a new prompt
    # displays (i.e., it runs every time you change dirs)
    if ! [[ "${PROMPT_COMMAND:-}" =~ _nvmrc_hook ]]; then
        PROMPT_COMMAND="_nvmrc_hook${PROMPT_COMMAND:+;$PROMPT_COMMAND}"
    fi

## 1.2 MongoDB setup (WSL)
Reference
  - https://gist.github.com/leobeeson/8ac8c8ddbb0a704af26e4bd153658bde
  - https://wiki.archlinux.org/title/MongoDB#Usage

### 1.2.1 Update package repositories
  
    sudo apt update

### 1.2.2 Import public key for MongoDB package management system

    wget -qO - https://pgp.mongodb.com/server-6.0.asc | sudo apt-key add -

### 1.2.3 Create list file for MongoDB

    echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list

### 1.2.4 Reload package database
  
    sudo apt update

### 1.2.5 Install MongoDB

    sudo apt install -y mongodb-org

### 1.2.6 Verify installation
  
    mongod --version

### 1.2.7 Start mongod and create a service for it
  
    sudo systemctl start mongod
    sudo systemctl enable mongod

### 1.2.8 Verify the mongod service
  
    sudo service mongod status

### 1.2.9 From the mongo shell, access the admin user database
  
    mongosh # Start the mongo shell
    use admin

### 1.2.10 Create a new admin user
    db.createUser({
      user: "myUserAdmin",
      pwd: "secret",
      roles: [{role: "userAdminAnyDatabase", db: "admin"}, "readWriteAnyDatabase"]
    })
    exit # Exit the mongo shell

### 1.2.11 Update config to require authentication
        
`sudo nano /etc/mongod.conf`
    
    security:
      authorization: enabled

  Ensure that you indent the second line with **two spaces** and **not a tab**

### 1.2.12 Restart the mongod service

    sudo service mongod restart
    sudo service mongod status # Should indicate 'running'
  
### 1.2.13 Verify authentication

    mongosh -u myUserAdmin
    # Should now be prompted to enter your password

### 1.2.14 Create a new database

    use myDatabase
    db.myCollection.insertOne({key:"value"}) # Insert dummy data

  *You must insert dummy data or the new database will not be saved*

# 2 Backend

### 2.1 Choose location for project, create project root dir

    cd repos        # e.g. project parent folder
    mkdir project

### 2.2 Create folders
  
    cd project
    mkdir -p frontend backend/config backend/models backend/controllers backend/util backend/routes

### 2.3 Init project root as node project

    npm init -y
This should add `package.json`

### 2.4 Install dependencies

    npm i express mongoose dotenv dotenv-expand esm-module-alias
    npm i nodemon -D
- `-D` to install as a development dependency
- This should add `node_modules` and `package-lock.json`

### 2.5 Update "scripts" in package.json

    // Before
    "scripts": {
        "test": "echo \"Error: no test specified\" && exit 1"
    }

    // After
    "scripts": {
        "dev": "NODE_ENV=development nodemon backend/server.js",
        "build": "npm install && npm install --prefix frontend && npm run build --prefix frontend",
        "start": "NODE_ENV=production node backend/server.js",
        "test": "echo \"Error: no test specified\" && exit 1"
    }
Allows us to use keywords `dev`, `build`, `start`, and `test` as arguments for `npm run [CMD]`.

# 3 Frontend

# 4 Bugs
**Server immediately exits on start**
      
    netstat -tulanp # Check for processes using our port
    pkill -f processName # Kill process(es) using our port
