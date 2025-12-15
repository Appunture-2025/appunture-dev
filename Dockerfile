# Dockerfile na raiz - aponta para o backend-java
# Este arquivo existe apenas para facilitar deploys pelo Cloud Console

FROM eclipse-temurin:17-jdk-alpine AS builder

WORKDIR /app

# Copiar arquivos do backend-java
COPY backend-java/mvnw .
COPY backend-java/.mvn .mvn
COPY backend-java/pom.xml .
COPY backend-java/src src

# Build
RUN chmod +x mvnw && ./mvnw clean package -DskipTests

# Runtime
FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

COPY --from=builder /app/target/*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
