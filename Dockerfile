FROM eclipse-temurin:21-jdk-alpine AS build
WORKDIR /app

COPY backend/.mvn .mvn
COPY backend/mvnw mvnw
COPY backend/pom.xml pom.xml

RUN chmod +x mvnw
RUN ./mvnw -q -DskipTests dependency:go-offline

COPY backend/src src
RUN ./mvnw -q -DskipTests clean package

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
VOLUME /tmp

COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080

ENTRYPOINT ["java","-jar","/app/app.jar"]