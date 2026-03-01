package com.cosmetovigilance.config;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.env.EnvironmentPostProcessor;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.env.MapPropertySource;

import java.util.HashMap;
import java.util.Map;

/**
 * Déchiffre spring.datasource.password quand la valeur est au format ENC(...)
 * en utilisant la clé JASYPT_ENCRYPTOR_PASSWORD. Compatible Spring Boot 3.
 * Si la valeur n'est pas ENC(...), elle est laissée telle quelle (mot de passe en clair).
 */
public class DecryptDataSourcePasswordPostProcessor implements EnvironmentPostProcessor {

    private static final String PASSWORD_PROP = "spring.datasource.password";
    private static final String KEY_PROP = "JASYPT_ENCRYPTOR_PASSWORD";
    private static final String ENC_PREFIX = "ENC(";
    private static final String ENC_SUFFIX = ")";

    @Override
    public void postProcessEnvironment(ConfigurableEnvironment environment, SpringApplication application) {
        String raw = environment.getProperty(PASSWORD_PROP);
        if (raw == null || !raw.startsWith(ENC_PREFIX) || !raw.endsWith(ENC_SUFFIX)) {
            return;
        }
        String key = environment.getProperty(KEY_PROP);
        if (key == null || key.isBlank()) {
            return;
        }
        String encrypted = raw.substring(ENC_PREFIX.length(), raw.length() - ENC_SUFFIX.length());
        String decrypted;
        try {
            decrypted = JasyptDecryptor.decrypt(key, encrypted);
        } catch (Exception e) {
            throw new IllegalStateException(
                "Impossible de déchiffrer spring.datasource.password. Vérifiez que ENC(...) a été généré avec la même clé que JASYPT_ENCRYPTOR_PASSWORD.", e);
        }
        Map<String, Object> overrides = new HashMap<>();
        overrides.put(PASSWORD_PROP, decrypted);
        environment.getPropertySources().addFirst(new MapPropertySource("decrypted-datasource-password", overrides));
    }
}
