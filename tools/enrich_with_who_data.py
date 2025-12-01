"""
Script para enriquecer o dataset de pontos com dados do WHO Standard.
Adiciona localizações padronizadas WHO e notas anatômicas.
Traduz automaticamente para Português.
"""

import json
import re
from datetime import datetime

# Dicionário de tradução de termos anatômicos EN -> PT-BR
ANATOMY_TRANSLATIONS = {
    # Regiões do corpo
    "anterior region of the neck": "região anterior do pescoço",
    "posterior region of the neck": "região posterior do pescoço",
    "anterior thoracic region": "região torácica anterior",
    "lateral thoracic region": "região torácica lateral",
    "upper back region": "região superior das costas",
    "lumbar region": "região lombar",
    "sacral region": "região sacral",
    "buttock region": "região glútea",
    "groin region": "região inguinal",
    "perineal region": "região perineal",
    "scapular region": "região escapular",
    "upper abdomen": "abdome superior",
    "lower abdomen": "abdome inferior",
    "on the face": "na face",
    "on the head": "na cabeça",
    "on the palm": "na palma",
    "on the dorsum of the hand": "no dorso da mão",
    "on the dorsum of the foot": "no dorso do pé",
    "on the sole of the foot": "na sola do pé",
    
    # Aspectos/direções
    "anterior aspect": "aspecto anterior",
    "posterior aspect": "aspecto posterior",
    "lateral aspect": "aspecto lateral",
    "medial aspect": "aspecto medial",
    "anterolateral aspect": "aspecto anterolateral",
    "posterolateral aspect": "aspecto posterolateral",
    "anteromedial aspect": "aspecto anteromedial",
    "posteromedial aspect": "aspecto posteromedial",
    "fibular aspect": "aspecto fibular",
    "tibial aspect": "aspecto tibial",
    
    # Partes do corpo
    "forearm": "antebraço",
    "arm": "braço",
    "elbow": "cotovelo",
    "wrist": "punho",
    "hand": "mão",
    "finger": "dedo",
    "thumb": "polegar",
    "index finger": "dedo indicador",
    "middle finger": "dedo médio",
    "ring finger": "dedo anelar",
    "little finger": "dedo mínimo",
    "great toe": "hálux",
    "little toe": "dedo mínimo do pé",
    "second toe": "segundo dedo do pé",
    "fourth toe": "quarto dedo do pé",
    "thigh": "coxa",
    "leg": "perna",
    "knee": "joelho",
    "ankle": "tornozelo",
    "foot": "pé",
    "shoulder": "ombro",
    "shoulder girdle": "cintura escapular",
    "axilla": "axila",
    "chest": "tórax",
    "abdomen": "abdome",
    "back": "costas",
    "neck": "pescoço",
    "head": "cabeça",
    "face": "face",
    "ear": "orelha",
    "eye": "olho",
    "nose": "nariz",
    "mouth": "boca",
    
    # Estruturas anatômicas
    "depression": "depressão",
    "in the depression": "na depressão",
    "prominence": "proeminência",
    "border": "borda",
    "inferior border": "borda inferior",
    "superior border": "borda superior",
    "medial border": "borda medial",
    "lateral border": "borda lateral",
    "anterior border": "borda anterior",
    "posterior border": "borda posterior",
    "midpoint": "ponto médio",
    "at the midpoint": "no ponto médio",
    "junction": "junção",
    "at the junction": "na junção",
    "intersection": "interseção",
    "at the intersection": "na interseção",
    "centre": "centro",
    "center": "centro",
    "line connecting": "linha que conecta",
    "on the line connecting": "na linha que conecta",
    
    # Ossos
    "bone": "osso",
    "clavicle": "clavícula",
    "scapula": "escápula",
    "spine of the scapula": "espinha da escápula",
    "humerus": "úmero",
    "radius": "rádio",
    "ulna": "ulna",
    "metacarpal": "metacarpo",
    "metatarsal": "metatarso",
    "phalanx": "falange",
    "distal phalanx": "falange distal",
    "tibia": "tíbia",
    "fibula": "fíbula",
    "patella": "patela",
    "femur": "fêmur",
    "sacrum": "sacro",
    "coccyx": "cóccix",
    "vertebra": "vértebra",
    "cervical vertebra": "vértebra cervical",
    "thoracic vertebra": "vértebra torácica",
    "lumbar vertebra": "vértebra lombar",
    "spinous process": "processo espinhoso",
    "styloid process": "processo estiloide",
    "mastoid process": "processo mastoide",
    "coracoid process": "processo coracoide",
    "olecranon": "olécrano",
    "acromion": "acrômio",
    "acromial angle": "ângulo acromial",
    "malleolus": "maléolo",
    "medial malleolus": "maléolo medial",
    "lateral malleolus": "maléolo lateral",
    "epicondyle": "epicôndilo",
    "medial epicondyle": "epicôndilo medial",
    "lateral epicondyle": "epicôndilo lateral",
    "condyle": "côndilo",
    "medial condyle": "côndilo medial",
    "lateral condyle": "côndilo lateral",
    "trochanter": "trocânter",
    "greater trochanter": "trocânter maior",
    "zygomatic arch": "arco zigomático",
    "zygomatic bone": "osso zigomático",
    "mandible": "mandíbula",
    "angle of the mandible": "ângulo da mandíbula",
    "occipital bone": "osso occipital",
    "external occipital protuberance": "protuberância occipital externa",
    "pubic symphysis": "sínfise púbica",
    "iliac crest": "crista ilíaca",
    "anterior superior iliac spine": "espinha ilíaca anterossuperior",
    "calcaneus": "calcâneo",
    "navicular bone": "osso navicular",
    "cuboid bone": "osso cuboide",
    "pisiform bone": "osso pisiforme",
    "triquetrum bone": "osso triquetral",
    "scaphoid bone": "osso escafoide",
    
    # Músculos
    "muscle": "músculo",
    "tendon": "tendão",
    "biceps brachii": "bíceps braquial",
    "triceps": "tríceps",
    "deltoid": "deltoide",
    "sternocleidomastoid": "esternocleidomastoideo",
    "trapezius": "trapézio",
    "gastrocnemius": "gastrocnêmio",
    "soleus": "sóleo",
    "tibialis anterior": "tibial anterior",
    "rectus femoris": "reto femoral",
    "vastus lateralis": "vasto lateral",
    "vastus medialis": "vasto medial",
    "sartorius": "sartório",
    "gracilis": "grácil",
    "adductor longus": "adutor longo",
    "semitendinosus": "semitendíneo",
    "semimembranosus": "semimembranoso",
    "biceps femoris": "bíceps femoral",
    "iliotibial band": "banda iliotibial",
    "palmaris longus": "palmar longo",
    "flexor carpi radialis": "flexor radial do carpo",
    "flexor carpi ulnaris": "flexor ulnar do carpo",
    "extensor digitorum": "extensor dos dedos",
    "extensor pollicis": "extensor do polegar",
    "abductor pollicis longus": "abdutor longo do polegar",
    "calcaneal tendon": "tendão calcâneo",
    "patellar ligament": "ligamento patelar",
    
    # Artérias/veias
    "artery": "artéria",
    "vein": "veia",
    "radial artery": "artéria radial",
    "femoral artery": "artéria femoral",
    "carotid artery": "artéria carótida",
    "dorsalis pedis artery": "artéria dorsal do pé",
    "axillary artery": "artéria axilar",
    "brachial artery": "artéria braquial",
    
    # Pregas e sulcos
    "crease": "prega",
    "fold": "prega",
    "cubital crease": "prega cubital",
    "popliteal crease": "prega poplítea",
    "palmar wrist crease": "prega palmar do punho",
    "dorsal wrist crease": "prega dorsal do punho",
    "gluteal fold": "prega glútea",
    "anterior axillary fold": "prega axilar anterior",
    "posterior axillary fold": "prega axilar posterior",
    "nasolabial sulcus": "sulco nasolabial",
    "mentolabial sulcus": "sulco mentolabial",
    "intercostal space": "espaço intercostal",
    
    # Estruturas faciais
    "eyebrow": "sobrancelha",
    "outer canthus": "canto externo do olho",
    "inner canthus": "canto interno do olho",
    "pupil": "pupila",
    "eyelid": "pálpebra",
    "nostril": "narina",
    "ala of the nose": "asa do nariz",
    "philtrum": "filtro labial",
    "upper lip": "lábio superior",
    "lower lip": "lábio inferior",
    "tragus": "tragus",
    "auricle": "aurícula",
    "auricular apex": "ápice auricular",
    "ear lobe": "lóbulo da orelha",
    "temple": "têmpora",
    "hairline": "linha do cabelo",
    "anterior hairline": "linha anterior do cabelo",
    "posterior hairline": "linha posterior do cabelo",
    
    # Outras estruturas
    "umbilicus": "umbigo",
    "nipple": "mamilo",
    "anus": "ânus",
    "thyroid cartilage": "cartilagem tireoide",
    "cricoid cartilage": "cartilagem cricoide",
    "xiphisternal junction": "junção xifoesternal",
    "suprasternal fossa": "fossa supraesternal",
    "infraclavicular fossa": "fossa infraclavicular",
    "anatomical snuffbox": "tabaqueira anatômica",
    "sacral hiatus": "hiato sacral",
    "sacral foramen": "forame sacral",
    "posterior sacral foramen": "forame sacral posterior",
    
    # Direções e posições
    "superior to": "superior a",
    "inferior to": "inferior a",
    "medial to": "medial a",
    "lateral to": "lateral a",
    "anterior to": "anterior a",
    "posterior to": "posterior a",
    "proximal to": "proximal a",
    "distal to": "distal a",
    "between": "entre",
    "at the same level as": "no mesmo nível de",
    "directly": "diretamente",
    "directly inferior": "diretamente inferior",
    "directly superior": "diretamente superior",
    
    # Medidas
    "B-cun": "cun",
    "F-cun": "cun",
    "fingerbreadth": "largura de dedo",
    
    # Verbos e frases comuns
    "is located": "está localizado",
    "can be palpated": "pode ser palpado",
    "can be felt": "pode ser sentido",
    "when the": "quando o",
    "with the": "com o",
    "flexed": "flexionado",
    "extended": "estendido",
    "abducted": "abduzido",
    "adducted": "aduzido",
    "red and white flesh": "pele vermelha e branca",
    "border between the red and white flesh": "limite entre a pele vermelha e branca",
    "at the border between": "no limite entre",
    "anterior median line": "linha mediana anterior",
    "posterior median line": "linha mediana posterior",
    "midaxillary line": "linha axilar média",
    "midclavicular line": "linha hemiclavicular",
    
    # Frases completas
    "On the": "Na",
    "In the": "Na",
    "on the": "na",
    "in the": "na",
    "of the": "do",
    "to the": "ao",
    "at the": "no",
    "and the": "e o",
    "from the": "do",
    "over the": "sobre a",
    "along the": "ao longo da",
    " the ": " o ",
    " and ": " e ",
    " or ": " ou ",
    " with ": " com ",
    " from ": " de ",
    " over ": " sobre ",
    
    # Números ordinais
    "first": "primeiro",
    "second": "segundo",
    "third": "terceiro",
    "fourth": "quarto",
    "fifth": "quinto",
    "sixth": "sexto",
    "seventh": "sétimo",
    "eighth": "oitavo",
    "ninth": "nono",
    "tenth": "décimo",
    "11th": "11º",
    "12th": "12º",
    
    # Notas comuns
    "Note:": "Nota:",
    "Remarks:": "Observações:",
    "Alternative location": "Localização alternativa",
    "are located": "estão localizados",
    "is located": "está localizado",
    "can be palpated": "pode ser palpado",
    "when": "quando",
    "where": "onde",
    "which": "que",
    "just": "logo",
    "slightly": "ligeiramente",
    "approximately": "aproximadamente",
    "above": "acima de",
    "below": "abaixo de",
    "level": "nível",
    "transverse line": "linha transversal",
}

