import csv
import os

raw_entries = """
BL-1|Jingming, ponto de encontro com ST, SI, YM e Yin Qiao.|Na depressão ligeiramente medial ao canto interno do olho.|Olhos vermelhos, lacrimejamento, visão turva, insônia, paralisia facial.|Inserção precisa com apoio digital protege o globo ocular.|Expulsa vento-calor, beneficia os olhos e acalma o Shen.
BL-2|Zanzhu, ponto local para pálpebras e fronte.|No arco medial da sobrancelha, na depressão acima do canto interno do olho.|Dor frontal, blefaroespasmo, rinite, paralisia facial.|Evitar punção profunda no seio frontal.|Dispersa vento e alivia dor frontal, clareia a visão.
BL-3|Meichong, ponto que estabiliza Yang na fronte.|0,5 cun dentro da linha anterior do cabelo, diretamente acima de BL-2.|Tontura, congestão nasal, epilepsia inicial.|Inserção subcutânea para evitar calota craniana.|Expulsa vento, aclarando cabeça e nariz.
BL-4|Quchai, ponto temporal para dores crônicas.|0,5 cun dentro da linha capilar, 1,5 cun lateral à linha média.|Cefaleia, epilepsia, vertigem, visão borrada.|Inserção superficial.|Dissipa vento e acalma convulsões leves.
BL-5|Wuchu, ponto para calor ascendente.|1 cun dentro da linha capilar, 1,5 cun lateral à linha média.|Epistaxe, convulsões, dor de cabeça.|Evitar inserção profunda.|Abaixa o Yang, refresca a cabeça.
BL-6|Chengguang, ponto que esclarece o cérebro.|2,5 cun dentro da linha anterior do cabelo, 1,5 cun lateral à linha média.|Cefaleia, zumbido, convulsões.|Inserção superficial.|Expulsa vento e abre os orifícios sensoriais.
BL-7|Tongtian, ponto para sinusite e cefaleia.|4 cun posterior à linha anterior do cabelo, 1,5 cun lateral à linha média.|Sinusite frontal, cefaleia, anosmia.|Evitar perfurar o crânio; usar subcutânea.|Dispersa vento, desobstrui nariz e alivia dor.
BL-8|Luoque, ponto calmante.|5,5 cun posterior à linha anterior do cabelo, 1,5 cun lateral à linha média.|Tontura, convulsões, vômito por estresse.|Inserção subcutânea.|Acalma o Shen, harmoniza a cabeça e elimina vento.
BL-9|Yuzhen, ponto na base do crânio.|1,3 cun lateral a GV-17 na borda occipital.|Cefaleia occipital, rigidez cervical, visão turva.|Inserção oblíqua inferior para evitar penetração craniana.|Expulsa vento, relaxa a nuca e beneficia olhos.
BL-10|Tianzhu, ponto Janela do Céu.|1,3 cun lateral a GV-15, na depressão entre trapézio e esternocleidomastoideo.|Tontura, cefaleia occipital, rigidez de nuca, ansiedade.|Direcionar a agulha para o nariz; evitar artéria vertebral.|Libera o vento interno, estabiliza a cabeça e acalma o Shen.
BL-11|Dazhu, ponto Hui dos ossos.|1,5 cun lateral a T1.|Dor cervical, osteoporose, gripe com febre, rigidez torácica.|Evitar penetrar muito profundamente para não lesar o pulmão.|Nutre ossos, expulsa vento externo e fortalece o pescoço.
BL-12|Fengmen, porta do vento.|1,5 cun lateral a T2.|Resfriados, tosse, febre, dor no ombro.|Cuidado com pneumotórax.|Libera o exterior, dispersa vento-frio e fortalece Wei Qi.
BL-13|Feishu, ponto Shu do Pulmão.|1,5 cun lateral a T3.|Tosse, asma, pele seca, tristeza.|Cuidado com pulmão.|Tonifica Pulmão, desce Qi e regula a pele.
BL-14|Jueyinshu, Shu do Pericárdio.|1,5 cun lateral a T4.|Dor torácica, palpitações, ansiedade.|Evitar perfurar pulmão.|Acalma o Shen, regula o Coração e abre o peito.
BL-15|Xinshu, Shu do Coração.|1,5 cun lateral a T5.|Insônia, palpitações, ansiedade, perda de memória.|Evitar perfurar pulmão.|Tonifica Coração, nutre Shen e regula o Sangue.
BL-16|Dushu, Shu do Du Mai.|1,5 cun lateral a T6.|Rigidez dorsal, dor espinhal, problemas de pele.|Cuidado com pulmão.|Harmoniza Du Mai, reforça coluna e libera a pele.
BL-17|Geshu, ponto Hui do Sangue.|1,5 cun lateral a T7.|Anemia, estase sanguínea, dor epigástrica, vômito.|Cuidado com pulmão.|Tonifica e mobiliza o Sangue, refresca calor e estanca sangramentos.
BL-18|Ganshu, Shu do Fígado.|1,5 cun lateral a T9.|Irritabilidade, icterícia, distúrbios oculares, dor costal.|Cuidado com pulmão.|Nutre Fígado, move Qi e clareia os olhos.
BL-19|Danshu, Shu da Vesícula Biliar.|1,5 cun lateral a T10.|Náusea, colecistite, dor costal, amargor na boca.|Cuidado com pulmão.|Drena umidade-calor da VB, harmoniza Shaoyang.
BL-20|Pishu, Shu do Baço.|1,5 cun lateral a T11.|Fadiga, diarreia, distensão abdominal, edemas.|Cuidado com pulmão.|Tonifica Baço, transforma umidade e regula a digestão.
BL-21|Weishu, Shu do Estômago.|1,5 cun lateral a T12.|Gastrite, refluxo, dor epigástrica, anorexia.|Cuidado com pulmão.|Harmoniza Estômago, desce Qi rebelde e alivia dor.
BL-22|Sanjiaoshu, Shu do Triplo Aquecedor.|1,5 cun lateral a L1.|Edema, distensão abdominal, febres alternadas.|Cuidado com rins.|Regula água, mobiliza Qi dos três aquecedores e remove umidade.
BL-23|Shenshu, Shu do Rim.|1,5 cun lateral a L2.|Dor lombar, tinnitus, infertilidade, micção fraca.|Cuidado com rins.|Tonifica Rins, fortalece lombar e regula água e Jing.
BL-24|Qihaishu, ponto do Mar do Qi.|1,5 cun lateral a L3.|Dor lombar, problemas menstruais, constipação.|Cuidado com rins.|Fortalece lombar, move Qi do aquecedor inferior.
BL-25|Dachangshu, Shu do Intestino Grosso.|1,5 cun lateral a L4.|Constipação, diarreia, dor lombar inferior.|Cuidado com rins.|Regula intestinos e alivia dor lombar.
BL-26|Guanyuanshu, porta da origem.|1,5 cun lateral a L5.|Dor lombar, ciática, distúrbios urinários.|Cuidado com rins.|Aquece o aquecedor inferior e fortalece a lombar.
BL-27|Xiaochangshu, Shu do Intestino Delgado.|1,5 cun lateral ao forame sacral S1.|Diarreia, cistite, dor sacral.|Evitar perfurar sacro.|Regula intestino delgado e aquece o aquecedor inferior.
BL-28|Pangguangshu, Shu da Bexiga.|1,5 cun lateral a S2.|Retenção urinária, dor lombosacra, leucorreia.|Evitar perfuração profunda.|Regula Bexiga, elimina umidade-calor.
BL-29|Zhonglushu, Shu médio da coluna.|1,5 cun lateral a S3.|Dor lombar média, diarreia, hérnia.|Evitar perfurar sacro.|Fortalece lombar e regula intestinos.
BL-30|Baihuanshu, Shu do anel branco.|1,5 cun lateral a S4.|Dor sacral, infertilidade, leucorreia, hemorroidas.|Evitar perfuração.|Fortalece sacro, regula útero e intestinos.
BL-31|Shangliao, primeiro forame sacral.|No forame sacral superior.|Ciática, distúrbios genitais, retenção urinária.|Entrada direta curta para evitar plexo sacral.|Regula Bexiga e útero, alivia ciática.
BL-32|Ciliao, segundo forame sacral.|No forame sacral médio.|Disfunção sexual, dor lombar, partos difíceis.|Inserção oblíqua curta.|Regula útero, facilita parto e trata dor sacral.
BL-33|Zhongliao, terceiro forame sacral.|No forame S3.|Dor lombar, constipação, distúrbios urinários.|Inserção oblíqua.|Move Qi do aquecedor inferior e alivia dor sacral.
BL-34|Xialiao, quarto forame sacral.|No forame S4.|Diarreia, hemorroidas, disfunção urinária.|Inserção oblíqua para proteger o plexo sacral.|Regula intestinos e Bexiga, alivia dor perineal.
BL-35|Huiyang, encontro dos Yang.|0,5 cun lateral da ponta do cóccix.|Dor no cóccix, prurido anal, hemorroidas.|Evitar perfurar reto.|Clarifica calor-umidade, relaxa o cóccix.
BL-36|Chengfu, apoio dos músculos.|Na dobra glútea, meio entre o cóccix e o trocânter.|Ciática, dor lombar, espasmo dos isquiotibiais.|Inserção profunda orientada ao nervo ciático com cuidado.|Ativa a circulação no membro inferior e alivia dor do ciático.
BL-37|Yinmen, portão da coxa posterior.|6 cun inferior a BL-36, entre isquiotibiais.|Ciática, dormência de perna, dor femoral.|Evitar vasos profundos.|Libera o canal Taiyang e reduz dor posterior da coxa.
BL-38|Fuxi, fenda superficial.|1 cun superior a BL-39, lateral ao tendão do bíceps femoral.|Dor lateral do joelho, paralisia.|Inserir superficial.|Relaxa tendões e remove estagnação no joelho.
BL-39|Weiyang, He inferior do SJ.|Na fossa poplítea, lateral ao tendão do bíceps femoral.|Edema, dificuldades urinárias, dor no joelho.|Evitar vasos poplíteos.|Desobstrui via das águas e alivia joelho.
BL-40|Weizhong, ponto He-Mar da Bexiga.|No centro da fossa poplítea.|Dor lombar, ciática, eczemas, insolação.|Cuidado com artéria poplítea.|Refresca sangue, remove estagnação e alivia dor lombar.
BL-41|Fufen, Shu lateral de T2.|3 cun lateral a T2, na linha do ramo exterior.|Dor torácica, rigidez escapular, tosse.|Cuidado com pulmão.|Desbloqueia o canal Taiyang externo e relaxa ombro.
BL-42|Pohu, porta da alma corpórea.|3 cun lateral a T3.|Tristeza, tosse crônica, falta de ar, depressão.|Risco pulmonar.|Acalma Po, fortalece Pulmão e abre o peito.
BL-43|Gaohuangshu, ponto de tonicidade geral.|3 cun lateral a T4.|Tuberculose, fadiga crônica, suores noturnos.|Risco pulmonar.|Tonifica Qi, Yin e Sangue, trata deficiências profundas.
BL-44|Shentang, salão do espírito.|3 cun lateral a T5.|Ansiedade, insônia, agitação torácica.|Risco pulmonar.|Acalma Shen, abre tórax e regula Coração.
BL-45|Yixi, fenda da lamentação.|3 cun lateral a T6.|Asma, dor torácica, prurido cutâneo.|Risco pulmonar.|Desce Qi do Pulmão, limpa calor e alivia prurido.
BL-46|Geguan, porta do diafragma.|3 cun lateral a T7.|Plenitude torácica, refluxo, soluços.|Risco pulmonar.|Regula diafragma, move Qi e alivia estagnação torácica.
BL-47|Hunmen, porta da alma etérea.|3 cun lateral a T9.|Irritabilidade, depressão, dor hipocondríaca.|Risco pulmonar.|Nutre Hun, move Qi do Fígado e estabiliza emoções.
BL-48|Yanggang, conexão com VB.|3 cun lateral a T10.|Colecistite, icterícia, dor lateral.|Risco pulmonar.|Drena VB, harmoniza Shaoyang e reduz icterícia.
BL-49|Yishe, morada do pensamento.|3 cun lateral a T11.|Fadiga mental, gastrite, distensão.|Risco pulmonar.|Sustenta Baço, acalma o Yi e melhora assimilação.
BL-50|Weicang, celeiro do estômago.|3 cun lateral a T12.|Distensão epigástrica, soluços, anorexia.|Risco pulmonar.|Harmoniza Estômago, move alimentos e reduz plenitude.
BL-51|Huangmen, porta vitais.|3 cun lateral a L1.|Dor epigástrica, constipação, espasmos intestinais.|Cuidado renal.|Regula aquecedor médio e apoia Rins.
BL-52|Zhishi, quarto da vontade.|3 cun lateral a L2.|Ansiedade, impotência, infertilidade, dor lombar.|Cuidado renal.|Tonifica Jing, apoia vontade e fortalece lombar.
BL-53|Baohuang, vísceras da bexiga.|3 cun lateral a S2.|Distúrbios urinários, leucorreia, dor sacral.|Evitar perfuração.|Regula Bexiga e útero, remove umidade.
BL-54|Zhibian, extremidade ordenada.|3 cun lateral a S4.|Ciática, constipação, hemorroidas.|Evitar perfuração.|Libera o canal Taiyang inferior e alivia dor pélvica.
BL-55|Heyang, convergência do Yang.|2 cun abaixo de BL-40, entre os ventres gastrocnêmios.|Espasmos, dor na panturrilha, hemorroidas.|Evitar veias superficiais.|Relaxar panturrilha, move sangue e desce calor.
BL-56|Chengjin, apoio dos tendões.|5 cun abaixo de BL-40, centro da barriga da perna.|Cãibras, tendinite de Aquiles, dor de panturrilha.|Evitar punção profunda no nervo tibial.|Descontrai tendões, alivia dor e melhora circulação.
BL-57|Chengshan, apoio da montanha.|8 cun abaixo de BL-40 na bifurcação do gastrocnêmio.|Ciática, hemorroidas, cãibras nas pernas.|Evitar veias superficiais.|Relaxa músculos da panturrilha, alivia hemorroidas e dor lombar.
BL-58|Feiyang, ponto Luo.|7 cun acima de BL-60, lateral ao tendão de Aquiles.|Ciática, dor lombar, tontura, hemorroidas.|Cuidado com nervo sural.|Fortalece conexão Taiyang, alivia dor lombossacra e hemorroidas.
BL-59|Fuyang, Xi-Cleft do Yang Qiao.|3 cun acima de BL-60, posterior ao maléolo lateral.|Dor aguda do tornozelo, convulsões, rigidez lombar.|Evitar tendão de Aquiles.|Tonifica Yang Qiao, relaxa tornozelo e reduz convulsões.
BL-60|Kunlun, ponto Jing-Rio (Fogo).|Na depressão entre o maléolo lateral e o tendão de Aquiles.|Dor lombar, ciática, cefaleia occipital, parto bloqueado.|Contraindicado na gravidez tardia.|Dispersa vento, relaxa a coluna e facilita o parto quando indicado.
BL-61|Pucan, visitante submisso.|1,5 cun inferior a BL-60, no calcâneo lateral.|Dor no calcanhar, entorses, rigidez plantar.|Evitar punção profunda no calcâneo.|Relaxa o tornozelo e abre o canal lateral.
BL-62|Shenmai, abertura do Yang Qiao.|Na depressão diretamente abaixo do maléolo lateral.|Insônia, epilepsia, dor cervical, distensão lateral.|Evitar vasos do dorso do pé.|Abre Yang Qiao, expulsa vento e harmoniza cabeça e olhos.
BL-63|Jinmen, ponto Xi-Cleft da Bexiga.|Posterior ao tubérculo do 5º metatarso, na depressão anterior ao calcâneo.|Dor aguda do tornozelo, convulsões, dor lombar.|Evitar vasos dorsais.|Move Qi Taiyang, alivia dor aguda e convulsões súbitas.
BL-64|Jinggu, ponto Yuan-Fonte.|Anterior e inferior ao tubérculo do 5º metatarso.|Dor lombar com irradiação para o pé, epilepsia, ansiedade.|Evitar vasos dorsais.|Fortalece canal Taiyang e acalma a mente.
BL-65|Shugu, ponto Shu-Riacho (Madeira).|Na depressão proximal à cabeça do 5º metatarso.|Dor de dente, cefaleia, rigidez cervical, febre.|Inserção superficial.|Dispersa calor, alivia dor de cabeça e relaxa o pescoço.
BL-66|Zutonggu, ponto Ying-Manancial (Água).|Distal à articulação metatarsofalângica do 5º dedo.|Cefaleia, vertigem, epistaxe, febre.|Evitar sangria profunda.|Limpa calor do Taiyang, beneficia a cabeça e a face.
BL-67|Zhiyin, ponto Jing-Poço (Metal).|0,1 cun lateral ao canto da unha do 5º dedo do pé.|Apresentação pélvica, parto prolongado, febre alta, cefaleia.|Sangria com técnica asséptica; cautela em gestantes salvo indicação obstétrica.|Vira o feto, revive a consciência e dispersa calor extremo.
"""

bl_data = {}
for line in raw_entries.strip().splitlines():
    code, description, location, indication, contraindications, functions = [field.strip() for field in line.split('|')]
    bl_data[code] = {
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
        if code in bl_data:
            data = bl_data[code]
            row['description'] = data['description']
            row['location'] = data['location']
            row['indication'] = data['indication']
            row['contraindications'] = data['contraindications'] or "Nenhuma contraindicação específica."
            row['functions'] = data['functions']
            updated_count += 1
        writer.writerow(row)

os.replace(temp_file_path, csv_file_path)
print(f"Updated {updated_count} rows in {csv_file_path}")
