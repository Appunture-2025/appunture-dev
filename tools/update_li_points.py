import csv
import os

# PT-BR Data for Large Intestine (LI) Meridian Points
li_data = {
  "LI-1": {
    "description": "Shangyang (Mercador de Yang). Ponto Jing-Poço e Ponto Metal.",
    "location": "No lado radial do dedo indicador, cerca de 0,1 cun posterior ao canto da unha.",
    "indication": "Dor de dente, dor de garganta, inchaço na região submandibular, dormência nos dedos, febre alta, coma.",
    "contraindications": "Nenhuma específica conhecida, mas usar com cautela em pacientes debilitados (sangria).",
    "functions": "Limpa o Calor, revive a consciência, beneficia a garganta e alivia a dor."
  },
  "LI-2": {
    "description": "Erjian (Segundo Intervalo). Ponto Ying-Manancial e Ponto Água.",
    "location": "Na depressão distal à articulação metacarpofalângica do dedo indicador, no lado radial.",
    "indication": "Visão turva, sangramento nasal, dor de dente, dor de garganta, doenças febris.",
    "contraindications": "Nenhuma específica.",
    "functions": "Expulsa o Vento, limpa o Calor e reduz o inchaço."
  },
  "LI-3": {
    "description": "Sanjian (Terceiro Intervalo). Ponto Shu-Riacho e Ponto Madeira.",
    "location": "No lado radial do dedo indicador, na depressão proximal à cabeça do segundo osso metacarpiano.",
    "indication": "Dor de dente, dor de garganta, vermelhidão e dor nos olhos, inchaço dos dedos e dorso da mão.",
    "contraindications": "Nenhuma específica.",
    "functions": "Expulsa o Vento e o Calor, beneficia a garganta e os dentes, dispersa a plenitude."
  },
  "LI-4": {
    "description": "Hegu (Vale da Junção). Ponto Yuan-Fonte. Ponto de Comando da Face e Boca.",
    "location": "No dorso da mão, entre o primeiro e o segundo ossos metacarpianos, aproximadamente no meio do segundo osso metacarpiano no lado radial.",
    "indication": "Dor de cabeça, dor de dente, doenças da face e órgãos dos sentidos, paralisia facial, indução do parto, dor abdominal, amenorreia.",
    "contraindications": "Contraindicado durante a gravidez (pode induzir o parto).",
    "functions": "Expulsa o Vento e libera o exterior, regula a face e os olhos, regula a menstruação, induz o parto, alivia a dor, tonifica o Qi."
  },
  "LI-5": {
    "description": "Yangxi (Riacho Yang). Ponto Jing-Rio e Ponto Fogo.",
    "location": "No lado radial do pulso, na depressão entre os tendões do extensor longo e curto do polegar (tabaqueira anatômica).",
    "indication": "Dor de cabeça, dor e vermelhidão nos olhos, dor de dente, dor de garganta, dor no pulso.",
    "contraindications": "Nenhuma específica.",
    "functions": "Limpa o Calor e alivia a dor, limpa o Fogo de Yangming, acalma o Shen (Mente)."
  },
  "LI-6": {
    "description": "Pianli (Passagem Inclinada). Ponto Luo-Conexão.",
    "location": "3 cun proximal a LI-5, na linha que une LI-5 e LI-11.",
    "indication": "Vermelhidão nos olhos, zumbido, surdez, epistaxe, dor de garganta, edema, dor no cotovelo e braço.",
    "contraindications": "Nenhuma específica.",
    "functions": "Abre as passagens de água do Pulmão, regula o Qi da via das águas, limpa o Calor."
  },
  "LI-7": {
    "description": "Wenliu (Fluxo Morno). Ponto Xi-Fenda.",
    "location": "5 cun proximal a LI-5, na linha que une LI-5 e LI-11.",
    "indication": "Dor de cabeça, inchaço facial, dor de garganta, borborigmo, dor abdominal, dor no ombro e braço.",
    "contraindications": "Nenhuma específica.",
    "functions": "Limpa o Calor e desintoxica, harmoniza o Estômago e Intestinos, alivia a dor aguda."
  },
  "LI-8": {
    "description": "Xialian (Crista Inferior).",
    "location": "4 cun distal a LI-11, na linha que une LI-5 e LI-11.",
    "indication": "Dor no cotovelo e braço, dor abdominal, dor na região mamária.",
    "contraindications": "Nenhuma específica.",
    "functions": "Harmoniza o Intestino Delgado, expele o Vento e limpa o Calor, limpa os canais e colaterais."
  },
  "LI-9": {
    "description": "Shanglian (Crista Superior).",
    "location": "3 cun distal a LI-11, na linha que une LI-5 e LI-11.",
    "indication": "Dor no ombro e braço, paralisia do membro superior, dormência na mão e braço, borborigmo.",
    "contraindications": "Nenhuma específica.",
    "functions": "Harmoniza o Intestino Grosso, ativa o canal e alivia a dor."
  },
  "LI-10": {
    "description": "Shousanli (Três Milhas do Braço).",
    "location": "2 cun distal a LI-11, na linha que une LI-5 e LI-11.",
    "indication": "Dor abdominal, diarreia, dor de dente, inchaço na bochecha, paralisia do membro superior, dor no ombro.",
    "contraindications": "Nenhuma específica.",
    "functions": "Regula o Qi e o Sangue, harmoniza o Estômago e Intestinos, desobstrui o canal e alivia a dor."
  },
  "LI-11": {
    "description": "Quchi (Lagoa da Curva). Ponto He-Mar e Ponto Terra.",
    "location": "Com o cotovelo flexionado, no ponto médio da linha que une a extremidade lateral da prega cubital transversal e o epicôndilo lateral do úmero.",
    "indication": "Febre alta, dor de garganta, doenças de pele (urticária, eczema), hipertensão, paralisia do membro superior.",
    "contraindications": "Nenhuma específica.",
    "functions": "Limpa o Calor e esfria o Sangue, resolve a Umidade, regula o Qi Nutritivo e o Sangue, beneficia os tendões e articulações."
  },
  "LI-12": {
    "description": "Zhouliao (Fenda do Cotovelo).",
    "location": "Com o cotovelo flexionado, na depressão 1 cun proximal a LI-11, na borda medial do úmero.",
    "indication": "Dor, contratura e dormência do cotovelo e braço.",
    "contraindications": "Nenhuma específica.",
    "functions": "Ativa o canal e alivia a dor, beneficia a articulação do cotovelo."
  },
  "LI-13": {
    "description": "Shouwuli (Cinco Milhas do Braço).",
    "location": "3 cun proximal a LI-11, na linha que une LI-11 e LI-15.",
    "indication": "Tosse, cuspir sangue, escrófula, dor no cotovelo e braço.",
    "contraindications": "Cuidado com a artéria braquial. Evitar puntura profunda.",
    "functions": "Ativa o canal e alivia a dor, regula o Qi, drena a Umidade e resolve a Fleuma."
  },
  "LI-14": {
    "description": "Binao (Braço Superior).",
    "location": "No lado lateral do braço, na inserção do músculo deltoide, 7 cun proximal a LI-11.",
    "indication": "Dor no ombro e braço, escrófula, doenças oculares.",
    "contraindications": "Nenhuma específica.",
    "functions": "Ativa o canal e alivia a dor, regula o Qi e dissipa nódulos de Fleuma, beneficia os olhos."
  },
  "LI-15": {
    "description": "Jianyu (Osso do Ombro).",
    "location": "Anterior e inferior ao acrômio, na depressão formada quando o braço é abduzido (levantado).",
    "indication": "Dor no ombro, fraqueza e paralisia do membro superior, urticária.",
    "contraindications": "Nenhuma específica.",
    "functions": "Dissipa o Vento e a Umidade, beneficia o ombro e o braço, elimina o Vento-Calor."
  },
  "LI-16": {
    "description": "Jugu (Osso Grande).",
    "location": "Na depressão entre a extremidade acromial da clavícula e a espinha da escápula.",
    "indication": "Dor no ombro e costas, movimento restrito do braço, cuspir sangue.",
    "contraindications": "Puntura profunda pode causar pneumotórax (embora raro nesta localização específica, cuidado com o ápice pulmonar medialmente).",
    "functions": "Ativa o canal e alivia a dor, beneficia o ombro, regula o Qi e o Sangue."
  },
  "LI-17": {
    "description": "Tianding (Vaso Celestial).",
    "location": "No lado lateral do pescoço, 1 cun inferior a LI-18, na borda posterior do músculo esternocleidomastoideo.",
    "indication": "Dor de garganta, perda súbita de voz, escrófula, bócio.",
    "contraindications": "Cuidado com a veia jugular externa.",
    "functions": "Beneficia a garganta e a voz, limpa o Calor e resolve a Fleuma."
  },
  "LI-18": {
    "description": "Futu (Suporte da Proeminência).",
    "location": "No lado lateral do pescoço, nivelado com a proeminência laríngea (pomo de Adão), entre as cabeças esternal e clavicular do músculo esternocleidomastoideo.",
    "indication": "Tosse, asma, dor de garganta, perda súbita de voz, escrófula, bócio.",
    "contraindications": "Cuidado com a artéria carótida e veia jugular.",
    "functions": "Beneficia a garganta e a voz, alivia a tosse e a asma, resolve a Fleuma."
  },
  "LI-19": {
    "description": "Kouheliao (Fenda do Grão).",
    "location": "Diretamente abaixo da margem lateral da narina, nivelado com GV-26.",
    "indication": "Obstrução nasal, epistaxe, desvio da boca, trismo (mandíbula travada).",
    "contraindications": "Moxibustão é geralmente contraindicada.",
    "functions": "Abre as passagens nasais, expulsa o Vento e desperta os sentidos."
  },
  "LI-20": {
    "description": "Yingxiang (Recepção de Fragrância).",
    "location": "No sulco nasolabial, ao nível do ponto médio da borda lateral da asa do nariz.",
    "indication": "Obstrução nasal, perda do olfato, epistaxe, rinorreia, desvio da boca, coceira e inchaço facial.",
    "contraindications": "Moxibustão é geralmente contraindicada ou usada com muito cuidado.",
    "functions": "Abre as passagens nasais, expulsa o Vento e limpa o Calor, dissipa o Vento-Calor da face."
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
        if code in li_data:
            row['description'] = li_data[code]['description']
            row['location'] = li_data[code]['location']
            row['indication'] = li_data[code]['indication']
            row['contraindications'] = li_data[code]['contraindications']
            row['functions'] = li_data[code]['functions']
            updated_count += 1
        writer.writerow(row)

os.replace(temp_file_path, csv_file_path)
print(f"Updated {updated_count} rows in {csv_file_path}")
