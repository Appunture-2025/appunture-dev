CREATE TABLE IF NOT EXISTS user_favorites (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    point_id BIGINT NOT NULL REFERENCES points(id) ON DELETE CASCADE,
    CONSTRAINT uk_user_favorite UNIQUE(user_id, point_id)
);

CREATE INDEX IF NOT EXISTS idx_user_favorites_user ON user_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_user_favorites_point ON user_favorites(point_id);
