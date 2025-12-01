# 🎯 Appunture Point Mapper

Ferramenta para mapeamento manual de coordenadas dos pontos de acupuntura nos SVGs.

## 🚀 Como Usar

### 1. Iniciar a Ferramenta

**Windows:**

```bash
tools\point-mapper\start-mapper.bat
```

**Linux/Mac:**

```bash
chmod +x tools/point-mapper/start-mapper.sh
./tools/point-mapper/start-mapper.sh
```

**Ou manualmente:**

```bash
cd appunture-dev
python -m http.server 8080
```

Acesse: **http://localhost:8080/tools/point-mapper/**

### 2. Mapear Pontos

1. **Selecione um ponto** na lista à esquerda (ou use a busca)
2. **Escolha a vista** do corpo (Frente, Costas, Lateral, etc.)
3. **Clique no SVG** exatamente onde o ponto deve ficar
4. **Clique "Salvar Coordenada"** ou pressione `Enter`
5. Use `→` para avançar para o próximo ponto

### 3. Atalhos de Teclado

| Tecla    | Ação              |
| -------- | ----------------- |
| `→`      | Próximo ponto     |
| `←`      | Ponto anterior    |
| `Enter`  | Salvar coordenada |
| `Ctrl+Z` | Desfazer clique   |
| `Esc`    | Cancelar marcação |

### 4. Exportar e Integrar ao Seed

1. Clique em **"Exportar JSON"**
2. Clique em **"Download"** para baixar o arquivo
3. Salve como `tools/point-mapper/coordinates_export.json`
4. Execute o script de integração:

```bash
python tools/integrate_coordinates.py
```

Isso irá:

- Atualizar `data/processed/2025-11-28/points_seed.json`
- Atualizar `data/processed/2025-11-28/points_seed.ndjson`
- Criar backup automático

## 📊 Formato das Coordenadas

As coordenadas são salvas como **porcentagem** (0-100) relativa ao SVG:

```json
{
  "coordinates": {
    "x": 25.5, // % da largura do SVG
    "y": 18.3, // % da altura do SVG
    "view": "front-01", // Vista onde foi mapeado (ex: front-01 a front-08, back-01 a back-07)
    "mappedAt": "2024-12-01T10:00:00Z"
  }
}
```

## 💾 Persistência

- **localStorage**: Progresso salvo automaticamente no navegador
- **Exportar JSON**: Backup manual recomendado regularmente
- **Importar JSON**: Restaura de um backup anterior

## 🎨 Vistas Disponíveis (Atlas Corporal)

O atlas contém **15 SVGs** em `frontend-mobile/appunture/assets/body-map/`:

### Frontal (8 imagens)

- `front-01` → `1.svg`
- `front-02` → `2.svg`
- `front-03` → `3.svg`
- `front-04` → `4.svg`
- `front-05` → `5.svg`
- `front-06` → `6.svg`
- `front-07` → `7.svg`
- `front-08` → `8.svg`

### Posterior (7 imagens)

- `back-01` → `9.svg`
- `back-02` → `10.svg`
- `back-03` → `11.svg`
- `back-04` → `12.svg`
- `back-05` → `13.svg`
- `back-06` → `14.svg`
- `back-07` → `15.svg`

## 📝 Dicas

1. **Comece pelos meridianos mais curtos** (LU=11, HT=9, PC=9)
2. **Use zoom** (+ e -) para posicionar com precisão
3. **Filtre por meridiano** para focar em uma região
4. **Exporte frequentemente** como backup
5. **Para pontos bilaterais**, marque apenas um lado - o app pode espelhar

## 🔄 Fluxo Completo

```
1. Abrir ferramenta → 2. Mapear pontos → 3. Exportar JSON
                                              ↓
4. Salvar coordinates_export.json → 5. python integrate_coordinates.py
                                              ↓
6. points_seed.json atualizado → 7. Fazer seed no Firestore
```

## 📁 Arquivos

```
tools/
├── point-mapper/
│   ├── index.html              # Ferramenta de mapeamento
│   ├── start-mapper.bat        # Script Windows
│   ├── start-mapper.sh         # Script Linux/Mac
│   ├── coordinates_export.json # Exportação (gerado)
│   └── README.md               # Esta documentação
└── integrate_coordinates.py    # Integrador ao seed
```
