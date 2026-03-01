package com.cosmetovigilance.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Value("${cors.allow-any-origin:false}")
    private boolean allowAnyOrigin;

    @Value("${cors.allowed-origins}")
    private String[] allowedOrigins;

    @Value("${cors.allowed-methods}")
    private String[] allowedMethods;

    @Value("${cors.allowed-headers}")
    private String allowedHeaders;

    @Value("${cors.max-age}")
    private long maxAge;

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        var registration = registry.addMapping("/**")
                .allowedMethods(allowedMethods)
                .allowedHeaders(allowedHeaders.split(","))
                .allowCredentials(true)
                .maxAge(maxAge);
        if (allowAnyOrigin) {
            registration.allowedOriginPatterns("*");
        } else {
            registration.allowedOrigins(allowedOrigins);
        }
    }
}
