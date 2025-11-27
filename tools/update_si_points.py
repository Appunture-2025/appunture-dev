import csv
import os

# Dados clínicos em PT-BR para os pontos do meridiano do Intestino Delgado (SI-1 a SI-19)
si_data = {
    "SI-1": {
        "description": "Shaoze, ponto Jing-Poço e Metal que libera calor perverso e desperta a lactação.",
        "location": "0,1 cun posterior ao canto ulnar da unha do dedo mínimo.",
        "indication": "Lactação insuficiente, mastite inicial, febre alta com delírio, perda súbita de consciência, dor na borda cubital da mão.",
        "contraindications": "Sangria profunda contraindicada em pacientes anticoagulados; usar punção leve.",
        "functions": "Remove calor extremo, abre os orifícios sensoriais e estimula a descida do leite."
    },
    "SI-2": {
        "description": "Qiangu, ponto Ying-Manancial (Água) que clareia calor do canal e beneficia garganta e olhos.",
        "location": "Na borda ulnar do dedo mínimo, na depressão distal à articulação metacarpofalângica.",
        "indication": "Dor e edema na borda cubital da mão, distúrbios febris, dor de garganta, visão turva.",
        "contraindications": "Nenhuma específica além de evitar inserção muito profunda em articulações inflamadas.",
        "functions": "Dispersa calor e vento, reduz edema local e lubrifica garganta e olhos."
    },
    "SI-3": {
        "description": "Houxi, ponto Shu-Riacho (Madeira) e ponto de abertura do Du Mai, útil para coluna e cabeça.",
        "location": "Na borda ulnar da mão, proximal à cabeça do quinto metacarpo, na transição de pele clara e escura.",
        "indication": "Cervicalgia, rigidez da nuca, dor lombar irradiada, epilepsia, febres noturnas, distúrbios da orelha.",
        "contraindications": "Evitar agulhamento agressivo em tendinite aguda do extensor ulnar.",
        "functions": "Move o Du Mai, relaxa a coluna, expulsa vento-calor e beneficia a orelha e os olhos."
    },
    "SI-4": {
        "description": "Wangu, ponto Yuan-Fonte do canal, indicado para distúrbios do punho e metabolismo de fluídos.",
        "location": "Na face ulnar do punho, na depressão entre o osso piramidal e a base do quinto metacarpo.",
        "indication": "Dor no punho, artrite cubital, icterícia leve, rigidez dos dedos, edema dos membros superiores.",
        "contraindications": "Inserção profunda pode irritar o nervo ulnar superficial; manter agulha oblíqua.",
        "functions": "Tonifica e regula o canal, drena umidade-calor e estabiliza o punho."
    },
    "SI-5": {
        "description": "Yanggu, ponto Jing-Rio (Fogo) que dispersa calor do coração e clareia os sentidos.",
        "location": "Na face dorsal do punho, na depressão entre o processo estilóide da ulna e o osso piramidal.",
        "indication": "Dor no punho, febre com delírio, rigidez da mandíbula, dor no ouvido, surtos de ansiedade.",
        "contraindications": "Cuidado com articulações hiperextensas; usar ângulo suave para evitar desconforto.",
        "functions": "Limpa calor do Coração e Intestino Delgado, acalma o Shen e alivia dor articular."
    },
    "SI-6": {
        "description": "Yanglao, ponto Xi-Cleft que libera a dor aguda do ombro e melhora a visão.",
        "location": "Na face dorsal da ulna, em uma fenda acima do processo estilóide, quando a palma está voltada para o peito.",
        "indication": "Dor aguda no ombro, lombalgia súbita, visão turva ligada a deficiência de Yin, rigidez do pescoço.",
        "contraindications": "Inserção profunda pode atingir o tendão do extensor; manter profundidade moderada.",
        "functions": "Relaxar tendões, tonificar o envelhecimento do olho e dispersar estagnação dolorosa."
    },
    "SI-7": {
        "description": "Zhizheng, ponto Luo-Conexão que harmoniza o Coração e acalma a mente.",
        "location": "5 cun proximal a SI-5, na linha entre SI-5 e SI-8, sobre a borda ulnar posterior do antebraço.",
        "indication": "Ansiedade, palpitações, agitação mental, dor no cotovelo e antebraço, rigidez cervical.",
        "contraindications": "Evitar agulhamento profundo medial que possa atingir o nervo ulnar.",
        "functions": "Conecta Coração e Intestino Delgado, estabiliza o Shen e relaxa o trajeto do canal."
    },
    "SI-8": {
        "description": "Xiaohai, ponto He-Mar (Terra) que drena calor e dissolve nódulos do cotovelo.",
        "location": "Na depressão entre o olécrano da ulna e o epicôndilo medial do úmero, com o cotovelo flexionado.",
        "indication": "Inchaço e dor no cotovelo, tremor do membro superior, epilepsia, linfadenite submandibular.",
        "contraindications": "Proteger o nervo ulnar; agulhar levemente lateral ou proximal.",
        "functions": "Alivia calor-toxina, desbloqueia o canal e reduz nódulos linfáticos."
    },
    "SI-9": {
        "description": "Jianzhen, ponto que libera o ombro posterior e melhora a circulação do membro superior.",
        "location": "Na face posterior do ombro, 1 cun superior a SI-10, na depressão inferior à espinha da escápula.",
        "indication": "Dor ou parestesia do ombro, limitação de abdução, bursite, dor irradiada para o braço.",
        "contraindications": "Evitar agulhamento excessivamente medial para não irritar o nervo axilar.",
        "functions": "Dissipa vento-umidade, mobiliza o ombro e abre o canal para circulação de Qi e Sangue."
    },
    "SI-10": {
        "description": "Naoshu, ponto de encontro com Yang Qiao e Yang Wei que trata ombro crônico.",
        "location": "Posterior ao ombro, na mesma linha de LI-15, na depressão inferior à espinha da escápula e posterior à cabeça do úmero.",
        "indication": "Dor crônica no ombro, rigidez pós-AVC, fraqueza do membro superior, bursite.",
        "contraindications": "Inserção profunda superior pode atingir a cavidade articular; usar direção tangencial.",
        "functions": "Fortalece o ombro, dispersa vento frio acumulado e harmoniza os vasos Yang da cintura escapular."
    },
    "SI-11": {
        "description": "Tianzong, ponto de encontro dos canais Yang do braço que libera a escápula.",
        "location": "Na fossa infratespinal, no terço médio entre a borda inferior da escápula e sua espinha.",
        "indication": "Dor escapular, mastite, lactação insuficiente, dor intercostal, dor torácica posterior.",
        "contraindications": "Cuidado com pneumotórax em pacientes muito magros; manter agulha oblíqua superficial.",
        "functions": "Afrouxa musculatura da escápula, libera leite estagnado e harmoniza Qi torácico posterior."
    },
    "SI-12": {
        "description": "Bingfeng, ponto que dispersa vento patogênico acumulado no gradil escapular.",
        "location": "Na fossa supraspinhal, no centro da depressão acima da espinha da escápula.",
        "indication": "Dor no ombro superior, rigidez cervical, inflamação muscular por vento-frio, asma leve.",
        "contraindications": "Evitar inserção profunda em direção medial para não perfurar o ápice pulmonar.",
        "functions": "Expulsa vento e calor, relaxa a cintura escapular e auxilia a respiração superficial."
    },
    "SI-13": {
        "description": "Quyuan, ponto que conecta ombro e coluna torácica alta.",
        "location": "No ângulo superomedial da escápula, na metade do caminho entre SI-10 e a coluna vertebral.",
        "indication": "Dor no ombro medial, rigidez superior das costas, tensão trapézio-superior.",
        "contraindications": "Agulhamento profundo medial pode alcançar a pleura; usar direção lateral.",
        "functions": "Relaxa o trapézio, desobstrui o canal e acalma dor que sobe ao pescoço."
    },
    "SI-14": {
        "description": "Jianwaishu, ponto paravertebral que trata dor crônica do pescoço e ombro.",
        "location": "3 cun lateral ao processo espinhoso de T1 (GV-13), na borda medial da escápula.",
        "indication": "Rigidez crônica do pescoço, dor interescapular, tosse por tensão muscular.",
        "contraindications": "Evitar inserção profunda perpendicular devido ao risco de pneumotórax.",
        "functions": "Desbloqueia os canais Taiyang, relaxa o trapézio e alivia dor de peito superior."
    },
    "SI-15": {
        "description": "Jianzhongshu, ponto paravertebral que libera a região cervical e auxilia respiração.",
        "location": "2 cun lateral ao processo espinhoso de C7 (GV-14).",
        "indication": "Dor cervical, tosse crônica, dispneia leve por tensão muscular, formigamento no braço.",
        "contraindications": "Inserção profunda é contraindicado (risco pulmonar); usar direção medial superficial.",
        "functions": "Dissipa vento-frio da região cervical, relaxa musculatura paravertebral e beneficia o Qi do Pulmão."
    },
    "SI-16": {
        "description": "Tianchuang, ponto Janela do Céu que regula a cabeça e os órgãos dos sentidos.",
        "location": "Na face lateral do pescoço, posterior ao músculo esternocleidomastoideo, alinhado com o pomo de Adão.",
        "indication": "Dor de garganta, rouquidão, distúrbios de fala, zumbido, hipertensão leve por ascensão de Yang.",
        "contraindications": "Cuidado com a artéria carótida e veia jugular; agulha deve ser oblíqua posterior.",
        "functions": "Libera o Qi ascendente, clareia os sentidos, acalma o Shen e reduz pressão cervical." 
    },
    "SI-17": {
        "description": "Tianrong, ponto Janela do Céu que limpa calor tóxico da garganta e glândulas.",
        "location": "Posterior ao ângulo da mandíbula, na depressão anterior ao músculo esternocleidomastoideo.",
        "indication": "Inflamação das glândulas submandibulares, dor de garganta intensa, zumbido, adenite.",
        "contraindications": "Risco vascular importante; utilizar punção suave oblíqua para evitar a carótida.",
        "functions": "Dissipa calor-toxina, desobstrui garganta e beneficia audição."
    },
    "SI-18": {
        "description": "Quanliao, ponto que trata paralisias faciais e estagnação no malar.",
        "location": "Directamente abaixo do canto externo do olho, ao nível do bordo inferior do osso zigomático, na depressão do forame infraorbital.",
        "indication": "Paralisia facial, tiques faciais, sinusite maxilar, dor de dente superior.",
        "contraindications": "Evitar puntura profunda para não lesar o nervo infraorbital; usar inserção oblíqua suave.",
        "functions": "Dispersa vento da face, desbloqueia o canal Yangming e reduz dor local."
    },
    "SI-19": {
        "description": "Tinggong, ponto de encontro dos canais SI, SJ e GB que beneficia audição.",
        "location": "Anterior à orelha, na depressão entre o trago e o côndilo da mandíbula, com a boca levemente aberta.",
        "indication": "Zumbido, surdez, otalgia, trismo, paralisia facial periférica.",
        "contraindications": "Inserção com a boca fechada pode comprimir a agulha; manter o paciente com a boca semiaberta.",
        "functions": "Abre os orifícios auditivos, dispersa vento-calor da face e harmoniza a articulação temporomandibular."
    },
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
        if code in si_data:
            data = si_data[code]
            row['description'] = data['description']
            row['location'] = data['location']
            row['indication'] = data['indication']
            row['contraindications'] = data['contraindications'] or "Nenhuma contraindicação específica."
            row['functions'] = data['functions']
            updated_count += 1
        writer.writerow(row)

os.replace(temp_file_path, csv_file_path)
print(f"Updated {updated_count} rows in {csv_file_path}")
