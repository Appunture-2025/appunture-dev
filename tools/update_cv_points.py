import csv
import os

raw_entries = """
CV-1|Huiyin, ponto de encontro dos canais Ren, Du, Chong, Fígado e Vesícula.|No ponto médio entre o ânus e o escroto ou entre o ânus e a comissura posterior dos lábios maiores.|Incontinência urinária, hemorroidas, prolapso uterino, dor genital, choque.|Contraindicado na gravidez e deve ser inserido superficialmente para evitar o reto.|Desperta o Yuan Qi, ancora o Yang e regula o aquecedor inferior.
CV-2|Qugu, ponto local essencial para disfunções urogenitais.|Na linha média anterior, superior à sínfise púbica, na borda superior do osso púbico.|Retenção urinária, disfunção sexual, dor suprapúbica, menstruação irregular.|Inserção profunda pode atingir a bexiga cheia; esvaziar antes do agulhamento.|Regula Bexiga e útero, aquece o aquecedor inferior e remove umidade.
CV-3|Zhongji, ponto Mu da Bexiga.|Na linha média, 4 cun abaixo do umbigo.|Cistite, leucorreia, hérnia, menstruação dolorosa.|Cuidado com a bexiga cheia e gestantes no primeiro trimestre.|Drena umidade-calor da Bexiga, regula menstruação e beneficia o aquecedor inferior.
CV-4|Guanyuan, ponto Mu do Intestino Delgado e Mar do Qi.|Na linha média, 3 cun abaixo do umbigo.|Fadiga extrema, infertilidade, impotência, diarreia crônica.|Inserção profunda pode atingir bexiga ou intestino em pacientes magros.|Tonifica Yuan Qi e Jing, aquece Rins e fortalece útero e intestinos.
CV-5|Shimen, ponto de controle das águas.|Na linha média, 2 cun abaixo do umbigo.|Edema, amenorreia, diarreia, dor abdominal.|Cuidado com bexiga cheia e gravidez inicial.|Regula a via das águas, harmoniza Baço e Rins e estabiliza o útero.
CV-6|Qihai, Mar do Qi.|Na linha média, 1,5 cun abaixo do umbigo.|Fadiga, prolapso, cólicas menstruais, constipação.|Evitar agulhamento profundo em gestantes.|Tonifica Qi e Yang, reforça o aquecedor inferior e regula intestinos e útero.
CV-7|Yinjiao, cruzamento com os meridianos dos Rins.|Na linha média, 1 cun abaixo do umbigo.|Dor abdominal inferior, distúrbios urinários, infertilidade, edema.|Evitar agulhamento profundo na gravidez.|Regula o Ren Mai, nutre o Yin do Rim e harmoniza menstruação.
CV-8|Shenque, centro do umbigo.|No umbigo.|Colapso de Yang, diarreia, dor abdominal, choque.|Agulhamento é contraindicado; usar moxabustão ou técnicas não invasivas.|Aquece o Yuan Qi, estabiliza o intestino e ressuscita o Yang colapsado.
CV-9|Shuifen, divisor das águas.|Na linha média, 1 cun acima do umbigo.|Edema generalizado, ascite, diarreia, dor abdominal.|Inserção profunda pode perfurar o peritônio em pacientes magros.|Regula a distribuição de líquidos, transforma umidade e harmoniza Baço.
CV-10|Xiawan, controlador inferior do Estômago.|Na linha média, 2 cun acima do umbigo.|Gastrite, distensão epigástrica, vômito, refluxo.|Cuidado com o peritônio.|Harmoniza Estômago, desce Qi rebelde e alivia distensão.
CV-11|Jianli, suporte central.|Na linha média, 3 cun acima do umbigo.|Nausea, falta de apetite, dor epigástrica, edema.|Cuidado com o peritônio.|Fortalece Baço e Estômago, move líquidos e alivia estagnação.
CV-12|Zhongwan, ponto Mu do Estômago e ponto Hui dos Fu.|Na linha média, 4 cun acima do umbigo.|Dispepsia, refluxo, náusea, ansiedade, úlcera.|Cuidado com o peritônio.|Harmoniza Estômago e Baço, regula Qi do aquecedor médio e acalma o Shen.
CV-13|Shangwan, controlador superior do Estômago.|Na linha média, 5 cun acima do umbigo.|Náusea, vômito ácido, dor epigástrica, soluços.|Cuidado com o peritônio.|Dirige o Qi descendente do Estômago, resolve fleuma e alivia dor epigástrica.
CV-14|Juque, ponto Mu do Coração.|Na linha média, 6 cun acima do umbigo.|Palpitações, ansiedade, dor retroesternal, náusea.|Cuidado com punção profunda (risco de perfurar fígado em hepatomegalia).|Acalma o Shen, harmoniza Coração e Estômago e resolve fleuma-calor.
CV-15|Jiuwei, ponto Luo do Ren Mai.|Na linha média, 7 cun acima do umbigo, na extremidade inferior do esterno.|Ansiedade, dor epigástrica, soluços, tosse seca.|Inserir oblíquo e superficial para evitar cavidade torácica.|Acalma o Shen, relaxa o diafragma e harmoniza o Qi ascendente/descendente.
CV-16|Zhongting, pátio central.|Na linha média, no nível do 5º espaço intercostal, sobre o processo xifoide.|Dor torácica, refluxo, soluços, vômito.|Cuidado com o esterno; inserção subcutânea.|Desobstrui o peito, direciona Qi para baixo e alivia refluxo.
CV-17|Shanzhong, ponto Mu do Pericárdio e ponto Hui do Qi.|Na linha média do tórax, ao nível do 4º espaço intercostal entre os mamilos.|Asma, dispneia, mastite, ansiedade.|Agulhar superficialmente para evitar pleura.|Regula Qi do pulmão e do coração, favorece lactação e acalma o Shen.
CV-18|Yutang, salão de jade.|Na linha média, ao nível do 3º espaço intercostal.|Dor torácica, tosse crônica, opressão no peito.|Evitar punção profunda.|Dispersa estagnação no peito, desce o Qi do Pulmão e acalma o Shen.
CV-19|Zigong, palácio roxo.|Na linha média, ao nível do 2º espaço intercostal.|Palpitações, tosse, dor torácica alta.|Inserção subcutânea para evitar pleura.|Libera o peito, regula Qi do Coração e do Pulmão.
CV-20|Huagai, cobertura esplêndida.|Na linha média, no 1º espaço intercostal.|Tosse rebelde, plenitude torácica, asma.|Agulhar superficialmente para evitar pleura.|Desce Qi rebelde, limpa calor do tórax e dissolve fleuma.
CV-21|Xuanji, pivô de jade.|Na linha média, na fossa supraesternal.|Dispneia, tosse, sensação de nó na garganta.|Inserir pequena profundidade direcionada inferiormente; evitar traqueia.|Regula Qi do Pulmão, dissolve fleuma e acalma sensação de sufocamento.
CV-22|Tiantu, portal do céu.|Na depressão acima do manúbrio esternal, na incisura supraesternal.|Tosse, asma, perda da voz, sensação de corpo estranho na garganta.|Inserção deve ser oblíqua inferior para evitar a traqueia.|Desce Qi rebelde, alivia garganta e limpa fleuma-calor.
CV-23|Lianquan, fonte do jade.|Acima do pomo de Adão, no centro da prega entre hióide e borda da mandíbula.|Afonia, disfagia, rigidez da língua, salivação excessiva.|Inserir oblíquo em direção à raiz da língua com cuidado para evitar vasos.|Beneficia a língua e garganta, clareia calor e dispersa vento interno.
CV-24|Chengjiang, recepção dos fluidos.|Na depressão no meio do sulco mentolabial.|Paralisia facial, salivação, dor de dente, espasmo labial.|Evitar estimulação excessiva em grávidas de alto risco.|Abre os orifícios, limpa calor da face e alivia espasmos locais.
"""

cv_data = {}
for line in raw_entries.strip().splitlines():
    code, description, location, indication, contraindications, functions = [field.strip() for field in line.split('|')]
    cv_data[code] = {
        "description": description,
        "location": location,
        "indication": indication,
        "contraindications": contraindications,
        "functions": functions,
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
        if code in cv_data:
            data = cv_data[code]
            row['description'] = data['description']
            row['location'] = data['location']
            row['indication'] = data['indication']
            row['contraindications'] = data['contraindications'] or "Nenhuma contraindicação específica."
            row['functions'] = data['functions']
            updated_count += 1
        writer.writerow(row)

os.replace(temp_file_path, csv_file_path)
print(f"Updated {updated_count} rows in {csv_file_path}")
