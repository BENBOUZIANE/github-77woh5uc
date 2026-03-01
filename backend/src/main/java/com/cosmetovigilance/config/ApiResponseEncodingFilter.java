package com.cosmetovigilance.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.Map;

/**
 * Encode le corps JSON des réponses API en base64 (clé "e") pour que l'inspecteur
 * navigateur n'affiche pas le JSON en clair. Le frontend décode si l'en-tête X-Response-Encoded est présent.
 * Activé via app.api.encode-responses=true.
 */
@Component
@Order(Ordered.LOWEST_PRECEDENCE - 10)
public class ApiResponseEncodingFilter implements Filter {

    private static final String HEADER_ENCODED = "X-Response-Encoded";
    private static final String ENCODING_VALUE = "base64";

    @Value("${app.api.encode-responses:false}")
    private boolean encodeResponses;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {

        if (!encodeResponses || !(response instanceof HttpServletResponse)) {
            chain.doFilter(request, response);
            return;
        }

        HttpServletResponse resp = (HttpServletResponse) response;

        BufferingResponseWrapper wrapper = new BufferingResponseWrapper(resp);
        chain.doFilter(request, wrapper);

        byte[] body = wrapper.getBuffer();
        if (body.length == 0) {
            return;
        }

        String contentType = resp.getContentType();
        if (contentType == null || !contentType.toLowerCase().contains(MediaType.APPLICATION_JSON_VALUE)) {
            resp.getOutputStream().write(body);
            return;
        }

        String bodyStr = new String(body, StandardCharsets.UTF_8);
        String encoded = Base64.getEncoder().encodeToString(bodyStr.getBytes(StandardCharsets.UTF_8));
        String wrapped = objectMapper.writeValueAsString(Map.of("e", encoded));

        resp.resetBuffer();
        resp.setContentType(MediaType.APPLICATION_JSON_VALUE);
        resp.setCharacterEncoding(StandardCharsets.UTF_8.name());
        resp.setHeader(HEADER_ENCODED, ENCODING_VALUE);
        resp.setContentLength(wrapped.getBytes(StandardCharsets.UTF_8).length);
        resp.getOutputStream().write(wrapped.getBytes(StandardCharsets.UTF_8));
    }
}