def translate_to_portuguese(text):
    """
    Traduz texto anatômico do inglês para português.
    Usa substituição baseada em dicionário para termos técnicos.
    """
    if not text:
        return text
    
    result = text
    
    # Ordenar por tamanho (maior primeiro) para evitar substituições parciais
    sorted_terms = sorted(ANATOMY_TRANSLATIONS.items(), key=lambda x: len(x[0]), reverse=True)
    
    for en_term, pt_term in sorted_terms:
        # Usar word boundaries para evitar substituições parciais indesejadas
        # Mas manter flexível para termos compostos
        if len(en_term) <= 3:
            # Para palavras curtas, exigir limites de palavra
            pattern = re.compile(r'\b' + re.escape(en_term) + r'\b', re.IGNORECASE)
        else:
            # Para termos maiores, pode ser mais flexível
            pattern = re.compile(re.escape(en_term), re.IGNORECASE)
        
        def replace_match(match):
            original = match.group(0)
            # Preserva capitalização
            if original.isupper():
                return pt_term.upper()
            elif original[0].isupper():
                return pt_term.capitalize()
            else:
                return pt_term
        
        result = pattern.sub(replace_match, result)
    
    return result

# Dados WHO extraídos do documento oficial
# WHO Standard Acupuncture Point Locations in the Western Pacific Region (2008)
WHO_DATA = {
    # LUNG MERIDIAN (LU)
    "LU-1": {
        "locationWHO": "On the anterior thoracic region, at the same level as the first intercostal space, lateral to the infraclavicular fossa, 6 B-cun lateral to the anterior median line.",
        "noteWHO": "ST14, KI26, CV20 and LU1 are located on the transverse line along the first intercostal space.",
        "needling": {"depth": "0.5-0.8 cun", "angle": "oblique", "direction": "lateral", "caution": "Avoid deep perpendicular insertion - risk of pneumothorax"}
    },
    "LU-2": {
        "locationWHO": "On the anterior thoracic region, in the depression of the infraclavicular fossa, medial to the coracoid process of the scapula, 6 B-cun lateral to the anterior median line.",
        "noteWHO": "After identifying the deltopectoral triangle when the arm is flexed and slightly abducted against resistance, LU2 is in the centre of the deltopectoral triangle.",
        "needling": {"depth": "0.5-0.8 cun", "angle": "oblique", "direction": "lateral", "caution": "Avoid deep perpendicular insertion - risk of pneumothorax"}
    },
    "LU-3": {
        "locationWHO": "On the anterolateral aspect of the arm, just lateral to the border of the biceps brachii muscle, 3 B-cun inferior to the anterior axillary fold.",
        "noteWHO": "Longitudinally, LU3 is located at the same level as the junction of the upper one third and lower two thirds of the line connecting the level with anterior axillary fold to LU5.",
        "needling": {"depth": "0.5-1.0 cun", "angle": "perpendicular"}
    },
    "LU-4": {
        "locationWHO": "On the anterolateral aspect of the arm, just lateral to the border of the biceps brachii muscle, 4 B-cun inferior to the anterior axillary fold.",
        "needling": {"depth": "0.5-1.0 cun", "angle": "perpendicular"}
    },
    "LU-5": {
        "locationWHO": "On the anterior aspect of the elbow, at the cubital crease, in the depression lateral to the biceps brachii tendon.",
        "noteWHO": "With the elbow flexed, LU5 is located at the cubital crease, between LI11 and PC3, separated from PC3 by the biceps brachii tendon.",
        "needling": {"depth": "0.8-1.2 cun", "angle": "perpendicular", "caution": "Avoid brachial artery"}
    },
    "LU-6": {
        "locationWHO": "On the anterolateral aspect of the forearm, on the line connecting LU5 with LU9, 7 B-cun superior to the palmar wrist crease.",
        "noteWHO": "LU6 is 5 B-cun inferior to LU5, 1 B-cun superior to the midpoint of the line connecting LU5 with LU9.",
        "needling": {"depth": "0.5-1.0 cun", "angle": "perpendicular"}
    },
    "LU-7": {
        "locationWHO": "On the radial aspect of the forearm, between the tendons of the abductor pollicis longus and the extensor pollicis brevis muscles, in the groove for the abductor pollicis longus tendon, 1.5 B-cun superior to the palmar wrist crease.",
        "needling": {"depth": "0.3-0.5 cun", "angle": "oblique", "direction": "proximal"}
    },
    "LU-8": {
        "locationWHO": "On the anterolateral aspect of the forearm, between the radial styloid process and the radial artery, 1 B-cun superior to the palmar wrist crease.",
        "noteWHO": "1 B-cun superior to LU9.",
        "needling": {"depth": "0.3-0.5 cun", "angle": "perpendicular", "caution": "Avoid radial artery"}
    },
    "LU-9": {
        "locationWHO": "On the anterolateral aspect of the wrist, between the radial styloid process and the scaphoid bone, in the depression ulnar to the abductor pollicis longus tendon.",
        "noteWHO": "On the radial side of the palmar wrist crease, over the radial artery.",
        "needling": {"depth": "0.3-0.5 cun", "angle": "perpendicular", "caution": "Avoid radial artery"}
    },
    "LU-10": {
        "locationWHO": "On the palm, radial to the midpoint of the first metacarpal bone, at the border between the red and white flesh.",
        "needling": {"depth": "0.5-0.8 cun", "angle": "perpendicular"}
    },
    "LU-11": {
        "locationWHO": "On the thumb, radial to the distal phalanx, 0.1 F-cun proximal-lateral to the radial corner of the thumb nail, at the intersection of the vertical line of the radial border and the horizontal line of the base of the thumb nail.",
        "needling": {"depth": "0.1 cun", "angle": "perpendicular", "technique": "Prick to bleed"}
    },
    
    # LARGE INTESTINE MERIDIAN (LI)
    "LI-1": {
        "locationWHO": "On the index finger, radial to the distal phalanx, 0.1 F-cun proximal-lateral to the radial corner of the index fingernail, at the intersection of the vertical line of the radial border of the fingernail and the horizontal line of the base of the index fingernail.",
        "needling": {"depth": "0.1 cun", "angle": "perpendicular", "technique": "Prick to bleed"}
    },
    "LI-2": {
        "locationWHO": "On the index finger, in the depression distal to the radial side of the second metacarpophalangeal joint, at the border between the red and white flesh.",
        "needling": {"depth": "0.2-0.3 cun", "angle": "perpendicular"}
    },
    "LI-3": {
        "locationWHO": "On the dorsum of the hand, in the depression radial and proximal to the second metacarpophalangeal joint.",
        "needling": {"depth": "0.5-0.8 cun", "angle": "perpendicular"}
    },
    "LI-4": {
        "locationWHO": "On the dorsum of the hand, radial to the midpoint of the second metacarpal bone.",
        "needling": {"depth": "0.5-1.0 cun", "angle": "perpendicular", "caution": "Contraindicated during pregnancy"}
    },
    "LI-5": {
        "locationWHO": "On the posterolateral aspect of the wrist, at the radial side of the dorsal wrist crease, distal to the radial styloid process, in the depression of the anatomical snuffbox.",
        "noteWHO": "The depression of the anatomical snuffbox is formed when the thumb is fully abducted and extended between the tendons of the extensor pollicis longus and the extensor pollicis brevis.",
        "needling": {"depth": "0.3-0.5 cun", "angle": "perpendicular"}
    },
    "LI-6": {
        "locationWHO": "On the posterolateral aspect of the forearm, on the line connecting LI5 with LI11, 3 B-cun superior to the dorsal wrist crease.",
        "noteWHO": "LI6 is located at the junction of the upper three fourths and the lower one fourth of the line connecting LI5 with LI11.",
        "needling": {"depth": "0.5-0.8 cun", "angle": "perpendicular"}
    },
    "LI-7": {
        "locationWHO": "On the posterolateral aspect of the forearm, on the line connecting LI5 with LI11, 5 B-cun superior to the dorsal wrist crease.",
        "needling": {"depth": "0.5-1.0 cun", "angle": "perpendicular"}
    },
    "LI-8": {
        "locationWHO": "On the posterolateral aspect of the forearm, on the line connecting LI5 with LI11, 4 B-cun inferior to the cubital crease.",
        "noteWHO": "LI8 is located at the junction of the upper one third and lower two thirds of the line connecting LI5 with LI11, 1 B-cun inferior to LI9.",
        "needling": {"depth": "0.5-1.0 cun", "angle": "perpendicular"}
    },
    "LI-9": {
        "locationWHO": "On the posterolateral aspect of the forearm, on the line connecting LI5 with LI11, 3 B-cun inferior to the cubital crease.",
        "needling": {"depth": "0.5-1.0 cun", "angle": "perpendicular"}
    },
    "LI-10": {
        "locationWHO": "On the posterolateral aspect of the forearm, on the line connecting LI5 with LI11, 2 B-cun inferior to the cubital crease.",
        "needling": {"depth": "0.8-1.2 cun", "angle": "perpendicular"}
    },
    "LI-11": {
        "locationWHO": "On the lateral aspect of the elbow, at the midpoint of the line connecting LU5 with the lateral epicondyle of the humerus.",
        "noteWHO": "When the elbow is fully flexed, LI11 is located in the depression on the lateral end of the cubital crease.",
        "needling": {"depth": "1.0-1.5 cun", "angle": "perpendicular"}
    },
    "LI-12": {
        "locationWHO": "On the posterolateral aspect of the elbow, superior to the lateral epicondyle of the humerus, anterior to the lateral supraepicondylar ridge.",
        "needling": {"depth": "0.5-1.0 cun", "angle": "perpendicular"}
    },
    "LI-13": {
        "locationWHO": "On the lateral aspect of the arm, on the line connecting LI11 with LI15, 3 B-cun superior to the cubital crease.",
        "needling": {"depth": "0.5-1.0 cun", "angle": "perpendicular"}
    },
    "LI-14": {
        "locationWHO": "On the lateral aspect of the arm, just anterior to the border of the deltoid muscle, 7 B-cun superior to LI11.",
        "needling": {"depth": "0.5-1.0 cun", "angle": "perpendicular"}
    },
    "LI-15": {
        "locationWHO": "On the shoulder girdle, in the depression between the anterior end of lateral border of the acromion and the greater tubercle of the humerus.",
        "noteWHO": "When the arm is abducted, two depressions appear, anterior and posterior to the acromion. LI15 is located in the deeper depression anterior to the acromion. TE14 is located in the posterior depression.",
        "needling": {"depth": "0.8-1.5 cun", "angle": "perpendicular"}
    },
    "LI-16": {
        "locationWHO": "On the shoulder girdle, in the depression between the acromial end of the clavicle and the spine of the scapula.",
        "noteWHO": "In the depression between the two bones lateral to the suprascapular fossa.",
        "needling": {"depth": "0.5-0.8 cun", "angle": "perpendicular", "caution": "Avoid deep insertion"}
    },
    "LI-17": {
        "locationWHO": "On the anterior aspect of the neck, at the same level as the cricoid cartilage, just posterior to the border of the sternocleidomastoid muscle.",
        "noteWHO": "Directly inferior to LI18, at the same level as ST10.",
        "needling": {"depth": "0.3-0.5 cun", "angle": "perpendicular", "caution": "Avoid carotid artery and jugular vein"}
    },
    "LI-18": {
        "locationWHO": "On the anterior aspect of the neck, at the same level as the superior border of the thyroid cartilage, between the anterior and posterior borders of the sternocleidomastoid muscle.",
        "needling": {"depth": "0.3-0.5 cun", "angle": "perpendicular", "caution": "Avoid carotid artery and jugular vein"}
    },
    "LI-19": {
        "locationWHO": "On the face, at the same level as the midpoint of the philtrum, inferior to the lateral margin of the nostril.",
        "noteWHO": "0.5 B-cun lateral to GV26. Alternative location: On the face, at the same level as the junction of the upper one third and lower two thirds of the philtrum.",
        "needling": {"depth": "0.2-0.3 cun", "angle": "oblique"}
    },
    "LI-20": {
        "locationWHO": "On the face, in the nasolabial sulcus, at the same level as the midpoint of lateral border of the ala of the nose.",
        "noteWHO": "Alternative location: On the face, in the nasolabial sulcus, at the level of the inferior border of the ala of the nose.",
        "needling": {"depth": "0.3-0.5 cun", "angle": "oblique", "direction": "medial-superior"}
    },
    
    # STOMACH MERIDIAN (ST)
    "ST-1": {
        "locationWHO": "On the face, between the eyeball and the infraorbital margin, directly inferior to the pupil.",
        "needling": {"depth": "0.3-0.5 cun", "angle": "perpendicular", "caution": "Push eyeball upward gently, insert along infraorbital margin. No manipulation."}
    },
    "ST-2": {
        "locationWHO": "On the face, in the infraorbital foramen.",
        "needling": {"depth": "0.2-0.3 cun", "angle": "perpendicular"}
    },
    "ST-3": {
        "locationWHO": "On the face, directly inferior to the pupil, at the same level as the inferior border of the ala of the nose.",
        "noteWHO": "When looking straight ahead, ST3 is located at the intersection of the vertical line of the pupil and the horizontal line of the inferior border of the ala of the nose.",
        "needling": {"depth": "0.3-0.5 cun", "angle": "perpendicular"}
    },
    "ST-4": {
        "locationWHO": "On the face, 0.4 F-cun lateral to the angle of the mouth.",
        "noteWHO": "Lateral to the angle of the mouth, the point is located in the nasolabial sulcus or on the continuation of the nasolabial sulcus.",
        "needling": {"depth": "0.3-0.5 cun", "angle": "oblique"}
    },
    "ST-5": {
        "locationWHO": "On the face, anterior to the angle of the mandible, in the depression anterior to the masseter attachment, over the facial artery.",
        "needling": {"depth": "0.3-0.5 cun", "angle": "perpendicular", "caution": "Avoid facial artery"}
    },
    "ST-6": {
        "locationWHO": "On the face, one fingerbreadth (middle finger) anterosuperior to the angle of the mandible.",
        "noteWHO": "On the bisector of the angle of the mandible. When the mouth is closed and the teeth are clenched, this point is located at the prominence of the masseter and in the depression felt when the clenched teeth are released.",
        "needling": {"depth": "0.3-0.5 cun", "angle": "perpendicular"}
    },
    "ST-7": {
        "locationWHO": "On the face, in the depression between the midpoint of the inferior border of the zygomatic arch and the mandibular notch.",
        "noteWHO": "When the mouth is closed, ST7 is located at the depression inferior to the zygomatic arch, directly inferior to GB3.",
        "needling": {"depth": "0.3-0.5 cun", "angle": "perpendicular"}
    },
    "ST-8": {
        "locationWHO": "On the head, 0.5 B-cun directly superior to the anterior hairline at the corner of the forehead, 4.5 B-cun lateral to the anterior median line.",
        "needling": {"depth": "0.5-1.0 cun", "angle": "transverse", "direction": "posterior"}
    },
    "ST-9": {
        "locationWHO": "In the anterior region of the neck, at the same level as the superior border of the thyroid cartilage, anterior to the sternocleidomastoid muscle, over the common carotid artery.",
        "noteWHO": "ST9 is located at the same level as LI18, SI16 and the superior border of the thyroid cartilage.",
        "needling": {"depth": "0.3-0.5 cun", "angle": "perpendicular", "caution": "Avoid carotid artery - dangerous point"}
    },
    "ST-10": {
        "locationWHO": "In the anterior region of the neck, at the same level as the cricoid cartilage, just anterior to the border of the sternocleidomastoid muscle.",
        "needling": {"depth": "0.3-0.5 cun", "angle": "perpendicular", "caution": "Avoid carotid artery"}
    },
    "ST-11": {
        "locationWHO": "In the anterior region of the neck, in the lesser supraclavicular fossa, superior to the sternal end of the clavicle, in the depression between the sternal and clavicular heads of the sternocleidomastoid muscle.",
        "noteWHO": "ST11 is located superior to the clavicle, inferior to ST9.",
        "needling": {"depth": "0.3-0.5 cun", "angle": "perpendicular", "caution": "Avoid deep insertion - risk of pneumothorax"}
    },
    "ST-12": {
        "locationWHO": "In the anterior region of the neck, in the greater supraclavicular fossa, 4 B-cun lateral to the anterior median line, in the depression superior to the clavicle.",
        "needling": {"depth": "0.3-0.5 cun", "angle": "perpendicular", "caution": "Avoid deep insertion - risk of pneumothorax"}
    },
    "ST-13": {
        "locationWHO": "In the anterior thoracic region, inferior to the clavicle, 4 B-cun lateral to the anterior median line.",
        "needling": {"depth": "0.3-0.5 cun", "angle": "oblique", "caution": "Avoid deep insertion - risk of pneumothorax"}
    },
    "ST-14": {
        "locationWHO": "In the anterior thoracic region, in the first intercostal space, 4 B-cun lateral to the anterior median line.",
        "needling": {"depth": "0.3-0.5 cun", "angle": "oblique", "caution": "Avoid deep insertion - risk of pneumothorax"}
    },
    "ST-15": {
        "locationWHO": "In the anterior thoracic region, in the second intercostal space, 4 B-cun lateral to the anterior median line.",
        "noteWHO": "The second intercostal space is inferior to the second rib which is located at the same level as the sternal angle.",
        "needling": {"depth": "0.3-0.5 cun", "angle": "oblique", "caution": "Avoid deep insertion - risk of pneumothorax"}
    },
    "ST-16": {
        "locationWHO": "In the anterior thoracic region, in the third intercostal space, 4 B-cun lateral to the anterior median line.",
        "needling": {"depth": "0.3-0.5 cun", "angle": "oblique", "caution": "Avoid deep insertion - risk of pneumothorax"}
    },
    "ST-17": {
        "locationWHO": "In the anterior thoracic region, at the centre of the nipple.",
        "noteWHO": "In males, the centre of the nipple is located in the fourth intercostal space. Reference point only - no needling.",
        "needling": {"depth": "0", "angle": "none", "caution": "Reference point only - DO NOT NEEDLE"}
    },
    "ST-18": {
        "locationWHO": "In the anterior thoracic region, in the fifth intercostal space, 4 B-cun lateral to the anterior median line.",
        "noteWHO": "In males, ST18 is located at the intersection of nipple line and the fifth intercostal space. In females, ST18 is located at the midpoint of the inferior crease of the breast.",
        "needling": {"depth": "0.3-0.5 cun", "angle": "oblique", "caution": "Avoid deep insertion - risk of pneumothorax"}
    },
    "ST-19": {
        "locationWHO": "On the upper abdomen, 6 B-cun superior to the centre of the umbilicus, 2 B-cun lateral to the anterior median line.",
        "noteWHO": "ST19 is 2 B-cun lateral to CV14. If the infrasternal angle is too sharp and the rib is located inferior to ST19, ST19 can be reached by oblique needling.",
        "needling": {"depth": "0.5-1.0 cun", "angle": "perpendicular"}
    },
    "ST-20": {
        "locationWHO": "On the upper abdomen, 5 B-cun superior to the centre of the umbilicus, 2 B-cun lateral to the anterior median line.",
        "noteWHO": "ST20 is 5 B-cun superior to ST25, 1 B-cun inferior to ST19, 2 B-cun lateral to CV13.",
        "needling": {"depth": "0.5-1.0 cun", "angle": "perpendicular"}
    },
    "ST-21": {
        "locationWHO": "On the upper abdomen, 4 B-cun superior to the centre of the umbilicus, 2 B-cun lateral to the anterior median line.",
        "noteWHO": "ST21 is 4 B-cun superior to ST25, 1 B-cun inferior to ST20, 2 B-cun lateral to CV12.",
        "needling": {"depth": "0.8-1.2 cun", "angle": "perpendicular"}
    },
    "ST-22": {
        "locationWHO": "On the upper abdomen, 3 B-cun superior to the centre of the umbilicus, 2 B-cun lateral to the anterior median line.",
        "noteWHO": "ST22 is located at the same level and lateral to KI18 and CV11.",
        "needling": {"depth": "0.8-1.2 cun", "angle": "perpendicular"}
    },
    "ST-23": {
        "locationWHO": "On the upper abdomen, 2 B-cun superior to the centre of the umbilicus, 2 B-cun lateral to the anterior median line.",
        "noteWHO": "ST23 is located at the same level and lateral to KI17 and CV10.",
        "needling": {"depth": "0.8-1.2 cun", "angle": "perpendicular"}
    },
    "ST-24": {
        "locationWHO": "On the upper abdomen, 1 B-cun superior to the centre of the umbilicus, 2 B-cun lateral to the anterior median line.",
        "noteWHO": "ST24 is at the same level and lateral to CV9.",
        "needling": {"depth": "0.8-1.2 cun", "angle": "perpendicular"}
    },
    "ST-25": {
        "locationWHO": "On the upper abdomen, 2 B-cun lateral to the centre of the umbilicus.",
        "needling": {"depth": "1.0-1.5 cun", "angle": "perpendicular"}
    },
    "ST-26": {
        "locationWHO": "On the lower abdomen, 1 B-cun inferior to the centre of the umbilicus, 2 B-cun lateral to the anterior median line.",
        "noteWHO": "ST26 is at the same level and lateral to KI15 and CV7.",
        "needling": {"depth": "1.0-1.5 cun", "angle": "perpendicular"}
    },
    "ST-27": {
        "locationWHO": "On the lower abdomen, 2 B-cun inferior to the centre of the umbilicus, 2 B-cun lateral to the anterior median line.",
        "noteWHO": "ST27 is at the same level and lateral to KI14 and CV5.",
        "needling": {"depth": "1.0-1.5 cun", "angle": "perpendicular"}
    },
    "ST-28": {
        "locationWHO": "On the lower abdomen, 3 B-cun inferior to the centre of the umbilicus, 2 B-cun lateral to the anterior median line.",
        "noteWHO": "ST28 is 3 B-cun inferior to ST25, 1 B-cun inferior to ST27, 2 B-cun lateral to CV4.",
        "needling": {"depth": "1.0-1.5 cun", "angle": "perpendicular"}
    },
    "ST-29": {
        "locationWHO": "On the lower abdomen, 4 B-cun inferior to the centre of the umbilicus, 2 B-cun lateral to the anterior median line.",
        "noteWHO": "ST29 is 4 B-cun inferior to ST25, 1 B-cun inferior to ST28, 2 B-cun lateral to CV3.",
        "needling": {"depth": "1.0-1.5 cun", "angle": "perpendicular"}
    },
    "ST-30": {
        "locationWHO": "In the groin region, at the same level as the superior border of the pubic symphysis, 2 B-cun lateral to the anterior median line, over the femoral artery.",
        "noteWHO": "ST30 is 5 B-cun inferior to ST25, 2 B-cun lateral to CV2.",
        "needling": {"depth": "0.5-1.0 cun", "angle": "perpendicular", "caution": "Avoid femoral artery"}
    },
    "ST-31": {
        "locationWHO": "On the anterior aspect of the thigh, in the depression among three muscles: the proximal portion of the rectus femoris muscle, the sartorius muscle and the tensor fasciae latae muscle.",
        "noteWHO": "ST31 is located at the intersection of the line connecting the lateral end of the base of the patella with the anterior superior iliac spine, and the horizontal line of the inferior border of the pubic symphysis.",
        "needling": {"depth": "1.0-2.0 cun", "angle": "perpendicular"}
    },
    "ST-32": {
        "locationWHO": "On the anterolateral aspect of the thigh, on the line connecting the lateral end of the base of the patella with the anterior superior iliac spine, 6 B-cun superior to the base of the patella.",
        "needling": {"depth": "1.0-2.0 cun", "angle": "perpendicular"}
    },
    "ST-33": {
        "locationWHO": "On the anterolateral aspect of the thigh, lateral to the rectus femoris tendon, 3 B-cun superior to the base of the patella.",
        "noteWHO": "ST33 is at the midpoint of the line connecting ST32 with the lateral end of the base of the patella.",
        "needling": {"depth": "1.0-1.5 cun", "angle": "perpendicular"}
    },
    "ST-34": {
        "locationWHO": "On the anterolateral aspect of the thigh, between the vastus lateralis muscle and the lateral border of the rectus femoris tendon, 2 B-cun superior to the base of the patella.",
        "noteWHO": "Putting the thigh muscle under tension, the rectus femoris tendon and the vastus lateralis muscle are more distinct. ST34 is located between the muscle and the tendon, 1 B-cun directly inferior to ST33.",
        "needling": {"depth": "1.0-1.5 cun", "angle": "perpendicular"}
    },
    "ST-35": {
        "locationWHO": "On the anterior aspect of the knee, in the depression lateral to the patellar ligament.",
        "noteWHO": "When the knee is flexed, ST35 is located in the depression lateral and inferior to the patella.",
        "needling": {"depth": "0.5-1.0 cun", "angle": "oblique", "direction": "medial"}
    },
    "ST-36": {
        "locationWHO": "On the anterior aspect of the leg, on the line connecting ST35 with ST41, 3 B-cun inferior to ST35.",
        "noteWHO": "ST36 is located on the tibialis anterior muscle.",
        "needling": {"depth": "1.0-2.0 cun", "angle": "perpendicular"}
    },
    "ST-37": {
        "locationWHO": "On the anterior aspect of the leg, on the line connecting ST35 with ST41, 6 B-cun inferior to ST35.",
        "noteWHO": "ST37 is located on the tibialis anterior muscle.",
        "needling": {"depth": "1.0-2.0 cun", "angle": "perpendicular"}
    },
    "ST-38": {
        "locationWHO": "On the anterior aspect of the leg, on the line connecting ST35 with ST41, 8 B-cun inferior to ST35.",
        "noteWHO": "ST38 is located on the tibialis anterior muscle, at the same level as ST40.",
        "needling": {"depth": "1.0-1.5 cun", "angle": "perpendicular"}
    },
    "ST-39": {
        "locationWHO": "On the anterior aspect of the leg, on the line connecting ST35 with ST41, 9 B-cun inferior to ST35.",
        "noteWHO": "ST39 is located on the tibialis anterior muscle, at the same level as GB35 and GB36.",
        "needling": {"depth": "1.0-1.5 cun", "angle": "perpendicular"}
    },
    "ST-40": {
        "locationWHO": "On the anterolateral aspect of the leg, lateral border of the tibialis anterior muscle, 8 B-cun superior to the prominence of the lateral malleolus.",
        "noteWHO": "ST40 is one fingerbreadth (middle finger) lateral to ST38.",
        "needling": {"depth": "1.0-1.5 cun", "angle": "perpendicular"}
    },
    "ST-41": {
        "locationWHO": "On the anterior aspect of the ankle, in the depression at the centre of the front surface of the ankle joint, between the tendons of extensor hallucis longus and extensor digitorum longus.",
        "noteWHO": "ST41 is located between two tendons on the dorsum of the foot which are more distinct when the ankle is in dorsiflexion, and is at the midpoint of the line connecting the prominences of the lateral malleolus and the medial malleolus.",
        "needling": {"depth": "0.5-0.8 cun", "angle": "perpendicular"}
    },
    "ST-42": {
        "locationWHO": "On the dorsum of the foot, at the joint of the base of the second metatarsal bone and the intermediate cuneiform bone, over the dorsalis pedis artery.",
        "needling": {"depth": "0.3-0.5 cun", "angle": "perpendicular", "caution": "Avoid dorsalis pedis artery"}
    },
    "ST-43": {
        "locationWHO": "On the dorsum of the foot, between the second and third metatarsal bones, in the depression proximal to the second metatarsophalangeal joint.",
        "needling": {"depth": "0.3-0.5 cun", "angle": "perpendicular"}
    },
    "ST-44": {
        "locationWHO": "On the dorsum of the foot, between the second and third toes, posterior to the web margin, at the border between the red and white flesh.",
        "needling": {"depth": "0.3-0.5 cun", "angle": "perpendicular"}
    },
    "ST-45": {
        "locationWHO": "On the second toe, lateral to the distal phalanx, 0.1 F-cun proximal-lateral to the lateral corner of the second toenail, at the intersection of the vertical line of the lateral border and the horizontal line of the base of the second toenail.",
        "needling": {"depth": "0.1 cun", "angle": "perpendicular", "technique": "Prick to bleed"}
    },
    
    # SPLEEN MERIDIAN (SP)
    "SP-1": {
        "locationWHO": "On the great toe, medial to the distal phalanx, 0.1 F-cun proximal-medial to the medial corner of the toenail, at the intersection of the vertical line of the medial border and horizontal line of the base of the toenail.",
        "needling": {"depth": "0.1 cun", "angle": "perpendicular", "technique": "Prick to bleed"}
    },
    "SP-2": {
        "locationWHO": "On the great toe, in the depression distal to the first metatarsophalangeal joint, at the border between the red and white flesh.",
        "needling": {"depth": "0.2-0.3 cun", "angle": "perpendicular"}
    },
    "SP-3": {
        "locationWHO": "On the medial aspect of the foot, in the depression proximal to the first metatarsophalangeal joint, at the border between the red and white flesh.",
        "needling": {"depth": "0.5-0.8 cun", "angle": "perpendicular"}
    },
    "SP-4": {
        "locationWHO": "On the medial aspect of the foot, anteroinferior to the base of the first metatarsal bone, at the border between the red and white flesh.",
        "noteWHO": "A depression can be felt when moving proximally from SP3. SP4 is located in the depression distal to the base of the first metatarsal bone.",
        "needling": {"depth": "0.5-1.0 cun", "angle": "perpendicular"}
    },
    "SP-5": {
        "locationWHO": "On the medial aspect of the foot, anteroinferior to the medial malleolus, in the depression midway between the tuberosity of the navicular bone and the prominence of the medial malleolus.",
        "noteWHO": "SP5 is located at the intersection of two imaginary lines: the vertical line of the anterior border of the medial malleolus and the horizontal line of the inferior border of the medial malleolus. SP5 is located posterior to LR4 and anterior to KI6.",
        "needling": {"depth": "0.3-0.5 cun", "angle": "perpendicular"}
    },
    "SP-6": {
        "locationWHO": "On the tibial aspect of the leg, posterior to the medial border of the tibia, 3 B-cun superior to the prominence of the medial malleolus.",
        "noteWHO": "1 B-cun superior to KI8.",
        "needling": {"depth": "1.0-1.5 cun", "angle": "perpendicular", "caution": "Contraindicated during pregnancy"}
    },
    "SP-7": {
        "locationWHO": "On the tibial aspect of the leg, posterior to the medial border of the tibia, 6 B-cun superior to the prominence of the medial malleolus.",
        "noteWHO": "3 B-cun superior to SP6.",
        "needling": {"depth": "1.0-1.5 cun", "angle": "perpendicular"}
    },
    "SP-8": {
        "locationWHO": "On the tibial aspect of the leg, posterior to the medial border of the tibia, 3 B-cun inferior to SP9.",
        "noteWHO": "SP8 is located at the junction of the upper one third and lower two thirds of the line connecting the apex of the patella with the prominence of the medial malleolus.",
        "needling": {"depth": "1.0-1.5 cun", "angle": "perpendicular"}
    },
    "SP-9": {
        "locationWHO": "On the tibial aspect of the leg, in the depression between the inferior border of the medial condyle of the tibia and the medial border of the tibia.",
        "noteWHO": "A depression can be felt inferior to the knee joint when moving proximally along the medial border of the tibia. SP9 is located in a depression at the angle formed by the inferior border of the medial condyle of the tibia and the posterior border of the tibia.",
        "needling": {"depth": "1.0-2.0 cun", "angle": "perpendicular"}
    },
    "SP-10": {
        "locationWHO": "On the anteromedial aspect of the thigh, on the bulge of the vastus medialis muscle, 2 B-cun superior to the medial end of the base of the patella.",
        "needling": {"depth": "1.0-1.5 cun", "angle": "perpendicular"}
    },
    "SP-11": {
        "locationWHO": "On the medial aspect of the thigh, at the junction of the upper one third and lower two thirds of the line connecting the medial end of the base of the patella with SP12, between the sartorius muscle and the adductor longus muscle, over the femoral artery.",
        "needling": {"depth": "0.5-1.0 cun", "angle": "perpendicular", "caution": "Avoid femoral artery"}
    },
    "SP-12": {
        "locationWHO": "In the groin region, at the inguinal crease, lateral to the femoral artery.",
        "noteWHO": "At the same level as CV2, medial and inferior to SP13.",
        "needling": {"depth": "0.5-1.0 cun", "angle": "perpendicular", "caution": "Avoid femoral artery and vein"}
    },
    "SP-13": {
        "locationWHO": "On the lower abdomen, 4.3 B-cun inferior to the centre of the umbilicus, 4 B-cun lateral to the anterior median line.",
        "needling": {"depth": "1.0-1.5 cun", "angle": "perpendicular"}
    },
    "SP-14": {
        "locationWHO": "On the lower abdomen, 1.3 B-cun inferior to the centre of the umbilicus, 4 B-cun lateral to the anterior median line.",
        "needling": {"depth": "1.0-1.5 cun", "angle": "perpendicular"}
    },
    "SP-15": {
        "locationWHO": "On the upper abdomen, 4 B-cun lateral to the centre of the umbilicus.",
        "noteWHO": "At the same level and lateral to ST25, KI16 and CV8.",
        "needling": {"depth": "1.0-1.5 cun", "angle": "perpendicular"}
    },
    "SP-16": {
        "locationWHO": "On the upper abdomen, 3 B-cun superior to the centre of the umbilicus, 4 B-cun lateral to the anterior median line.",
        "noteWHO": "3 B-cun superior to SP15, at the same level as CV11.",
        "needling": {"depth": "1.0-1.5 cun", "angle": "perpendicular"}
    },
    "SP-17": {
        "locationWHO": "In the anterior thoracic region, in the fifth intercostal space, 6 B-cun lateral to the anterior median line.",
        "noteWHO": "SP17, ST18 and KI22 are located along the curve of the fifth intercostal space.",
        "needling": {"depth": "0.3-0.5 cun", "angle": "oblique", "caution": "Avoid deep insertion - risk of pneumothorax"}
    },
    "SP-18": {
        "locationWHO": "In the anterior thoracic region, in the fourth intercostal space, 6 B-cun lateral to the anterior median line.",
        "noteWHO": "SP18, ST17 and KI23 are located along the curve of the fourth intercostal space.",
        "needling": {"depth": "0.3-0.5 cun", "angle": "oblique", "caution": "Avoid deep insertion - risk of pneumothorax"}
    },
    "SP-19": {
        "locationWHO": "In the anterior thoracic region, in the third intercostal space, 6 B-cun lateral to the anterior median line.",
        "noteWHO": "SP19, ST16 and KI24 are located along the curve of the third intercostal space.",
        "needling": {"depth": "0.3-0.5 cun", "angle": "oblique", "caution": "Avoid deep insertion - risk of pneumothorax"}
    },
    "SP-20": {
        "locationWHO": "In the anterior thoracic region, in the second intercostal space, 6 B-cun lateral to the anterior median line.",
        "noteWHO": "SP20, ST15 and KI25 are located along the curve of the second intercostal space.",
        "needling": {"depth": "0.3-0.5 cun", "angle": "oblique", "caution": "Avoid deep insertion - risk of pneumothorax"}
    },
    "SP-21": {
        "locationWHO": "In the lateral thoracic region, in the sixth intercostal space, on the midaxillary line.",
        "noteWHO": "With the subject lying on the side and the arm abducted, SP21 is located at the intersection of the midaxillary line and the sixth intercostal space.",
        "needling": {"depth": "0.3-0.5 cun", "angle": "oblique", "caution": "Avoid deep insertion - risk of pneumothorax"}
    },
    
    # HEART MERIDIAN (HT) - Note: Using HT code (WHO standard) but data has HE
    "HE-1": {
        "locationWHO": "In the axilla, in the centre of the axillary fossa, over the axillary artery.",
        "needling": {"depth": "0.3-0.5 cun", "angle": "perpendicular", "caution": "Avoid axillary artery"}
    },
    "HE-2": {
        "locationWHO": "On the medial aspect of the arm, just medial to the biceps brachii muscle, 3 B-cun superior to the cubital crease.",
        "noteWHO": "With the elbow flexed and the arm abducted, HT2 is located at the junction of the upper two thirds and lower one third of the line connecting HT1 with HT3.",
        "needling": {"depth": "0.5-1.0 cun", "angle": "perpendicular", "caution": "Avoid brachial artery"}
    },
    "HE-3": {
        "locationWHO": "On the anteromedial aspect of the elbow, just anterior to the medial epicondyle of the humerus, at the same level as the cubital crease.",
        "noteWHO": "With the elbow flexed, HT3 is located at the midpoint of the line connecting the medial end of the cubital crease and the medial epicondyle of the humerus.",
        "needling": {"depth": "0.5-1.0 cun", "angle": "perpendicular", "caution": "Avoid ulnar nerve"}
    },
    "HE-4": {
        "locationWHO": "On the anteromedial aspect of the forearm, just radial to the flexor carpi ulnaris tendon, 1.5 B-cun proximal to the palmar wrist crease.",
        "noteWHO": "1.5 B-cun proximal to HT7, at the same level as the superior border of the head of the ulna.",
        "needling": {"depth": "0.3-0.5 cun", "angle": "perpendicular"}
    },
    "HE-5": {
        "locationWHO": "On the anteromedial aspect of the forearm, radial to the flexor carpi ulnaris tendon, 1 B-cun proximal to the palmar wrist crease.",
        "noteWHO": "1 B-cun proximal to HT7.",
        "needling": {"depth": "0.3-0.5 cun", "angle": "perpendicular"}
    },
    "HE-6": {
        "locationWHO": "On the anteromedial aspect of the forearm, radial to the flexor carpi ulnaris tendon, 0.5 B-cun proximal to the palmar wrist crease.",
        "noteWHO": "0.5 B-cun proximal to HT7, at the same level as the distal border of the head of the ulna.",
        "needling": {"depth": "0.3-0.5 cun", "angle": "perpendicular"}
    },
    "HE-7": {
        "locationWHO": "On the anteromedial aspect of the wrist, radial to the flexor carpi ulnaris tendon, on the palmar wrist crease.",
        "noteWHO": "In the depression radial to the proximal border of the pisiform bone, on the palmar wrist crease.",
        "needling": {"depth": "0.3-0.5 cun", "angle": "perpendicular"}
    },
    "HE-8": {
        "locationWHO": "On the palm of the hand, in the depression between the fourth and fifth metacarpal bones, proximal to the fifth metacarpophalangeal joint.",
        "noteWHO": "Between the fourth and fifth metacarpal bones, where the tip of the little finger rests when a fist is made, at the same level as PC8.",
        "needling": {"depth": "0.3-0.5 cun", "angle": "perpendicular"}
    },
    "HE-9": {
        "locationWHO": "On the little finger, radial to the distal phalanx, 0.1 F-cun proximal-lateral to the radial corner of the little fingernail, at the intersection of the vertical line of the radial border of the nail and horizontal line of the base of the little fingernail.",
        "needling": {"depth": "0.1 cun", "angle": "perpendicular", "technique": "Prick to bleed"}
    },
    
    # SMALL INTESTINE MERIDIAN (SI)
    "SI-1": {
        "locationWHO": "On the little finger, ulnar to the distal phalanx, 0.1 F-cun proximal-medial to the ulnar corner of the little fingernail, at the intersection of the vertical line of ulnar border of the nail and horizontal line of the base of the little fingernail.",
        "needling": {"depth": "0.1 cun", "angle": "perpendicular", "technique": "Prick to bleed"}
    },
    "SI-2": {
        "locationWHO": "On the little finger, in the depression distal to the ulnar side of the fifth metacarpophalangeal joint, at the border between the red and white flesh.",
        "noteWHO": "When the hand is slightly flexed, the point is located at the ulnar end of the palmar metacarpophalangeal crease of the little finger.",
        "needling": {"depth": "0.2-0.3 cun", "angle": "perpendicular"}
    },
    "SI-3": {
        "locationWHO": "On the dorsum of the hand, in the depression proximal to the ulnar side of the fifth metacarpophalangeal joint, at the border between the red and white flesh.",
        "noteWHO": "When the hand is slightly flexed, the point is located at the ulnar end of the distal transverse skin crease of the palm, at the border between the red and white flesh.",
        "needling": {"depth": "0.5-0.8 cun", "angle": "perpendicular"}
    },
    "SI-4": {
        "locationWHO": "On the posteromedial aspect of the wrist, in the depression between the base of the fifth metacarpal bone and the triquetrum bone, at the border between the red and white flesh.",
        "noteWHO": "With one finger placed on SI3, push and slide proximally along the fifth metacarpal bone to the bony projection, SI4 is located in the depression between these two bones.",
        "needling": {"depth": "0.3-0.5 cun", "angle": "perpendicular"}
    },
    "SI-5": {
        "locationWHO": "On the posteromedial aspect of the wrist, in the depression between the triquetrum bone and the ulnar styloid process.",
        "needling": {"depth": "0.3-0.5 cun", "angle": "perpendicular"}
    },
    "SI-6": {
        "locationWHO": "On the posteromedial aspect of the forearm, in the depression radial to the head of the ulnar bone, 1 B-cun proximal to the dorsal wrist crease.",
        "noteWHO": "With the palm facing downwards, press the highest point of the head of ulnar bone with a finger, and then turn the palm towards the chest; SI6 is located at the cleft between the bones where the finger slides.",
        "needling": {"depth": "0.3-0.5 cun", "angle": "perpendicular"}
    },
    "SI-7": {
        "locationWHO": "On the posteromedial aspect of the forearm, between the medial border of the ulnar bone and the flexor carpi ulnaris muscle, 5 B-cun proximal to the dorsal wrist crease.",
        "noteWHO": "1 B-cun distal to the midpoint of the line connecting SI5 with SI8.",
        "needling": {"depth": "0.5-0.8 cun", "angle": "perpendicular"}
    },
    "SI-8": {
        "locationWHO": "On the posteromedial aspect of the elbow, in the depression between the olecranon and the medial epicondyle of the humerus bone.",
        "noteWHO": "When the elbow is slightly flexed, SI8 is located in the groove for the ulnar nerve.",
        "needling": {"depth": "0.3-0.5 cun", "angle": "perpendicular", "caution": "Avoid ulnar nerve"}
    },
    "SI-9": {
        "locationWHO": "On the shoulder girdle, posteroinferior to the shoulder joint, 1 B-cun superior to the posterior axillary fold.",
        "noteWHO": "When the arm is adducted, SI9 is located 1 B-cun superior to the posterior axillary fold, posterior to the deltoid muscle.",
        "needling": {"depth": "0.5-1.0 cun", "angle": "perpendicular"}
    },
    "SI-10": {
        "locationWHO": "On the shoulder girdle, superior to the posterior axillary fold, in the depression inferior to the spine of the scapula.",
        "needling": {"depth": "0.5-1.0 cun", "angle": "perpendicular"}
    },
    "SI-11": {
        "locationWHO": "In the scapular region, in the depression between the upper one third and lower two thirds of the line connecting the midpoint of the spine of the scapula with the inferior angle of the scapula.",
        "needling": {"depth": "0.5-1.0 cun", "angle": "perpendicular"}
    },
    "SI-12": {
        "locationWHO": "In the scapular region, in the supraspinatous fossa, superior to the midpoint of the spine of the scapula.",
        "needling": {"depth": "0.5-1.0 cun", "angle": "perpendicular"}
    },
    "SI-13": {
        "locationWHO": "In the scapular region, in the depression superior to the medial end of the spine of the scapula.",
        "noteWHO": "SI13 is located at the midpoint of the line connecting SI10 with the spinous process of the second thoracic vertebra (T2).",
        "needling": {"depth": "0.5-1.0 cun", "angle": "oblique"}
    },
    "SI-14": {
        "locationWHO": "In the upper back region, at the same level as the inferior border of the spinous process of the first thoracic vertebra (T1), 3 B-cun lateral to the posterior median line.",
        "noteWHO": "SI14 is located at the same level as BL11, GV13, and the inferior border of the spinous process of the first thoracic vertebra (T1).",
        "needling": {"depth": "0.3-0.5 cun", "angle": "oblique"}
    },
    "SI-15": {
        "locationWHO": "In the upper back region, at the same level as the inferior border of the spinous process of the seventh cervical vertebra (C7), 2 B-cun lateral to the posterior median line.",
        "needling": {"depth": "0.3-0.5 cun", "angle": "oblique"}
    },
}

