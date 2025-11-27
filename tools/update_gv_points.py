import csv
import os

raw_entries = """
GV-1|Changqiang, ponto Luo do Du Mai.|Na linha média posterior, entre a ponta do cóccix e o ânus.|Hemorroidas, prolapso retal, dor no cóccix, epilepsia.|Inserir superficialmente para evitar perfurar o reto; contraindicado em gravidez avançada.|Tonifica Yang do Rim, estabiliza o intestino inferior e acalma espasmos.
GV-2|Yaoshu, portal lombar.|Na fenda sacral, na depressão do hiato sacral.|Dor lombar, ciática, impotência, convulsões infantis.|Evitar agulhamento profundo em gestantes e pacientes com malformações sacrais.|Dissipa estagnação no sacro, aquece o aquecedor inferior e relaxa tendões.
GV-3|Yaoyangguan, passagem do Yang lombar.|Abaixo do processo espinhoso de L4, na linha média posterior.|Dor lombar, fraqueza das pernas, espermatorreia, menstruação irregular.|Evitar punção profunda em osteoporose.|Fortalece lombar e joelhos, regula Rins e remove umidade-frio.
GV-4|Mingmen, Porta da Vida.|Abaixo do processo espinhoso de L2, na linha média posterior.|Dor lombar, infertilidade, micção frequente, frio nas extremidades.|Evitar agulhamento profundo na gravidez; cautela com medula.|Tonifica o Fogo de Mingmen, reforça Yuan Qi e aquece o aquecedor inferior.
GV-5|Xuanshu, pivô suspenso.|Abaixo do processo espinhoso de L1.|Rigidez lombar, diarreia, dor abdominal, epilepsia.|Evitar agulhamento profundo.|Harmoniza Baço e Estômago, fortalece a coluna e dispersa umidade.
GV-6|Jizhong, centro da coluna.|Abaixo do processo espinhoso de T11.|Dor torácica e abdominal, diarreia, febres intermitentes.|Evitar penetrar demasiado para não irritar medula.|Regula o Qi do Triplo Aquecedor e fortalece o dorso.
GV-7|Zhongshu, pivô central.|Abaixo do processo espinhoso de T10.|Dor torácica, contraturas dorsais, gastrite.|Evitar profundidade excessiva.|Dispersa calor do estômago, relaxa músculos dorsais e move Qi.
GV-8|Jinsuo, contração muscular.|Abaixo do processo espinhoso de T9.|Espasmos, epilepsia, rigidez dorsal.|Evitar agulhamento profundo.|Acaba com vento interno, relaxa tendões e alivia dor dorsal.
GV-9|Zhiyang, atingindo o Yang.|Abaixo do processo espinhoso de T7.|Icterícia, dor torácica, tosse crônica.|Evitar penetração profunda (risco de pleura).|Drena calor do Fígado e Vesícula, harmoniza o diafragma e tonifica Pulmão.
GV-10|Lingtai, plataforma espiritual.|Abaixo do processo espinhoso de T6.|Tosse, febre, eczema, rigidez dorsal.|Evitar pleura.|Elimina calor do Pulmão, acalma o Shen e relaxa a coluna.
GV-11|Shendao, caminho do espírito.|Abaixo do processo espinhoso de T5.|Palpitações, ansiedade, tosse, dor interescapular.|Evitar pleura.|Aclara calor do Coração, acalma Shen e relaxa região torácica.
GV-12|Shenzhu, pilar do corpo.|Abaixo do processo espinhoso de T3.|Calor alto, epilepsia, tosse, dor cervical.|Evitar medula e pleura.|Elimina calor patogênico, acalma convulsões e fortalece Wei Qi.
GV-13|Taodao, caminho do forno.|Abaixo do processo espinhoso de T1.|Febre alta, rigidez cervical, ansiedade.|Evitar medula.|Libera o exterior, expulsa patógenos e acalma Shen.
GV-14|Dazhui, grande vértebra.|Entre C7 e T1, na base do pescoço.|Febres, rigidez cervical, hipertensão, asma.|Substituir por técnica oblíqua para evitar medula.|Libera vento-calor, tonifica Yang e regula os meridianos Yang.
GV-15|Yamen, portal mudo.|0,5 cun acima da linha posterior do cabelo, entre C1 e C2.|Rigidez cervical, afonia, cefaleia occipital.|Inserção horizontal em direção à mandíbula para evitar medula.|Desobstrui a garganta, acalma vento interno e clareia sentidos.
GV-16|Fengfu, palácio do vento.|Logo abaixo da protuberância occipital externa, na linha média.|Cefaleia, vertigem, insônia, rigidez de nuca.|Inserção oblíqua inferior; evitar penetração craniana.|Expulsa vento interno/externo, nutre cérebro e acalma o Shen.
GV-17|Naohu, porta do cérebro.|1,5 cun acima de GV-16, na linha média.|Tontura, convulsões, visão turva.|Inserção subcutânea posterior.|Aclara o cérebro, alivia dor e dispersa vento interno.
GV-18|Qiangjian, espaço firme.|1,5 cun acima de GV-17.|Cefaleia, vertigem, epistaxe.|Inserção subcutânea.|Pacifica vento, refresca a cabeça e beneficia o nariz.
GV-19|Houding, vértice posterior.|1,5 cun acima de GV-18.|Cefaleia occipital, convulsões, insônia.|Inserção subcutânea.|Subjuga Yang ascendente, acalma o Shen e alivia dor no vértice.
GV-20|Baihui, cem reuniões.|7 cun acima da borda posterior do cabelo, no topo da cabeça.|Cefaleia, hipertensão, prolapso, ansiedade.|Inserção subcutânea; evitar pressão excessiva em craniossinostose.|Eleva Yang, ancora a mente, estabiliza prolapsos e beneficia o cérebro.
GV-21|Qianding, topo frontal.|1,5 cun anterior a GV-20.|Cefaleia frontal, ansiedade, rinite.|Inserção subcutânea.|Aclara cabeça, pacifica Shen e abre os orifícios nasais.
GV-22|Xinhui, encontro das fontanelas.|2 cun anterior a GV-21.|Rinite crônica, cefaleia, vertigem.|Inserção subcutânea para frente.|Dispersa vento e calor, libera nariz e acalma a mente.
GV-23|Shangxing, estrela superior.|1 cun anterior a GV-22.|Sinusite, epistaxe, transtornos emocionais.|Inserção subcutânea.|Abre nariz, expulsa vento e clareia o Shen.
GV-24|Shenting, pátio do espírito.|0,5 cun anterior à linha do cabelo, na linha média.|Ansiedade, insônia, sinusite frontal.|Inserção subcutânea.|Acalma Shen, clareia olhos e nariz e dissipa vento.
GV-25|Suliao, espaço puro.|Na ponta do nariz.|Congestão nasal, choque, perda de consciência.|Evitar agulhar profundamente (risco de cartilagem).|Desperta a consciência, abre o nariz e remove calor.
GV-26|Renzhong, meio da pessoa.|No sulco nasolabial, no terço superior da linha do filtro.|Choque, síncope, convulsões, dor lombar aguda.|Inserir obliquamente superior, evitando perfurar gengiva.|Restaura a consciência, desobstrui os colaterais e alivia dor lombar aguda.
GV-27|Duiduan, limite do intercâmbio.|No ponto médio entre lábio superior e gengiva.|Dor nos lábios, paralisia facial, convulsões infantis.|Evitar sangramentos em pacientes anticoagulados.|Desperta a consciência, harmoniza os lábios e dispersa vento interno.
GV-28|Yinjiao, união das gengivas.|Na junção entre gengiva e lábio superior, internamente.|Sangramento gengival, paralisia facial, trismo.|Inserir superficialmente; evitar lesão das gengivas.|Remove calor da boca, beneficia gengivas e relaxa espasmos faciais.
"""

gv_data = {}
for line in raw_entries.strip().splitlines():
    code, description, location, indication, contraindications, functions = [field.strip() for field in line.split('|')]
    gv_data[code] = {
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
        if code in gv_data:
            data = gv_data[code]
            row['description'] = data['description']
            row['location'] = data['location']
            row['indication'] = data['indication']
            row['contraindications'] = data['contraindications'] or "Nenhuma contraindicação específica."
            row['functions'] = data['functions']
            updated_count += 1
        writer.writerow(row)

os.replace(temp_file_path, csv_file_path)
print(f"Updated {updated_count} rows in {csv_file_path}")
