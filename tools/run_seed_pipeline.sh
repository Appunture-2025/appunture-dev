#!/usr/bin/env bash
# Appunture Seed Data Pipeline
# This script runs the complete data normalization and seed generation pipeline.
#
# Usage:
#   ./tools/run_seed_pipeline.sh [options]
#
# Options:
#   --skip-normalize    Skip the initial CSV normalization step
#   --skip-enrichment   Skip the update_*.py enrichment scripts
#   --skip-validate     Skip validation (not recommended)
#   --allow-missing     Export even with missing required fields
#   -h, --help          Show this help message
#
# Output:
#   - tools/output/points_seed.json       Formatted JSON for inspection
#   - tools/output/points_seed.ndjson     NDJSON for Firestore import
#   - tools/output/symptoms_seed.json     Symptoms seed JSON
#   - tools/output/symptoms_seed.ndjson   Symptoms seed NDJSON
#   - tools/output/categories_seed.json   Categories seed JSON
#   - data/processed/<date>/              Versioned copy of all artifacts

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_ROOT"

# Default options
SKIP_NORMALIZE=false
SKIP_ENRICHMENT=false
SKIP_VALIDATE=false
ALLOW_MISSING=false

# Help function
show_help() {
    cat << 'EOF'
Appunture Seed Data Pipeline
This script runs the complete data normalization and seed generation pipeline.

Usage:
  ./tools/run_seed_pipeline.sh [options]

Options:
  --skip-normalize    Skip the initial CSV normalization step
  --skip-enrichment   Skip the update_*.py enrichment scripts
  --skip-validate     Skip validation (not recommended)
  --allow-missing     Export even with missing required fields
  -h, --help          Show this help message

Output:
  - tools/output/points_seed.json       Formatted JSON for inspection
  - tools/output/points_seed.ndjson     NDJSON for Firestore import
  - tools/output/symptoms_seed.json     Symptoms seed JSON
  - tools/output/symptoms_seed.ndjson   Symptoms seed NDJSON
  - tools/output/categories_seed.json   Categories seed JSON
  - data/processed/<date>/              Versioned copy of all artifacts
EOF
}

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --skip-normalize)
            SKIP_NORMALIZE=true
            shift
            ;;
        --skip-enrichment)
            SKIP_ENRICHMENT=true
            shift
            ;;
        --skip-validate)
            SKIP_VALIDATE=true
            shift
            ;;
        --allow-missing)
            ALLOW_MISSING=true
            shift
            ;;
        -h|--help)
            show_help
            exit 0
            ;;
        *)
            echo -e "${RED}Unknown option: $1${NC}"
            exit 1
            ;;
    esac
done

echo -e "${GREEN}=== Appunture Seed Data Pipeline ===${NC}"
echo "Project root: $PROJECT_ROOT"
echo ""

# Step 1: Normalize CSVs
if [ "$SKIP_NORMALIZE" = false ]; then
    echo -e "${YELLOW}Step 1: Normalizing CSV files...${NC}"
    python3 tools/normalize_points.py
    echo ""
else
    echo -e "${YELLOW}Step 1: Skipping normalization (--skip-normalize)${NC}"
fi

# Step 2: Include missing meridians (GV, CV)
echo -e "${YELLOW}Step 2: Including missing meridian points...${NC}"
python3 tools/include_missing_meridians.py
echo ""

# Step 3: Run enrichment scripts
if [ "$SKIP_ENRICHMENT" = false ]; then
    echo -e "${YELLOW}Step 3: Running enrichment scripts...${NC}"
    for script in tools/update_*.py; do
        if [ -f "$script" ]; then
            echo "  Running $(basename "$script")..."
            python3 "$script"
        fi
    done
    echo ""
else
    echo -e "${YELLOW}Step 3: Skipping enrichment (--skip-enrichment)${NC}"
fi

# Step 4: Validate
if [ "$SKIP_VALIDATE" = false ]; then
    echo -e "${YELLOW}Step 4: Validating points_review.csv...${NC}"
    if python3 tools/validate_points_review.py --file tools/output/points_review.csv; then
        echo -e "${GREEN}Validation passed!${NC}"
    else
        if [ "$ALLOW_MISSING" = false ]; then
            echo -e "${RED}Validation failed. Use --allow-missing to continue with missing fields.${NC}"
            exit 1
        else
            echo -e "${YELLOW}Validation failed but continuing due to --allow-missing${NC}"
        fi
    fi
    echo ""
else
    echo -e "${YELLOW}Step 4: Skipping validation (--skip-validate)${NC}"
fi

# Step 5: Export to JSON/NDJSON
echo -e "${YELLOW}Step 5: Exporting to JSON/NDJSON...${NC}"
EXPORT_ARGS="--input tools/output/points_review.csv --json tools/output/points_seed.json --ndjson tools/output/points_seed.ndjson --config tools/seed_config.json"
if [ "$ALLOW_MISSING" = true ]; then
    EXPORT_ARGS="$EXPORT_ARGS --allow-missing"
fi
python3 tools/export_points_review.py $EXPORT_ARGS
echo ""

# Step 6: Generate symptoms/categories seed
echo -e "${YELLOW}Step 6: Generating symptoms and categories seed...${NC}"
python3 tools/generate_symptoms_seed.py --input tools/output/points_review.csv --output-dir tools/output
echo ""

# Step 7: Version outputs
DATE=$(date +%Y-%m-%d)
VERSION_DIR="data/processed/$DATE"
echo -e "${YELLOW}Step 7: Versioning outputs to $VERSION_DIR...${NC}"
mkdir -p "$VERSION_DIR"
cp tools/output/points_seed.json "$VERSION_DIR/"
cp tools/output/points_seed.ndjson "$VERSION_DIR/"
cp tools/output/points_review.csv "$VERSION_DIR/"
cp tools/output/symptoms_seed.json "$VERSION_DIR/"
cp tools/output/symptoms_seed.ndjson "$VERSION_DIR/"
cp tools/output/categories_seed.json "$VERSION_DIR/"
cp tools/output/categories_seed.ndjson "$VERSION_DIR/"
echo ""

# Step 8: Update backend resources
echo -e "${YELLOW}Step 8: Updating backend seed resources...${NC}"
BACKEND_SEED_DIR="backend-java/src/main/resources/seed"
mkdir -p "$BACKEND_SEED_DIR"
cp "$VERSION_DIR/points_seed.ndjson" "$BACKEND_SEED_DIR/"
cp "$VERSION_DIR/symptoms_seed.ndjson" "$BACKEND_SEED_DIR/"
cp "$VERSION_DIR/categories_seed.ndjson" "$BACKEND_SEED_DIR/"
echo "Copied seed files to $BACKEND_SEED_DIR"
echo ""

# Summary
echo -e "${GREEN}=== Pipeline Complete ===${NC}"
echo ""
echo "Generated files:"
ls -lh tools/output/*.json tools/output/*.ndjson tools/output/*.csv 2>/dev/null | awk '{print "  " $9 " (" $5 ")"}'
echo ""
echo "Versioned copy: $VERSION_DIR"
echo "Backend seed: $BACKEND_SEED_DIR"
echo ""
echo -e "${GREEN}Next steps:${NC}"
echo "  1. Review the generated data in $VERSION_DIR"
echo "  2. Start the backend: cd backend-java && mvn spring-boot:run"
echo "  3. Seed the database: curl -X POST http://localhost:8080/api/admin/data/seed"
echo "  4. Verify with: curl http://localhost:8080/api/points?limit=5"
