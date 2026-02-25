package com.cosmetovigilance.service;

import com.cosmetovigilance.dto.*;
import com.cosmetovigilance.model.*;
import com.cosmetovigilance.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DeclarationService {

    private final DeclarationRepository declarationRepository;
    private final DeclarantRepository declarantRepository;
    private final PersonneExposeeRepository personneExposeeRepository;
    private final AllergiesConnuesRepository allergiesConnuesRepository;
    private final AntecedentsMedicalRepository antecedentsMedicalRepository;
    private final MedicamentProduitSimultanementRepository medicamentRepository;
    private final EffetIndesirableRepository effetIndesirableRepository;
    private final ProduitSuspecteRepository produitSuspecteRepository;
    private final PriseChargeMedicaleRepository priseChargeMedicaleRepository;
    private final UserRepository userRepository;
    private final UtilisateurRepository utilisateurRepository;
    private final ProfessionnelSanteRepository professionnelSanteRepository;
    private final RepresentantLegalRepository representantLegalRepository;
    private final EmailService emailService;

    @Transactional
    public DeclarationResponse createDeclaration(DeclarationRequest request, String userEmail) {
        User user = null;
        if (userEmail != null && !userEmail.isEmpty()) {
            user = userRepository.findByEmail(userEmail)
                    .orElseThrow(() -> new RuntimeException("User not found"));
        }

        // Create Utilisateur to store declarant type if provided
        Utilisateur utilisateur = null;
        if (request.getUtilisateurType() != null && !request.getUtilisateurType().isEmpty()) {
            utilisateur = new Utilisateur();
            utilisateur.setType(request.getUtilisateurType());
            utilisateur = utilisateurRepository.save(utilisateur);
        }

        // Create ProfessionnelSante / RepresentantLegal records depending on type.
        ProfessionnelSante professionnelSante = null;
        RepresentantLegal representantLegal = null;
        if (utilisateur != null) {
            String type = utilisateur.getType();
            if ("professionnel".equalsIgnoreCase(type) || "professionnel_sante".equalsIgnoreCase(type) ) {
                if (request.getProfessionnelSante() == null) {
                    throw new RuntimeException("ProfessionnelSante information is required for type " + type);
                }
                professionnelSante = new ProfessionnelSante();
                professionnelSante.setUtilisateurId(utilisateur.getId());
                professionnelSante.setProfession(request.getProfessionnelSante().getProfession());
                professionnelSante.setStructure(request.getProfessionnelSante().getStructure());
                professionnelSante.setVille(request.getProfessionnelSante().getVille());
                professionnelSante = professionnelSanteRepository.save(professionnelSante);
            }

            if ("representant_legal".equalsIgnoreCase(type)) {
                if (request.getRepresentantLegal() == null) {
                    throw new RuntimeException("RepresentantLegal information is required for type representant_legal");
                }
                representantLegal = new RepresentantLegal();
                representantLegal.setProfessionnelSanteId(professionnelSante != null ? professionnelSante.getId() : null);
                representantLegal.setNomEtablissement(request.getRepresentantLegal().getNomEtablissement());
                representantLegal.setNumeroDeclarationEtablissement(request.getRepresentantLegal().getNumeroDeclarationEtablissement());
                representantLegal.setNumeroDocumentEnregistrementProduit(request.getRepresentantLegal().getNumeroDocumentEnregistrementProduit());
                representantLegal.setDateReceptionNotification(request.getRepresentantLegal().getDateReceptionNotification());
                representantLegal = representantLegalRepository.save(representantLegal);
            }
        }

        Declarant declarant = new Declarant();
        declarant.setNom(request.getDeclarant().getNom());
        declarant.setPrenom(request.getDeclarant().getPrenom());
        declarant.setEmail(request.getDeclarant().getEmail());
        declarant.setTel(request.getDeclarant().getTel());
        if (utilisateur != null) {
            declarant.setUtilisateurId(utilisateur.getId());
        }
        declarant = declarantRepository.save(declarant);

        PersonneExposee personneExposee = new PersonneExposee();
        personneExposee.setType(request.getPersonneExposee().getType());
        personneExposee.setNomPrenom(request.getPersonneExposee().getNomPrenom());
        personneExposee.setAge(request.getPersonneExposee().getAge());
        personneExposee.setGrossesse(request.getPersonneExposee().getGrossesse());
        personneExposee.setMoisGrossesse(request.getPersonneExposee().getMoisGrossesse());
        personneExposee.setAllaitement(request.getPersonneExposee().getAllaitement() != null ? request.getPersonneExposee().getAllaitement() : false);
        personneExposee.setSexe(request.getPersonneExposee().getSexe());
        personneExposee.setVille(request.getPersonneExposee().getVille());
        personneExposee = personneExposeeRepository.save(personneExposee);

        if (request.getPersonneExposee().getAllergies() != null) {
            for (String allergie : request.getPersonneExposee().getAllergies()) {
                AllergiesConnues allergiesConnues = new AllergiesConnues();
                allergiesConnues.setPersonneExposeeId(personneExposee.getId());
                allergiesConnues.setLabel(allergie);
                allergiesConnuesRepository.save(allergiesConnues);
            }
        }

        if (request.getPersonneExposee().getAntecedents() != null) {
            for (String antecedent : request.getPersonneExposee().getAntecedents()) {
                AntecedentsMedical antecedentsMedical = new AntecedentsMedical();
                antecedentsMedical.setPersonneExposeeId(personneExposee.getId());
                antecedentsMedical.setLabel(antecedent);
                antecedentsMedicalRepository.save(antecedentsMedical);
            }
        }

        if (request.getPersonneExposee().getMedicaments() != null) {
            for (String medicament : request.getPersonneExposee().getMedicaments()) {
                MedicamentProduitSimultanement medicamentProduit = new MedicamentProduitSimultanement();
                medicamentProduit.setPersonneExposeeId(personneExposee.getId());
                medicamentProduit.setLabel(medicament);
                medicamentRepository.save(medicamentProduit);
            }
        }

        Declaration declaration = new Declaration();
        declaration.setDeclarantId(declarant.getId());
        declaration.setPersonneExposeeId(personneExposee.getId());
        // For public (unauthenticated) submissions, user may be null
        declaration.setUserId(user != null ? user.getId() : null);
        declaration.setCommentaire(request.getCommentaire());
        declaration.setStatut(DeclarationStatus.nouveau);
        declaration = declarationRepository.save(declaration);

        if (request.getEffetsIndesirables() != null) {
            for (EffetIndesirableDto effetDto : request.getEffetsIndesirables()) {
                EffetIndesirable effet = new EffetIndesirable();
                effet.setDeclarationId(declaration.getId());
                effet.setLocalisation(effetDto.getLocalisation());
                effet.setDateApparition(effetDto.getDateApparition());
                effet.setDateFin(effetDto.getDateFin());
                effet.setGravite(effetDto.getGravite());
                effet.setCriteresGravite(effetDto.getCriteresGravite());
                effet.setEvolutionEffet(effetDto.getEvolutionEffet());
                effetIndesirableRepository.save(effet);
            }
        }

        if (request.getProduitsSuspectes() != null) {
            for (ProduitSuspecteDto produitDto : request.getProduitsSuspectes()) {
                ProduitSuspecte produit = new ProduitSuspecte();
                produit.setDeclarationId(declaration.getId());
                produit.setNomCommercial(produitDto.getNomCommercial());
                produit.setMarque(produitDto.getMarque());
                produit.setFabricant(produitDto.getFabricant());
                produit.setTypeProduit(produitDto.getTypeProduit());
                produit.setNumeroLot(produitDto.getNumeroLot());
                produit.setFrequenceUtilisation(produitDto.getFrequenceUtilisation());
                produit.setDateDebutUtilisation(produitDto.getDateDebutUtilisation());
                produit.setArretUtilisation(produitDto.getArretUtilisation());
                produit.setReexpositionProduit(produitDto.getReexpositionProduit());
                produit.setReapparitionEffetIndesirable(produitDto.getReapparitionEffetIndesirable());
                produitSuspecteRepository.save(produit);
            }
        }

        if (request.getPrisesChargeMedicales() != null) {
            for (PriseChargeMedicaleDto priseDto : request.getPrisesChargeMedicales()) {
                PriseChargeMedicale prise = new PriseChargeMedicale();
                prise.setDeclarationId(declaration.getId());
                prise.setDiagnostic(priseDto.getDiagnostic());
                prise.setMesuresPrise(priseDto.getMesuresPrise());
                prise.setExamensRealise(priseDto.getExamensRealise());
                priseChargeMedicaleRepository.save(prise);
            }
        }

        return getDeclarationById(declaration.getId());
    }

    @Transactional
    public DeclarationResponse updateDeclarationStatus(String id, DeclarationStatus statut) {
        Declaration declaration = declarationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Declaration not found"));
        declaration.setStatut(statut);
        declaration = declarationRepository.save(declaration);
        return mapToResponse(declaration);
    }

    @Transactional(readOnly = true)
    public DeclarationResponse getDeclarationById(String id) {
        Declaration declaration = declarationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Declaration not found"));

        return mapToResponse(declaration);
    }

    @Transactional(readOnly = true)
    public List<DeclarationResponse> getUserDeclarations(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<Declaration> declarations = declarationRepository.findByUserId(user.getId());
        return declarations.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<DeclarationResponse> getAllDeclarations() {
        List<Declaration> declarations = declarationRepository.findAll();
        return declarations.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private DeclarationResponse mapToResponse(Declaration declaration) {
        Declarant declarant = declarantRepository.findById(declaration.getDeclarantId())
                .orElseThrow(() -> new RuntimeException("Declarant not found"));

        PersonneExposee personneExposee = personneExposeeRepository.findById(declaration.getPersonneExposeeId())
                .orElseThrow(() -> new RuntimeException("Personne exposee not found"));

        DeclarantDto declarantDto = new DeclarantDto();
        declarantDto.setId(declarant.getId());
        declarantDto.setNom(declarant.getNom());
        declarantDto.setPrenom(declarant.getPrenom());
        declarantDto.setEmail(declarant.getEmail());
        declarantDto.setTel(declarant.getTel());

        PersonneExposeeDto personneExposeeDto = new PersonneExposeeDto();
        personneExposeeDto.setId(personneExposee.getId());
        personneExposeeDto.setType(personneExposee.getType());
        personneExposeeDto.setNomPrenom(personneExposee.getNomPrenom());
        personneExposeeDto.setAge(personneExposee.getAge());
        personneExposeeDto.setGrossesse(personneExposee.getGrossesse());
        personneExposeeDto.setMoisGrossesse(personneExposee.getMoisGrossesse());
        personneExposeeDto.setAllaitement(personneExposee.getAllaitement());
        personneExposeeDto.setSexe(personneExposee.getSexe());
        personneExposeeDto.setVille(personneExposee.getVille());

        List<AllergiesConnues> allergies = allergiesConnuesRepository.findByPersonneExposeeId(personneExposee.getId());
        personneExposeeDto.setAllergies(allergies.stream().map(AllergiesConnues::getLabel).collect(Collectors.toList()));

        List<AntecedentsMedical> antecedents = antecedentsMedicalRepository.findByPersonneExposeeId(personneExposee.getId());
        personneExposeeDto.setAntecedents(antecedents.stream().map(AntecedentsMedical::getLabel).collect(Collectors.toList()));

        List<MedicamentProduitSimultanement> medicaments = medicamentRepository.findByPersonneExposeeId(personneExposee.getId());
        personneExposeeDto.setMedicaments(medicaments.stream().map(MedicamentProduitSimultanement::getLabel).collect(Collectors.toList()));

        List<EffetIndesirable> effets = effetIndesirableRepository.findByDeclarationId(declaration.getId());
        List<EffetIndesirableDto> effetsDto = effets.stream().map(effet -> {
            EffetIndesirableDto dto = new EffetIndesirableDto();
            dto.setId(effet.getId());
            dto.setLocalisation(effet.getLocalisation());
            dto.setDateApparition(effet.getDateApparition());
            dto.setDateFin(effet.getDateFin());
            dto.setGravite(effet.getGravite());
            dto.setCriteresGravite(effet.getCriteresGravite());
            dto.setEvolutionEffet(effet.getEvolutionEffet());
            return dto;
        }).collect(Collectors.toList());

        List<ProduitSuspecte> produits = produitSuspecteRepository.findByDeclarationId(declaration.getId());
        List<ProduitSuspecteDto> produitsDto = produits.stream().map(produit -> {
            ProduitSuspecteDto dto = new ProduitSuspecteDto();
            dto.setId(produit.getId());
            dto.setNomCommercial(produit.getNomCommercial());
            dto.setMarque(produit.getMarque());
            dto.setFabricant(produit.getFabricant());
            dto.setTypeProduit(produit.getTypeProduit());
            dto.setNumeroLot(produit.getNumeroLot());
            dto.setFrequenceUtilisation(produit.getFrequenceUtilisation());
            dto.setDateDebutUtilisation(produit.getDateDebutUtilisation());
            dto.setArretUtilisation(produit.getArretUtilisation());
            dto.setReexpositionProduit(produit.getReexpositionProduit());
            dto.setReapparitionEffetIndesirable(produit.getReapparitionEffetIndesirable());
            return dto;
        }).collect(Collectors.toList());

        List<PriseChargeMedicale> prises = priseChargeMedicaleRepository.findByDeclarationId(declaration.getId());
        List<PriseChargeMedicaleDto> prisesDto = prises.stream().map(prise -> {
            PriseChargeMedicaleDto dto = new PriseChargeMedicaleDto();
            dto.setId(prise.getId());
            dto.setDiagnostic(prise.getDiagnostic());
            dto.setMesuresPrise(prise.getMesuresPrise());
            dto.setExamensRealise(prise.getExamensRealise());
            return dto;
        }).collect(Collectors.toList());

        String utilisateurType = null;
        if (declarant.getUtilisateurId() != null) {
            utilisateurType = utilisateurRepository.findById(declarant.getUtilisateurId())
                    .map(Utilisateur::getType)
                    .orElse(null);
        }

        ProfessionnelSanteDto professionnelSanteDto = null;
        RepresentantLegalDto representantLegalDto = null;
        if (declarant.getUtilisateurId() != null) {
            ProfessionnelSante professionnelSante = professionnelSanteRepository.findByUtilisateurId(declarant.getUtilisateurId())
                    .orElse(null);
            if (professionnelSante != null) {
                professionnelSanteDto = new ProfessionnelSanteDto();
                professionnelSanteDto.setId(professionnelSante.getId());
                professionnelSanteDto.setProfession(professionnelSante.getProfession());
                professionnelSanteDto.setStructure(professionnelSante.getStructure());
                professionnelSanteDto.setVille(professionnelSante.getVille());

                RepresentantLegal representantLegal = representantLegalRepository.findByProfessionnelSanteId(professionnelSante.getId())
                        .orElse(null);
                if (representantLegal != null) {
                    representantLegalDto = new RepresentantLegalDto();
                    representantLegalDto.setId(representantLegal.getId());
                    representantLegalDto.setNomEtablissement(representantLegal.getNomEtablissement());
                    representantLegalDto.setNumeroDeclarationEtablissement(representantLegal.getNumeroDeclarationEtablissement());
                    representantLegalDto.setNumeroDocumentEnregistrementProduit(representantLegal.getNumeroDocumentEnregistrementProduit());
                    representantLegalDto.setDateReceptionNotification(representantLegal.getDateReceptionNotification());
                }
            }
        }

        return DeclarationResponse.builder()
                .id(declaration.getId())
                .statut(declaration.getStatut())
                .declarant(declarantDto)
                .personneExposee(personneExposeeDto)
                .utilisateurType(utilisateurType)
                .professionnelSante(professionnelSanteDto)
                .representantLegal(representantLegalDto)
                .effetsIndesirables(effetsDto)
                .produitsSuspectes(produitsDto)
                .prisesChargeMedicales(prisesDto)
                .commentaire(declaration.getCommentaire())
                .commentaireAnmps(declaration.getCommentaireAnmps())
                .userId(declaration.getUserId())
                .createdAt(declaration.getCreatedAt())
                .build();
    }

    @Transactional
    public DeclarationResponse updateCommentaireAnmps(String id, String commentaireAnmps) {
        Declaration declaration = declarationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Declaration not found"));

        Declarant declarant = declarantRepository.findById(declaration.getDeclarantId())
                .orElseThrow(() -> new RuntimeException("Declarant not found"));

        declaration.setCommentaireAnmps(commentaireAnmps);
        declaration = declarationRepository.save(declaration);

        emailService.sendCommentaireAnmpsEmail(
            declarant.getEmail(),
            declaration.getId(),
            commentaireAnmps,
            declaration.getStatut()
        );

        return mapToResponse(declaration);
    }
}
