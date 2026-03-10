package com.cosmetovigilance.config;

import com.cosmetovigilance.util.AesEncryptionUtil;
import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;

/**
 * Filtre qui déchiffre les requêtes POST/PATCH avec l'en-tête X-Request-Encrypted=true
 * Les données reçues doivent être au format: { "e": "donneesChiffrees" }
 */
@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class RequestDecryptionFilter implements Filter {

    private static final String ENCRYPTION_HEADER = "X-Request-Encrypted";
    private static final String ENCRYPT_VALUE = "true";

    @Value("${app.encryption.key:your-32-char-secret-key-here!!}")
    private String encryptionKey;

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {

        if (!(request instanceof HttpServletRequest)) {
            chain.doFilter(request, response);
            return;
        }

        HttpServletRequest httpRequest = (HttpServletRequest) request;
        String contentType = httpRequest.getContentType();
        String encryptionHeader = httpRequest.getHeader(ENCRYPTION_HEADER);

        // Déchiffrer seulement les POST/PATCH JSON avec l'en-tête de chiffrement
        boolean isPostOrPatch = "POST".equalsIgnoreCase(httpRequest.getMethod()) ||
                               "PATCH".equalsIgnoreCase(httpRequest.getMethod());
        boolean isEncrypted = ENCRYPT_VALUE.equalsIgnoreCase(encryptionHeader);
        boolean isJson = contentType != null && contentType.contains("application/json");

        if (!isPostOrPatch || !isEncrypted || !isJson) {
            chain.doFilter(request, response);
            return;
        }

        String body = null;
        try {
            // Lire le body de la requête une seule fois
            body = readRequestBody(request);

            if (body == null || body.isEmpty()) {
                chain.doFilter(request, response);
                return;
            }

            // Extraire les données chiffrées
            String decryptedBody = extractAndDecrypt(body);

            // Wrapper la requête avec le body déchiffré
            BufferingRequestWrapper wrappedRequest = new BufferingRequestWrapper(
                    httpRequest,
                    decryptedBody.getBytes(StandardCharsets.UTF_8)
            );

            chain.doFilter(wrappedRequest, response);
        } catch (Exception e) {
            // Log l'erreur et affiche le body lu précédemment (si présent)
            System.err.println("Erreur lors du déchiffrement: " + e.getMessage());
            if (body != null) {
                System.err.println("Raw request body (pre-read): " + body);
            }
            System.err.println("Encryption key used: " + encryptionKey + " (len=" + encryptionKey.length() + ")");
            chain.doFilter(request, response);
        }
    }

    /**
     * Lit le body de la requête
     */
    private String readRequestBody(ServletRequest request) throws IOException {
        StringBuilder stringBuilder = new StringBuilder();
        String line;

        try (BufferedReader bufferedReader = new BufferedReader(
                new InputStreamReader(request.getInputStream(), StandardCharsets.UTF_8))) {
            while ((line = bufferedReader.readLine()) != null) {
                stringBuilder.append(line);
            }
        }

        return stringBuilder.toString();
    }

    /**
     * Extrait la clé "e" et déchiffre le contenu
     */
    private String extractAndDecrypt(String encryptedPayload) throws Exception {
        // Parse le JSON pour extraire "e"
        String encryptedData = extractJsonValue(encryptedPayload, "e");
        
        if (encryptedData.isEmpty()) {
            throw new Exception("Clé 'e' non trouvée dans le payload");
        }

        // Déchiffre
        return AesEncryptionUtil.decrypt(encryptedData, encryptionKey);
    }

    /**
     * Extrait une valeur d'un JSON simple (sans dépendance externe)
     */
    private String extractJsonValue(String json, String key) {
        String searchKey = "\"" + key + "\":\"";
        int startIndex = json.indexOf(searchKey);

        if (startIndex == -1) {
            return "";
        }

        startIndex += searchKey.length();
        int endIndex = json.indexOf("\"", startIndex);

        if (endIndex == -1) {
            return "";
        }

        return json.substring(startIndex, endIndex);
    }

    @Override
    public void init(FilterConfig filterConfig) {
    }

    @Override
    public void destroy() {
    }
}
