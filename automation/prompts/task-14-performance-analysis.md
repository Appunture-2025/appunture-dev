# Task 14: Performance Analysis & Optimization

## Objetivo
Analisar performance do backend e frontend, identificar gargalos e implementar otimizações.

## Escopo

### Backend Java

#### 1. Análise de Queries Firestore
- [ ] Identificar queries sem índices
- [ ] Analisar N+1 problems
- [ ] Verificar batch operations
- [ ] Revisar listeners em tempo real

```java
// Problema: N+1
for (Point point : points) {
    Meridian m = getMeridianById(point.getMeridianId()); // Query por iteração!
}

// Solução: Batch
Map<String, Meridian> meridians = getMeridiansByIds(meridianIds);
```

#### 2. Caching Strategy
- [ ] Identificar dados cacheáveis (meridianos, pontos estáticos)
- [ ] Implementar cache em memória (Caffeine)
- [ ] Definir TTLs apropriados
- [ ] Adicionar cache invalidation

```java
// Exemplo de cache config
@Cacheable(value = "meridians", key = "#code")
public Meridian getMeridianByCode(String code) { ... }
```

#### 3. Response Optimization
- [ ] Implementar compressão GZIP
- [ ] Analisar payload sizes
- [ ] Verificar projections (retornar apenas campos necessários)
- [ ] Implementar ETags para conditional requests

#### 4. Connection Pooling
- [ ] Verificar configuração de pool HTTP
- [ ] Analisar timeouts
- [ ] Revisar retry policies

### Frontend Mobile

#### 5. Bundle Size Analysis
- [ ] Analisar bundle com `npx expo export --dump-sourcemap`
- [ ] Identificar dependências pesadas
- [ ] Verificar tree shaking
- [ ] Lazy loading de screens

#### 6. React Performance
- [ ] Identificar re-renders desnecessários
- [ ] Verificar memoização (useMemo, useCallback)
- [ ] Analisar FlatList optimization (keyExtractor, getItemLayout)
- [ ] Revisar Image optimization

```tsx
// Problema: Re-render toda a lista
<FlatList data={points} renderItem={({item}) => <PointCard point={item} />} />

// Solução: Memoização
const MemoizedPointCard = React.memo(PointCard);
```

#### 7. Network Optimization
- [ ] Implementar request caching
- [ ] Analisar prefetching strategies
- [ ] Verificar debounce em search
- [ ] Revisar retry logic

#### 8. Image & Asset Optimization
- [ ] Verificar lazy loading de imagens
- [ ] Analisar tamanhos de assets
- [ ] Implementar progressive loading
- [ ] Cache de imagens

### Frontend Admin

#### 9. React Query Optimization
- [ ] Verificar staleTime/cacheTime
- [ ] Implementar prefetching
- [ ] Analisar query invalidation
- [ ] Verificar background refetching

#### 10. Code Splitting
- [ ] Implementar lazy loading de routes
- [ ] Analisar chunks gerados
- [ ] Verificar vendor splitting

## Métricas a Coletar

### Backend
| Métrica | Target | Atual |
|---------|--------|-------|
| Latência P95 | < 200ms | ? |
| Latência P99 | < 500ms | ? |
| Throughput | > 100 req/s | ? |
| Memory Usage | < 512MB | ? |

### Frontend
| Métrica | Target | Atual |
|---------|--------|-------|
| TTI (Time to Interactive) | < 3s | ? |
| LCP (Largest Contentful Paint) | < 2.5s | ? |
| Bundle Size | < 5MB | ? |
| FPS durante scroll | 60fps | ? |

## Critérios de Aceitação

1. **Relatório de Performance**: `PERFORMANCE_REPORT.md` com:
   - Métricas coletadas
   - Gargalos identificados
   - Otimizações implementadas
   - Antes/depois comparison

2. **Otimizações Implementadas**:
   - Cache no backend para dados estáticos
   - Memoização adequada no frontend
   - Lazy loading implementado
   - Bundle size reduzido

3. **Benchmarks**:
   - Scripts de benchmark criados
   - Baseline documentado
   - Melhorias quantificadas

## Comandos Úteis

```bash
# Backend - Profile request
curl -w "@curl-format.txt" -o /dev/null -s "http://localhost:8080/api/v1/points"

# Frontend - Bundle analysis
cd frontend-mobile/appunture
npx expo export --platform web --dump-sourcemap
npx source-map-explorer dist/**/*.js

# Frontend Admin - Bundle analysis
cd frontend-admin
npm run build -- --stats
npx webpack-bundle-analyzer dist/stats.json
```

## Output Esperado

```markdown
# PERFORMANCE_REPORT.md

## Resumo Executivo
- Latência média reduzida de Xms para Yms (-Z%)
- Bundle size reduzido de XMB para YMB (-Z%)

## Gargalos Identificados
1. N+1 queries em /points (fixed)
2. Bundle com moment.js não utilizado (removed)
3. Imagens não otimizadas (lazy loading added)

## Otimizações Implementadas
### Backend
- Caffeine cache para meridians (TTL: 1h)
- GZIP compression enabled
- Query optimization

### Frontend
- React.memo em PointCard
- Lazy loading de screens
- Image caching with expo-image

## Benchmarks
| Endpoint | Before | After | Improvement |
|----------|--------|-------|-------------|
| GET /points | 450ms | 120ms | 73% |
```

## Labels
`performance`, `optimization`, `copilot-agent`, `priority:medium`
