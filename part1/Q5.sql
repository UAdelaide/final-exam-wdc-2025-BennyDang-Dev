-- * Five users
INSERT INTO Users ( username, email, password_hash, role ) VALUES
    ( 'alice123', 'alice@example.com', 'hashed123', 'owner' ),
    ( 'bobwalker', 'bob@example.com', 'hashed456', 'walker' ),
    ( 'carol123', 'carol@example.com', 'hashed789', 'owner '),
    ( 'kinglouisXIV', 'theking@example.com', 'hashed1214', 'owner' ),
    ( 'zewalkerz', 'zewalkerz@example.com', 'hashed1519', 'walker');

-- * Five Doggos
INSERT INTO Dogs ( owner_id, name, size ) VALUES
    ( (SELECT user_id FROM Users WHERE Users.username = 'alice123' LIMIT 1), 'Max', 'medium' ),
    ( (SELECT user_id FROM Users WHERE Users.username = 'carol123' LIMIT 1), 'Bella', 'small' ),
    ( (SELECT user_id FROM Users WHERE Users.username = 'kinglouisXIV' LIMIT 1), 'Belfort', 'large' ),
    ( (SELECT user_id FROM Users WHERE Users.username = 'kinglouisXIV' LIMIT 1), 'Lupin', 'large' ),
    ( (SELECT user_id FROM Users WHERE Users.username = 'alice123' LIMIT 1), 'Fluke', 'large' );

-- * Five Walkies
INSERT INTO WalkRequests ( dog_id, requested_time, duration_minutes, location, status ) VALUES
    ( (SELECT dog_id FROM Dogs WHERE Dogs.name = 'Max' LIMIT 1), '2025-06-10 08:00:00', 30, 'Parklands', 'open' ),
    ( (SELECT dog_id FROM Dogs WHERE Dogs.name = 'Bella' LIMIT 1), '2025-06-10 09:30:00', 45, 'Beachside Ave', 'accepted' ),
    ( (SELECT dog_id FROM Dogs WHERE Dogs.name = 'Belfort' LIMIT 1), '2025-06-15 08:30:00', 60, 'Versailles', 'open' ),
    ( (SELECT dog_id FROM Dogs WHERE Dogs.name = 'Lupin' LIMIT 1), '2025-06-15 09:00:00', 30, 'Versailles', 'accepted' ),
    ( (SELECT dog_id FROM Dogs WHERE Dogs.name = 'Fluke' LIMIT 1), '2025-06-18 09:00:00', 45, 'Fort Funston', 'cancelled' );