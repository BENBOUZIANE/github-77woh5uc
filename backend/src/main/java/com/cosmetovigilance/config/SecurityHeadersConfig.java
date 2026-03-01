package com.cosmetovigilance.config;

import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.util.StringUtils;

import java.io.IOException;
import java.util.Arrays;
import java.util.stream.Collectors;

/**
 * En-têtes de sécurité (CSP, etc.). La directive connect-src est construite
 * dynamiquement à partir de app.csp.allowed-http-hosts et app.csp.allow-private-network-http.
 */
@Configuration
@Order(Ordered.HIGHEST_PRECEDENCE)
public class SecurityHeadersConfig implements Filter {

    @Value("${server.port:8080}")
    private int serverPort;

    @Value("${app.csp.allowed-http-hosts:localhost,127.0.0.1}")
    private String allowedHttpHosts;

    @Value("${app.csp.allow-private-network-http:true}")
    private boolean allowPrivateNetworkHttp;

    @Value("${security.csp.default-src:'self'}")
    private String defaultSrc;

    @Value("${security.csp.script-src:'self' 'unsafe-inline' 'unsafe-eval'}")
    private String scriptSrc;

    @Value("${security.csp.style-src:'self' 'unsafe-inline'}")
    private String styleSrc;

    @Value("${security.csp.img-src:'self' data: https:}")
    private String imgSrc;

    @Value("${security.csp.font-src:'self' data:}")
    private String fontSrc;

    @Value("${security.csp.frame-ancestors:'none'}")
    private String frameAncestors;

    private String resolvedConnectSrc;

    @jakarta.annotation.PostConstruct
    public void init() {
        resolvedConnectSrc = buildConnectSrc();
    }

    private String buildConnectSrc() {
        String base = "'self' https:";
        if (!StringUtils.hasText(allowedHttpHosts)) {
            return base;
        }
        String hosts = Arrays.stream(allowedHttpHosts.split(","))
                .map(String::trim)
                .filter(StringUtils::hasText)
                .map(h -> "http://" + h + ":" + serverPort)
                .collect(Collectors.joining(" "));
        if (StringUtils.hasText(hosts)) {
            base = base + " " + hosts;
        }
        if (allowPrivateNetworkHttp) {
            base = base + " http://*:" + serverPort;
        }
        return base;
    }

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {

        HttpServletResponse httpResponse = (HttpServletResponse) response;

        String csp = String.join("; ",
                "default-src " + defaultSrc,
                "script-src " + scriptSrc,
                "style-src " + styleSrc,
                "img-src " + imgSrc,
                "font-src " + fontSrc,
                "connect-src " + resolvedConnectSrc,
                "frame-ancestors " + frameAncestors
        );

        httpResponse.setHeader("Content-Security-Policy", csp);
        httpResponse.setHeader("X-Content-Type-Options", "nosniff");
        httpResponse.setHeader("X-Frame-Options", "DENY");
        httpResponse.setHeader("X-XSS-Protection", "1; mode=block");
        httpResponse.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
        httpResponse.setHeader("Permissions-Policy", "geolocation=(), microphone=(), camera=(), payment=()");

        chain.doFilter(request, response);
    }

    @Override
    public void init(FilterConfig filterConfig) {}

    @Override
    public void destroy() {}
}
