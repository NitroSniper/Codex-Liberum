CREATE TABLE posts (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    category VARCHAR(100) NOT NULL DEFAULT 'uncategorised',
    created TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    image_url TEXT NULL
);

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    hashed_password TEXT NOT NULL,
    salt TEXT NOT NULL
);

CREATE TABLE sesh (
    session_token TEXT PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_active TIMESTAMP,
    expires_at TIMESTAMP 
);

CREATE TABLE donations (
    id SERIAL PRIMARY KEY,
    transaction_id VARCHAR(50) UNIQUE NOT NULL,
    name          VARCHAR(100) NOT NULL,
    email         VARCHAR(255) NOT NULL,
    amount        NUMERIC(10,2) NOT NULL,
    donated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

