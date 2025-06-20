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
    ( (SELECT dog_id FROM Dogs WHERE Dogs.name = 'Fluke' LIMIT 1), '2025-06-02 08:00:00', 45, 'Fort Funston', 'open' ),
    ( (SELECT dog_id FROM Dogs WHERE Dogs.name = 'Max' LIMIT 1), '2025-06-10 08:00:00', 30, 'Parklands', 'completed' ),
    ( (SELECT dog_id FROM Dogs WHERE Dogs.name = 'Bella' LIMIT 1), '2025-06-10 09:30:00', 45, 'Beachside Ave', 'completed' ),
    ( (SELECT dog_id FROM Dogs WHERE Dogs.name = 'Belfort' LIMIT 1), '2025-06-15 08:30:00', 60, 'Versailles', 'completed' ),
    ( (SELECT dog_id FROM Dogs WHERE Dogs.name = 'Lupin' LIMIT 1), '2025-06-15 09:00:00', 30, 'Versailles', 'completed' ),
    ( (SELECT dog_id FROM Dogs WHERE Dogs.name = 'Fluke' LIMIT 1), '2025-06-18 09:00:00', 45, 'Fort Funston', 'completed' ),
    ( (SELECT dog_id FROM Dogs WHERE Dogs.name = 'Max' LIMIT 1), '2025-06-19 16:00:00', 30, 'Parklands', 'open' )

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
INNER JOIN Users U ON D.owner_id = U.user_id;

SELECT COUNT(U.user_id) FROM
