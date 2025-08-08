CREATE TABLE IF NOT EXISTS point_symptoms (
    id BIGSERIAL PRIMARY KEY,
    point_id BIGINT NOT NULL REFERENCES points(id) ON DELETE CASCADE,
    symptom_id BIGINT NOT NULL REFERENCES symptoms(id) ON DELETE CASCADE,
    score INT NOT NULL DEFAULT 0,
    CONSTRAINT uk_point_symptom UNIQUE(point_id, symptom_id)
);

CREATE INDEX IF NOT EXISTS idx_point_symptoms_point ON point_symptoms(point_id);
CREATE INDEX IF NOT EXISTS idx_point_symptoms_symptom ON point_symptoms(symptom_id);
