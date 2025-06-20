-- * Five users
INSERT INTO Users ( username, email, password_hash, role ) VALUES
    ( 'alice123', 'alice@example.com', 'hashed123', 'owner' ),
    ( 'bobwalker', 'bob@example.com', 'hashed456', 'walker' ),
    ( 'carol123', 'carol@example.com', 'hashed789', 'owner '),
    (),
    ();

INSERT INTO Dogs ( owner_id, name, size ) VALUES
    ( (SELECT owner_id FROM Users WHERE username = 'alice123' LIMIT 1), 'Max',  )