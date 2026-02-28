package com.cosmetovigilance.config;

import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;

import java.io.IOException;

@Configuration
@Order(Ordered.HIGHEST_PRECEDENCE)
public class SecurityHeadersConfig implements Filter {

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {

        HttpServletResponse httpResponse = (HttpServletResponse) response;

        // Content Security Policy - Protège contre XSS et injection de code
        httpResponse.setHeader("Content-Security-Policy",
            "default-src 'self'; " +
            "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
            "style-src 'self' 'unsafe-inline'; " +
            "img-src 'self' data: https:; " +
            "font-src 'self' data:; " +
            "connect-src 'self'; " +
            "frame-ancestors 'none';"
        );

        // X-Content-Type-Options - Empêche le MIME type sniffing
        httpResponse.setHeader("X-Content-Type-Options", "nosniff");

        // X-Frame-Options - Protège contre le clickjacking
        httpResponse.setHeader("X-Frame-Options", "DENY");

        // X-XSS-Protection - Active la protection XSS du navigateur
        httpResponse.setHeader("X-XSS-Protection", "1; mode=block");

        // Strict-Transport-Security - Force HTTPS (à activer en production)
        // httpResponse.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");

        // Referrer-Policy - Contrôle les informations de référence
        httpResponse.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");

        // Permissions-Policy - Contrôle les fonctionnalités du navigateur
        httpResponse.setHeader("Permissions-Policy",
            "geolocation=(), microphone=(), camera=(), payment=()"
        );

        chain.doFilter(request, response);
    }

    @Override
    public void init(FilterConfig filterConfig) throws ServletException {
        // Initialization logic if needed
    }

    @Override
    public void destroy() {
        // Cleanup logic if needed
    }
}
