erDiagram
    USERS {
        INTEGER id PK
        VARCHAR name
        VARCHAR email
        VARCHAR password_hash
        VARCHAR role
        VARCHAR status
        TIMESTAMP created_at
    }
    POINTS {
        VARCHAR id PK
        VARCHAR name
        VARCHAR meridian
        TEXT location
        VARCHAR puncture_depth
        TEXT special_characteristics
        TEXT energy_patterns
        TEXT functions
        TEXT indications
        TEXT image_url
        INTEGER coord_x
        INTEGER coord_y
        TIMESTAMP updated_at
    }
    SYMPTOMS {
        VARCHAR id PK
        VARCHAR name
        TEXT[] synonyms
        TIMESTAMP updated_at
    }
    SYMPTOM_POINT {
        VARCHAR symptom_id FK
        VARCHAR point_id FK
        TIMESTAMP updated_at
    }
    FAVORITES {
        INTEGER id PK
        INTEGER user_id FK
        VARCHAR point_id FK
        TIMESTAMP created_at
    }
    NOTES {
        INTEGER id PK
        INTEGER user_id FK
        VARCHAR point_id FK
        TEXT note_text
        TIMESTAMP created_at
        TIMESTAMP updated_at
    }

    %% Relacionamentos %%
    USERS ||--o{ FAVORITES : "1 → n"
    POINTS ||--o{ FAVORITES : "1 → n"

    USERS ||--o{ NOTES : "1 → n"
    POINTS ||--o{ NOTES : "1 → n"

    SYMPTOMS ||--o{ SYMPTOM_POINT : "1 → n"
    POINTS ||--o{ SYMPTOM_POINT : "1 → n"

    %% Chaves estrangeiras indicadas nas próprias entidades %%
