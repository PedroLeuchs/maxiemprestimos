# Etapa 1: Build com JDK e Gradle Wrapper
FROM eclipse-temurin:21-jdk AS build

WORKDIR /app

# Copia todos os arquivos do backend para dentro do container
COPY . .

# Permissão para executar o gradlew (Gradle Wrapper)
RUN chmod +x ./gradlew

# Roda o build pulando os testes
RUN ./gradlew build -x test

# Etapa 2: Imagem final para rodar o app
FROM eclipse-temurin:21-jdk

WORKDIR /app

# Copia o .jar gerado da etapa de build
COPY --from=build /app/build/libs/*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
