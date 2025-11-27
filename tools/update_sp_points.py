import csv
import os

# Dados clínicos em PT-BR para os pontos do meridiano do Baço (SP-1 a SP-21)
sp_data = {
    "SP-1": {
        "description": "Yinbai, ponto Jing-Poço e ponto de parada de sangramento do meridiano do Baço.",
        "location": "Face medial do hálux, 0,1 cun proximal ao canto medial da unha.",
        "indication": "Sangramentos uterinos ou nasais, insônia por excesso de preocupação, colapso de Qi, transtornos mentais agudos.",
        "contraindications": "Evitar sangria profunda em pacientes com anticoagulantes ou anemia severa.",
        "functions": "Controla o sangue, acalma o Shen, reanima a consciência e harmoniza o Baço."
    },
    "SP-2": {
        "description": "Dadu, ponto Ying-Fonte e Fogo do Baço.",
        "location": "Borda medial do hálux, distal à articulação metatarsofalângica, na depressão anterior ao primeiro metatarso.",
        "indication": "Distensão abdominal, dor epigástrica, febre por deficiência, gastrite, diarreia aguda.",
        "contraindications": "Evitar moxabustão excessiva em casos de calor pleno.",
        "functions": "Purga calor do Baço, regula o Qi digestivo, transforma umidade e acalma a mente."
    },
    "SP-3": {
        "description": "Taibai, ponto Shu-Rio, Yuan-Fonte e Terra do meridiano.",
        "location": "Face medial do pé, proximal à cabeça do primeiro metatarso, na junção de pele clara e escura.",
        "indication": "Fadiga pós-prandial, diarreia crônica, hipoglicemia funcional, sensação de peso nos membros.",
        "contraindications": "Pressão excessiva pode ser desconfortável para pacientes com neuropatia periférica.",
        "functions": "Tonifica o Baço e Pulmão, resolve umidade, harmoniza o Estômago e fortalece músculos."
    },
    "SP-4": {
        "description": "Gongsun, ponto Luo e mestre do Chong Mai.",
        "location": "Face medial do pé, 1 cun proximal à base do primeiro metatarso.",
        "indication": "Náuseas, vômitos, dor epigástrica, distúrbios ginecológicos, ansiedade digestiva.",
        "contraindications": "Cuidado em gestantes no primeiro trimestre se usado com Chong Mai por risco de estimulação uterina.",
        "functions": "Regula o Chong Mai, harmoniza o aquecedor médio, move sangue estagnado e acalma o Shen."
    },
    "SP-5": {
        "description": "Shangqiu, ponto Jing-Rio e Metal.",
        "location": "Anterior e inferior ao maléolo medial, na depressão entre o maléolo e o osso navicular.",
        "indication": "Edema maleolar, dor de tornozelo, distúrbios urinários por umidade, rigidez de língua.",
        "contraindications": "Evitar manipulação agressiva em entorses agudos.",
        "functions": "Elimina umidade, beneficia tendões, regula Baço e Estômago e acalma dor local."
    },
    "SP-6": {
        "description": "Sanyinjiao, grande ponto de convergência dos meridianos do Baço, Fígado e Rim.",
        "location": "Face medial da perna, 3 cun acima do maléolo medial, posterior à borda medial da tíbia.",
        "indication": "Transtornos ginecológicos, infertilidade, insônia, digestão lenta, edema, ansiedade.",
        "contraindications": "Proibido em gestantes após primeiro trimestre devido a efeito de indução de parto.",
        "functions": "Tonifica Baço e Rim, harmoniza Fígado, regula sangue, transforma umidade e acalma o Shen."
    },
    "SP-7": {
        "description": "Lougu, ponto de passagem para dispersar umidade.",
        "location": "6 cun acima de SP-6, linha entre SP-9 e o maléolo medial, próximo à borda posterior da tíbia.",
        "indication": "Edema de membros inferiores, sensação de peso nas pernas, diarreia com umidade.",
        "contraindications": "Pressão excessiva pode causar hematoma em pacientes anticoagulados.",
        "functions": "Desobstrui canais, resolve umidade e fortalece Baço para circulação de fluidos."
    },
    "SP-8": {
        "description": "Diji, ponto Xi-Cleft do meridiano.",
        "location": "3 cun abaixo de SP-9, na linha entre SP-9 e o maléolo medial, junto à borda medial da tíbia.",
        "indication": "Cólicas menstruais agudas, metrorragia, dor abdominal súbita, cistite com hematúria.",
        "contraindications": "Evitar estimulação forte em hemorragias abundantes sem avaliação médica.",
        "functions": "Regula fluxo sanguíneo, harmoniza útero, alivia dor aguda e transforma estagnação."
    },
    "SP-9": {
        "description": "Yinlingquan, ponto He-Mar e Água.",
        "location": "Inferior ao côndilo medial da tíbia, na depressão posterior à borda inferior do côndilo.",
        "indication": "Edema generalizado, diarreia por umidade-frio, dor no joelho medial, cistite.",
        "contraindications": "Cuidado com bursite inflamada; manipulação suave.",
        "functions": "Draga umidade, harmoniza Baço e Estômago, melhora fluxo urinário e beneficia joelho."
    },
    "SP-10": {
        "description": "Xuehai, Mar do Sangue.",
        "location": "2 cun proximal à borda superior da patela, no ventre do músculo vasto medial.",
        "indication": "Distúrbios menstruais, prurido cutâneo por calor no sangue, urticária, estase menstrual.",
        "contraindications": "Evitar agulhar em inflamações ou hematomas extensos.",
        "functions": "Move e esfria o sangue, elimina estase e nutre a pele."
    },
    "SP-11": {
        "description": "Jimen, passagem do meridiano pela coxa.",
        "location": "6 cun acima de SP-10, na linha medial da coxa, próximo ao canal femoral medial.",
        "indication": "Dor inguinal, retenção urinária, leucorreia, parestesias na coxa.",
        "contraindications": "Evitar profundidade excessiva para não lesar artéria femoral ou nervo safeno.",
        "functions": "Regula a urina, dissolve umidade no aquecedor inferior e relaxa músculos da coxa."
    },
    "SP-12": {
        "description": "Chongmen, ponto de encontro com o Fígado e Yin Qiao.",
        "location": "3,5 cun lateral à linha média, na prega inguinal, lateral à artéria femoral.",
        "indication": "Dor abdominal inferior, distúrbios urinários, dor menstrual, hérnias.",
        "contraindications": "Risco vascular; palpar bem e evitar punção profunda.",
        "functions": "Move Qi do aquecedor inferior, regula Baço e Fígado e dissipa estagnações."
    },
    "SP-13": {
        "description": "Fushe, ponto abdominal do Baço.",
        "location": "0,7 cun acima de SP-12 e 4 cun lateral à linha média, na parte inferior do abdômen.",
        "indication": "Dor abdominal crônica, constipação com estagnação, distensão pós-prandial.",
        "contraindications": "Cuidados em gestantes; evitar inserção profunda sobre cavidade abdominal.",
        "functions": "Regula intestinos, move Qi e estabiliza o aquecedor inferior."
    },
    "SP-14": {
        "description": "Fujie, ponto para harmonizar intestinos.",
        "location": "1,3 cun abaixo do umbigo e 4 cun lateral à linha média.",
        "indication": "Dor abdominal, cólicas intestinais, constipação, diarreia alternada.",
        "contraindications": "Evitar punção profunda em abdômen agudo.",
        "functions": "Ajusta função intestinal, dissipa estagnação e fortalece o Baço no aquecedor médio."
    },
    "SP-15": {
        "description": "Daheng, ponto ao lado do umbigo.",
        "location": "Nível do umbigo e 4 cun lateral à linha média, no músculo reto abdominal.",
        "indication": "Constipação crônica, diarreia por deficiência, dor abdominal espástica.",
        "contraindications": "Evitar em gravidez avançada; cuidado com pacientes pós-cirúrgicos abdominais.",
        "functions": "Regula o Intestino Grosso, move Qi abdominal e fortalece Baço para transformar alimentos."
    },
    "SP-16": {
        "description": "Fuai, ponto para dor abdominal superior.",
        "location": "3 cun acima do umbigo e 4 cun lateral à linha média.",
        "indication": "Dor epigástrica, diarreia, refluxo, distúrbios intestinais funcionais.",
        "contraindications": "Evitar agulha profunda em pacientes magros para não atingir cavidade abdominal.",
        "functions": "Harmoniza Baço e Intestinos, dispersa estagnação de Qi e regula aquecedor médio."
    },
    "SP-17": {
        "description": "Shidou, ponto torácico de suporte respiratório.",
        "location": "5.º espaço intercostal, 6 cun lateral à linha média anterior.",
        "indication": "Plenitude torácica, dor costal, dispneia por fleuma, mastite inicial.",
        "contraindications": "Risco de pneumotórax; inserir superficial e oblíquo.",
        "functions": "Resolve fleuma no tórax, harmoniza Qi descendente do Pulmão e alivia dor costal."
    },
    "SP-18": {
        "description": "Tianxi, ponto para lactação e dor mamária.",
        "location": "4.º espaço intercostal, 6 cun lateral à linha média anterior.",
        "indication": "Mastite, hipogalactia, dor torácica lateral, tosse com fleuma.",
        "contraindications": "Mesmos cuidados com pleura; usar inserção oblíqua.",
        "functions": "Regula fluxo de leite, dissipa fleuma e harmoniza Qi do tórax."
    },
    "SP-19": {
        "description": "Xiongxiang, ponto para plenitude costal.",
        "location": "3.º espaço intercostal, 6 cun lateral à linha média anterior.",
        "indication": "Dispneia, dor costal crônica, sensação de opressão torácica.",
        "contraindications": "Risco de pneumotórax; inserção superficial oblíqua.",
        "functions": "Expande o tórax, regula Qi do Pulmão e auxilia o Baço na transformação de fluidos."
    },
    "SP-20": {
        "description": "Zhourong, ponto para dispersar fleuma quente.",
        "location": "2.º espaço intercostal, 6 cun lateral à linha média anterior.",
        "indication": "Tosse seca ou com fleuma, sensação de plenitude torácica, dor de ombro anterior.",
        "contraindications": "Cuidado com perfuração pleural; inserção oblíqua.",
        "functions": "Dispersa calor e fleuma do Pulmão, harmoniza Qi do tórax e alivia dor local."
    },
    "SP-21": {
        "description": "Dabao, Grande Luo do Baço.",
        "location": "Lado lateral do tórax, nível do 6.º espaço intercostal, na linha axilar média.",
        "indication": "Dor generalizada do corpo, fraqueza muscular difusa, fibromialgia, dispneia leve.",
        "contraindications": "Risco de pneumotórax; usar técnica superficial oblíqua.",
        "functions": "Regula o Grande Luo, move Qi e sangue por todo o corpo e alivia dor generalizada."
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
        if code in sp_data:
            data = sp_data[code]
            row['description'] = data['description']
            row['location'] = data['location']
            row['indication'] = data['indication']
            row['contraindications'] = data['contraindications'] or "Nenhuma contraindicação específica."
            row['functions'] = data['functions']
            updated_count += 1
        writer.writerow(row)

os.replace(temp_file_path, csv_file_path)
print(f"Updated {updated_count} rows in {csv_file_path}")
