package com.cosmetovigilance.service;

import com.cosmetovigilance.model.DeclarationStatus;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    public void sendCommentaireAnmpsEmail(String toEmail, String declarationId, String commentaireAnmps, DeclarationStatus statut) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom("noreply@cosmetovigilance.fr");
            message.setTo(toEmail);
            message.setSubject("Mise à jour de votre déclaration - " + declarationId);

            String statusLabel = getStatusLabel(statut);

            String emailBody = String.format(
                "Bonjour,\n\n" +
                "Votre déclaration #%s a été mise à jour.\n\n" +
                "Statut actuel: %s\n\n" +
                "Commentaire de l'ANMPS:\n%s\n\n" +
                "Cordialement,\n" +
                "L'équipe de Cosmétovigilance",
                declarationId.substring(0, Math.min(8, declarationId.length())),
                statusLabel,
                commentaireAnmps != null ? commentaireAnmps : "Aucun commentaire"
            );

            message.setText(emailBody);
            mailSender.send(message);

            log.info("Email sent successfully to {}", toEmail);
        } catch (Exception e) {
            log.error("Failed to send email to {}: {}", toEmail, e.getMessage());
        }
    }

    private String getStatusLabel(DeclarationStatus statut) {
        switch (statut) {
            case nouveau: return "Nouveau";
            case en_cours: return "En cours";
            case traite: return "Traité";
            case rejete: return "Rejeté";
            case cloture: return "Clôturé";
            default: return statut.name();
        }
    }
}
