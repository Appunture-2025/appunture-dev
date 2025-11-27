import csv
from pathlib import Path


def update_csv(csv_path: Path, updates):
    rows = []
    with csv_path.open("r", encoding="utf-8-sig") as f:
        reader = csv.DictReader(f)
        fieldnames = reader.fieldnames
        for row in reader:
            rows.append(row)

    update_map = {u["code"]: u for u in updates}
    updated_count = 0

    for row in rows:
        code = row["code"]
        if code in update_map:
            data = update_map[code]
            row["description"] = data.get("description", "")
            row["location"] = data.get("location", "")
            row["indication"] = data.get("indication", "")
            row["contraindications"] = data.get("contraindications", "")
            row["functions"] = data.get("functions", "")
            row["contentStatus"] = "pending-review"
            updated_count += 1

    with csv_path.open("w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)

    print(f"Atualizados {updated_count} registros em {csv_path}")


updates = [
    {
        "code": "LU-1",
        "description": "Ponto Mu do Pulmão que dispersa Calor e regula a descida do Qi.",
        "location": "No 1.º espaço intercostal, 6 cun lateral à linha média anterior, acima do LU-2.",
        "indication": "Tosse seca ou produtiva, dispneia, asma com fleuma espessa, dor pleurítica, sensação de opressão torácica.",
        "contraindications": "Cuidado com pneumotórax; evitar punções profundas em pacientes muito emagrecidos.",
        "functions": "Regula e faz descer o Qi de Pulmão, transforma Fleuma-Calor, harmoniza Qi de Estômago, relaxa o tórax."
    },
    {
        "code": "LU-2",
        "description": "Ponto auxiliar para liberar Calor e umidade do tórax anterior.",
        "location": "No 2.º espaço intercostal, 6 cun lateral à linha média, logo abaixo da clavícula.",
        "indication": "Dor torácica, tosse com sangue, asma, rigidez de ombro, sensação de aperto emocional.",
        "contraindications": "Punção profunda com risco de pneumotórax; evitar em pele inflamada.",
        "functions": "Dispersa Calor do Pulmão, alivia plenitude torácica, promove a circulação de Qi nos ombros."
    },
    {
        "code": "LU-3",
        "description": "Ponto Janela do Céu que equilibra as emoções ligadas ao Pulmão.",
        "location": "3 cun abaixo de LU-5 na face ântero-lateral do braço, entre o bíceps e o úmero.",
        "indication": "Epistaxe, tosse com sangue, tristeza profunda, instabilidade emocional, afonia súbita.",
        "contraindications": "Evitar em pacientes propensos a síncope; atenção a vasos superficiais.",
        "functions": "Resfria o Sangue, interrompe sangramentos, acalma o Po e regula o Qi ascendente do Pulmão."
    },
    {
        "code": "LU-4",
        "description": "Ponto que regula o Qi torácico e a circulação do braço superior.",
        "location": "4 cun abaixo de LU-5, entre os feixes do bíceps na face ântero-lateral do braço.",
        "indication": "Dispneia leve, dor torácica, tensão do bíceps, dor no ombro irradiando para o tórax.",
        "contraindications": "Evitar estimulação excessiva em pacientes debilitados.",
        "functions": "Move o Qi e o Sangue da região superior, alivia dor torácica e auxilia na respiração."
    },
    {
        "code": "LU-5",
        "description": "He-Mar do Pulmão e ponto Água que dispersa Calor e umidade.",
        "location": "Na prega do cotovelo, lado radial do tendão do bíceps braquial.",
        "indication": "Tosse com fleuma, asma, febre alta, dor e edema do cotovelo, vômitos por Qi rebelde.",
        "contraindications": "Evitar punção medial profunda para proteger vasos.",
        "functions": "Elimina Calor do Pulmão, regula água, relaxa tendões do cotovelo e desce o Qi rebelde."
    },
    {
        "code": "LU-6",
        "description": "Xi-Cleft do Pulmão com ação rápida sobre quadros agudos.",
        "location": "Na linha LU-5 a LU-9, 7 cun proximal a LU-9 (ou 5 cun distal de LU-5).",
        "indication": "Tosse aguda, asma com dor torácica, hemoptise, falta de ar súbita, dor no antebraço.",
        "contraindications": "Cuidado em crianças pequenas ou pacientes anticoagulados.",
        "functions": "Desobstrui o canal, interrompe sangramentos pulmonares, alivia dor aguda, desce o Qi."
    },
    {
        "code": "LU-7",
        "description": "Ponto Luo e Comando da cabeça/pescoço; abre o Ren Mai e regula as águas.",
        "location": "1,5 cun proximal à prega do punho, entre tendões do braquiorradial e abdutor longo do polegar.",
        "indication": "Resfriado com calafrios, cefaleia occipital, rigidez cervical, asma, micção difícil.",
        "contraindications": "Evitar movimentos bruscos para não irritar nervos; cautela em gestantes ao abrir o Ren Mai.",
        "functions": "Libera o exterior, promove a descida do Qi do Pulmão, beneficia garganta e regula água corporal."
    },
    {
        "code": "LU-8",
        "description": "Ponto Jing-Rio (Metal) que fortalece o elemento Pulmão.",
        "location": "1 cun acima de LU-9, sobre a artéria radial.",
        "indication": "Tosse seca, irritação na garganta, febre leve, dor no punho, calor nas palmas.",
        "contraindications": "Pressão digital firme antes de agulhar; cuidado com a artéria radial.",
        "functions": "Tonifica o Pulmão Metal, regula o Qi descendente e harmoniza garganta e punho."
    },
    {
        "code": "LU-9",
        "description": "Ponto Yuan e Shu-Transporte que fortalece Qi e Sangue do Pulmão.",
        "location": "Na prega do punho, entre a artéria radial e o tendão do abdutor longo do polegar.",
        "indication": "Tosse crônica, voz fraca, palpitações de origem pulmonar, dor no punho, má circulação.",
        "contraindications": "Compressão da artéria radial antes da punção; evitar em casos de endarterite ativa.",
        "functions": "Tonifica Pulmão, harmoniza circulação, transforma fleuma crônica e abre os Luo."
    },
    {
        "code": "LU-10",
        "description": "Ying-Fonte (Fogo) que resfria a garganta e o Pulmão.",
        "location": "Na eminência tenar, ponto médio do primeiro metacarpo, na transição pele vermelha/branca.",
        "indication": "Dor intensa na garganta, perda de voz, febre, tosse seca, dor na mão.",
        "contraindications": "Cautela no primeiro trimestre gestacional; atenção ao usar moxabustão.",
        "functions": "Clareia Calor do Pulmão, beneficia garganta, desce Qi rebelde e acalma o Shen."
    },
    {
        "code": "LU-11",
        "description": "Jing-Poço (Madeira) útil para emergências e reanimação.",
        "location": "0,1 cun proximal ao canto radial da unha do polegar.",
        "indication": "Amigdalite aguda, febre alta, delírio, síncope, epistaxe, dor da extremidade superior.",
        "contraindications": "Evitar em distúrbios hemorrágicos; uso estéril ao fazer sangria.",
        "functions": "Dispersa Calor extremo, abre orifícios sensoriais, acalma o Shen e promove circulação no canal."
    },
]

if __name__ == "__main__":
    csv_target = Path(__file__).resolve().parent / "output" / "points_review.csv"
    update_csv(csv_target, updates)
