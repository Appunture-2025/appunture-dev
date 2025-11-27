import csv
import os

ki_data = {
    "KI-1": {
        "description": "Yongquan, ponto Jing-Poço (Madeira) e ponto mais baixo do corpo, usado para puxar o Yang excessivo para baixo.",
        "location": "Na planta do pé, entre a 2ª e 3ª cabeças metatarsais, no terço anterior do sulco formado ao flexionar os dedos.",
        "indication": "Colapso de Yang, vertigem, insônia por calor no Coração, dor de garganta, irritabilidade, cefaleia vértice.",
        "contraindications": "Evitar sangria profunda em pacientes diabéticos com neuropatia plantar.",
        "functions": "Abaixa o Yang rebelde, nutre o Yin do Rim e refresca a cabeça." 
    },
    "KI-2": {
        "description": "Rangu, ponto Ying-Manancial (Fogo) que clareia calor por deficiência de Yin.",
        "location": "Na face medial do pé, inferior ao maléolo medial, na depressão anterior ao calcâneo.",
        "indication": "Calor nos pés, sudorese noturna, garganta seca, menstruação irregular, cistite.",
        "contraindications": "Evitar punctura profunda para não lesar ligamentos do tornozelo.",
        "functions": "Elimina calor do Rim, regula a menstruação e beneficia garganta e trato urinário." 
    },
    "KI-3": {
        "description": "Taixi, ponto Shu-Transporte (Terra) e Yuan-Fonte dos Rins.",
        "location": "Na depressão entre o maléolo medial e o tendão de Aquiles.",
        "indication": "Dor lombar, tinnitus, impotência, menstruação irregular, asma por deficiência de Rim.",
        "contraindications": "Cuidado com a artéria tibial posterior; inserir suavemente junto ao tendão.",
        "functions": "Tonifica Yin e Yang do Rim, fortalece a lombar e estabiliza a respiração." 
    },
    "KI-4": {
        "description": "Dazhong, ponto Luo-Conexão que estabiliza emoções ligadas ao Rim.",
        "location": "0,5 cun posterior e superior a KI-3, na borda anterior do tendão de Aquiles.",
        "indication": "Ansiedade, medo, dor do calcanhar, retenção urinária.",
        "contraindications": "Evitar pressão exagerada para não irritar o tendão de Aquiles.",
        "functions": "Fortalece a ligação Coração-Rim, estabiliza emoções e alivia dor no calcanhar." 
    },
    "KI-5": {
        "description": "Shuiquan, ponto Xi-Cleft usado para distúrbios ginecológicos por deficiência de Rim.",
        "location": "1 cun inferior a KI-3, na face medial do calcâneo, na depressão anterior ao tendão de Aquiles.",
        "indication": "Dismenorreia, amenorreia, sangramento uterino, dor lombar aguda.",
        "contraindications": "Nenhuma específica além de cuidado com inserção profunda em tendões.",
        "functions": "Regula o Útero, refresca calor por deficiência e alivia dor lombar aguda." 
    },
    "KI-6": {
        "description": "Zhaohai, ponto de abertura do Yin Qiao Mai, excelente para garganta seca e insônia.",
        "location": "1 cun inferior ao maléolo medial, entre os ligamentos do tornozelo.",
        "indication": "Insônia, garganta seca, constipação por secura, dor lombar, epilepsia infantil.",
        "contraindications": "Inserção profunda pode atingir vasos tibiais; utilizar ângulo oblíquo.",
        "functions": "Nutre Yin do Rim, lubrifica garganta e intestinos e acalma o Shen." 
    },
    "KI-7": {
        "description": "Fuliu, ponto Jing-Rio (Metal) que regula água e sudorese.",
        "location": "2 cun superior a KI-3, na borda anterior do tendão de Aquiles.",
        "indication": "Edema, sudorese espontânea ou noturna, diarreia aquosa, dor lombar.",
        "contraindications": "Cuidado com a artéria tibial posterior.",
        "functions": "Fortalece o Yang do Rim, regula a água e estabiliza a transpiração." 
    },
    "KI-8": {
        "description": "Jiaoxin, ponto Xi-Cleft do Yin Qiao Mai.",
        "location": "0,5 cun anterior a KI-7 e 2 cun superior a KI-3, na borda medial da tíbia.",
        "indication": "Dismenorreia, sangramento uterino, prolápso, dor genital.",
        "contraindications": "Evitar tocar o nervo tibial; inserir oblíqua superficial.",
        "functions": "Regula a menstruação, harmoniza o útero e fortalece o canal Yin Qiao." 
    },
    "KI-9": {
        "description": "Zhubin, ponto Xi-Cleft do Yin Wei Mai.",
        "location": "5 cun superior a KI-3, cerca de 1 cun posterior à borda media da tíbia.",
        "indication": "Ansiedade, medo, dor mental, vômitos, dor na panturrilha.",
        "contraindications": "Inserção profunda pode atingir vasos; usar ângulo oblíquo.",
        "functions": "Equilibra o Coração e o Rim, acalma o Shen e relaxa a panturrilha." 
    },
    "KI-10": {
        "description": "Yingu, ponto He-Mar (Água) do Rim.",
        "location": "Na flexura do joelho, entre os tendões dos músculos semitendinoso e semimembranoso, na borda medial do corno poplíteo.",
        "indication": "Dor de joelho, impotência, leucorreia, disúria.",
        "contraindications": "Evitar atingir vasos poplíteos; inserir oblíquo medial.",
        "functions": "Nutre Yin do Rim, limpa calor e beneficia o trato urinário." 
    },
    "KI-11": {
        "description": "Henggu, ponto que reforça a ligação Rim-Útero.",
        "location": "5 cun abaixo do umbigo, 0,5 cun lateral à linha média (CV-2).",
        "indication": "Distúrbios urinários, infertilidade, impotência, leucorreia.",
        "contraindications": "Cuidado com a bexiga cheia; esvaziá-la antes da puntura.",
        "functions": "Aquece o Aquecedor Inferior, fortalece os Rins e regula a bexiga." 
    },
    "KI-12": {
        "description": "Dahe, ponto que sustenta o períneo e estabiliza o Jing.",
        "location": "4 cun abaixo do umbigo e 0,5 cun lateral à linha média (CV-3).",
        "indication": "Incontinência urinária, fluxo uterino excessivo, ejaculação precoce.",
        "contraindications": "Esvaziar a bexiga antes da puntura para evitar lesão.",
        "functions": "Tonifica o Rim, controla Jing e fortalece os músculos do assoalho pélvico." 
    },
    "KI-13": {
        "description": "Qixue, ponto que ancora o Chong Mai.",
        "location": "3 cun abaixo do umbigo, 0,5 cun lateral a CV-4.",
        "indication": "Infertilidade, menstruação irregular, dor abdominal inferior.",
        "contraindications": "Cuidado com peritônio e bexiga cheia.",
        "functions": "Regula o Chong e o Ren Mai, consolida o útero e mobiliza o Qi do aquecedor inferior." 
    },
    "KI-14": {
        "description": "Siman, ponto de encontro do Chong e do Rim que regula o Qi do útero.",
        "location": "2 cun abaixo do umbigo, 0,5 cun lateral a CV-5.",
        "indication": "Dismenorreia, miomas, dor abdominal, diarreia.",
        "contraindications": "Cuidado com o peritônio.",
        "functions": "Regula menstruação, harmoniza intestinos e dissolve massas." 
    },
    "KI-15": {
        "description": "Zhongzhu, ponto que ancora o Qi no aquecedor inferior.",
        "location": "1 cun abaixo do umbigo, 0,5 cun lateral a CV-6.",
        "indication": "Diarreia, dor abdominal, menstruação irregular.",
        "contraindications": "Cuidado com peritônio.",
        "functions": "Regula intestinos, estabiliza o Qi e aquece o aquecedor inferior." 
    },
    "KI-16": {
        "description": "Huangshu, ponto equivalente ao umbigo para os Rins.",
        "location": "Ao nível do umbigo, 0,5 cun lateral a CV-8.",
        "indication": "Distensão abdominal, constipação, dor lombar.",
        "contraindications": "Puntura profunda deve evitar cavidade abdominal em pacientes magros.",
        "functions": "Harmoniza Estômago e Intestinos, ancora o Qi e fortalece o Rim." 
    },
    "KI-17": {
        "description": "Shangqu, ponto que regula o Qi ascendente do abdome.",
        "location": "2 cun acima do umbigo, 0,5 cun lateral a CV-10.",
        "indication": "Má digestão, dor abdominal, distensão por alimentos.",
        "contraindications": "Cuidado com o peritônio.",
        "functions": "Regula o Qi do Estômago e harmoniza o intestino delgado." 
    },
    "KI-18": {
        "description": "Shiguan, ponto que move o sangue do útero.",
        "location": "3 cun acima do umbigo, 0,5 cun lateral a CV-11.",
        "indication": "Náusea, vômito, dor abdominal, distúrbios menstruais.",
        "contraindications": "Evitar punctura profunda em abdome magro.",
        "functions": "Desce o Qi rebelde, harmoniza o Estômago e regula o sangue uterino." 
    },
    "KI-19": {
        "description": "Yindu, ponto que regula o Estômago e acalma rebeliões.",
        "location": "4 cun acima do umbigo, 0,5 cun lateral a CV-12.",
        "indication": "Gastrite, refluxo, náusea, dor abdominal superior.",
        "contraindications": "Cuidado com cavidade abdominal.",
        "functions": "Harmoniza Estômago, abaixa o Qi e acalma o Shen." 
    },
    "KI-20": {
        "description": "Futonggu, ponto que auxilia o transporte de alimento no Estômago.",
        "location": "5 cun acima do umbigo, 0,5 cun lateral a CV-13.",
        "indication": "Plenitude gástrica, náusea, vômito, ansiedade por estagnação.",
        "contraindications": "Evitar perfurar órgãos abdominais em pacientes magros.",
        "functions": "Descongestiona o Estômago, regula o Qi descendente e acalma o espírito." 
    },
    "KI-21": {
        "description": "Youmen, ponto que move o Qi e o Sangue entre Rim e Estômago.",
        "location": "6 cun acima do umbigo, 0,5 cun lateral a CV-14.",
        "indication": "Vômitos persistentes, depressão, dor epigástrica, palpitações.",
        "contraindications": "Risco de perfuração hepática em pacientes magros; inserir superficial.",
        "functions": "Harmoniza Estômago e Coração, tranquiliza o Shen e mobiliza a Essência." 
    },
    "KI-22": {
        "description": "Bulang, ponto da parede torácica que libera o Qi do Pulmão.",
        "location": "5º espaço intercostal, 2 cun lateral à linha média (mesmo nível de CV-16).",
        "indication": "Dispneia, tosse, dor torácica, mastalgia.",
        "contraindications": "Puntura perpendicular profunda é contraindicada (risco de pneumotórax).",
        "functions": "Desce o Qi rebelde do Pulmão, abre o peito e acalma a mente." 
    },
    "KI-23": {
        "description": "Shenfeng, ponto que regula o Qi cardíaco e libera o peito.",
        "location": "4º espaço intercostal, 2 cun lateral à linha média (CV-17).",
        "indication": "Palpitações, tosse, mastalgia, agitação.",
        "contraindications": "Evitar puntura profunda para não perfurar o pulmão.",
        "functions": "Abre o peito, regula o Coração e acalma o Shen." 
    },
    "KI-24": {
        "description": "Lingxu, ponto que suaviza o Qi do tórax.",
        "location": "3º espaço intercostal, 2 cun lateral à linha média (CV-18).",
        "indication": "Tosse, asma, dor torácica, ansiedade.",
        "contraindications": "Risco de pneumotórax com inserção profunda.",
        "functions": "Desce o Qi, relaxa o peito e alivia tosse." 
    },
    "KI-25": {
        "description": "Shencang, ponto que ancora o Qi cardíaco e reduz ansiedade.",
        "location": "2º espaço intercostal, 2 cun lateral à linha média (CV-19).",
        "indication": "Palpitações, tosse, opressão torácica, ansiedade.",
        "contraindications": "Evitar puntura profunda.",
        "functions": "Libera o peito, regula o Coração e harmoniza o Pulmão." 
    },
    "KI-26": {
        "description": "Yuzhong, ponto que guia o Qi descendente do peito.",
        "location": "1º espaço intercostal, 2 cun lateral à linha média (CV-20).",
        "indication": "Dispneia, tosse com fleuma, sensação de sufocamento.",
        "contraindications": "Risco de pneumotórax; usar inserção transversa.",
        "functions": "Desce o Qi rebelde, dissolve fleuma e acalma a respiração." 
    },
    "KI-27": {
        "description": "Shufu, ponto final do canal que integra Rim, Pulmão e garganta.",
        "location": "Inferior à clavícula, 2 cun lateral à linha média, na depressão adjacente ao esterno.",
        "indication": "Tosse crônica, asma, dor de garganta, ansiedade com plenitude torácica.",
        "contraindications": "Evitar puntura profunda; risco de perfuração pulmonar.",
        "functions": "Une o Qi do Rim e Pulmão, alivia tosse e acalma o Shen." 
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
        if code in ki_data:
            data = ki_data[code]
            row['description'] = data['description']
            row['location'] = data['location']
            row['indication'] = data['indication']
            row['contraindications'] = data['contraindications'] or "Nenhuma contraindicação específica."
            row['functions'] = data['functions']
            updated_count += 1
        writer.writerow(row)

os.replace(temp_file_path, csv_file_path)
print(f"Updated {updated_count} rows in {csv_file_path}")
