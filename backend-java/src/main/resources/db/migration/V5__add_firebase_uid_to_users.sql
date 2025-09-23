-- Adiciona coluna firebase_uid à tabela users para integração com Firebase Auth
ALTER TABLE users ADD COLUMN firebase_uid VARCHAR(128) UNIQUE;

-- Criar índice para performance na busca por firebase_uid
CREATE INDEX idx_users_firebase_uid ON users(firebase_uid);

-- Comentário para documentação
COMMENT ON COLUMN users.firebase_uid IS 'UID único do Firebase Auth para integração';