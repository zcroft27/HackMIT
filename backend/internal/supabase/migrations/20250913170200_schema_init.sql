-- Users table
CREATE TABLE "user" (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL
);

-- Oceans table
CREATE TABLE ocean (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    user_id INT,
    FOREIGN KEY (user_id) REFERENCES "user"(id) ON DELETE SET NULL
);

-- Tags table
CREATE TABLE tag (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    color VARCHAR(100) NOT NULL
);

-- Bottles table
CREATE TABLE bottle (
    id SERIAL PRIMARY KEY,
    content TEXT NOT NULL,
    author VARCHAR(100),
    tag_id INT NOT NULL,
    user_id INT,
    location_from VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tag_id) REFERENCES tag(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES "user"(id) ON DELETE SET NULL
);

-- Tag-Ocean junction table
CREATE TABLE tag_ocean (
    tag_id INT NOT NULL,
    ocean_id INT NOT NULL,
    FOREIGN KEY (tag_id) REFERENCES tag(id) ON DELETE CASCADE,
    FOREIGN KEY (ocean_id) REFERENCES ocean(id) ON DELETE CASCADE,
    PRIMARY KEY (tag_id, ocean_id)
);

-- Seen bottles tracking table
CREATE TABLE seen_bottles (
    user_id INT NOT NULL,
    bottle_id INT NOT NULL,
    seen_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES "user"(id) ON DELETE CASCADE,
    FOREIGN KEY (bottle_id) REFERENCES bottle(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, bottle_id)
);

-- Indexes for foreign keys and common queries
CREATE INDEX idx_ocean_user_id ON ocean(user_id);
CREATE INDEX idx_bottle_tag_id ON bottle(tag_id);
CREATE INDEX idx_bottle_user_id ON bottle(user_id);
CREATE INDEX idx_bottle_created_at ON bottle(created_at DESC);
CREATE INDEX idx_tag_ocean_ocean_id ON tag_ocean(ocean_id);
CREATE INDEX idx_seen_bottles_user_id ON seen_bottles(user_id);
CREATE INDEX idx_seen_bottles_bottle_id ON seen_bottles(bottle_id);
CREATE INDEX idx_seen_bottles_seen_at ON seen_bottles(seen_at DESC);

-- Composite indexes for common query patterns
CREATE INDEX idx_bottle_tag_user ON bottle(tag_id, user_id);
CREATE INDEX idx_seen_bottles_user_seen ON seen_bottles(user_id, seen_at DESC);