def parse_who_document(file_path):
    """
    Parse the WHO Standard Markdown file to extract point locations and notes.
    Returns a dictionary of point data.
    """
    print(f"Parsing WHO document: {file_path}")
    who_parsed_data = {}
    
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            lines = f.readlines()
    except FileNotFoundError:
        print(f"Error: File not found at {file_path}")
        return {}

    current_point = None
    current_code = None
    current_section = None # 'location' or 'note'
    
    # Regex for point header: e.g., "BL1: Jingming" or "LU1: Zhongfu"
    # Handles variations like "ST-1" or "ST1"
    header_pattern = re.compile(r'^([A-Z]{2,3})\s*(\d+):\s+([a-zA-Z\s]+)')
    
    # Regex to ignore page headers/footers
    ignore_pattern = re.compile(r'(WHO Standard|Meridian|annex|Reference)', re.IGNORECASE)

    for line in lines:
        line = line.strip()
        if not line:
            continue
            
        if ignore_pattern.search(line):
            continue

        # Check for new point header
        match = header_pattern.match(line)
        if match:
            # Save previous point
            if current_code and current_point:
                who_parsed_data[current_code] = current_point

            meridian = match.group(1)
            number = match.group(2)
            name = match.group(3).strip()
            
            # Normalize code to AA-N format (e.g., BL-1)
            current_code = f"{meridian}-{number}"
            
            current_point = {
                "namePT": name, # Using Pinyin as the PT-BR name reference
                "locationWHO": "",
                "noteWHO": ""
            }
            current_section = 'location'
            continue

        if current_point:
            if line.startswith("Note") or line.startswith("Remarks"):
                current_section = 'note'
                # Remove "Note:" prefix if present
                content = re.sub(r'^(Note\s*\d*:?|Note:|Remarks:)\s*', '', line)
                current_point['noteWHO'] += content + " "
            else:
                if current_section == 'location':
                    current_point['locationWHO'] += line + " "
                elif current_section == 'note':
                    current_point['noteWHO'] += line + " "

    # Save last point
    if current_code and current_point:
        who_parsed_data[current_code] = current_point
        
    # Clean up whitespace
    for code in who_parsed_data:
        who_parsed_data[code]['locationWHO'] = who_parsed_data[code]['locationWHO'].strip()
        who_parsed_data[code]['noteWHO'] = who_parsed_data[code]['noteWHO'].strip()
        
    print(f"Parsed {len(who_parsed_data)} points from WHO document.")
    return who_parsed_data

