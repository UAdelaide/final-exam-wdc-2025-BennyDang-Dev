Use DogWalkService;

INSERT INTO Users ( username, email, password_hash, role ) VALUES
    ( 'alice123', 'alice@example.com', 'hashed123', 'owner' ),
    ( 'bobwalker', 'bob@example.com', 'hashed456', 'walker' ),
    ( 'carol123', 'carol@example.com', 'hashed789', 'owner '),
    ( 'kinglouisXIV', 'theking@example.com', 'hashed1214', 'owner' ),
    ( 'zewalkerz', 'zewalkerz@example.com', 'hashed1519', 'walker'),
    ( 'walker', 'walker2@example.com', 'hashed2021', 'walker');

INSERT INTO Dogs ( owner_id, name, size ) VALUES
    ( (SELECT user_id FROM Users WHERE Users.username = 'alice123' LIMIT 1), 'Max', 'medium' ),
    ( (SELECT user_id FROM Users WHERE Users.username = 'carol123' LIMIT 1), 'Bella', 'small' ),
    ( (SELECT user_id FROM Users WHERE Users.username = 'kinglouisXIV' LIMIT 1), 'Belfort', 'large' ),
    ( (SELECT user_id FROM Users WHERE Users.username = 'kinglouisXIV' LIMIT 1), 'Lupin', 'large' ),
    ( (SELECT user_id FROM Users WHERE Users.username = 'alice123' LIMIT 1), 'Fluke', 'large' );

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

INSERT INTO WalkApplications ( request_id, walker_id, status ) VALUES
    ( 1, (SELECT user_id FROM Users WHERE username = 'bobwalker'), 'rejected'),
    ( 2, (SELECT user_id FROM Users WHERE username = 'bobwalker'), 'accepted'),
    ( 3, (SELECT user_id FROM Users WHERE username = 'bobwalker'), 'accepted'),
    ( 4, (SELECT user_id FROM Users WHERE username = 'zewalkerz'), 'accepted'),
    ( 5, (SELECT user_id FROM Users WHERE username = 'bobwalker'), 'accepted'),
    ( 6, (SELECT user_id FROM Users WHERE username = 'zewalkerz'), 'accepted'),
    ( 7, (SELECT user_id FROM Users WHERE username = 'zewalkerz'), 'accepted');

INSERT INTO WalkRatings (request_id, walker_id, owner_id, rating, comments ) VALUES
    ( 2, (SELECT user_id FROM Users WHERE username = 'bobwalker'), 1 , 5 , 'some comments'),
    ( 3, (SELECT user_id FROM Users WHERE username = 'bobwalker'), 3 , 4 , 'some comments'),
    ( 4, (SELECT user_id FROM Users WHERE username = 'zewalkerz'), 4 , 3 , ''),
    ( 5, (SELECT user_id FROM Users WHERE username = 'bobwalker'), 4 , 5 , ''),
    ( 6, (SELECT user_id FROM Users WHERE username = 'zewalkerz'), 1 , 5 , '');

-- * Some Test Querries

SELECT name AS dog_name, size, U.username AS owner_username
FROM Dogs D
INNER JOIN Users U ON D.owner_id = U.user_id;

SELECT request_id, D.name AS dog_name, requested_time, duration_minutes, location, U.username AS owner_username
FROM WalkRequests WR
INNER JOIN Dogs D ON WR.dog_id = D.dog_id
INNER JOIN Users U ON D.owner_id = U.user_id
WHERE WR.status = 'open';

-- * Select walkers with walk ratings;
SELECT U.username AS walker_username, COUNT(WRT.rating_id) AS total_ratings, ROUND(AVG(WRT.rating),1) AS average_rating
FROM WalkRatings WRT
INNER JOIN Users U ON WRT.walker_id = U.user_id
INNER JOIN WalkRequests WR ON WRT.request_id = WR.request_id
GROUP BY WRT.walker_id;

SELECT U.username, COUNT(walker_id) AS completed_walks
FROM WalkApplications WA
INNER JOIN WalkRequests WR ON WA.request_id = WR.request_id
INNER JOIN Users U on WA.walker_id = U.user_id
WHERE WA.status = 'accepted' AND WR.status = 'completed'
GROUP BY U.username;

SELECT U.username, COUNT(walker_id) AS total_ratings, ROUND(AVG(rating),1) AS average_rating
FROM WalkRatings WR
INNER JOIN Users U ON WR.walker_id = U.user_id
GROUP BY U.username;

-- * Maybe we should select a list of walker user names
-- * Then have two querries selecting completed walks and ratings that is mapped based on username -> object
-- * We can then process it by looping through the usernames

SELECT JSON_OBJECTAGG(SQ.username, SQ.completed_walks) AS completed_walks
FROM
    (SELECT U.username AS username, COUNT(walker_id) AS completed_walks
    FROM WalkApplications WA
    INNER JOIN WalkRequests WR ON WA.request_id = WR.request_id
    INNER JOIN Users U on WA.walker_id = U.user_id
    WHERE WA.status = 'accepted' AND WR.status = 'completed'
    GROUP BY U.username) AS SQ;


SELECT JSON_OBJECTAGG(SQ.username, JSON_OBJECT('total_ratings', SQ.total_ratings, 'average_rating', SQ.average_rating)) AS ratings
FROM
    (SELECT U.username, COUNT(walker_id) AS total_ratings, ROUND(AVG(rating),1) AS average_rating
    FROM WalkRatings WR
    INNER JOIN Users U ON WR.walker_id = U.user_id
    GROUP BY U.username) AS SQ;

SELECT JSON_ARRAYAGG(username) AS usernames
FROM Usersp
WHERE role = 'walker';

-- * For Q17
SELECT JSON_OBJECTAGG(U.username,U.)
FROM Users U
WHERE U.username IN ('alice123','bobwalker')