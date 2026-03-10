package com.cosmetovigilance.config;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.enums.SecuritySchemeType;
import io.swagger.v3.oas.annotations.info.Contact;
import io.swagger.v3.oas.annotations.info.Info;
import io.swagger.v3.oas.annotations.security.SecurityScheme;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.context.annotation.Bean;
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
    )
)
@SecurityScheme(
    name = "bearerAuth",
    type = SecuritySchemeType.HTTP,
    bearerFormat = "JWT",
    scheme = "bearer"
)
public class OpenApiConfig {
    
    @Bean
    public OpenAPI customOpenAPI() {
        Server server = new Server();
        server.setUrl("http://localhost:8080/api");
        server.setDescription("Local Development Server");
        
        Server prodServer = new Server();
        prodServer.setUrl("https://api.cosmetovigilance.com/api");
        prodServer.setDescription("Production Server");
        
        OpenAPI openAPI = new OpenAPI();
        openAPI.addServersItem(server);
        openAPI.addServersItem(prodServer);
        
        return openAPI;
    }
}
