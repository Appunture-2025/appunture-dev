import csv
import os

lr_data = {
    "LR-1": {
        "description": "Dadun, ponto Jing-Poço (Madeira) e ponto de reanimação do meridiano do Fígado.",
        "location": "No lado lateral do hálux, 0,1 cun posterior ao canto da unha.",
        "indication": "Choque, hemorragia uterina súbita, retenção urinária, dor genital.",
        "contraindications": "Sangria profunda deve ser evitada em pacientes com distúrbios de coagulação.",
        "functions": "Revive a consciência, regula o Qi do Fígado e esfria calor do aquecedor inferior." 
    },
    "LR-2": {
        "description": "Xingjian, ponto Ying-Manancial (Fogo) que dispersa calor do Fígado.",
        "location": "No dorso do pé, entre o 1º e 2º dedos, 0,5 cun proximal à membrana interdigital.",
        "indication": "Irritabilidade, cefaleia temporal, olhos vermelhos, menstruação dolorosa por calor, priapismo.",
        "contraindications": "Evitar puntura profunda em tecido inflamado.",
        "functions": "Limpa fogo do Fígado, acalma vento interno e regula o ciclo menstrual." 
    },
    "LR-3": {
        "description": "Taichong, ponto Shu-Transporte (Terra) e Yuan-Fonte do Fígado.",
        "location": "No dorso do pé, na depressão entre os 1º e 2º metatarsos, anterior à junção das cabeças ósseas.",
        "indication": "Cefaleia, hipertensão, ansiedade, dismenorreia, dor hipocondríaca, dorsalgia lombar.",
        "contraindications": "Nenhuma específica além de cuidado com gravidez no início (estímulo forte pode mover Qi).",
        "functions": "Disperse estagnação de Qi, nutre Sangue do Fígado e harmoniza o Baço." 
    },
    "LR-4": {
        "description": "Zhongfeng, ponto Jing-Rio (Metal) do canal.",
        "location": "Anterior ao maléolo medial, na depressão medial ao tendão tibial anterior.",
        "indication": "Dor nos tornozelos, micção difícil, priapismo, menstruação irregular.",
        "contraindications": "Evitar atingir vasos dorsais do pé.",
        "functions": "Regula Qi do aquecedor inferior, beneficia genital e estabiliza urina." 
    },
    "LR-5": {
        "description": "Ligou, ponto Luo-Conexão que equilibra emoções do Fígado.",
        "location": "5 cun acima do maléolo medial, posterior à borda medial da tíbia.",
        "indication": "Corrimentos, gonorreia, prurido genital, ansiedade, dor hipocondríaca.",
        "contraindications": "Inserção profunda pode atingir o nervo safeno; manter oblíqua leve.",
        "functions": "Harmoniza o Qi do Fígado, regula os genitais e estabiliza emoções." 
    },
    "LR-6": {
        "description": "Zhongdu, ponto Xi-Cleft do canal.",
        "location": "7 cun acima do maléolo medial, na superfície medial da perna, anterior ao músculo gastrocnêmio.",
        "indication": "Dor aguda e distensão hipogástrica, diarreia aquosa, menstruação dolorosa.",
        "contraindications": "Evitar vasos superficiais.",
        "functions": "Move Qi e Sangue rapidamente, alivia dor aguda e regula o intestino grosso." 
    },
    "LR-7": {
        "description": "Xiguan, ponto que libera a articulação do joelho medial.",
        "location": "1 cun posterior ao epicôndilo medial do fêmur, no bordo medial da tíbia.",
        "indication": "Dor no joelho, contratura da coxa, dor lombar.",
        "contraindications": "Nenhuma específica; inserir paralelamente ao osso.",
        "functions": "Desbloqueia tendões, elimina vento-umidade e fortalece joelho e coxa." 
    },
    "LR-8": {
        "description": "Ququan, ponto He-Mar (Água) e tonificador de Sangue do Fígado.",
        "location": "Na extremidade medial da dobra poplítea, anterior aos tendões semimembranoso e semitendinoso.",
        "indication": "Menstruação irregular, infertilidade, dor genital, cólicas, dor no joelho.",
        "contraindications": "Evitar vasos poplíteos.",
        "functions": "Nutre Sangue e Yin do Fígado, beneficia útero e alivia dor do joelho." 
    },
    "LR-9": {
        "description": "Yinbao, ponto que relaxa o músculo adutor e harmoniza o aquecedor inferior.",
        "location": "4 cun acima de LR-8, entre o músculo vasto medial e o adutor longo.",
        "indication": "Dor na coxa, leucorreia, cólicas uterinas.",
        "contraindications": "Inserção profunda medial pode atingir vasos femorais; manter direção posterior.",
        "functions": "Regula o Qi do Fígado, fortalece os tendões e alivia dor uterina." 
    },
    "LR-10": {
        "description": "Zuwuli, ponto que equilibra Yin e Yang nos genitais.",
        "location": "3 cun abaixo de LR-11, na face medial da coxa, anterior ao músculo adutor longo.",
        "indication": "Prurido genital, impotência, leucorreia, dor abdominal inferior.",
        "contraindications": "Cuidado com vasos femorais.",
        "functions": "Expulsa calor-umidade da região genital e regula a menstruação." 
    },
    "LR-11": {
        "description": "Yinlian, ponto que reduz calor da região inguinal.",
        "location": "2 cun abaixo do ligamento inguinal, medial ao músculo sartório.",
        "indication": "Hérnia, dor abdominal baixa, infertilidade, prurido genital.",
        "contraindications": "Evitar punctura profunda na região femoral.",
        "functions": "Dissipa calor-umidade, trata hérnia e regula o Qi do Fígado na virilha." 
    },
    "LR-12": {
        "description": "Jimai, ponto que combina Fígado e Baço no triângulo femoral.",
        "location": "1 cun inferior ao ligamento inguinal e 2,5 cun lateral à linha média, na depressão lateral ao vaso femoral.",
        "indication": "Hérnia, dor testicular, dificuldade urinária, dor abdominal.",
        "contraindications": "Grande vaso femoral passa adjacente; usar inserção superficial lateral.",
        "functions": "Regula o Qi do Fígado, move umidade e controla dor genital." 
    },
    "LR-13": {
        "description": "Zhangmen, ponto Mo frontal do Baço e ponto de reunião dos Zang.",
        "location": "Ponta livre da 11ª costela, na borda lateral do abdome.",
        "indication": "Dor hipocondríaca, distensão abdominal, vômito, diarreia, depressão.",
        "contraindications": "Perigo de lesão do baço; inserir oblíqua paralela ao rebordo costal.",
        "functions": "Regula Baço e Fígado, harmoniza os Zang e alivia dor hipocondríaca." 
    },
    "LR-14": {
        "description": "Qimen, ponto Mo frontal do Fígado e ponto de encontro com canais Yin Wei e SP.",
        "location": "No 6º espaço intercostal, diretamente abaixo do mamilo, 4 cun lateral à linha média.",
        "indication": "Dor costal, distensão torácica, depressão, mastite, náusea.",
        "contraindications": "Risco de pneumotórax; inserir oblíqua.",
        "functions": "Distribui o Qi do Fígado, harmoniza o Estômago e alivia plenitude torácica." 
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
        if code in lr_data:
            data = lr_data[code]
            row['description'] = data['description']
            row['location'] = data['location']
            row['indication'] = data['indication']
            row['contraindications'] = data['contraindications'] or "Nenhuma contraindicação específica."
            row['functions'] = data['functions']
            updated_count += 1
        writer.writerow(row)

os.replace(temp_file_path, csv_file_path)
print(f"Updated {updated_count} rows in {csv_file_path}")
