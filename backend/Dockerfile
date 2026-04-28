# ===== STAGE 1: Build =====
FROM eclipse-temurin:21-jdk-alpine AS builder
WORKDIR /build

# Copy build files first for better caching
COPY mvnw .
COPY .mvn .mvn
COPY pom.xml .
RUN ./mvnw dependency:go-offline -B -DskipTests

# Then copy source and build
COPY src ./src
COPY checkstyle.xml .
RUN ./mvnw package -DskipTests -B

# ===== STAGE 2: Extract Layers =====
FROM eclipse-temurin:21-jdk-alpine AS extractor
WORKDIR /app
COPY --from=builder /build/target/*.jar app.jar
RUN java -Djarmode=layertools -jar app.jar extract

# ===== STAGE 3: Runtime (JRE only) =====
FROM eclipse-temurin:21-jre-alpine AS runner
WORKDIR /app

# Non-root user for security
RUN addgroup -S spring && adduser -S spring -G spring
USER spring:spring

# Copy layers: least-changed first for best cache hits
COPY --from=extractor /app/dependencies/ ./
COPY --from=extractor /app/spring-boot-loader/ ./
COPY --from=extractor /app/snapshot-dependencies/ ./
COPY --from=extractor /app/application/ ./

EXPOSE 8080

ENV JAVA_TOOL_OPTIONS="-XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0 -Djava.security.egd=file:/dev/./urandom"

ENTRYPOINT ["java", "org.springframework.boot.loader.launch.JarLauncher"]
