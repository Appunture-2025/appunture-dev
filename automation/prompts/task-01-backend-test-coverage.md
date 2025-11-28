# Prompt – Backend Test Coverage 80%+

## Contexto

- Cobertura atual do backend: ~60-70% (JaCoCo)
- Meta: ≥80% para instruction e branch coverage
- Arquivos sem testes adequados identificados

## Objetivo

Elevar a cobertura de testes do backend Java para ≥80%, focando em services e controllers que estão abaixo da meta.

## Arquivos Prioritários para Testar

### Services sem cobertura adequada:

1. `FileUploadService.java` - Upload de arquivos
2. `ThumbnailGenerationService.java` - Geração de thumbnails
3. `EmailService.java` - Envio de emails (mock)

### Controllers sem testes:

1. `FirebaseStorageController.java` - Storage endpoints

## Passos

1. Rodar `./mvnw test jacoco:report` e analisar `target/site/jacoco/index.html`
2. Identificar classes com coverage < 80%
3. Para cada classe, criar testes cobrindo:

   - Happy path (cenário de sucesso)
   - Edge cases (null, empty, invalid input)
   - Error handling (exceptions)
   - Boundary conditions

4. Para `FileUploadService`:

```java
@ExtendWith(MockitoExtension.class)
class FileUploadServiceTest {
    @Mock private FirebaseStorage firebaseStorage;
    @InjectMocks private FileUploadService service;

    @Test
    void shouldUploadFileSuccessfully() { }
    @Test
    void shouldThrowExceptionForInvalidFileType() { }
    @Test
    void shouldHandleEmptyFile() { }
}
```

5. Para `FirebaseStorageController`:

```java
@WebMvcTest(FirebaseStorageController.class)
class FirebaseStorageControllerTest {
    @Autowired private MockMvc mockMvc;
    @MockBean private FirebaseStorageService storageService;

    @Test
    void shouldUploadFile() { }
    @Test
    void shouldReturnBadRequestForMissingFile() { }
}
```

6. Rodar novamente `./mvnw test jacoco:report`
7. Verificar se coverage ≥80%

## Critérios de Aceitação

- [ ] JaCoCo instruction coverage ≥ 80%
- [ ] JaCoCo branch coverage ≥ 80%
- [ ] Todos os testes passam (`./mvnw test`)
- [ ] Nenhum teste com `@Disabled` ou `@Ignore`
- [ ] Mocks configurados corretamente (sem NPE)

## Arquivos a Criar/Editar

```
backend-java/src/test/java/com/appunture/backend/
├── service/
│   ├── FileUploadServiceTest.java (criar)
│   ├── ThumbnailGenerationServiceTest.java (criar)
│   └── EmailServiceTest.java (verificar/expandir)
└── controller/
    └── FirebaseStorageControllerTest.java (criar)
```

## Rollback

Se algum teste falhar de forma inesperada, verificar se há dependências de estado (usar `@BeforeEach` para reset).
