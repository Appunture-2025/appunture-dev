import csv
import os

pc_data = {
    "PC-1": {
        "description": "Tianchi, ponto de encontro do PC com LV e GB que abre o peito e promove lactação.",
        "location": "No 4º espaço intercostal, 1 cun lateral ao mamilo, ligeiramente lateral a CV-17.",
        "indication": "Plenitude torácica, mastite, falta de lactação, tosse com fleuma espessa, dor no ombro e axila.",
        "contraindications": "Evitar inserção profunda perpendicular devido ao risco de pneumotórax; utilizar ângulo tangencial.",
        "functions": "Libera o Qi do Peito, dissolve fleuma-calor e direciona o Qi para baixo."
    },
    "PC-2": {
        "description": "Tianquan, ponto que amolece rigidez das axilas e regula o Qi nutritivo.",
        "location": "2 cun inferior a axila anterior, entre os músculos bíceps e peitoral maior, na face medial do braço.",
        "indication": "Dor e tensão no peito, palpitações, dor no braço medial, espasmos do bíceps.",
        "contraindications": "Inserção profunda posterior pode atingir vasos braquiais; manter agulha oblíqua superficial.",
        "functions": "Abre o peito, regula o Sangue do Coração e relaxa o braço superior."
    },
    "PC-3": {
        "description": "Quze, ponto He-Mar (Água) e dispersor de Calor do Coração.",
        "location": "Na prega cubital, no lado ulnar do tendão do bíceps braquial, com o cotovelo levemente flexionado.",
        "indication": "Febre alta, agitação mental, palpitações, dor no cotovelo, tremor do antebraço.",
        "contraindications": "Evitar punção profunda medial para não atingir a artéria braquial.",
        "functions": "Drena calor do Coração, refresca o Sangue e relaxa o cotovelo." 
    },
    "PC-4": {
        "description": "Ximen, ponto Xi-Cleft que ativa o Qi e estanca dor e sangramento agudo.",
        "location": "5 cun proximal à prega do punho, na linha entre PC-3 e PC-7, entre os tendões dos flexores.",
        "indication": "Dor torácica aguda, arritmias, hemoptise devido a calor do Coração, dor no antebraço.",
        "contraindications": "Inserir superficialmente para evitar hematomas em pacientes com distúrbios de coagulação.",
        "functions": "Move o Sangue do Coração, acalma o Shen e alivia a dor aguda." 
    },
    "PC-5": {
        "description": "Jianshi, ponto Jing-Rio (Metal) e ponto de abertura para fleuma-calor que afeta Shen.",
        "location": "3 cun proximal a PC-7, entre os tendões do palmar longo e flexor radial do carpo.",
        "indication": "Náuseas de origem emocional, palpitações, irregularidades menstruais por estagnação de Qi, tremores.",
        "contraindications": "Inserção muito radial pode irritar o nervo mediano; utilizar trajeto paralelo aos tendões.",
        "functions": "Transforma fleuma-calor, regula o Coração, acalma a mente e harmoniza o Estômago." 
    },
    "PC-6": {
        "description": "Neiguan, ponto Luo e abertura do Yin Wei Mai, essencial para náuseas e distúrbios emocionais.",
        "location": "2 cun proximal à prega do punho, entre os tendões do palmar longo e flexor radial do carpo.",
        "indication": "Náuseas, vômitos, enjoo de movimento, palpitações, ansiedade, dor torácica, síndrome do túnel do carpo.",
        "contraindications": "Evitar pressão excessiva se houver neuropatia do nervo mediano.",
        "functions": "Harmoniza o Estômago, regula o Coração, acalma o Shen e alivia dor torácica." 
    },
    "PC-7": {
        "description": "Daling, ponto Shu-Transporte (Terra) e Yuan-Fonte; forte para dispersar calor do Coração.",
        "location": "Na prega do punho, entre os tendões do palmar longo e flexor radial do carpo, nível de HT-7.",
        "indication": "Insônia por calor do Coração, agitação, transtornos de fala por choque, dor no punho, gastrite nervosa.",
        "contraindications": "Inserção profunda pode comprimir o nervo mediano; preferir técnica ligeiramente oblíqua.",
        "functions": "Limpa calor do Coração, acalma o Shen e libera o canal do punho." 
    },
    "PC-8": {
        "description": "Laogong, ponto Ying-Manancial (Fogo) que purga calor e tranquiliza a mente.",
        "location": "Na palma, entre o 2º e 3º metacarpos onde a ponta do dedo médio repousa ao fechar o punho.",
        "indication": "Úlceras na boca, halitose, febre alta, ansiedade com calor nas palmas, eczema palmar.",
        "contraindications": "Evitar moxibustão direta em pele sensível; risco de bolhas.",
        "functions": "Dissipa calor do Coração e Estômago, refresca a boca e acalma o Shen." 
    },
    "PC-9": {
        "description": "Zhongchong, ponto Jing-Poço (Madeira) e ponto de reanimação do canal.",
        "location": "0,1 cun proximal ao canto radial da unha do dedo médio.",
        "indication": "Perda de consciência, febre alta, golpe de calor, dor de garganta súbita, mania aguda.",
        "contraindications": "Uso de sangria requer assepsia rigorosa e cautela em distúrbios hemorrágicos.",
        "functions": "Revive a consciência, limpa calor extremo do Coração e desobstrui a garganta." 
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
        if code in pc_data:
            data = pc_data[code]
            row['description'] = data['description']
            row['location'] = data['location']
            row['indication'] = data['indication']
            row['contraindications'] = data['contraindications'] or "Nenhuma contraindicação específica."
            row['functions'] = data['functions']
            updated_count += 1
        writer.writerow(row)

os.replace(temp_file_path, csv_file_path)
print(f"Updated {updated_count} rows in {csv_file_path}")
