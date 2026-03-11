package com.cosmetovigilance.config;

import com.cosmetovigilance.util.AesEncryptionUtil;
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
import java.util.Map;

/**
 * Chiffre le corps JSON des réponses API avec AES (clé "e") pour que l'inspecteur
 * navigateur n'affiche pas le JSON en clair. Le frontend déchiffre si l'en-tête X-Response-Encrypted est présent.
 * Activé via app.api.encrypt-responses=true.
 */
@Component
@Order(Ordered.HIGHEST_PRECEDENCE + 1)
public class ApiResponseEncodingFilter implements Filter {

    private static final String HEADER_ENCRYPTED = "X-Response-Encrypted";
    private static final String ENCRYPTION_VALUE = "true";

    @Value("${app.api.encrypt-responses:false}")
    private boolean encryptResponses;

    @Value("${app.encryption.key:your-32-char-secret-key-here!!}")
    private String encryptionKey;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {

        if (!encryptResponses || !(response instanceof HttpServletResponse)) {
            chain.doFilter(request, response);
            return;
        }

        HttpServletResponse resp = (HttpServletResponse) response;

        BufferingResponseWrapper wrapper = new BufferingResponseWrapper(resp);
        chain.doFilter(request, wrapper);

        byte[] body = wrapper.getBuffer();
        String contentType = wrapper.getContentType();

        if (contentType == null || !contentType.toLowerCase().contains(MediaType.APPLICATION_JSON_VALUE)) {
            resp.getOutputStream().write(body);
            resp.getOutputStream().flush();
            return;
        }

        try {
            String bodyStr = new String(body, StandardCharsets.UTF_8);
            String encrypted = AesEncryptionUtil.encrypt(bodyStr, encryptionKey);

            String wrapped = objectMapper.writeValueAsString(Map.of(
                    "encrypted", true,
                    "data", encrypted
            ));
            byte[] encryptedBody = wrapped.getBytes(StandardCharsets.UTF_8);

            // Définir les headers AVANT l'écriture
            resp.setContentType(MediaType.APPLICATION_JSON_VALUE + ";charset=utf-8");
            resp.setCharacterEncoding(StandardCharsets.UTF_8.name());
            resp.setContentLength(encryptedBody.length);
            resp.setHeader(HEADER_ENCRYPTED, ENCRYPTION_VALUE);

            // Écrire le contenu
            resp.getOutputStream().write(encryptedBody);
            resp.getOutputStream().flush();
            resp.flushBuffer();
        } catch (Exception e) {
            // En cas d'erreur de chiffrement, log et essaie de retourner la réponse brute
            System.err.println("❌ Erreur lors du chiffrement de la réponse: " + e.getMessage());
            e.printStackTrace();
            try {
                resp.setContentType(MediaType.APPLICATION_JSON_VALUE + ";charset=utf-8");
                resp.setCharacterEncoding(StandardCharsets.UTF_8.name());
                resp.setContentLength(body.length);
                resp.getOutputStream().write(body);
                resp.getOutputStream().flush();
            } catch (Exception ex) {
                System.err.println("❌ Erreur lors de l'écriture du body non chiffré: " + ex.getMessage());
            }
        }
    }
}
