import csv
import os

st_data = {
  "ST-1": {
    "description": "Chengqi (Recebendo as Lágrimas) - Ponto de encontro dos canais do Estômago, Vaso Concepção e Yang Qiao.",
    "location": "Com os olhos olhando diretamente para frente, o ponto está diretamente abaixo da pupila, entre o globo ocular e a crista infraorbital.",
    "indication": "Vermelhidão, inchaço e dor nos olhos, lacrimejamento ao vento, cegueira noturna, paralisia facial, tiques das pálpebras.",
    "contraindications": "Puntura profunda é contraindicada. Cuidado para não ferir o globo ocular. Não manipular a agulha.",
    "functions": "Elimina o vento e dissipa o calor, beneficia os olhos, interrompe o lacrimejamento."
  },
  "ST-2": {
    "description": "Sibai (Quatro Brancos).",
    "location": "Com os olhos olhando para frente, o ponto está diretamente abaixo da pupila, na depressão do forame infraorbital.",
    "indication": "Vermelhidão e dor nos olhos, paralisia facial, tiques das pálpebras, dor na face, cefaleia.",
    "contraindications": "Puntura profunda pode lesar o nervo ou vasos. Cuidado.",
    "functions": "Elimina o vento, clareia o calor, beneficia os olhos, alivia a dor."
  },
  "ST-3": {
    "description": "Juliao (Grande Fenda) - Ponto de encontro dos canais do Estômago e Yang Qiao.",
    "location": "Diretamente abaixo da pupila, no nível da borda inferior da asa do nariz, no lado lateral do sulco nasolabial.",
    "indication": "Paralisia facial, tiques das pálpebras, epistaxe, dor de dente, inchaço dos lábios e bochecha.",
    "contraindications": "",
    "functions": "Elimina o vento, dissipa o inchaço, alivia a dor."
  },
  "ST-4": {
    "description": "Dicang (Celeiro da Terra) - Ponto de encontro dos canais do Estômago, Intestino Grosso e Yang Qiao.",
    "location": "Lateral ao canto da boca, diretamente abaixo da pupila.",
    "indication": "Desvio da boca e olhos, salivação, tiques das pálpebras, dor de dente.",
    "contraindications": "",
    "functions": "Elimina o vento da face, ativa o canal e alivia a dor."
  },
  "ST-5": {
    "description": "Daying (Grande Recepção).",
    "location": "Anterior ao ângulo da mandíbula, na borda anterior do músculo masseter, na depressão semelhante a um sulco que aparece quando a bochecha é inflada.",
    "indication": "Trismo, desvio da boca, inchaço da bochecha, dor de dente.",
    "contraindications": "Cuidado com a artéria facial.",
    "functions": "Elimina o vento, reduz o inchaço."
  },
  "ST-6": {
    "description": "Jiache (Carruagem da Mandíbula).",
    "location": "Um dedo transversal anterior e superior ao ângulo da mandíbula, na proeminência do músculo masseter quando os dentes são cerrados.",
    "indication": "Paralisia facial, dor de dente, inchaço da bochecha, trismo, rigidez do pescoço.",
    "contraindications": "",
    "functions": "Elimina o vento, beneficia a mandíbula e os dentes, ativa o canal e alivia a dor."
  },
  "ST-7": {
    "description": "Xiaguan (Abaixo da Articulação) - Ponto de encontro dos canais do Estômago e Vesícula Biliar.",
    "location": "Na depressão na borda inferior do arco zigomático, anterior ao côndilo da mandíbula.",
    "indication": "Surdez, zumbido, otorreia, paralisia facial, dor de dente, dor na ATM.",
    "contraindications": "",
    "functions": "Beneficia os ouvidos, mandíbula e dentes, elimina o vento e alivia a dor."
  },
  "ST-8": {
    "description": "Touwei (Amarrado à Cabeça) - Ponto de encontro dos canais do Estômago, Vesícula Biliar e Yang Wei.",
    "location": "No canto da testa, 0,5 cun dentro da linha anterior do cabelo, 4,5 cun lateral à linha média (Shenting VG-24).",
    "indication": "Cefaleia, tontura, dor nos olhos, lacrimejamento.",
    "contraindications": "",
    "functions": "Elimina o vento, alivia a dor, beneficia os olhos e a cabeça."
  },
  "ST-9": {
    "description": "Renying (Acolhida Humana) - Ponto de encontro dos canais do Estômago e Vesícula Biliar. Ponto Janela do Céu.",
    "location": "No nível da proeminência laríngea, na borda anterior do músculo esternocleidomastoideo, onde a pulsação da artéria carótida comum é palpável.",
    "indication": "Dor de garganta, asma, tontura, rubor facial, hipertensão.",
    "contraindications": "Cuidado extremo com a artéria carótida. Evitar moxibustão.",
    "functions": "Regula o Qi e o Sangue, beneficia a garganta e o pescoço, alivia a asma."
  },
  "ST-10": {
    "description": "Shuitu (Proeminência da Água).",
    "location": "Na borda anterior do músculo esternocleidomastoideo, a meio caminho entre Renying (ST-9) e Qishe (ST-11).",
    "indication": "Dor de garganta, asma, falta de ar.",
    "contraindications": "Cuidado com a artéria carótida.",
    "functions": "Beneficia a garganta, desce o Qi do Pulmão."
  },
  "ST-11": {
    "description": "Qishe (Morada do Qi).",
    "location": "Na borda superior da clavícula, entre as cabeças esternal e clavicular do músculo esternocleidomastoideo.",
    "indication": "Dor de garganta, asma, rigidez do pescoço.",
    "contraindications": "Cuidado com os vasos profundos e o ápice do pulmão.",
    "functions": "Beneficia a garganta, desce o Qi."
  },
  "ST-12": {
    "description": "Quepen (Bacia Vazia).",
    "location": "No centro da fossa supraclavicular, 4 cun lateral à linha média.",
    "indication": "Tosse, asma, dor de garganta, dor na fossa supraclavicular, dor no ombro.",
    "contraindications": "Puntura profunda é contraindicada (risco de pneumotórax). Cuidado com a artéria subclávia.",
    "functions": "Desce o Qi do Pulmão, ativa o canal e alivia a dor."
  },
  "ST-13": {
    "description": "Qihu (Porta do Qi).",
    "location": "Na borda inferior da clavícula, 4 cun lateral à linha média.",
    "indication": "Asma, tosse, plenitude no peito e hipocôndrio.",
    "contraindications": "Puntura profunda ou perpendicular é contraindicada (risco de pneumotórax).",
    "functions": "Desce o Qi do Pulmão, abre o peito."
  },
  "ST-14": {
    "description": "Kufang (Armazém).",
    "location": "No primeiro espaço intercostal, 4 cun lateral à linha média.",
    "indication": "Sensação de plenitude e dor no peito e hipocôndrio, tosse.",
    "contraindications": "Puntura profunda ou perpendicular é contraindicada (risco de pneumotórax).",
    "functions": "Desce o Qi do Pulmão, abre o peito."
  },
  "ST-15": {
    "description": "Wuyi (Tela do Quarto).",
    "location": "No segundo espaço intercostal, 4 cun lateral à linha média.",
    "indication": "Tosse, asma, dor no peito, distensão mamária.",
    "contraindications": "Puntura profunda ou perpendicular é contraindicada (risco de pneumotórax).",
    "functions": "Desce o Qi do Pulmão, alivia a dor no peito."
  },
  "ST-16": {
    "description": "Yingchuang (Janela do Peito).",
    "location": "No terceiro espaço intercostal, 4 cun lateral à linha média.",
    "indication": "Tosse, asma, plenitude no peito, mastite.",
    "contraindications": "Puntura profunda ou perpendicular é contraindicada (risco de pneumotórax).",
    "functions": "Alivia a tosse e a asma, beneficia as mamas."
  },
  "ST-17": {
    "description": "Ruzhong (Meio do Mamilo).",
    "location": "No centro do mamilo, no quarto espaço intercostal.",
    "indication": "Serve apenas como referência anatômica.",
    "contraindications": "Contraindicado para agulhamento e moxibustão.",
    "functions": "N/A"
  },
  "ST-18": {
    "description": "Rugen (Raiz da Mama).",
    "location": "No quinto espaço intercostal, 4 cun lateral à linha média.",
    "indication": "Mastite, lactação insuficiente, dor no peito, tosse, asma.",
    "contraindications": "Puntura profunda ou perpendicular é contraindicada (risco de pneumotórax).",
    "functions": "Beneficia as mamas e a lactação, desce o Qi do Pulmão."
  },
  "ST-19": {
    "description": "Burong (Não Contido).",
    "location": "6 cun acima do umbigo, 2 cun lateral à linha média.",
    "indication": "Distensão abdominal, vômito, dor gástrica, falta de apetite.",
    "contraindications": "Cuidado com o peritônio em pacientes magros.",
    "functions": "Harmoniza o Estômago, desce o Qi rebelde."
  },
  "ST-20": {
    "description": "Chengman (Recebendo a Plenitude).",
    "location": "5 cun acima do umbigo, 2 cun lateral à linha média.",
    "indication": "Dor gástrica, distensão abdominal, vômito, anorexia.",
    "contraindications": "Cuidado com o peritônio.",
    "functions": "Harmoniza o Estômago, regula o Qi."
  },
  "ST-21": {
    "description": "Liangmen (Porta da Trave).",
    "location": "4 cun acima do umbigo, 2 cun lateral à linha média.",
    "indication": "Dor gástrica, vômito, anorexia, diarreia.",
    "contraindications": "Cuidado com o peritônio.",
    "functions": "Regula o Qi do Estômago e Baço, harmoniza o Aquecedor Médio."
  },
  "ST-22": {
    "description": "Guanmen (Porta da Passagem).",
    "location": "3 cun acima do umbigo, 2 cun lateral à linha média.",
    "indication": "Distensão abdominal, borborigmo, diarreia, edema.",
    "contraindications": "Cuidado com o peritônio.",
    "functions": "Regula os intestinos, beneficia a micção."
  },
  "ST-23": {
    "description": "Taiyi (Unidade Suprema).",
    "location": "2 cun acima do umbigo, 2 cun lateral à linha média.",
    "indication": "Dor gástrica, irritabilidade, mania.",
    "contraindications": "Cuidado com o peritônio.",
    "functions": "Transforma a fleuma, acalma o Shen, harmoniza o Estômago."
  },
  "ST-24": {
    "description": "Huaroumen (Porta da Carne Escorregadia).",
    "location": "1 cun acima do umbigo, 2 cun lateral à linha média.",
    "indication": "Dor gástrica, vômito, mania, rigidez da língua.",
    "contraindications": "Cuidado com o peritônio.",
    "functions": "Acalma o Shen, harmoniza o Estômago."
  },
  "ST-25": {
    "description": "Tianshu (Pivô Celestial) - Ponto Mu-Frontal do Intestino Grosso.",
    "location": "2 cun lateral ao centro do umbigo.",
    "indication": "Dor abdominal, diarreia, constipação, disenteria, menstruação irregular.",
    "contraindications": "Cuidado com o peritônio.",
    "functions": "Regula o Baço e o Estômago, resolve a umidade e o calor, regula o Qi e o Sangue."
  },
  "ST-26": {
    "description": "Wailing (Monte Externo).",
    "location": "1 cun abaixo do umbigo, 2 cun lateral à linha média.",
    "indication": "Dor abdominal, hérnia.",
    "contraindications": "Cuidado com o peritônio.",
    "functions": "Regula o Qi, alivia a dor."
  },
  "ST-27": {
    "description": "Daju (O Grande).",
    "location": "2 cun abaixo do umbigo, 2 cun lateral à linha média.",
    "indication": "Distensão abdominal, disúria, hérnia, ejaculação precoce.",
    "contraindications": "Cuidado com o peritônio.",
    "functions": "Beneficia os Rins e a Essência, regula o Qi."
  },
  "ST-28": {
    "description": "Shuidao (Caminho da Água).",
    "location": "3 cun abaixo do umbigo, 2 cun lateral à linha média.",
    "indication": "Distensão abdominal, retenção urinária, edema, hérnia, dismenorreia.",
    "contraindications": "Cuidado com a bexiga cheia.",
    "functions": "Regula o Aquecedor Inferior, beneficia a micção, regula a menstruação."
  },
  "ST-29": {
    "description": "Guilai (Retorno).",
    "location": "4 cun abaixo do umbigo, 2 cun lateral à linha média.",
    "indication": "Amenorreia, menstruação irregular, hérnia, dor abdominal, prolapso uterino.",
    "contraindications": "Cuidado com a bexiga cheia.",
    "functions": "Aquece o Aquecedor Inferior, regula a menstruação, beneficia a região genital."
  },
  "ST-30": {
    "description": "Qichong (Avanço do Qi) - Ponto de encontro do canal do Estômago com o Chong Mai.",
    "location": "5 cun abaixo do umbigo, 2 cun lateral à linha média, na borda superior da sínfise púbica.",
    "indication": "Hérnia, dor genital, menstruação irregular, infertilidade.",
    "contraindications": "Cuidado com a artéria femoral.",
    "functions": "Regula o Qi no Aquecedor Inferior, regula o Chong Mai."
  },
  "ST-31": {
    "description": "Biguan (Barreira da Coxa).",
    "location": "Na face anterior da coxa, diretamente abaixo da espinha ilíaca ântero-superior, em uma depressão lateral ao músculo sartório.",
    "indication": "Dor na coxa, atrofia muscular, paralisia dos membros inferiores, dor lombar.",
    "contraindications": "",
    "functions": "Ativa o canal e alivia a dor, dissipa o vento-umidade."
  },
  "ST-32": {
    "description": "Futu (Coelho Agachado).",
    "location": "Na face ântero-lateral da coxa, 6 cun acima da borda superior lateral da patela.",
    "indication": "Dor na região lombar e ilíaca, frio e dor no joelho, paralisia, beribéri.",
    "contraindications": "",
    "functions": "Ativa o canal e alivia a dor, dissipa o vento-umidade."
  },
  "ST-33": {
    "description": "Yinshi (Mercado Yin).",
    "location": "Na face ântero-lateral da coxa, 3 cun acima da borda superior lateral da patela.",
    "indication": "Dormência, dor e frio no joelho e perna, dificuldade de flexão e extensão.",
    "contraindications": "",
    "functions": "Dissipa o vento-umidade, beneficia as articulações."
  },
  "ST-34": {
    "description": "Liangqiu (Cume da Colina) - Ponto Xi-Fenda.",
    "location": "2 cun acima da borda superior lateral da patela.",
    "indication": "Dor aguda no estômago, inchaço e dor no joelho, paralisia dos membros inferiores, mastite.",
    "contraindications": "",
    "functions": "Harmoniza o Estômago, alivia a dor aguda, beneficia o joelho."
  },
  "ST-35": {
    "description": "Dubi (Nariz do Bezerro).",
    "location": "Na depressão lateral ao ligamento patelar, abaixo da patela.",
    "indication": "Dor, inchaço e dificuldade motora do joelho.",
    "contraindications": "",
    "functions": "Dissipa o vento-umidade, reduz o inchaço, alivia a dor no joelho."
  },
  "ST-36": {
    "description": "Zusanli (Três Distâncias da Perna) - Ponto He-Mar. Ponto Terra.",
    "location": "3 cun abaixo de Dubi (ST-35), um dedo transversal lateral à crista anterior da tíbia.",
    "indication": "Dor gástrica, vômito, distensão abdominal, diarreia, constipação, tontura, fadiga, fraqueza geral.",
    "contraindications": "",
    "functions": "Tonifica o Qi e o Sangue, harmoniza o Estômago, fortifica o Baço, restaura o Yang."
  },
  "ST-37": {
    "description": "Shangjuxu (Grande Vazio Superior) - Ponto He-Mar Inferior do Intestino Grosso.",
    "location": "6 cun abaixo de Dubi (ST-35), um dedo transversal lateral à crista anterior da tíbia.",
    "indication": "Dor abdominal, diarreia, apendicite, constipação, paralisia.",
    "contraindications": "",
    "functions": "Regula os intestinos e o Estômago, elimina a umidade-calor."
  },
  "ST-38": {
    "description": "Tiaokou (Abertura da Faixa).",
    "location": "8 cun abaixo de Dubi (ST-35), um dedo transversal lateral à crista anterior da tíbia.",
    "indication": "Atrofia muscular, distúrbios motores, dor no ombro, dor abdominal.",
    "contraindications": "",
    "functions": "Beneficia o ombro, relaxa os tendões, ativa o canal."
  },
  "ST-39": {
    "description": "Xiajuxu (Grande Vazio Inferior) - Ponto He-Mar Inferior do Intestino Delgado.",
    "location": "9 cun abaixo de Dubi (ST-35), um dedo transversal lateral à crista anterior da tíbia.",
    "indication": "Dor no baixo ventre, dor lombar referida aos testículos, diarreia, mastite.",
    "contraindications": "",
    "functions": "Regula o Intestino Delgado, elimina a umidade-calor, ativa o canal."
  },
  "ST-40": {
    "description": "Fenglong (Abundância Generosa) - Ponto Luo-Conexão.",
    "location": "8 cun abaixo de Dubi (ST-35), dois dedos transversais laterais à crista anterior da tíbia (lateral a ST-38).",
    "indication": "Tosse com fleuma abundante, asma, tontura, cefaleia, mania, epilepsia, edema.",
    "contraindications": "",
    "functions": "Transforma a fleuma e a umidade, acalma o Shen, limpa o calor do Estômago."
  },
  "ST-41": {
    "description": "Jiexi (Ravina Dispersa) - Ponto Jing-Rio. Ponto Fogo.",
    "location": "No dorso do pé, na depressão entre os tendões do extensor longo dos dedos e extensor longo do hálux, no nível do maléolo lateral.",
    "indication": "Inchaço da face e cabeça, cefaleia, tontura, dor abdominal, constipação, queda do pé.",
    "contraindications": "",
    "functions": "Limpa o calor do Estômago e do canal, acalma o Shen, ativa o canal."
  },
  "ST-42": {
    "description": "Chongyang (Yang Apressado) - Ponto Yuan-Fonte.",
    "location": "No dorso do pé, 1,5 cun distal a Jiexi (ST-41), no ponto mais alto do dorso do pé, onde se sente a pulsação da artéria dorsal do pé.",
    "indication": "Desvio da boca e olhos, inchaço facial, dor de dente, atrofia muscular do pé.",
    "contraindications": "Cuidado com a artéria dorsal do pé.",
    "functions": "Limpa o calor do Estômago, harmoniza o Estômago, acalma o Shen."
  },
  "ST-43": {
    "description": "Xiangu (Vale Afundado) - Ponto Shu-Riacho. Ponto Madeira.",
    "location": "No dorso do pé, na depressão distal à junção do segundo e terceiro ossos metatarsais.",
    "indication": "Edema facial, dor nos olhos, dor abdominal, borborigmo, inchaço do dorso do pé.",
    "contraindications": "",
    "functions": "Regula o Baço e o Estômago, elimina o edema, limpa o calor."
  },
  "ST-44": {
    "description": "Neiting (Pátio Interno) - Ponto Ying-Manancial. Ponto Água.",
    "location": "No dorso do pé, entre o segundo e o terceiro dedos, na margem da membrana interdigital.",
    "indication": "Dor de dente, dor facial, desvio da boca, epistaxe, dor abdominal, diarreia, disenteria.",
    "contraindications": "",
    "functions": "Limpa o calor do Estômago, harmoniza os intestinos, alivia a dor."
  },
  "ST-45": {
    "description": "Lidui (Troca Rigorosa) - Ponto Jing-Poço. Ponto Metal.",
    "location": "No lado lateral do segundo dedo do pé, aproximadamente 0,1 cun do canto da unha.",
    "indication": "Inchaço facial, desvio da boca, dor de dente, epistaxe, distensão abdominal, sonhos excessivos, mania.",
    "contraindications": "",
    "functions": "Limpa o calor do Estômago, acalma o Shen, restaura a consciência."
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
        if code in st_data:
            row['description'] = st_data[code]['description']
            row['location'] = st_data[code]['location']
            row['indication'] = st_data[code]['indication']
            row['contraindications'] = st_data[code]['contraindications'] if st_data[code]['contraindications'] else "Nenhuma contraindicação específica."
            row['functions'] = st_data[code]['functions']
            updated_count += 1
        writer.writerow(row)

os.replace(temp_file_path, csv_file_path)
print(f"Updated {updated_count} rows in {csv_file_path}")
