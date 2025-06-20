-- * Five users
INSERT INTO Users ( username, email, password_hash, role ) VALUES
    ( 'alice123', 'alice@example.com', 'hashed123', 'owner' ),
    ( 'bobwalker', 'bob@example.com', 'hashed456', 'walker' ),
    ( 'carol123', 'carol@example.com', 'hashed789', 'owner '),
    (),
    ();

-- * Five Doggos
INSERT INTO Dogs ( owner_id, name, size ) VALUES
    ( (SELECT owner_id FROM Users WHERE username = 'alice123' LIMIT 1), 'Max', 'medium' ),
    ( (SELECT owner_id FROM Users WHERE username = 'carol123' LIMIT 1), 'Bella', 'small' ),
    ( (SELECT owner_ud FROM Users WHERE username = '...' LIMIT 1), '', '' ),
    ( (SELECT owner_ud FROM Users WHERE username = '...' LIMIT 1), '', '' ),
    ( (SELECT owner_ud FROM Users WHERE username = '...' LIMIT 1), '', '' );

-- * Five Walkies
INSERT INTO WalkRequests ( dog_id, requested_time, duration_minutes, location, status ) VALUES
    ( (SELECT dog_id FROM Dogs WHERE Dogs.name = 'Max' LIMIT 1), '2025-06-10 08:00:00', 30, 'Parklands', 'open' ),
    ( (SELECT dog_id FROM Dogs WHERE Dogs.name = 'Bella' LIMIT 1), '2025-06-10 08:00:00', 30, 'Parklands', 'open' ),