import csv
import os

# Dados clínicos em PT-BR para os pontos do meridiano do Coração (HT-1 a HT-9)
ht_data = {
    "HE-1": {
        "description": "Jiquan, ponto de encontro do canal do Coração que libera o peito e o ombro.",
        "location": "No centro da axila, na depressão entre a cabeça medial do úmero e a parede torácica quando o braço está abduzido.",
        "indication": "Dor e sensação de plenitude torácica, dor no ombro e axila, distúrbios cardíacos emocionais, agitação.",
        "contraindications": "Evitar punção profunda em direção medial para não lesar a artéria axilar e o plexo braquial.",
        "functions": "Descongestiona o peito, move o Qi do Coração e relaxa o ombro." 
    },
    "HE-2": {
        "description": "Qingling, ponto para dissipar Calor e aliviar dor do braço medial.",
        "location": "3 cun proximal a HT-3, na linha que conecta HT-1 a HT-3, na borda medial do braço.",
        "indication": "Cardiopalmores, dor torácica, tremor ou dor no braço medial, ansiedade com calor.",
        "contraindications": "Inserção profunda pode atingir vasos braquiais; usar técnica oblíqua suave.",
        "functions": "Dispersa Calor do Coração, alivia dor local e harmoniza o Qi descendente." 
    },
    "HE-3": {
        "description": "Shaohai, ponto He-Mar (Água) do Coração.",
        "location": "Na prega do cotovelo, entre o epicôndilo medial do úmero e o tendão do músculo bíceps braquial quando o cotovelo está flexionado.",
        "indication": "Ansiedade, palpitações, espasmos no braço, dor medial do cotovelo, tremores.",
        "contraindications": "Evitar punção profunda medial para proteger o nervo cubital.",
        "functions": "Acalma o Shen, elimina Calor do Coração e relaxa tendões do cotovelo." 
    },
    "HE-4": {
        "description": "Lingdao, ponto Jing-Rio (Metal) do canal.",
        "location": "1,5 cun proximal a HT-7, na face ulnar do antebraço, radial ao tendão do flexor ulnar do carpo.",
        "indication": "Palpitações, perda da voz por choque, rigidez do antebraço, tristeza súbita.",
        "contraindications": "Cuidado com a artéria ulnar superficial; inserir paralelo ao tendão.",
        "functions": "Acalma o Shen, regula o Qi e dispersa Calor do Coração." 
    },
    "HE-5": {
        "description": "Tongli, ponto Luo-Conexão e ponto Benção das Vozes.",
        "location": "1 cun proximal a HT-7, na face ulnar do antebraço, radial ao tendão do flexor ulnar do carpo.",
        "indication": "Palpitações, ansiedade, distúrbios de fala por causa emocional, sudorese noturna, cefaleia frontal.",
        "contraindications": "Técnica superficial para evitar hematomas em pacientes com fragilidade capilar.",
        "functions": "Tonifica o Qi do Coração, estabiliza o Shen e beneficia a fala e a língua." 
    },
    "HE-6": {
        "description": "Yinxi, ponto Xi-Cleft do Coração.",
        "location": "0,5 cun proximal a HT-7, na face ulnar do antebraço, radial ao tendão do flexor ulnar do carpo.",
        "indication": "Sudorese noturna intensa, dor torácica aguda, ansiedade com palpitações, hemoptise por calor do Coração.",
        "contraindications": "Evitar manipulação vigorosa em pacientes com sangramentos ativos.",
        "functions": "Nutre o Yin do Coração, controla a transpiração e acalma o Shen." 
    },
    "HE-7": {
        "description": "Shenmen, ponto Shu-Transporte (Terra) e Yuan-Fonte do Coração.",
        "location": "Na face ulnar do punho, na depressão radial ao tendão do flexor ulnar do carpo, na prega do punho.",
        "indication": "Insônia, ansiedade, palpitações, irritabilidade, perda de memória, síndrome do túnel do carpo medial.",
        "contraindications": "Inserção excessivamente profunda pode atingir o nervo ulnar; usar ângulo leve.",
        "functions": "Tonifica Sangue e Yin do Coração, acalma profundamente o Shen e harmoniza o espírito." 
    },
    "HE-8": {
        "description": "Shaofu, ponto Ying-Manancial (Fogo) do canal.",
        "location": "Na palma da mão, entre o quarto e o quinto metacarpos, onde a ponta do dedo mínimo repousa quando um punho é fechado.",
        "indication": "Palpitações por calor, boca e língua ulceradas, sensação de calor nas palmas, irritabilidade.",
        "contraindications": "Evitar moxabustão direta em pele sensível; risco de queimaduras.",
        "functions": "Dispersa Calor do Coração e Intestino Delgado, acalma o Shen e refresca a boca e língua." 
    },
    "HE-9": {
        "description": "Shaochong, ponto Jing-Poço (Madeira) e ponto de reanimação.",
        "location": "0,1 cun proximal ao canto radial da unha do dedo mínimo.",
        "indication": "Perda de consciência, febre alta, delírio, dor na garganta, palpitações súbitas.",
        "contraindications": "Sangria deve ser asséptica; evitar em distúrbios hemorrágicos graves.",
        "functions": "Revive a consciência, limpa Calor do Coração e resfria a garganta." 
    }
}

csv_file_path = os.path.join('tools', 'output', 'points_review.csv')
temp_file_path = os.path.join('tools', 'output', 'points_review_temp.csv')

updated_count = 0

with open(csv_file_path, mode='r', encoding='utf-8', newline='') as csvfile, \
     open(temp_file_path, mode='w', encoding='utf-8', newline='') as tempfile:

    reader = csv.DictReader(csvfile)
    fieldnames = reader.fieldnames
    writer = csv.DictWriter(tempfile, fieldnames=fieldnames)
    writer.writeheader()

    for row in reader:
        code = row['code']
        if code in ht_data:
            data = ht_data[code]
            row['description'] = data['description']
            row['location'] = data['location']
            row['indication'] = data['indication']
            row['contraindications'] = data['contraindications'] or "Nenhuma contraindicação específica."
            row['functions'] = data['functions']
            updated_count += 1
        writer.writerow(row)

os.replace(temp_file_path, csv_file_path)
print(f"Updated {updated_count} rows in {csv_file_path}")
