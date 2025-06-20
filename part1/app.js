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
        // * Insert records into Users table if table if empty
        const [rows] = await db.execute(`SELECT COUNT(*) AS count FROM Users`);
        if(rows[0].count === 0){
            await db.execute(`
                INSERT INTO Users ( username, email, password_hash, role ) VALUES
                    ( 'alice123', 'alice@example.com', 'hashed123', 'owner' ),
                    ( 'bobwalker', 'bob@example.com', 'hashed456', 'walker' ),
                    ( 'carol123', 'carol@example.com', 'hashed789', 'owner '),
                    ( 'kinglouisXIV', 'theking@example.com', 'hashed1214', 'owner' ),
                    ( 'zewalkerz', 'zewalkerz@example.com', 'hashed1519', 'walker');
            `);

        await db.execute(`
            CREATE TABLE Dogs (
    dog_id INT AUTO_INCREMENT PRIMARY KEY,
    owner_id INT NOT NULL,
    name VARCHAR(50) NOT NULL,
    size ENUM('small', 'medium', 'large') NOT NULL,
    FOREIGN KEY (owner_id) REFERENCES Users(user_id)
);
        `)

        }
    }catch(error){
        process.stdout.write(`A problem occurred when setting up DB for testing!\n\nCheck that DogWalkService Database Exists!\n\n`);
        console.error(error);
    }
})();

app.use('/', indexRouter);
app.use('/users', usersRouter);

module.exports = app;
