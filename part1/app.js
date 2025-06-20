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

let db;

// * Connect to mysql te
(async () => {
    try {
        db = await mysql.createConnection({
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
        await db.execute(`
            CREATE TABLE IF NOT EXISTS WalkApplications (
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
        // ? These querries can be found Q6-8.sql
        // ------------------------------------------
        let rows = [];

        // * Insert records into Users table if table is empty
        [rows] = await db.execute(`SELECT COUNT(*) AS count FROM Users`);
        if(rows[0].count === 0){
            await db.execute(`
                INSERT INTO Users ( username, email, password_hash, role ) VALUES
                    ( 'alice123', 'alice@example.com', 'hashed123', 'owner' ),
                    ( 'bobwalker', 'bob@example.com', 'hashed456', 'walker' ),
                    ( 'carol123', 'carol@example.com', 'hashed789', 'owner '),
                    ( 'kinglouisXIV', 'theking@example.com', 'hashed1214', 'owner' ),
                    ( 'zewalkerz', 'zewalkerz@example.com', 'hashed1519', 'walker'),
                    ( 'walker', 'walker2@example.com', 'hashed2021', 'walker');
            `);
        }

        // * Insert records into Dogs table if table is empty
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

        // * Insert records into WalkRequests table if table is empty
        [rows] = await db.execute(`SELECT COUNT(*) AS count FROM WalkRequests`);
        if(rows[0].count === 0){
            await db.execute(`
                INSERT INTO WalkRequests ( dog_id, requested_time, duration_minutes, location, status ) VALUES
                    ( (SELECT dog_id FROM Dogs WHERE Dogs.name = 'Fluke' LIMIT 1), '2025-06-02 08:00:00', 45, 'Fort Funston', 'cancelled' ),
                    ( (SELECT dog_id FROM Dogs WHERE Dogs.name = 'Max' LIMIT 1), '2025-06-10 08:00:00', 30, 'Parklands', 'completed' ),
                    ( (SELECT dog_id FROM Dogs WHERE Dogs.name = 'Bella' LIMIT 1), '2025-06-10 09:30:00', 45, 'Beachside Ave', 'completed' ),
                    ( (SELECT dog_id FROM Dogs WHERE Dogs.name = 'Belfort' LIMIT 1), '2025-06-15 08:30:00', 60, 'Versailles', 'completed' ),
                    ( (SELECT dog_id FROM Dogs WHERE Dogs.name = 'Lupin' LIMIT 1), '2025-06-15 09:00:00', 30, 'Versailles', 'completed' ),
                    ( (SELECT dog_id FROM Dogs WHERE Dogs.name = 'Fluke' LIMIT 1), '2025-06-18 09:00:00', 45, 'Fort Funston', 'completed' ),
                    -- * So this one have no rating - id = 7
                    ( (SELECT dog_id FROM Dogs WHERE Dogs.name = 'Bella' LIMIT 1), '2025-06-19 10:00:00', 30, 'Beachside Ave', 'completed' ),
                    -- * These are just open
                    ( (SELECT dog_id FROM Dogs WHERE Dogs.name = 'Max' LIMIT 1), '2025-06-24 16:00:00', 30, 'Parklands', 'open' ),
                    ( (SELECT dog_id FROM Dogs WHERE Dogs.name = 'Fluke' LIMIT 1), '2025-06-23 17:00:00', 45, 'Fort Funston', 'open' );
            `);
        }

        // * This is necessary for getting completed walks
        [rows] = await db.execute(`SELECT COUNT(*) AS count FROM WalkApplications`);
        if(rows[0].count === 0){
            await db.execute(`
                INSERT INTO WalkApplications ( request_id, walker_id, status ) VALUES
                    ( 1, (SELECT user_id FROM Users WHERE username = 'bobwalker'), 'rejected'),
                    ( 2, (SELECT user_id FROM Users WHERE username = 'bobwalker'), 'accepted'),
                    ( 3, (SELECT user_id FROM Users WHERE username = 'bobwalker'), 'accepted'),
                    ( 4, (SELECT user_id FROM Users WHERE username = 'zewalkerz'), 'accepted'),
                    ( 5, (SELECT user_id FROM Users WHERE username = 'bobwalker'), 'accepted'),
                    ( 6, (SELECT user_id FROM Users WHERE username = 'zewalkerz'), 'accepted'),
                    ( 7, (SELECT user_id FROM Users WHERE username = 'zewalkerz'), 'accepted'),
                    ( 8, (SELECT user_id FROM Users WHERE username = 'bobwalker'), 'pending'),
                    ( 9, (SELECT user_id FROM Users WHERE username = 'zewalkerz'), 'pending');
            `);
        }

        // * Insert records into WalkRatings table if table is empty
        // * Will Hard Code Request ID + Owner ID from WalkRequests that has been completed
        [rows] = await db.execute(`SELECT COUNT(*) AS count FROM WalkRatings`);
        if(rows[0].count === 0){
            await db.execute(`
                INSERT INTO WalkRatings (request_id, walker_id, owner_id, rating, comments ) VALUES
                    ( 2, (SELECT user_id FROM Users WHERE username = 'bobwalker'), 1 , 5 , 'some comments'),
                    ( 3, (SELECT user_id FROM Users WHERE username = 'bobwalker'), 3 , 4 , 'some comments'),
                    ( 4, (SELECT user_id FROM Users WHERE username = 'zewalkerz'), 4 , 3 , ''),
                    ( 5, (SELECT user_id FROM Users WHERE username = 'bobwalker'), 4 , 5 , ''),
                    ( 6, (SELECT user_id FROM Users WHERE username = 'zewalkerz'), 1 , 5 , '');
            `);
        }

    }catch(error){
        process.stdout.write(`A problem occurred when setting up DB for testing!\n\nCheck that DogWalkService Database Exists!\n\n`);
        console.error(error);
    }
})();

// * Routes
// * Testing querries can be found Q6-8.sql

// ? Maybe we should select a list of walker user names
// ? Then have two querries selecting completed walks and ratings that is mapped based on username
// ? We can then process it by looping through the usernames
app.get('/api/walkers/summary', async(req,res) => {
    try {
        let rows;
        [rows] = await db.execute(`
           SELECT JSON_ARRAYAGG(username) AS usernames
           FROM Users
           WHERE role = 'walker';
        `);
        const usernames = rows[0].usernames;
        [rows] = await db.execute(`
            SELECT JSON_OBJECTAGG(SQ.username, SQ.completed_walks) AS completed_walks
            FROM
                (SELECT U.username AS username, COUNT(walker_id) AS completed_walks
                FROM WalkApplications WA
                INNER JOIN WalkRequests WR ON WA.request_id = WR.request_id
                INNER JOIN Users U on WA.walker_id = U.user_id
                WHERE WA.status = 'accepted' AND WR.status = 'completed'
                GROUP BY U.username) AS SQ;
        `);
        const completed_walks = rows[0].completed_walks;

        [rows] = await db.execute(`
            SELECT JSON_OBJECTAGG(SQ.username, JSON_OBJECT('total_ratings', SQ.total_ratings, 'average_rating', SQ.average_rating)) AS ratings
                FROM
                    (SELECT U.username, COUNT(walker_id) AS total_ratings, ROUND(AVG(rating),1) AS average_rating
                    FROM WalkRatings WR
                    INNER JOIN Users U ON WR.walker_id = U.user_id
                    GROUP BY U.username) AS SQ;
        `);
        const ratings = rows[0].ratings;

        const resObj = {};
        for(let i=0; i<usernames.length; i++){
            let username = usernames[i];
            if completed_walks
        }

    }catch(error){
        res.status(500).send('A problem occurred!');
        throw (error);
    }

});

app.use('/', indexRouter);
app.use('/users', usersRouter);

module.exports = app;
