package com.cosmetovigilance;

import com.cosmetovigilance.util.AesEncryptionUtil;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
@EnableJpaAuditing
public class CosmetovigilanceApplication {

    @Value("${app.encryption.key:your-32-char-secret-key-here!!}")
    private String encryptionKey;

    public static void main(String[] args) {
        SpringApplication.run(CosmetovigilanceApplication.class, args);
    }

    @Bean
    public CommandLineRunner testEncryption() {
        return args -> {
            System.out.println("🔐 Testing AES encryption/decryption...");
            boolean success = AesEncryptionUtil.testEncryption(encryptionKey);
            if (success) {
                System.out.println("✅ AES encryption test PASSED");
            } else {
                System.err.println("❌ AES encryption test FAILED - Check encryption key!");
            }
        };
    }
}
