import os
import re
import unicodedata
import requests
from bs4 import BeautifulSoup
import pandas as pd

URL = "https://en.wikipedia.org/wiki/List_of_acupuncture_points"

def slugify(value: str, allow_unicode: bool = False, max_len: int = 60) -> str:
    value = str(value or "")
    if allow_unicode:
        value = unicodedata.normalize("NFKC", value)
    else:
        value = unicodedata.normalize("NFKD", value).encode("ascii", "ignore").decode("ascii")
    value = re.sub(r"[^\w\s-]", "", value).strip().lower()
    value = re.sub(r"[-\s]+", "-", value)
    return value[:max_len] or "untitled"

def nearest_heading(el) -> str | None:
    # Procura heading anterior mais próximo (h1..h6)
    for prev in el.find_all_previous(["h1", "h2", "h3", "h4", "h5", "h6"]):
        txt = prev.get_text(" ", strip=True).replace("[edit]", "").strip()
        if txt:
            return txt
    return None

# Requisitar página (headers e timeout melhoram confiabilidade)
headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                  "AppleWebKit/537.36 (KHTML, like Gecko) "
                  "Chrome/124.0 Safari/537.36",
    "Accept-Language": "en-US,en;q=0.9"
}
response = requests.get(URL, headers=headers, timeout=30)
response.raise_for_status()

# Salvar HTML bruto em arquivo
html_filename = "wikipedia_acupuncture_points.html"
with open(html_filename, "wb") as f:
    f.write(response.content)

# Parsear com BeautifulSoup
soup = BeautifulSoup(response.text, "html.parser")

# Encontrar TODAS as tabelas
all_tables = soup.find_all("table")
if not all_tables:
    print("Nenhuma tabela encontrada na página.")
    raise SystemExit(0)

os.makedirs("tables", exist_ok=True)  # salvar CSVs numa pasta

salvas = 0
for i, table in enumerate(all_tables, start=1):
    # Nome base pela caption ou heading anterior
    caption = table.find("caption")
    caption_text = caption.get_text(" ", strip=True) if caption else ""
    heading_text = nearest_heading(table) or ""
    base_name = caption_text or heading_text or f"table-{i}"
    safe_slug = slugify(base_name)

    csv_path = os.path.join("tables", f"{i:02d}_{safe_slug}.csv")

    # Converter a tabela para DataFrame via pandas
    try:
        # read_html retorna lista; como passamos somente essa tabela, pega o primeiro elemento
        df = pd.read_html(str(table))[0]
    except ValueError:
        # pandas não conseguiu ler; pula tabela
        print(f"Aviso: não foi possível ler a tabela {i} ({base_name}). Pulando.")
        continue

    # Limpeza básica de espaços em colunas de texto
    for col in df.select_dtypes(include="object"):
        df[col] = df[col].astype(str).str.strip()

    # Salvar CSV em UTF-8 com BOM (compatível com Excel/Windows)
    df.to_csv(csv_path, index=False, encoding="utf-8-sig")
    salvas += 1

print(f"HTML salvo em: {html_filename}")
print(f"Tabelas salvas: {salvas} arquivo(s) CSV na pasta ./tables")
