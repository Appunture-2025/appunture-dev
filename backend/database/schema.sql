-- Script SQL para criar o banco de dados PostgreSQL
-- Execute este script no PostgreSQL para criar o banco e as tabelas

-- Criar banco de dados (execute como superuser)
-- CREATE DATABASE appunture;

-- Conectar ao banco appunture e executar os comandos abaixo:

-- Extensão para UUID (opcional)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabela de usuários
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    profession VARCHAR(100),
    role VARCHAR(50) DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de pontos de acupuntura
CREATE TABLE IF NOT EXISTS points (
    id SERIAL PRIMARY KEY,
    code VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    chinese_name VARCHAR(255),
    meridian VARCHAR(100) NOT NULL,
    location TEXT NOT NULL,
    indications TEXT,
    contraindications TEXT,
    coordinates JSONB,
    image_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de sintomas
CREATE TABLE IF NOT EXISTS symptoms (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de relacionamento ponto-sintoma
CREATE TABLE IF NOT EXISTS point_symptoms (
    id SERIAL PRIMARY KEY,
    point_id INTEGER REFERENCES points(id) ON DELETE CASCADE,
    symptom_id INTEGER REFERENCES symptoms(id) ON DELETE CASCADE,
    efficacy_score INTEGER DEFAULT 5,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(point_id, symptom_id)
);

-- Tabela de favoritos dos usuários
CREATE TABLE IF NOT EXISTS user_favorites (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    point_id INTEGER REFERENCES points(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, point_id)
);

-- Índices para melhorar performance
CREATE INDEX IF NOT EXISTS idx_points_meridian ON points(meridian);
CREATE INDEX IF NOT EXISTS idx_points_code ON points(code);
CREATE INDEX IF NOT EXISTS idx_symptoms_category ON symptoms(category);
CREATE INDEX IF NOT EXISTS idx_point_symptoms_point_id ON point_symptoms(point_id);
CREATE INDEX IF NOT EXISTS idx_point_symptoms_symptom_id ON point_symptoms(symptom_id);
CREATE INDEX IF NOT EXISTS idx_user_favorites_user_id ON user_favorites(user_id);

-- Inserir usuário admin padrão
INSERT INTO users (email, password_hash, name, profession, role) 
VALUES ('admin@appunture.com', '$2a$10$example.hash.here', 'Admin User', 'Administrator', 'admin')
ON CONFLICT (email) DO NOTHING;
