import csv
import os

# Dados em PT-BR para o meridiano da Vesícula Biliar (GB-1 a GB-44)
gb_data = {
    "GB-1": {
        "description": "Tongziliao, ponto de encontro dos canais GB, SI e SJ que clareia a visão.",
        "location": "0,5 cun lateral ao canto externo do olho, na depressão lateral da órbita.",
        "indication": "Cefaleia temporal, olhos vermelhos, lacrimejamento ao vento, paralisia facial.",
        "contraindications": "Inserir superficialmente para proteger o globo ocular.",
        "functions": "Expulsa vento-calor da cabeça e beneficia os olhos." 
    },
    "GB-2": {
        "description": "Tinghui, ponto que abre o meato auditivo.",
        "location": "Anterior ao trago, na depressão entre o processo condilar da mandíbula e o arco zigomático, com a boca aberta.",
        "indication": "Zumbido, surdez, otalgia, disfunção temporomandibular.",
        "contraindications": "Inserir com a boca levemente aberta para evitar prender a agulha.",
        "functions": "Desobstrui os ouvidos, reduz dor na articulação temporomandibular e elimina vento." 
    },
    "GB-3": {
        "description": "Shangguan, ponto que combina canais GB e SJ para tratar a face lateral.",
        "location": "Na fronte temporal, no ponto médio entre o arco zigomático e a linha do cabelo, diretamente acima do condilo mandibular.",
        "indication": "Dor de dente, paralisia facial, zumbido, cefaleia temporal.",
        "contraindications": "Evitar manipulação agressiva em pacientes com ATM inflamada.",
        "functions": "Dispersa vento da face, alivia dor temporal e beneficia o ouvido." 
    },
    "GB-4": {
        "description": "Hanyan, ponto complementado por ST e SJ para dores temporais.",
        "location": "Na linha do cabelo temporal, 0,5 cun anterior a ST-8 e acima de GB-3.",
        "indication": "Cefaleia lateral, vertigem, ataques epilépticos leves.",
        "contraindications": "Inserção subcutânea; evitar perfurar o periósteo.",
        "functions": "Expulsa vento, limpa calor e acalma convulsões leves." 
    },
    "GB-5": {
        "description": "Xuanlu, ponto que seda dor ocular e cefaleia.",
        "location": "Na linha temporal do cabelo, 0,5 cun posterior a GB-4.",
        "indication": "Dor de cabeça lateral, distúrbios oculares, dor na mandíbula.",
        "contraindications": "Inserir superficialmente.",
        "functions": "Dissipa vento-calor e alivia dor temporal." 
    },
    "GB-6": {
        "description": "Xuanli, continuação da série de pontos temporais da VB.",
        "location": "No mesmo nível que ST-8, 1,5 cun superior ao ápice da orelha.",
        "indication": "Cefaleia unilateral, dor de dente superior, convulsões infantis.",
        "contraindications": "Usar inserção subcutânea para proteger o periósteo.",
        "functions": "Expulsa vento, beneficia olhos e acalma convulsões." 
    },
    "GB-7": {
        "description": "Qubin, ponto que drena calor do canal Shaoyang.",
        "location": "Posterior e superior à orelha, 1 cun anterior a SJ-20.",
        "indication": "Dor temporal, zumbido, convulsões infantis.",
        "contraindications": "Inserção superficial apenas.",
        "functions": "Dissipa vento, reduz calor e acalma o Shen." 
    },
    "GB-8": {
        "description": "Shuaigu, ponto clássico para cefaleia por álcool e vertigem.",
        "location": "1,5 cun superior ao ápice da orelha, na linha curva da cabeça.",
        "indication": "Cefaleia lateral, náusea por abuso de álcool, tontura.",
        "contraindications": "Inserção subcutânea para evitar hematomas.",
        "functions": "Dissipa vento, transforma fleuma e alivia náusea." 
    },
    "GB-9": {
        "description": "Tianchong, ponto que harmoniza a região posterior da orelha.",
        "location": "Posterior e superior à orelha, 0,5 cun posterior a GB-8.",
        "indication": "Cefaleia, convulsões, dor retroauricular.",
        "contraindications": "Inserir superficialmente.",
        "functions": "Expulsa vento e alivia dor local." 
    },
    "GB-10": {
        "description": "Fubai, ponto para cefaleias que irradiam à nuca.",
        "location": "Posterior à orelha, em linha com GB-9, um terço da distância entre GB-9 e GB-12.",
        "indication": "Dor de cabeça, rigidez cervical, zumbido.",
        "contraindications": "Inserção superficial.",
        "functions": "Dissipa vento, clareia os sentidos e relaxa a nuca." 
    },
    "GB-11": {
        "description": "Touqiaoyin, ponto que regula o Shaoyang da cabeça.",
        "location": "Na linha posterior da orelha, ao nível do ápice, dois terços da distância entre GB-9 e GB-12.",
        "indication": "Zumbido, dor de ouvido, cefaleia lateral.",
        "contraindications": "Inserir superficialmente para evitar hematomas.",
        "functions": "Libera Shaoyang, alivia dor auricular e harmoniza o ouvido interno." 
    },
    "GB-12": {
        "description": "Wangu, ponto de encontro com SJ que relaxa occipital e mastoide.",
        "location": "Na depressão posterior ao processo mastoide, abaixo de SJ-17.",
        "indication": "Insônia, zumbido, paralisia facial, dor occipital.",
        "contraindications": "Inserção profunda posterior pode atingir nervo acessório; preferir oblíqua inferior.",
        "functions": "Acalma o Shen, expulsa vento e relaxa o occipital." 
    },
    "GB-13": {
        "description": "Benshen, ponto que ancora o espírito e trata transtornos emocionais.",
        "location": "0,5 cun dentro da linha anterior do cabelo, 3 cun lateral a GV-24.",
        "indication": "Ansiedade, epilepsia, vertigem, cefaleia frontal.",
        "contraindications": "Inserção subcutânea.",
        "functions": "Acalma o Shen, dispersa vento e clareia a cabeça." 
    },
    "GB-14": {
        "description": "Yangbai, ponto local para problemas oculares e ptose.",
        "location": "1 cun acima da sobrancelha, diretamente acima da pupila com olhar reto.",
        "indication": "Blefaroespasmo, paralisia facial, sinusite frontal, cefaleia.",
        "contraindications": "Inserir superficialmente; evitar o osso frontal.",
        "functions": "Clareia olhos, expulsa vento e alivia dor frontal." 
    },
    "GB-15": {
        "description": "Toulinqi, ponto que combina com BL e SJ para dores frontais.",
        "location": "Na linha anterior do cabelo, 1,5 cun lateral a GV-24.",
        "indication": "Lacrimejamento por vento, dor frontal, vertigem.",
        "contraindications": "Inserção subcutânea para evitar vertigem por estímulo forte.",
        "functions": "Expulsa vento, beneficia olhos e estabiliza o Yang ascendente." 
    },
    "GB-16": {
        "description": "Muchuang, ponto que projeta visão e memória.",
        "location": "1,5 cun posterior a GB-15, na linha do cabelo.",
        "indication": "Zumbido, vertigem, congestão nasal, dor occipital.",
        "contraindications": "Inserir superficialmente.",
        "functions": "Dissipa vento, clareia os sentidos e acalma a mente." 
    },
    "GB-17": {
        "description": "Zhengying, ponto para distúrbios emocionais com dor de cabeça.",
        "location": "Um cun posterior a GB-16 ao longo da linha da cabeça.",
        "indication": "Cefaleia crônica, convulsões leves, ansiedade.",
        "contraindications": "Inserir superficialmente.",
        "functions": "Libera o Shaoyang, acalma o Shen e alivia dor." 
    },
    "GB-18": {
        "description": "Chengling, ponto que estabiliza o Yang ascendente.",
        "location": "1,5 cun posterior a GB-17.",
        "indication": "Tontura, dor de cabeça, congestão nasal.",
        "contraindications": "Inserir superficial.",
        "functions": "Abaixa o Yang, alivia dor e clareia nariz." 
    },
    "GB-19": {
        "description": "Naokong, ponto na linha nucal para vento interno.",
        "location": "Na linha occipital, lateral a GV-17.",
        "indication": "Cefaleia occipital, rigidez cervical, convulsões.",
        "contraindications": "Inserir superficial, direção oblíqua inferior.",
        "functions": "Expulsa vento e relaxa a nuca." 
    },
    "GB-20": {
        "description": "Fengchi, ponto Janela do Céu clássico do Shaoyang.",
        "location": "Na depressão entre o esternocleidomastoideo e o trapézio, ao nível de GV-16.",
        "indication": "Cefaleia, vertigem, hipertensão, rigidez cervical, visão borrada.",
        "contraindications": "Dirigir a agulha em direção ao nariz; evitar perfurar artéria vertebral.",
        "functions": "Expulsa vento interno/externo, clareia os sentidos e reduz pressão." 
    },
    "GB-21": {
        "description": "Jianjing, ponto de encontro com SJ e ST para liberar o ombro.",
        "location": "No ombro, ponto médio entre GV-14 e a ponta do acrômio.",
        "indication": "Dor de ombro, rigidez cervical, mastite, dificuldade de parto.",
        "contraindications": "Contraindicado em gravidez (pode induzir parto) e cuidado com pneumotórax.",
        "functions": "Desce Qi rebelde, dispersa vento e relaxa ombro e pescoço." 
    },
    "GB-22": {
        "description": "Yuanye, ponto da parede torácica que move o Qi lateral.",
        "location": "Na linha axilar média, 5º espaço intercostal.",
        "indication": "Plenitude torácica, mastite, dor costal.",
        "contraindications": "Risco de pneumotórax; usar inserção oblíqua.",
        "functions": "Libera o peito, move Qi no hipocôndrio e regula a lactação." 
    },
    "GB-23": {
        "description": "Zhejin, ponto auxiliar para distensão costal.",
        "location": "1 cun anterior a GB-22, no 5º espaço intercostal.",
        "indication": "Dor hipocondríaca, plenitude torácica, asma.",
        "contraindications": "Evitar puntura profunda (risco pulmonar).",
        "functions": "Move Qi, reduz distensão lateral e harmoniza o Pulmão." 
    },
    "GB-24": {
        "description": "Riyue, ponto Mu frontal da Vesícula Biliar.",
        "location": "No 7º espaço intercostal, na linha mamilar, diretamente abaixo de LV-14.",
        "indication": "Colelitíase, náusea, gastrite, dor costal.",
        "contraindications": "Inserir oblíqua para evitar pneumotórax.",
        "functions": "Harmoniza VB e LV, resolve umidade-calor e alivia dor hipocondríaca." 
    },
    "GB-25": {
        "description": "Jingmen, ponto Mu frontal dos Rins.",
        "location": "Na ponta livre da 12ª costela.",
        "indication": "Dor lombar, cólica renal, distensão abdominal.",
        "contraindications": "Inserir oblíqua ao longo da costela para evitar órgãos.",
        "functions": "Tonifica Rim, regula água e alivia dor lombar lateral." 
    },
    "GB-26": {
        "description": "Daimai, ponto chave do Vaso Cintura.",
        "location": "Nivelado com o umbigo, diretamente abaixo do ápice da 11ª costela, na linha lateral do abdome.",
        "indication": "Leucorreia, prolapso uterino, dor lombar lateral.",
        "contraindications": "Aplicar inserção oblíqua; evitar cavidade abdominal profunda.",
        "functions": "Regula o meridiano da cintura, fortalece músculos oblíquos e trata corrimentos." 
    },
    "GB-27": {
        "description": "Wushu, ponto ântero-inferior que ancora o Daimai.",
        "location": "Anterior ao tubérculo ilíaco, 3 cun inferior a GB-26.",
        "indication": "Dor abdominal inferior, hérnia, leucorreia, dor lombar.",
        "contraindications": "Cuidado com cavidade abdominal.",
        "functions": "Regula o Qi da cintura, trata hérnia e estabiliza o útero." 
    },
    "GB-28": {
        "description": "Weidao, ponto que completa a dupla do Daimai.",
        "location": "0,5 cun anterior e inferior a GB-27.",
        "indication": "Dor abdominal inferior, leucorreia, distensão inguinal.",
        "contraindications": "Evitar perfurar vísceras; inserir tangencial.",
        "functions": "Ativa o Daimai, regula útero e aquece o aquecedor inferior." 
    },
    "GB-29": {
        "description": "Juliao, ponto para dores do quadril.",
        "location": "No ponto médio entre a espinha ilíaca anterossuperior e o trocânter maior do fêmur.",
        "indication": "Dor no quadril, lombociatalgia, limitação de movimento.",
        "contraindications": "Inserção profunda pode atingir bursa; usar ângulo moderado.",
        "functions": "Ativa o canal, relaxa o quadril e remove estagnação." 
    },
    "GB-30": {
        "description": "Huantiao, ponto de encontro com BL para ciático.",
        "location": "Na depressão do sulco glúteo, no terço lateral entre o sacro e o trocânter maior.",
        "indication": "Ciatalgia, dor lombar, hemiplegia.",
        "contraindications": "Evitar injeção vascular profunda; direcionar agulha para o nervo ciático com cautela.",
        "functions": "Desobstrui o ciático, relaxa glúteos e elimina vento-umidade." 
    },
    "GB-31": {
        "description": "Fengshi, ponto famoso para pruridos generalizados.",
        "location": "7 cun acima do côndilo lateral do fêmur, onde as pontas dos dedos alcançam com o paciente em pé e braços pendentes.",
        "indication": "Prurido corporal, urticária, dor lateral da coxa.",
        "contraindications": "Inserir perpendicularmente; cuidado com pacientes anticoagulados.",
        "functions": "Expulsa vento-umidade, alivia prurido e relaxa a faixa lateral da coxa." 
    },
    "GB-32": {
        "description": "Zhongdu, ponto intermediário para rigidez da coxa.",
        "location": "2 cun abaixo de GB-31, na linha lateral da coxa.",
        "indication": "Parestesias, limitações de marcha, dor do iliotibial.",
        "contraindications": "Inserir perpendicular superficial.",
        "functions": "Relaxa músculos laterais e dispersa vento-umidade." 
    },
    "GB-33": {
        "description": "Xiyangguan, ponto adjacente ao joelho lateral.",
        "location": "Acima da articulação do joelho, entre o fêmur lateral e o tendão do bíceps femoral.",
        "indication": "Dor no joelho, artrite, rigidez.",
        "contraindications": "Evitar vasos laterais do joelho.",
        "functions": "Desbloqueia o joelho, dispersa vento-frio e alivia dor." 
    },
    "GB-34": {
        "description": "Yanglingquan, ponto He-Mar (Terra) e Mar dos Tendões.",
        "location": "Na depressão anterior e inferior à cabeça do perônio.",
        "indication": "Espasmos musculares, dor hipocondríaca, náusea, vômito, ciatalgia.",
        "contraindications": "Cuidado com nervo fibular comum.",
        "functions": "Harmoniza VB e LV, beneficia tendões e elimina umidade-calor." 
    },
    "GB-35": {
        "description": "Yangjiao, ponto Xi-Cleft do Yang Wei Mai.",
        "location": "7 cun acima do maléolo lateral, na borda posterior da fíbula.",
        "indication": "Dor lateral da perna, paralisia, fraqueza muscular.",
        "contraindications": "Evitar atingir o nervo fibular.",
        "functions": "Fortalece o Yang Wei, alivia dor aguda e estabiliza o Qi lateral." 
    },
    "GB-36": {
        "description": "Waiqiu, ponto Xi-Cleft da VB.",
        "location": "7 cun acima do maléolo lateral, anterior à fíbula.",
        "indication": "Dor aguda abdominal lateral, raiva reprimida, paralisia do membro inferior.",
        "contraindications": "Inserir com cuidado para não irritar o nervo fibular.",
        "functions": "Move o Qi da VB, alivia dor aguda e acalma o Shen." 
    },
    "GB-37": {
        "description": "Guangming, ponto Luo que beneficia os olhos.",
        "location": "5 cun acima do maléolo lateral, anterior à fíbula.",
        "indication": "Olhos secos, visão turva, hipertensão, dor lateral da perna.",
        "contraindications": "Inserção perpendicular moderada.",
        "functions": "Expulsa vento, melhora visão e harmoniza o Shaoyang." 
    },
    "GB-38": {
        "description": "Yangfu, ponto Jing-Rio (Fogo).",
        "location": "4 cun acima do maléolo lateral, anterior à fíbula.",
        "indication": "Dor hipocondríaca, enxaqueca lateral, câimbras nas pernas.",
        "contraindications": "Evitar nervo fibular.",
        "functions": "Dispersa fogo da VB, harmoniza Shaoyang e relaxa tendões." 
    },
    "GB-39": {
        "description": "Xuanzhong, ponto Mar da Medula.",
        "location": "3 cun acima do maléolo lateral, entre a borda posterior da fíbula e o tendão peroneal longo.",
        "indication": "Tontura, dor cervical, osteoporose, fraqueza dos membros inferiores.",
        "contraindications": "Evitar punção profunda diretamente na fíbula.",
        "functions": "Nutre medula óssea, fortalece ossos e move o Qi do Shaoyang." 
    },
    "GB-40": {
        "description": "Qiuxu, ponto Yuan-Fonte da Vesícula Biliar.",
        "location": "Anterior e inferior ao maléolo lateral, na depressão lateral do tendão extensor dos dedos.",
        "indication": "Dor no tornozelo, hemiplegia, dor hipocondríaca, ataques de pânico.",
        "contraindications": "Evitar inserir sobre artéria dorsal do pé.",
        "functions": "Regula Shaoyang, libera o tornozelo e estabiliza decisões emocionais." 
    },
    "GB-41": {
        "description": "Zulinqi, ponto Shu-Riacho (Madeira) e abertura do Dai Mai.",
        "location": "Na depressão distal às junções dos 4º e 5º metatarsos, no dorso do pé.",
        "indication": "Migrânea, dor costal, mastalgia, irregularidades menstruais.",
        "contraindications": "Inserção profunda pode causar hematoma dorsal.",
        "functions": "Move o Qi da VB, destrava o Dai Mai e alivia dor lateral do corpo." 
    },
    "GB-42": {
        "description": "Diwuhui, ponto que reforça o Dai Mai.",
        "location": "Distal às junções do 4º e 5º metatarsos, medial a GB-41.",
        "indication": "Dor nos pés, mastite, distensão hipocondríaca.",
        "contraindications": "Inserção superficial para evitar vasos dorsais.",
        "functions": "Regula o Dai Mai, relaxa tendões do pé e alivia mastite." 
    },
    "GB-43": {
        "description": "Xiaxi, ponto Ying-Manancial (Água) do canal.",
        "location": "Entre o 4º e 5º dedos do pé, na margem da membrana interdigital.",
        "indication": "Dor ocular, cefaleia lateral, febre alta, edema nos pés.",
        "contraindications": "Evitar sangria profunda.",
        "functions": "Dispersa fogo de Shaoyang, beneficia olhos e limpa calor da região lateral." 
    },
    "GB-44": {
        "description": "Zuqiaoyin, ponto Jing-Poço (Metal) terminal.",
        "location": "0,1 cun anterior ao canto lateral da unha do 4º dedo do pé.",
        "indication": "Insônia, pesadelos, cefaleia aguda, febre com delírio.",
        "contraindications": "Uso de sangria requer técnica asséptica.",
        "functions": "Elimina calor extremo, acalma o Shen e revive a consciência." 
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
        if code in gb_data:
            data = gb_data[code]
            row['description'] = data['description']
            row['location'] = data['location']
            row['indication'] = data['indication']
            row['contraindications'] = data['contraindications'] or "Nenhuma contraindicação específica."
            row['functions'] = data['functions']
            updated_count += 1
        writer.writerow(row)

os.replace(temp_file_path, csv_file_path)
print(f"Updated {updated_count} rows in {csv_file_path}")
