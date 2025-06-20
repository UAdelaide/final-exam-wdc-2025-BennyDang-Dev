var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var mysql = require('mysql2/promise');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


// * Connect to mysql te
(async () => {
    try {
        const db = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: '',
            database: 'DogWalkService'
        });

        // ------------------------------------------
        // ! Creating Tables if not exists
        // ------------------------------------------

        // * Create Users table if not exists
        await db.execute(`
            CREATE TABLE IF NOT EXISTS Users (
                user_id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(50) UNIQUE NOT NULL,
                email VARCHAR(100) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                role ENUM('owner', 'walker') NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);

        `);

        // * Create Dogs table if not exists
        await db.execute(`
            CREATE TABLE IF NOT EXISTS Dogs (
                dog_id INT AUTO_INCREMENT PRIMARY KEY,
                owner_id INT NOT NULL,
                name VARCHAR(50) NOT NULL,
                size ENUM('small', 'medium', 'large') NOT NULL,
                FOREIGN KEY (owner_id) REFERENCES Users(user_id));
        `);

        // * Create WalkRequests table if not exists
        await db.execute(`
            CREATE TABLE IF NOT EXISTS WalkRequests (
                request_id INT AUTO_INCREMENT PRIMARY KEY,
                dog_id INT NOT NULL,
                requested_time DATETIME NOT NULL,
                duration_minutes INT NOT NULL,
                location VARCHAR(255) NOT NULL,
                status ENUM('open', 'accepted', 'completed', 'cancelled') DEFAULT 'open',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (dog_id) REFERENCES Dogs(dog_id)
            );
        `);

        // * Create WalkRatings table if not exists
        await db.execute(`
            CREATE TABLE IF NOT EXISTS WalkRatings (
                rating_id INT AUTO_INCREMENT PRIMARY KEY,
                request_id INT NOT NULL,
                walker_id INT NOT NULL,
                owner_id INT NOT NULL,
                rating INT CHECK (rating BETWEEN 1 AND 5),
                comments TEXT,
                rated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (request_id) REFERENCES WalkRequests(request_id),
                FOREIGN KEY (walker_id) REFERENCES Users(user_id),
                FOREIGN KEY (owner_id) REFERENCES Users(user_id),
                CONSTRAINT unique_rating_per_walk UNIQUE (request_id)
            );
        `);

        // * Create WalkApplication table if not exists
        // ? Mostly for formality since none of of our routes make uses
        // ? of the WalkApplications Tables
        await db.execute(`
            CREATE TABLE WalkApplications (
                application_id INT AUTO_INCREMENT PRIMARY KEY,
                request_id INT NOT NULL,
                walker_id INT NOT NULL,
                applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                status ENUM('pending', 'accepted', 'rejected') DEFAULT 'pending',
                FOREIGN KEY (request_id) REFERENCES WalkRequests(request_id),
                FOREIGN KEY (walker_id) REFERENCES Users(user_id),
                CONSTRAINT unique_application UNIQUE (request_id, walker_id)
            );
        `);

        // ------------------------------------------
        // ! Inserting Records
        // ------------------------------------------
        let rows = [];

        // * Insert records into Users table if table if empty
        [rows] = await db.execute(`SELECT COUNT(*) AS count FROM Users`);
        if(rows[0].count === 0){
            await db.execute(`
                INSERT INTO Users ( username, email, password_hash, role ) VALUES
                    ( 'alice123', 'alice@example.com', 'hashed123', 'owner' ),
                    ( 'bobwalker', 'bob@example.com', 'hashed456', 'walker' ),
                    ( 'carol123', 'carol@example.com', 'hashed789', 'owner '),
                    ( 'kinglouisXIV', 'theking@example.com', 'hashed1214', 'owner' ),
                    ( 'zewalkerz', 'zewalkerz@example.com', 'hashed1519', 'walker');
            `);
        }

        [rows] = await db.execute(`SELECT COUNT(*) AS count FROM Dogs`);
        if(rows[0].count === 0){
            await db.execute(`
                INSERT INTO Dogs ( owner_id, name, size ) VALUES
                    ( (SELECT user_id FROM Users WHERE Users.username = 'alice123' LIMIT 1), 'Max', 'medium' ),
                    ( (SELECT user_id FROM Users WHERE Users.username = 'carol123' LIMIT 1), 'Bella', 'small' ),
                    ( (SELECT user_id FROM Users WHERE Users.username = 'kinglouisXIV' LIMIT 1), 'Belfort', 'large' ),
                    ( (SELECT user_id FROM Users WHERE Users.username = 'kinglouisXIV' LIMIT 1), 'Lupin', 'large' ),
                    ( (SELECT user_id FROM Users WHERE Users.username = 'alice123' LIMIT 1), 'Fluke', 'large' );
            `);
        }


    }catch(error){
        process.stdout.write(`A problem occurred when setting up DB for testing!\n\nCheck that DogWalkService Database Exists!\n\n`);
        console.error(error);
    }
})();

app.use('/', indexRouter);
app.use('/users', usersRouter);

module.exports = app;
