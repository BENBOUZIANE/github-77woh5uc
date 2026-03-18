package com.cosmetovigilance.service;

import com.cosmetovigilance.dto.*;
import com.cosmetovigilance.model.*;
import com.cosmetovigilance.repository.*;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class DispositifMedicalService {

    private final DispositifMedicalRepository dispositifMedicalRepository;
    private final DeclarantDMRepository declarantDMRepository;
    private final PersonneExposeeDMRepository personneExposeeDMRepository;
    private final DispositifSuspecteRepository dispositifSuspecteRepository;
    private final EffetIndesirableDMRepository effetIndesirableDMRepository;
    private final PriseChargeMedicaleDMRepository priseChargeMedicaleDMRepository;
    private final ProfessionnelSanteDMRepository professionnelSanteDMRepository;
    private final RepresentantLegalDMRepository representantLegalDMRepository;
    private final AllergiesConnuesDMRepository allergiesConnuesDMRepository;
    private final AntecedentsMedicalDMRepository antecedentsMedicalDMRepository;
    private final MedicamentProduitSimultanementDMRepository medicamentProduitSimultanementDMRepository;
    private final UserRepository userRepository;

    @Transactional
    public DispositifMedicalResponse createDeclaration(DispositifMedicalRequest request, String userEmail) {
        log.info("Creating dispositif medical declaration for user: {}", userEmail);

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        DispositifMedical dispositifMedical = new DispositifMedical();
        dispositifMedical.setUser(user);
        dispositifMedical.setCommentaire(request.getCommentaire());
        dispositifMedical.setStatut("EN_ATTENTE");

        if (request.getDeclarant() != null) {
            DeclarantDM declarant = mapToDeclarant(request.getDeclarant());
            declarant = declarantDMRepository.save(declarant);
            dispositifMedical.setDeclarant(declarant);
        }

        if (request.getPersonneExposee() != null) {
            PersonneExposeeDM personneExposee = mapToPersonneExposee(request.getPersonneExposee());
            personneExposee = personneExposeeDMRepository.save(personneExposee);
            dispositifMedical.setPersonneExposee(personneExposee);

            Long personneExposeeId = personneExposee.getId();

            if (request.getAllergies() != null && !request.getAllergies().isEmpty()) {
                for (AllergiesConnuesDMDto allergieDto : request.getAllergies()) {
                    AllergiesConnuesDM allergie = new AllergiesConnuesDM();
                    allergie.setPersonneExposeeDmId(personneExposeeId);
                    allergie.setTypeAllergie(allergieDto.getTypeAllergie());
                    allergie.setDescription(allergieDto.getDescription());
                    allergiesConnuesDMRepository.save(allergie);
                }
            }

            if (request.getAntecedents() != null && !request.getAntecedents().isEmpty()) {
                for (AntecedentsMedicalDMDto antecedentDto : request.getAntecedents()) {
                    AntecedentsMedicalDM antecedent = new AntecedentsMedicalDM();
                    antecedent.setPersonneExposeeDmId(personneExposeeId);
                    antecedent.setDescription(antecedentDto.getDescription());
                    antecedentsMedicalDMRepository.save(antecedent);
                }
            }

            if (request.getMedicamentsSimultanes() != null && !request.getMedicamentsSimultanes().isEmpty()) {
                for (MedicamentProduitSimultanementDMDto medicamentDto : request.getMedicamentsSimultanes()) {
                    MedicamentProduitSimultanementDM medicament = new MedicamentProduitSimultanementDM();
                    medicament.setPersonneExposeeDmId(personneExposeeId);
                    medicament.setNom(medicamentDto.getNom());
                    medicament.setPosologie(medicamentDto.getPosologie());
                    medicamentProduitSimultanementDMRepository.save(medicament);
                }
            }
        }

        if (request.getProfessionnelSante() != null) {
            ProfessionnelSanteDM professionnelSante = mapToProfessionnelSante(request.getProfessionnelSante());
            professionnelSante = professionnelSanteDMRepository.save(professionnelSante);
            dispositifMedical.setProfessionnelSante(professionnelSante);
        }

        if (request.getRepresentantLegal() != null) {
            RepresentantLegalDM representantLegal = mapToRepresentantLegal(request.getRepresentantLegal());
            representantLegal = representantLegalDMRepository.save(representantLegal);
            dispositifMedical.setRepresentantLegal(representantLegal);
        }

        dispositifMedical = dispositifMedicalRepository.save(dispositifMedical);
        Long dispositifMedicalId = dispositifMedical.getId();

        if (request.getDispositifsSuspectes() != null && !request.getDispositifsSuspectes().isEmpty()) {
            for (DispositifSuspecteDto dispositifDto : request.getDispositifsSuspectes()) {
                DispositifSuspecte dispositifSuspecte = new DispositifSuspecte();
                dispositifSuspecte.setDispositifMedicalId(dispositifMedicalId);
                dispositifSuspecte.setNomSpecialite(dispositifDto.getNomSpecialite());
                dispositifSuspecte.setPosologie(dispositifDto.getPosologie());
                dispositifSuspecte.setNumeroLot(dispositifDto.getNumeroLot());
                dispositifSuspecte.setDateDebutPrise(dispositifDto.getDateDebutPrise());
                dispositifSuspecte.setDateArretPrise(dispositifDto.getDateArretPrise());
                dispositifSuspecte.setMotifPrise(dispositifDto.getMotifPrise());
                dispositifSuspecte.setLieuAchat(dispositifDto.getLieuAchat());
                dispositifSuspecteRepository.save(dispositifSuspecte);
            }
        }

        if (request.getEffetsIndesirables() != null && !request.getEffetsIndesirables().isEmpty()) {
            for (EffetIndesirableDMDto effetDto : request.getEffetsIndesirables()) {
                EffetIndesirableDM effet = new EffetIndesirableDM();
                effet.setDispositifMedicalId(dispositifMedicalId);
                effet.setDescription(effetDto.getDescription());
                effet.setLocalisation(effetDto.getLocalisation());
                effet.setDateApparition(effetDto.getDateApparition());
                effet.setGravite(effetDto.getGravite());
                effet.setEvolution(effetDto.getEvolution());
                effetIndesirableDMRepository.save(effet);
            }
        }

        if (request.getPriseChargeMedicale() != null) {
            PriseChargeMedicaleDM priseCharge = new PriseChargeMedicaleDM();
            priseCharge.setDispositifMedicalId(dispositifMedicalId);
            priseCharge.setHospitalisationRequise(request.getPriseChargeMedicale().getHospitalisationRequise());
            priseCharge.setDureeHospitalisation(request.getPriseChargeMedicale().getDureeHospitalisation());
            priseCharge.setTraitementMedical(request.getPriseChargeMedicale().getTraitementMedical());
            priseCharge.setExamensComplementaires(request.getPriseChargeMedicale().getExamensComplementaires());
            priseChargeMedicaleDMRepository.save(priseCharge);
        }

        log.info("Dispositif medical declaration created with ID: {}", dispositifMedicalId);
        return mapToResponse(dispositifMedical);
    }

    public List<DispositifMedicalResponse> getDeclarationsByUser(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<DispositifMedical> declarations = dispositifMedicalRepository.findByUserIdOrderByCreatedAtDesc(user.getId());
        return declarations.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<DispositifMedicalResponse> getAllDeclarations() {
        List<DispositifMedical> declarations = dispositifMedicalRepository.findAll();
        return declarations.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public DispositifMedicalResponse getDeclarationById(Long id) {
        DispositifMedical dispositifMedical = dispositifMedicalRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Declaration not found"));
        return mapToResponse(dispositifMedical);
    }

    @Transactional
    public DispositifMedicalResponse updateStatut(Long id, String statut) {
        DispositifMedical dispositifMedical = dispositifMedicalRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Declaration not found"));

        dispositifMedical.setStatut(statut);
        dispositifMedical = dispositifMedicalRepository.save(dispositifMedical);

        return mapToResponse(dispositifMedical);
    }

    @Transactional
    public DispositifMedicalResponse updateCommentaireAnmps(Long id, String commentaireAnmps) {
        DispositifMedical dispositifMedical = dispositifMedicalRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Declaration not found"));

        dispositifMedical.setCommentaireAnmps(commentaireAnmps);
        dispositifMedical = dispositifMedicalRepository.save(dispositifMedical);

        return mapToResponse(dispositifMedical);
    }

    private DeclarantDM mapToDeclarant(DeclarantDMDto dto) {
        DeclarantDM declarant = new DeclarantDM();
        declarant.setNom(dto.getNom());
        declarant.setPrenom(dto.getPrenom());
        declarant.setEmail(dto.getEmail());
        declarant.setTelephone(dto.getTelephone());
        declarant.setQualiteDeclarant(dto.getQualiteDeclarant());
        return declarant;
    }

    private PersonneExposeeDM mapToPersonneExposee(PersonneExposeeDMDto dto) {
        PersonneExposeeDM personne = new PersonneExposeeDM();
        personne.setNom(dto.getNom());
        personne.setPrenom(dto.getPrenom());
        personne.setDateNaissance(dto.getDateNaissance());
        personne.setAge(dto.getAge());
        personne.setAgeUnite(dto.getAgeUnite());
        personne.setSexe(dto.getSexe());
        personne.setPoids(dto.getPoids());
        personne.setTaille(dto.getTaille());
        personne.setEmail(dto.getEmail());
        personne.setTelephone(dto.getTelephone());
        personne.setAdresse(dto.getAdresse());
        personne.setVille(dto.getVille());
        personne.setCodePostal(dto.getCodePostal());
        personne.setGrossesse(dto.getGrossesse());
        personne.setAllaitement(dto.getAllaitement());
        return personne;
    }

    private ProfessionnelSanteDM mapToProfessionnelSante(ProfessionnelSanteDMDto dto) {
        ProfessionnelSanteDM professionnel = new ProfessionnelSanteDM();
        professionnel.setNom(dto.getNom());
        professionnel.setPrenom(dto.getPrenom());
        professionnel.setSpecialite(dto.getSpecialite());
        professionnel.setEmail(dto.getEmail());
        professionnel.setTelephone(dto.getTelephone());
        professionnel.setAdresse(dto.getAdresse());
        professionnel.setEtablissement(dto.getEtablissement());
        professionnel.setVille(dto.getVille());
        return professionnel;
    }

    private RepresentantLegalDM mapToRepresentantLegal(RepresentantLegalDMDto dto) {
        RepresentantLegalDM representant = new RepresentantLegalDM();
        representant.setNom(dto.getNom());
        representant.setPrenom(dto.getPrenom());
        representant.setLienParente(dto.getLienParente());
        representant.setEmail(dto.getEmail());
        representant.setTelephone(dto.getTelephone());
        representant.setAdresse(dto.getAdresse());
        return representant;
    }

    private DispositifMedicalResponse mapToResponse(DispositifMedical dm) {
        List<DispositifSuspecte> dispositifsSuspectes = dispositifSuspecteRepository.findByDispositifMedicalId(dm.getId());
        List<EffetIndesirableDM> effetsIndesirables = effetIndesirableDMRepository.findByDispositifMedicalId(dm.getId());
        List<PriseChargeMedicaleDM> priseCharges = priseChargeMedicaleDMRepository.findByDispositifMedicalId(dm.getId());

        List<AllergiesConnuesDMDto> allergies = new ArrayList<>();
        List<AntecedentsMedicalDMDto> antecedents = new ArrayList<>();
        List<MedicamentProduitSimultanementDMDto> medicamentsSimultanes = new ArrayList<>();

        if (dm.getPersonneExposee() != null) {
            Long personneExposeeId = dm.getPersonneExposee().getId();

            allergies = allergiesConnuesDMRepository.findByPersonneExposeeDmId(personneExposeeId)
                    .stream()
                    .map(a -> new AllergiesConnuesDMDto(a.getTypeAllergie(), a.getDescription()))
                    .collect(Collectors.toList());

            antecedents = antecedentsMedicalDMRepository.findByPersonneExposeeDmId(personneExposeeId)
                    .stream()
                    .map(a -> new AntecedentsMedicalDMDto(a.getDescription()))
                    .collect(Collectors.toList());

            medicamentsSimultanes = medicamentProduitSimultanementDMRepository.findByPersonneExposeeDmId(personneExposeeId)
                    .stream()
                    .map(m -> new MedicamentProduitSimultanementDMDto(m.getNom(), m.getPosologie()))
                    .collect(Collectors.toList());
        }

        return DispositifMedicalResponse.builder()
                .id(dm.getId())
                .numeroDeclaration(dm.getNumeroDeclaration())
                .statut(dm.getStatut())
                .commentaire(dm.getCommentaire())
                .commentaireAnmps(dm.getCommentaireAnmps())
                .createdAt(dm.getCreatedAt())
                .updatedAt(dm.getUpdatedAt())
                .declarant(dm.getDeclarant() != null ? mapDeclarantToDto(dm.getDeclarant()) : null)
                .personneExposee(dm.getPersonneExposee() != null ? mapPersonneExposeeToDto(dm.getPersonneExposee()) : null)
                .dispositifsSuspectes(dispositifsSuspectes.stream().map(this::mapDispositifSuspecteToDto).collect(Collectors.toList()))
                .effetsIndesirables(effetsIndesirables.stream().map(this::mapEffetIndesirableToDto).collect(Collectors.toList()))
                .priseChargeMedicale(!priseCharges.isEmpty() ? mapPriseChargeMedicaleToDto(priseCharges.get(0)) : null)
                .professionnelSante(dm.getProfessionnelSante() != null ? mapProfessionnelSanteToDto(dm.getProfessionnelSante()) : null)
                .representantLegal(dm.getRepresentantLegal() != null ? mapRepresentantLegalToDto(dm.getRepresentantLegal()) : null)
                .allergies(allergies)
                .antecedents(antecedents)
                .medicamentsSimultanes(medicamentsSimultanes)
                .build();
    }

    private DeclarantDMDto mapDeclarantToDto(DeclarantDM declarant) {
        return new DeclarantDMDto(
                declarant.getNom(),
                declarant.getPrenom(),
                declarant.getEmail(),
                declarant.getTelephone(),
                declarant.getQualiteDeclarant()
        );
    }

    private PersonneExposeeDMDto mapPersonneExposeeToDto(PersonneExposeeDM personne) {
        return new PersonneExposeeDMDto(
                personne.getNom(),
                personne.getPrenom(),
                personne.getDateNaissance(),
                personne.getAge(),
                personne.getAgeUnite(),
                personne.getSexe(),
                personne.getPoids(),
                personne.getTaille(),
                personne.getEmail(),
                personne.getTelephone(),
                personne.getAdresse(),
                personne.getVille(),
                personne.getCodePostal(),
                personne.getGrossesse(),
                personne.getAllaitement()
        );
    }

    private DispositifSuspecteDto mapDispositifSuspecteToDto(DispositifSuspecte dispositif) {
        return new DispositifSuspecteDto(
                dispositif.getNomSpecialite(),
                dispositif.getPosologie(),
                dispositif.getNumeroLot(),
                dispositif.getDateDebutPrise(),
                dispositif.getDateArretPrise(),
                dispositif.getMotifPrise(),
                dispositif.getLieuAchat()
        );
    }

    private EffetIndesirableDMDto mapEffetIndesirableToDto(EffetIndesirableDM effet) {
        return new EffetIndesirableDMDto(
                effet.getDescription(),
                effet.getLocalisation(),
                effet.getDateApparition(),
                effet.getGravite(),
                effet.getEvolution()
        );
    }

    private PriseChargeMedicaleDMDto mapPriseChargeMedicaleToDto(PriseChargeMedicaleDM priseCharge) {
        return new PriseChargeMedicaleDMDto(
                priseCharge.getHospitalisationRequise(),
                priseCharge.getDureeHospitalisation(),
                priseCharge.getTraitementMedical(),
                priseCharge.getExamensComplementaires()
        );
    }

    private ProfessionnelSanteDMDto mapProfessionnelSanteToDto(ProfessionnelSanteDM professionnel) {
        return new ProfessionnelSanteDMDto(
                professionnel.getNom(),
                professionnel.getPrenom(),
                professionnel.getSpecialite(),
                professionnel.getEmail(),
                professionnel.getTelephone(),
                professionnel.getAdresse(),
                professionnel.getEtablissement(),
                professionnel.getVille()
        );
    }

    private RepresentantLegalDMDto mapRepresentantLegalToDto(RepresentantLegalDM representant) {
        return new RepresentantLegalDMDto(
                representant.getNom(),
                representant.getPrenom(),
                representant.getLienParente(),
                representant.getEmail(),
                representant.getTelephone(),
                representant.getAdresse()
        );
    }
}