def load_points_data(filepath):
    """Load existing points data."""
    with open(filepath, 'r', encoding='utf-8') as f:
        return json.load(f)

def save_points_data(filepath, data):
    """Save enriched points data."""
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

def enrich_point(point, who_data):
    """Enrich a single point with WHO data and translate to Portuguese."""
    code = point.get('code', '')
    
    # Handle code variations (e.g. HT vs HE)
    if code.startswith('HT-'):
        alt_code = code.replace('HT-', 'HE-')
        if alt_code in who_data and code not in who_data:
            code = alt_code
    
    if code in who_data:
        who_info = who_data[code]
        
        # Add Name PT (Pinyin)
        if 'namePT' in who_info and who_info['namePT']:
            # If namePT doesn't exist or is empty, update it
            if 'namePT' not in point or not point['namePT']:
                point['namePT'] = who_info['namePT']
        
        # Add WHO location - translated to Portuguese
        if 'locationWHO' in who_info and who_info['locationWHO']:
            # Keep original English
            point['locationWHO_EN'] = who_info['locationWHO']
            # Add Portuguese translation
            point['locationWHO'] = translate_to_portuguese(who_info['locationWHO'])
        
        # Add WHO notes - translated to Portuguese
        if 'noteWHO' in who_info and who_info['noteWHO']:
            # Keep original English
            point['noteWHO_EN'] = who_info['noteWHO']
            # Add Portuguese translation
            point['noteWHO'] = translate_to_portuguese(who_info['noteWHO'])
        
        # Add needling information (only if available in source)
        if 'needling' in who_info:
            needling = who_info['needling'].copy()
            # Translate needling cautions
            if 'caution' in needling:
                needling['caution'] = translate_to_portuguese(needling['caution'])
            point['needling'] = needling
        
        # Update tags
        if 'tags' not in point:
            point['tags'] = []
        if 'who-enriched' not in point['tags']:
            point['tags'].append('who-enriched')
        if 'seed-pending' in point['tags']:
            point['tags'].remove('seed-pending')
        
        # Update timestamp
        point['updatedAt'] = datetime.now().isoformat() + 'Z'
        point['contentStatus'] = 'who-reviewed'
        
        return True
    return False

