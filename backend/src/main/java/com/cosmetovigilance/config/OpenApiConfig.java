package com.cosmetovigilance.config;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.enums.SecuritySchemeType;
import io.swagger.v3.oas.annotations.info.Contact;
import io.swagger.v3.oas.annotations.info.Info;
import io.swagger.v3.oas.annotations.security.SecurityScheme;
import io.swagger.v3.oas.annotations.servers.Server;
import org.springframework.context.annotation.Configuration;

@Configuration
@OpenAPIDefinition(
    info = @Info(
        title = "Cosmetovigilance API",
        version = "1.0.0",
        description = "REST API for Cosmetovigilance declaration management system",
        contact = @Contact(
            name = "Cosmetovigilance",
            email = "contact@cosmetovigilance.com"
        )
    ),
    servers = {
        @Server(url = "http://192.168.1.109:8080/api", description = "Local Server"),
        @Server(url = "https://api.cosmetovigilance.com/api", description = "Production Server")
    }
)
@SecurityScheme(
    name = "bearerAuth",
    type = SecuritySchemeType.HTTP,
    bearerFormat = "JWT",
    scheme = "bearer"
)
public class OpenApiConfig {
}
