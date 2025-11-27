import csv
import os

te_data = {
    "TE-1": {
        "description": "Guanchong, ponto Jing-Poço (Metal) que dispersa calor do Triplo Aquecedor e desperta consciência.",
        "location": "0,1 cun posterior ao canto ulnar da unha do dedo anelar.",
        "indication": "Zumbido agudo, dor de garganta, febre alta, perda súbita de consciência, inchaço nos dedos.",
        "contraindications": "Sangria intensa contraindica-se em pacientes com distúrbios hemorrágicos.",
        "functions": "Purge calor extremo, libera os canais superiores e abre os orifícios sensoriais."
    },
    "TE-2": {
        "description": "Yemen, ponto Ying-Manancial (Água) que limpa calor em orelhas e garganta.",
        "location": "Entre o 4º e 5º dedos, na depressão distal à articulação metacarpofalângica, no dorso da mão.",
        "indication": "Dor de ouvido, garganta seca, constipação por calor, dor no ombro e braços.",
        "contraindications": "Evitar punctura profunda direta sobre articulações inflamadas.",
        "functions": "Reduz calor do canal Shaoyang, beneficia os ouvidos e diminui dor local."
    },
    "TE-3": {
        "description": "Zhongzhu, ponto Shu-Riacho (Madeira) e Shu Antigo do canal.",
        "location": "No dorso da mão, na depressão proximal às cabeças do 4º e 5º metacarpos.",
        "indication": "Zumbido crônico, cefaleia temporal, rigidez cervical, dor nos dedos e mãos.",
        "contraindications": "Nenhuma específica além de técnica suave em artrites.",
        "functions": "Libera o canal Shaoyang, remove obstrução nos ouvidos e relaxa o pescoço."
    },
    "TE-4": {
        "description": "Yangchi, ponto Yuan-Fonte que regula a função do Triplo Aquecedor.",
        "location": "Na prega dorsal do punho, na depressão entre os tendões do extensor ulnar e extensor do 5º dedo.",
        "indication": "Edema nos membros, dor no punho, febres alternadas, diabetes com sede intensa.",
        "contraindications": "Evitar agulhamento profundo em articulações artríticas; usar inserção oblíqua.",
        "functions": "Harmoniza os três aquecedores, mobiliza fluídos e limpa calor."
    },
    "TE-5": {
        "description": "Waiguan, ponto Luo e abertura do Yang Wei Mai, essencial para febres externas e dor em ombro.",
        "location": "2 cun proximal a TE-4, entre o rádio e a ulna, no dorso do antebraço.",
        "indication": "Febre com calafrios, rigidez cervical, dor no ombro, surdez, parestesia no membro superior.",
        "contraindications": "Inserção profunda medial pode atingir o nervo interósseo posterior; manter ângulo superficial.",
        "functions": "Libera o exterior, abre o Yang Wei Mai, beneficia a cabeça e regula o Qi defensivo." 
    },
    "TE-6": {
        "description": "Zhigou, ponto Jing-Rio (Fogo) que move o Qi dos três aquecedores.",
        "location": "3 cun proximal a TE-4, entre o rádio e a ulna, na linha do antebraço.",
        "indication": "Constipação por calor, hipocondralgia, náusea, vômito, dor no ombro e dor lateral do corpo.",
        "contraindications": "Nenhuma específica além de cuidado com nervo interósseo; inserir paralelo aos ossos.",
        "functions": "Desce o Qi rebelde, regula intestinos, move Qi do Shaoyang e beneficia o tórax." 
    },
    "TE-7": {
        "description": "Huizong, ponto Xi-Cleft do canal.",
        "location": "3 cun proximal a TE-4 e 1 cun lateral a TE-6, no lado ulnar posterior do antebraço.",
        "indication": "Dor aguda no ouvido, epilepsia, dor subcostal, espasmo no antebraço.",
        "contraindications": "Inserção profunda lateral pode atingir o nervo ulnar; aplicar oblíqua leve.",
        "functions": "Libera o canal Shaoyang, alivia dor aguda e harmoniza o Qi."
    },
    "TE-8": {
        "description": "Sanyangluo, ponto de cruzamento dos três Yang do braço.",
        "location": "4 cun proximal a TE-4, entre rádio e ulna, na face posterior do antebraço.",
        "indication": "Dor no antebraço, parestesia nas mãos, dor cervical que irradia ao braço.",
        "contraindications": "Evitar agulhamento profundo em neuropatias; usar inserção superficial.",
        "functions": "Desbloqueia todos os canais Yang do braço e regulariza o Qi defensivo."
    },
    "TE-9": {
        "description": "Sidu, ponto que remove bloqueios do úmero.",
        "location": "7 cun proximal a TE-4, na linha entre TE-4 e TE-10, posterior ao rádio.",
        "indication": "Dor no ombro, epicondilite lateral, neuralgia do úmero.",
        "contraindications": "Nenhuma específica, apenas cuidado com veias superficiais.",
        "functions": "Dissipa estagnação no antebraço e ativa o canal Shaoyang." 
    },
    "TE-10": {
        "description": "Tianjing, ponto He-Mar (Terra) localizado sobre o olécrano.",
        "location": "1 cun superior ao olécrano quando o cotovelo está flexionado, na depressão do tríceps.",
        "indication": "Inchaço e dor no cotovelo, tremores de mão, adenite submandibular, cefaleia temporal.",
        "contraindications": "Inserção profunda medial pode irritar o nervo ulnar; usar ângulo posterior.",
        "functions": "Transforma fleuma, harmoniza o Shaoyang e dispersa nódulos." 
    },
    "TE-11": {
        "description": "Qinglengyuan, ponto que elimina calor e relaxa o tríceps.",
        "location": "1 cun superior a TE-10, na borda posterior do úmero.",
        "indication": "Tendinite do tríceps, dor no ombro e pescoço, placas cutâneas com prurido.",
        "contraindications": "Evitar punção profunda anterior para não atingir o nervo radial.",
        "functions": "Dispersa calor-toxina, relaxa musculatura posterior do braço e alivia coceira." 
    },
    "TE-12": {
        "description": "Xiaoluo, ponto que abre o canal no braço posterior.",
        "location": "4 cun proximal a TE-10, entre a cabeça longa e lateral do tríceps.",
        "indication": "Dor no braço posterior, parestesia pós-AVC, contratura.",
        "contraindications": "Inserção profunda lateral pode atingir o nervo radial; agulhar paralelamente.",
        "functions": "Relaxar tendões, remover obstrução e melhorar a condução nervosa." 
    },
    "TE-13": {
        "description": "Naohui, ponto de encontro com o canal do Yang Wei Mai.",
        "location": "Posterior ao ângulo acromial, na depressão entre a clavícula e a escápula quando o braço está abduzido.",
        "indication": "Dor crônica no ombro, rigidez da nuca, linfadenite cervical.",
        "contraindications": "Evitar inserção profunda medial devido ao risco de pneumotórax.",
        "functions": "Libera o ombro, mobiliza o Yang Wei e dispersa nódulos linfáticos." 
    },
    "TE-14": {
        "description": "Jianliao, ponto que solta a articulação glenoumeral.",
        "location": "Posterior e inferior ao acrômio, na depressão formada com o braço abduzido.",
        "indication": "Capsulite adesiva, limitação de abdução, dor pós-trauma no ombro.",
        "contraindications": "Agulhamento superior profundo pode penetrar na cavidade articular; usar sentido tangencial.",
        "functions": "Dispersa vento-umidade, libera o ombro e ativa o canal." 
    },
    "TE-15": {
        "description": "Tianliao, ponto Janela do Céu auxiliar que relaxa a região cervicoescapular.",
        "location": "Meio da linha entre GB-21 e SI-13, 2 cun acima do ângulo superior da escápula.",
        "indication": "Dor cervical, rigidez do trapézio, tosse com sensação de plenitude torácica.",
        "contraindications": "Inserção profunda inferior é contraindicada por risco de pneumotórax.",
        "functions": "Abre o tórax superior, relaxa o trapézio e regula o Qi ascendente." 
    },
    "TE-16": {
        "description": "Tianchiang, ponto Janela do Céu que regula a cabeça e os sentidos.",
        "location": "Na face posterior do pescoço, diretamente abaixo de GB-12, posterior ao músculo esternocleidomastoideo.",
        "indication": "Zumbido, dor de cabeça, turvação visual, hipertensão leve, dor no pescoço.",
        "contraindications": "Cuidado com artéria carótida e veia jugular; inserção deve ser oblíqua posterior.",
        "functions": "Desce o Qi rebelde, beneficia a cabeça e acalma o Shen." 
    },
    "TE-17": {
        "description": "Yifeng, ponto essencial para ouvidos e ATM.",
        "location": "Posterior ao lóbulo da orelha, na depressão entre o processo mastoide e a mandíbula.",
        "indication": "Zumbido, surdez, otorreia, paralisia facial, dor mandibular.",
        "contraindications": "Evitar direção posterior profunda para não atingir a artéria carótida externa.",
        "functions": "Desbloqueia os orifícios auditivos, relaxa a articulação temporomandibular e remove vento externo." 
    },
    "TE-18": {
        "description": "Qimai, ponto que dispersa vento na região retroauricular.",
        "location": "Na linha curva superior ao redor da orelha, no terço superior entre TE-17 e TE-20.",
        "indication": "Dor retroauricular, dor de cabeça temporal, zumbido.",
        "contraindications": "Inserção profunda pode atingir o crânio; usar agulha subcutânea.",
        "functions": "Expulsa vento e alivia dor local." 
    },
    "TE-19": {
        "description": "Luxi, ponto que acalma cólicas infantis e dor temporal.",
        "location": "No sulco retroauricular, ao nível do ápice da orelha, 1/3 acima e 2/3 abaixo entre TE-17 e TE-20.",
        "indication": "Zumbido, dor de ouvido, convulsões infantis, cefaleia temporal.",
        "contraindications": "Evitar moxibustão forte em crianças.",
        "functions": "Acalma vento interno, alivia dor temporal e beneficia audição." 
    },
    "TE-20": {
        "description": "Jiaosun, ponto que ventila o calor da cabeça.",
        "location": "Acima da orelha, onde o ápice toca o couro cabeludo quando dobrada para frente.",
        "indication": "Dor de ouvido, rubor facial, dor de dente superior, vertigem.",
        "contraindications": "Inserção profunda no couro cabeludo não é necessária; usar subcutânea.",
        "functions": "Dispersa vento-calor da cabeça, beneficia ouvidos e olhos." 
    },
    "TE-21": {
        "description": "Ermen, ponto de encontro com o canal SI que abre o meato auditivo.",
        "location": "Anterior à orelha, na depressão formada ao fechar a boca, superior a SI-19.",
        "indication": "Surdez, zumbido, otalgia, trismo, paralisia facial.",
        "contraindications": "Evitar agulhar com a boca aberta em excesso, pois pode prender a agulha quando fechar.",
        "functions": "Desobstrui o ouvido, reduz dor e sincroniza o movimento da articulação temporomandibular." 
    },
    "TE-22": {
        "description": "Erheliao, ponto que reduz edema da face e dispersa vento.",
        "location": "Anterior à orelha, nível superior do arco zigomático, na depressão quando a boca está aberta.",
        "indication": "Edema facial, dor orbital, trismo, neuralgia trigeminal.",
        "contraindications": "Evitar agulhamento profundo devido à proximidade da artéria temporal superficial.",
        "functions": "Dispersa vento da face, alivia dor e reduz edema."
    },
    "TE-23": {
        "description": "Sizhukong, ponto que beneficia olhos e sobrancelhas.",
        "location": "Na extremidade lateral da sobrancelha, na depressão óssea do processo frontal.",
        "indication": "Dor ocular, ptose, blefaroespasmo, cefaleia temporal.",
        "contraindications": "Inserir superficialmente para proteger o globo ocular.",
        "functions": "Expulsa vento, clareia os olhos e relaxa os músculos perioculares." 
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
        if code in te_data:
            data = te_data[code]
            row['description'] = data['description']
            row['location'] = data['location']
            row['indication'] = data['indication']
            row['contraindications'] = data['contraindications'] or "Nenhuma contraindicação específica."
            row['functions'] = data['functions']
            updated_count += 1
        writer.writerow(row)

os.replace(temp_file_path, csv_file_path)
print(f"Updated {updated_count} rows in {csv_file_path}")
