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

