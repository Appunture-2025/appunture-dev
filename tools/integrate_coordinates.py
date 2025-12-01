#!/usr/bin/env python3
"""
Script para integrar coordenadas mapeadas ao dataset de pontos (points_seed.json).
Lê o JSON exportado pela ferramenta point-mapper e atualiza os campos coordinates.

Uso:
    python integrate_coordinates.py                           # Usa arquivo padrão
    python integrate_coordinates.py coordinates_export.json   # Especifica arquivo
    python integrate_coordinates.py --update-seed             # Atualiza points_seed.json diretamente
"""

import json
import sys
import shutil
from pathlib import Path
from datetime import datetime

# Caminhos
SCRIPT_DIR = Path(__file__).parent
PROJECT_ROOT = SCRIPT_DIR.parent
DATA_DIR = PROJECT_ROOT / "data" / "processed" / "2025-11-28"
POINTS_FILE = DATA_DIR / "points_seed.json"
POINTS_NDJSON = DATA_DIR / "points_seed.ndjson"
COORDINATES_FILE = SCRIPT_DIR / "point-mapper" / "coordinates_export.json"


def load_json(filepath: Path) -> dict | list:
    """Carrega arquivo JSON."""
    with open(filepath, 'r', encoding='utf-8') as f:
        return json.load(f)


def save_json(filepath: Path, data: dict | list):
    """Salva arquivo JSON com formatação."""
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


def save_ndjson(filepath: Path, data: list):
    """Salva arquivo NDJSON (uma linha por objeto)."""
    with open(filepath, 'w', encoding='utf-8') as f:
        for item in data:
            f.write(json.dumps(item, ensure_ascii=False) + '\n')


def integrate_coordinates(coordinates_file: Path = None, update_seed: bool = True):
    """
    Integra coordenadas ao dataset de pontos.
    
    Args:
        coordinates_file: Caminho para o JSON de coordenadas exportado.
        update_seed: Se True, atualiza o points_seed.json diretamente.
    """
    if coordinates_file is None:
        coordinates_file = COORDINATES_FILE
    
    coordinates_file = Path(coordinates_file)
    
    # Verificar arquivo de pontos
    if not POINTS_FILE.exists():
        print(f"❌ Arquivo de pontos não encontrado: {POINTS_FILE}")
        sys.exit(1)
    
    # Verificar arquivo de coordenadas
    if not coordinates_file.exists():
        print(f"❌ Arquivo de coordenadas não encontrado: {coordinates_file}")
        print("\n📋 Como usar:")
        print("1. Abra a ferramenta point-mapper (tools/point-mapper/index.html)")
        print("2. Mapeie os pontos desejados")
        print("3. Clique em 'Exportar JSON' e salve como 'coordinates_export.json'")
        print("   na pasta tools/point-mapper/")
        print("4. Execute este script novamente")
        sys.exit(1)
    
    # Carregar dados
    print(f"📂 Carregando pontos de: {POINTS_FILE}")
    points = load_json(POINTS_FILE)
    
    print(f"📂 Carregando coordenadas de: {coordinates_file}")
    coord_data = load_json(coordinates_file)
    
    # Extrair coordenadas (suporta formato com ou sem wrapper)
    if "coordinates" in coord_data:
        coordinates = coord_data["coordinates"]
    else:
        coordinates = coord_data
    
    print(f"\n📊 Estatísticas iniciais:")
    print(f"   Total de pontos no dataset: {len(points)}")
    print(f"   Coordenadas a integrar: {len(coordinates)}")
    
    # Contar pontos já mapeados antes
    already_mapped = sum(1 for p in points if p.get("coordinates", {}).get("x") is not None)
    print(f"   Pontos já com coordenadas: {already_mapped}")
    
    # Criar índice de pontos por código
    points_by_code = {p.get("code"): p for p in points if p.get("code")}
    
    # Integrar coordenadas
    updated = 0
    new_mappings = 0
    not_found = []
    
    for code, coord in coordinates.items():
        point = points_by_code.get(code)
        
        if point:
            # Verificar se é novo mapeamento
            was_mapped = point.get("coordinates", {}).get("x") is not None
            
            # Atualizar coordenadas
            point["coordinates"] = {
                "x": round(coord["x"], 2),
                "y": round(coord["y"], 2),
                "view": coord.get("view", "front"),
                "mappedAt": coord.get("mappedAt", datetime.now().isoformat())
            }
            
            # Atualizar timestamp
            point["updatedAt"] = datetime.now().isoformat()
            
            updated += 1
            if not was_mapped:
                new_mappings += 1
        else:
            not_found.append(code)
    
    print(f"\n✅ Resultados:")
    print(f"   Pontos atualizados: {updated}")
    print(f"   Novos mapeamentos: {new_mappings}")
    
    if not_found:
        print(f"⚠️  Códigos não encontrados no dataset: {len(not_found)}")
        if len(not_found) <= 10:
            print(f"   {', '.join(not_found)}")
        else:
            print(f"   {', '.join(not_found[:10])}... (+{len(not_found) - 10} mais)")
    
    if update_seed and updated > 0:
        # Fazer backup
        backup_file = POINTS_FILE.with_suffix('.json.bak')
        shutil.copy(POINTS_FILE, backup_file)
        print(f"\n💾 Backup criado: {backup_file}")
        
        # Salvar dataset atualizado
        save_json(POINTS_FILE, points)
        print(f"💾 Dataset JSON salvo: {POINTS_FILE}")
        
        # Atualizar NDJSON também
        save_ndjson(POINTS_NDJSON, points)
        print(f"💾 Dataset NDJSON salvo: {POINTS_NDJSON}")
    
    # Estatísticas finais
    with_coords = sum(1 for p in points if p.get("coordinates", {}).get("x") is not None)
    without_coords = len(points) - with_coords
    percentage = (with_coords / len(points)) * 100
    
    print(f"\n📈 Status final do mapeamento:")
    print(f"   Com coordenadas: {with_coords} ({percentage:.1f}%)")
    print(f"   Sem coordenadas: {without_coords}")
    
    # Mostrar progresso por meridiano
    print(f"\n📊 Progresso por meridiano:")
    meridian_stats = {}
    for point in points:
        meridian = point.get("meridian", "??")
        if meridian not in meridian_stats:
            meridian_stats[meridian] = {"total": 0, "mapped": 0}
        meridian_stats[meridian]["total"] += 1
        if point.get("coordinates", {}).get("x") is not None:
            meridian_stats[meridian]["mapped"] += 1
    
    # Ordenar por meridiano
    for meridian in sorted(meridian_stats.keys()):
        stats = meridian_stats[meridian]
        pct = (stats["mapped"] / stats["total"]) * 100 if stats["total"] > 0 else 0
        bar = "█" * int(pct / 10) + "░" * (10 - int(pct / 10))
        print(f"   {meridian:4} {bar} {stats['mapped']:3}/{stats['total']:3} ({pct:5.1f}%)")
    
    return updated


def main():
    """Função principal."""
    print("=" * 60)
    print("🎯 Integrador de Coordenadas - Appunture")
    print("=" * 60)
    
    # Processar argumentos
    coordinates_file = None
    update_seed = True
    
    for arg in sys.argv[1:]:
        if arg == "--update-seed":
            update_seed = True
        elif arg == "--no-update":
            update_seed = False
        elif not arg.startswith("-"):
            coordinates_file = Path(arg)
    
    integrate_coordinates(coordinates_file, update_seed)
    
    print("\n✨ Concluído!")


if __name__ == "__main__":
    main()
