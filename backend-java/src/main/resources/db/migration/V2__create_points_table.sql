CREATE TABLE IF NOT EXISTS points (
    id BIGSERIAL PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(150) NOT NULL,
    chinese_name VARCHAR(150),
    meridian VARCHAR(100) NOT NULL,
    location TEXT NOT NULL,
    indications TEXT,
    contraindications TEXT,
    coordinates_json TEXT,
    image_url VARCHAR(500),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_points_code ON points(code);
CREATE INDEX IF NOT EXISTS idx_points_meridian ON points(meridian);