def main():
    # File paths
    input_file = r'd:\_repos\appunture-dev\data\processed\2025-11-28\points_seed.json'
    output_file = r'd:\_repos\appunture-dev\data\processed\2025-11-28\points_seed.json'
    who_doc_path = r'd:\_repos\appunture-dev\who-standard.md'
    
    # Load data
    print("Loading points data...")
    points = load_points_data(input_file)
    print(f"Loaded {len(points)} points")
    
    # Parse WHO document
    parsed_who_data = parse_who_document(who_doc_path)
    
    # Merge parsed data with hardcoded data (hardcoded takes precedence for needling)
    # But parsed data takes precedence for location/notes as it is from the full text
    full_who_data = parsed_who_data.copy()
    
    for code, data in WHO_DATA.items():
        if code in full_who_data:
            # Merge: keep parsed location/name, add needling from hardcoded
            if 'needling' in data:
                full_who_data[code]['needling'] = data['needling']
            # Optional: if hardcoded location is better formatted, use it? 
            # For now, let's trust the hardcoded one for the first meridians as it was manually curated
            full_who_data[code]['locationWHO'] = data['locationWHO']
            if 'noteWHO' in data:
                full_who_data[code]['noteWHO'] = data['noteWHO']
        else:
            full_who_data[code] = data

    # Enrich with WHO data
    enriched_count = 0
    for point in points:
        if enrich_point(point, full_who_data):
            enriched_count += 1
    
    print(f"Enriched {enriched_count} points with WHO data")
    
    # Save enriched data
    save_points_data(output_file, points)
    print(f"Saved enriched data to {output_file}")
    
    # Print summary
    print("\n=== Summary ===")
    print(f"Total points: {len(points)}")
    print(f"Points with WHO data: {enriched_count}")
    print(f"Points without WHO data: {len(points) - enriched_count}")

if __name__ == '__main__':
    main()
