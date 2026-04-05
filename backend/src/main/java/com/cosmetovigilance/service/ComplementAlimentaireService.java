package com.cosmetovigilance.service;

import com.cosmetovigilance.dto.*;
import com.cosmetovigilance.model.*;
import com.cosmetovigilance.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ComplementAlimentaireService {

    private final ComplementAlimentaireRepository complementAlimentaireRepository;
    private final DeclarantCARepository declarantCARepository;
    private final ProfessionnelSanteCARepository professionnelSanteCARepository;
    private final RepresentantLegalCARepository representantLegalCARepository;
    private final PersonneExposeeCARepository personneExposeeCARepository;
    private final AllergiesConnuesCARepository allergiesConnuesCARepository;
    private final AntecedentsMedicalCARepository antecedentsMedicalCARepository;
    private final MedicamentProduitSimultanementCARepository medicamentProduitSimultanementCARepository;
    private final EffetIndesirableCARepository effetIndesirableCARepository;
    private final PriseChargeMedicaleCARepository priseChargeMedicaleCARepository;
    private final ComplementSuspecteRepository complementSuspecteRepository;

    @Transactional
    public ComplementAlimentaireResponse createDeclaration(ComplementAlimentaireRequest request, User user, MultipartFile documentEnregistrement) throws Exception {
        ComplementAlimentaire complementAlimentaire = new ComplementAlimentaire();
        complementAlimentaire.setUser(user);
        complementAlimentaire.setNumeroDeclaration(generateDeclarationNumber());
        complementAlimentaire.setCommentaire(request.getCommentaire());

        complementAlimentaire = complementAlimentaireRepository.save(complementAlimentaire);

        saveDeclarant(request, complementAlimentaire);

        if ("professionnel".equals(request.getUtilisateurType())) {
            saveProfessionnelSante(request.getProfessionnelSante(), complementAlimentaire);
        } else if ("representant_legal".equals(request.getUtilisateurType())) {
            saveRepresentantLegal(request.getRepresentantLegal(), complementAlimentaire, documentEnregistrement);
        }

        savePersonneExposee(request, complementAlimentaire);
        saveEffetIndesirable(request.getEffetIndesirable(), complementAlimentaire);
        savePriseChargeMedicale(request.getPriseChargeMedicale(), complementAlimentaire);
        saveComplementSuspecte(request.getComplementSuspecte(), complementAlimentaire);

        return toResponse(complementAlimentaire);
    }

    private void saveDeclarant(ComplementAlimentaireRequest request, ComplementAlimentaire complementAlimentaire) throws Exception {
        DeclarantCA declarant = new DeclarantCA();
        declarant.setComplementAlimentaire(complementAlimentaire);
        declarant.setUtilisateurType(request.getUtilisateurType());
        declarant.setUtilisateurTypeAutre(request.getUtilisateurTypeAutre());
        declarant.setNom(request.getDeclarant().getNom());
        declarant.setPrenom(request.getDeclarant().getPrenom());
        declarant.setEmail(request.getDeclarant().getEmail());
        declarant.setTel(request.getDeclarant().getTel());
        declarantCARepository.save(declarant);
    }

    private void saveProfessionnelSante(ProfessionnelSanteCADto dto, ComplementAlimentaire complementAlimentaire) {
        if (dto == null) return;
        ProfessionnelSanteCA ps = new ProfessionnelSanteCA();
        ps.setComplementAlimentaire(complementAlimentaire);
        ps.setProfession(dto.getProfession());
        ps.setProfessionAutre(dto.getProfessionAutre());
        ps.setStructure(dto.getStructure());
        ps.setVille(dto.getVille());
        professionnelSanteCARepository.save(ps);
    }

    private void saveRepresentantLegal(RepresentantLegalCADto dto, ComplementAlimentaire complementAlimentaire, MultipartFile documentEnregistrement) throws IOException {
        if (dto == null) return;
        RepresentantLegalCA rl = new RepresentantLegalCA();
        rl.setComplementAlimentaire(complementAlimentaire);
        rl.setNomEtablissement(dto.getNomEtablissement());
        rl.setNumeroDeclarationEtablissement(dto.getNumeroDeclarationEtablissement());
        rl.setNumeroDocumentEnregistrementProduit(dto.getNumeroDocumentEnregistrementProduit());

        if (dto.getDateReceptionNotification() != null && !dto.getDateReceptionNotification().isEmpty()) {
            rl.setDateReceptionNotification(LocalDate.parse(dto.getDateReceptionNotification()));
        }

        if (documentEnregistrement != null && !documentEnregistrement.isEmpty()) {
            String fileName = saveFile(documentEnregistrement);
            rl.setDocumentEnregistrementPath(fileName);
        }

        representantLegalCARepository.save(rl);
    }

    private void savePersonneExposee(ComplementAlimentaireRequest request, ComplementAlimentaire complementAlimentaire) throws Exception {
        PersonneExposeeCA pe = new PersonneExposeeCA();
        pe.setComplementAlimentaire(complementAlimentaire);
        PersonneExposeeCADto dto = request.getPersonneExposee();
        pe.setType(dto.getType());
        pe.setNomPrenom(dto.getNomPrenom());
        pe.setDateNaissance(dto.getDateNaissance());
        pe.setAge(dto.getAge());
        pe.setAgeUnite(dto.getAgeUnite());
        pe.setGrossesse(dto.getGrossesse());
        pe.setMoisGrossesse(dto.getMoisGrossesse());
        pe.setAllaitement(dto.getAllaitement());
        pe.setSexe(dto.getSexe());
        pe.setVille(dto.getVille());
        pe = personneExposeeCARepository.save(pe);

        if (request.getAllergiesConnues() != null) {
            for (String allergie : request.getAllergiesConnues()) {
                AllergiesConnuesCA ac = new AllergiesConnuesCA();
                ac.setPersonneExposeeCA(pe);
                ac.setAllergie(allergie);
                allergiesConnuesCARepository.save(ac);
            }
        }

        if (request.getAntecedentsMedicaux() != null) {
            for (String antecedent : request.getAntecedentsMedicaux()) {
                AntecedentsMedicalCA am = new AntecedentsMedicalCA();
                am.setPersonneExposeeCA(pe);
                am.setAntecedent(antecedent);
                antecedentsMedicalCARepository.save(am);
            }
        }

        if (request.getMedicamentsSimultanes() != null) {
            for (String medicament : request.getMedicamentsSimultanes()) {
                MedicamentProduitSimultanementCA mp = new MedicamentProduitSimultanementCA();
                mp.setPersonneExposeeCA(pe);
                mp.setMedicament(medicament);
                medicamentProduitSimultanementCARepository.save(mp);
            }
        }
    }

    private void saveEffetIndesirable(EffetIndesirableCADto dto, ComplementAlimentaire complementAlimentaire) {
        EffetIndesirableCA ei = new EffetIndesirableCA();
        ei.setComplementAlimentaire(complementAlimentaire);
        ei.setLocalisation(dto.getLocalisation());
        ei.setDescriptionSymptomes(dto.getDescriptionSymptomes());

        if (dto.getDateApparition() != null && !dto.getDateApparition().isEmpty()) {
            ei.setDateApparition(LocalDate.parse(dto.getDateApparition()));
        }

        ei.setDelaiSurvenue(dto.getDelaiSurvenue());
        ei.setGravite(dto.getGravite());
        ei.setCriteresGravite(dto.getCriteresGravite());
        ei.setEvolutionEffet(dto.getEvolutionEffet());
        effetIndesirableCARepository.save(ei);
    }

    private void savePriseChargeMedicale(PriseChargeMedicaleCADto dto, ComplementAlimentaire complementAlimentaire) {
        if (dto == null) return;
        PriseChargeMedicaleCA pcm = new PriseChargeMedicaleCA();
        pcm.setComplementAlimentaire(complementAlimentaire);
        pcm.setConsultationMedicale(dto.getConsultationMedicale());
        pcm.setDiagnosticMedecin(dto.getDiagnosticMedecin());
        pcm.setMesuresPriseType(dto.getMesuresPriseType());
        pcm.setMesuresPriseAutre(dto.getMesuresPriseAutre());
        pcm.setExamensRealise(dto.getExamensRealise());
        priseChargeMedicaleCARepository.save(pcm);
    }

    private void saveComplementSuspecte(ComplementSuspecteDto dto, ComplementAlimentaire complementAlimentaire) {
        ComplementSuspecte cs = new ComplementSuspecte();
        cs.setComplementAlimentaire(complementAlimentaire);
        cs.setNomSpecialite(dto.getNomSpecialite());
        cs.setPosologie(dto.getPosologie());
        cs.setNumeroLot(dto.getNumeroLot());

        if (dto.getDateDebutPrise() != null && !dto.getDateDebutPrise().isEmpty()) {
            cs.setDateDebutPrise(LocalDate.parse(dto.getDateDebutPrise()));
        }

        if (dto.getDateArretPrise() != null && !dto.getDateArretPrise().isEmpty()) {
            cs.setDateArretPrise(LocalDate.parse(dto.getDateArretPrise()));
        }

        cs.setMotifPrise(dto.getMotifPrise());
        cs.setLieuAchat(dto.getLieuAchat());
        complementSuspecteRepository.save(cs);
    }

    private String saveFile(MultipartFile file) throws IOException {
        String uploadDir = "backend/uploads/";
        Path uploadPath = Paths.get(uploadDir);

        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        String fileName = UUID.randomUUID().toString() + ".pdf";
        Path filePath = uploadPath.resolve(fileName);
        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

        return fileName;
    }

    private String generateDeclarationNumber() {
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));
        String random = UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        return "CA-" + timestamp + "-" + random;
    }

    public List<ComplementAlimentaireResponse> getUserDeclarations(User user) {
        return complementAlimentaireRepository.findByUserOrderByDateCreationDesc(user)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public List<ComplementAlimentaireResponse> getAllDeclarations() {
        return complementAlimentaireRepository.findAll()
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public ComplementAlimentaireResponse getDeclarationById(Long id) {
        ComplementAlimentaire complementAlimentaire = complementAlimentaireRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Déclaration not found"));
        return toResponse(complementAlimentaire);
    }

    @Transactional
    public void updateStatut(Long id, DeclarationStatus statut) {
        ComplementAlimentaire complementAlimentaire = complementAlimentaireRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Déclaration not found"));
        complementAlimentaire.setStatut(statut);
        complementAlimentaireRepository.save(complementAlimentaire);
    }

    @Transactional
    public void updateCommentaireAnmps(Long id, String commentaire) {
        ComplementAlimentaire complementAlimentaire = complementAlimentaireRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Déclaration not found"));
        complementAlimentaire.setCommentaireAnmps(commentaire);
        complementAlimentaireRepository.save(complementAlimentaire);
    }

    private ComplementAlimentaireResponse toResponse(ComplementAlimentaire ca) {
        try {
            return ComplementAlimentaireResponse.builder()
                    .id(ca.getId())
                    .numeroDeclaration(ca.getNumeroDeclaration())
                    .statut(ca.getStatut())
                    .commentaireAnmps(ca.getCommentaireAnmps())
                    .dateCreation(ca.getDateCreation())
                    .dateModification(ca.getDateModification())
                    .declarant(toDeclarantDto(ca.getDeclarant()))
                    .professionnelSante(toProfessionnelSanteDto(ca.getProfessionnelSante()))
                    .representantLegal(toRepresentantLegalDto(ca.getRepresentantLegal()))
                    .personneExposee(toPersonneExposeeDto(ca.getPersonneExposee()))
                    .effetIndesirable(toEffetIndesirableDto(ca.getEffetIndesirable()))
                    .priseChargeMedicale(toPriseChargeMedicaleDto(ca.getPriseChargeMedicale()))
                    .complementSuspecte(toComplementSuspecteDto(ca.getComplementSuspecte()))
                    .commentaire(ca.getCommentaire())
                    .build();
        } catch (Exception e) {
            throw new RuntimeException("Error converting to response", e);
        }
    }

    private DeclarantCADto toDeclarantDto(DeclarantCA declarant) throws Exception {
        if (declarant == null) return null;
        DeclarantCADto dto = new DeclarantCADto();
        dto.setNom(declarant.getNom());
        dto.setPrenom(declarant.getPrenom());
        dto.setEmail(declarant.getEmail());
        dto.setTel(declarant.getTel());
        return dto;
    }

    private ProfessionnelSanteCADto toProfessionnelSanteDto(ProfessionnelSanteCA ps) {
        if (ps == null) return null;
        ProfessionnelSanteCADto dto = new ProfessionnelSanteCADto();
        dto.setProfession(ps.getProfession());
        dto.setProfessionAutre(ps.getProfessionAutre());
        dto.setStructure(ps.getStructure());
        dto.setVille(ps.getVille());
        return dto;
    }

    private RepresentantLegalCADto toRepresentantLegalDto(RepresentantLegalCA rl) {
        if (rl == null) return null;
        RepresentantLegalCADto dto = new RepresentantLegalCADto();
        dto.setNomEtablissement(rl.getNomEtablissement());
        dto.setNumeroDeclarationEtablissement(rl.getNumeroDeclarationEtablissement());
        dto.setNumeroDocumentEnregistrementProduit(rl.getNumeroDocumentEnregistrementProduit());
        dto.setDateReceptionNotification(rl.getDateReceptionNotification() != null ? rl.getDateReceptionNotification().toString() : null);
        return dto;
    }

    private PersonneExposeeCADto toPersonneExposeeDto(PersonneExposeeCA pe) throws Exception {
        if (pe == null) return null;
        PersonneExposeeCADto dto = new PersonneExposeeCADto();
        dto.setType(pe.getType());
        dto.setNomPrenom(pe.getNomPrenom());
        dto.setDateNaissance(pe.getDateNaissance());
        dto.setAge(pe.getAge());
        dto.setAgeUnite(pe.getAgeUnite());
        dto.setGrossesse(pe.getGrossesse());
        dto.setMoisGrossesse(pe.getMoisGrossesse());
        dto.setAllaitement(pe.getAllaitement());
        dto.setSexe(pe.getSexe());
        dto.setVille(pe.getVille());

        if (pe.getAllergiesConnues() != null) {
            dto.setAllergiesConnues(pe.getAllergiesConnues().stream()
                    .map(AllergiesConnuesCA::getAllergie)
                    .collect(Collectors.toList()));
        }

        if (pe.getAntecedentsMedicaux() != null) {
            dto.setAntecedentsMedicaux(pe.getAntecedentsMedicaux().stream()
                    .map(AntecedentsMedicalCA::getAntecedent)
                    .collect(Collectors.toList()));
        }

        if (pe.getMedicamentsSimultanes() != null) {
            dto.setMedicamentsSimultanes(pe.getMedicamentsSimultanes().stream()
                    .map(MedicamentProduitSimultanementCA::getMedicament)
                    .collect(Collectors.toList()));
        }

        return dto;
    }

    private EffetIndesirableCADto toEffetIndesirableDto(EffetIndesirableCA ei) {
        if (ei == null) return null;
        EffetIndesirableCADto dto = new EffetIndesirableCADto();
        dto.setLocalisation(ei.getLocalisation());
        dto.setDescriptionSymptomes(ei.getDescriptionSymptomes());
        dto.setDateApparition(ei.getDateApparition() != null ? ei.getDateApparition().toString() : null);
        dto.setDelaiSurvenue(ei.getDelaiSurvenue());
        dto.setGravite(ei.getGravite());
        dto.setCriteresGravite(ei.getCriteresGravite());
        dto.setEvolutionEffet(ei.getEvolutionEffet());
        return dto;
    }

    private PriseChargeMedicaleCADto toPriseChargeMedicaleDto(PriseChargeMedicaleCA pcm) {
        if (pcm == null) return null;
        PriseChargeMedicaleCADto dto = new PriseChargeMedicaleCADto();
        dto.setConsultationMedicale(pcm.getConsultationMedicale());
        dto.setDiagnosticMedecin(pcm.getDiagnosticMedecin());
        dto.setMesuresPriseType(pcm.getMesuresPriseType());
        dto.setMesuresPriseAutre(pcm.getMesuresPriseAutre());
        dto.setExamensRealise(pcm.getExamensRealise());
        return dto;
    }

    private ComplementSuspecteDto toComplementSuspecteDto(ComplementSuspecte cs) {
        if (cs == null) return null;
        ComplementSuspecteDto dto = new ComplementSuspecteDto();
        dto.setNomSpecialite(cs.getNomSpecialite());
        dto.setPosologie(cs.getPosologie());
        dto.setNumeroLot(cs.getNumeroLot());
        dto.setDateDebutPrise(cs.getDateDebutPrise() != null ? cs.getDateDebutPrise().toString() : null);
        dto.setDateArretPrise(cs.getDateArretPrise() != null ? cs.getDateArretPrise().toString() : null);
        dto.setMotifPrise(cs.getMotifPrise());
        dto.setLieuAchat(cs.getLieuAchat());
        return dto;
    }
}
