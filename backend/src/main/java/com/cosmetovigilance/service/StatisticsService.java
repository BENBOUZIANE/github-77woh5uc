package com.cosmetovigilance.service;

import com.cosmetovigilance.model.*;
import com.cosmetovigilance.model.DeclarationStatus;
import com.cosmetovigilance.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class StatisticsService {

    @Autowired
    private DeclarationRepository declarationRepository;

    @Autowired
    private EffetIndesirableRepository effetIndesirableRepository;

    @Autowired
    private PersonneExposeeRepository personneExposeeRepository;

    @Autowired
    private ProduitSuspecteRepository produitSuspecteRepository;

    @Autowired
    private DispositifMedicalRepository dispositifMedicalRepository;

    @Autowired
    private ComplementAlimentaireRepository complementAlimentaireRepository;

    @Autowired
    private PersonneExposeeCARepository personneExposeeCARepository;

    @Autowired
    private EffetIndesirableCARepository effetIndesirableCARepository;

    @Autowired
    private EffetIndesirableDMRepository effetIndesirableDMRepository;

    public Map<String, Object> getStatsByAgeAndGravite() {
        Map<String, Map<String, Long>> data = new LinkedHashMap<>();
        for (String t : new String[]{"0-2 ans","3-11 ans","12-17 ans","18-64 ans","65+ ans","Non spécifié"}) {
            data.put(t, new LinkedHashMap<>(Map.of("Grave", 0L, "Non grave", 0L)));
        }

        // Cosmétiques
        List<Object[]> cosmo = declarationRepository.findStatsByAgeAndGravite();
        for (Object[] r : cosmo) {
            Integer age = r[0] != null ? ((Number) r[0]).intValue() : null;
            String ageUnite = r[1] != null ? r[1].toString() : null;
            Boolean gravite = toBoolean(r[2]);
            Long count = r[3] != null ? ((Number) r[3]).longValue() : 0L;
            String dateNaissance = r[4] != null ? r[4].toString() : null;
            String tranche = getAgeCategory(age, ageUnite, dateNaissance);
            String label = gravite ? "Grave" : "Non grave";
            if (data.containsKey(tranche)) data.get(tranche).merge(label, count, Long::sum);
        }

        // Compléments alimentaires
        for (PersonneExposeeCA pe : personneExposeeCARepository.findAll()) {
            ComplementAlimentaire ca = pe.getComplementAlimentaire();
            if (ca == null || ca.getEffetIndesirable() == null) continue;
            Boolean gravite = ca.getEffetIndesirable().getGravite();
            String tranche = getAgeCategory(pe.getAge(), pe.getAgeUnite(), pe.getDateNaissance());
            String label = Boolean.TRUE.equals(gravite) ? "Grave" : "Non grave";
            if (data.containsKey(tranche)) data.get(tranche).merge(label, 1L, Long::sum);
        }

        // Dispositifs médicaux
        for (DispositifMedical dm : dispositifMedicalRepository.findAll()) {
            if (dm.getPersonneExposee() == null) continue;
            PersonneExposeeDM pe = dm.getPersonneExposee();
            List<EffetIndesirableDM> effets = effetIndesirableDMRepository.findByDispositifMedicalId(dm.getId());
            boolean grave = effets.stream().anyMatch(e -> e.getGravite() != null && !e.getGravite().isBlank() && !"non".equalsIgnoreCase(e.getGravite()));
            String dateNaissanceDM = pe.getDateNaissance() != null ? pe.getDateNaissance().toString() : null;
            String tranche = getAgeCategory(pe.getAge(), pe.getAgeUnite(), dateNaissanceDM);
            String label = grave ? "Grave" : "Non grave";
            if (data.containsKey(tranche)) data.get(tranche).merge(label, 1L, Long::sum);
        }

        Map<String, Object> response = new HashMap<>();
        response.put("data", data);
        return response;
    }

    public Map<String, Object> getStatsBySexeAndGravite() {
        Map<String, Map<String, Long>> data = new LinkedHashMap<>();
        data.put("Masculin", new LinkedHashMap<>(Map.of("Grave", 0L, "Non grave", 0L)));
        data.put("Féminin", new LinkedHashMap<>(Map.of("Grave", 0L, "Non grave", 0L)));

        // Cosmétiques
        List<Object[]> cosmo = declarationRepository.findStatsBySexeAndGravite();
        for (Object[] r : cosmo) {
            String sexe = r[0] != null ? r[0].toString() : "";
            Boolean gravite = toBoolean(r[1]);
            Long count = r[2] != null ? ((Number) r[2]).longValue() : 0L;
            String sexeLabel = "M".equalsIgnoreCase(sexe) ? "Masculin" : "Féminin";
            String label = gravite ? "Grave" : "Non grave";
            data.get(sexeLabel).merge(label, count, Long::sum);
        }

        // Compléments alimentaires
        for (PersonneExposeeCA pe : personneExposeeCARepository.findAll()) {
            ComplementAlimentaire ca = pe.getComplementAlimentaire();
            if (ca == null || ca.getEffetIndesirable() == null) continue;
            Boolean gravite = ca.getEffetIndesirable().getGravite();
            String sexeLabel = "M".equalsIgnoreCase(pe.getSexe()) ? "Masculin" : "Féminin";
            String label = Boolean.TRUE.equals(gravite) ? "Grave" : "Non grave";
            data.get(sexeLabel).merge(label, 1L, Long::sum);
        }

        // Dispositifs médicaux
        for (DispositifMedical dm : dispositifMedicalRepository.findAll()) {
            if (dm.getPersonneExposee() == null) continue;
            PersonneExposeeDM pe = dm.getPersonneExposee();
            List<EffetIndesirableDM> effets = effetIndesirableDMRepository.findByDispositifMedicalId(dm.getId());
            boolean grave = effets.stream().anyMatch(e -> e.getGravite() != null && !e.getGravite().isBlank() && !"non".equalsIgnoreCase(e.getGravite()));
            String sexeLabel = "M".equalsIgnoreCase(pe.getSexe()) ? "Masculin" : "Féminin";
            String label = grave ? "Grave" : "Non grave";
            data.get(sexeLabel).merge(label, 1L, Long::sum);
        }

        Map<String, Object> response = new HashMap<>();
        response.put("data", data);
        return response;
    }

    public Map<String, Object> getStatsByNotifiantAndGravite() {
        List<Object[]> results = declarationRepository.findStatsByNotifiantAndGravite();

        Map<String, Map<String, Long>> data = new LinkedHashMap<>();

        for (Object[] result : results) {
            String type = result[0] != null ? result[0].toString() : "";
            Boolean gravite = toBoolean(result[1]);
            Long count = result[2] != null ? ((Number) result[2]).longValue() : 0L;

            String typeLabel = getNotifiantLabel(type);
            String graviteLabel = (gravite != null && gravite) ? "Grave" : "Non grave";

            data.putIfAbsent(typeLabel, new LinkedHashMap<>());
            data.get(typeLabel).put(graviteLabel, count);
        }

        Map<String, Object> response = new HashMap<>();
        response.put("data", data);
        return response;
    }

    public Map<String, Object> getStatsByCriteresGravite() {
        List<Object[]> results = effetIndesirableRepository.findStatsByCriteresGravite();

        Map<String, Long> data = new LinkedHashMap<>();
        data.put("Décès", 0L);
        data.put("Mise en jeu du pronostic vital", 0L);
        data.put("Invalidité ou incapacité", 0L);
        data.put("Hospitalisation", 0L);
        data.put("Anomalie congénitale", 0L);
        data.put("Autre situation grave", 0L);

        for (Object[] result : results) {
            String criteres = result[0] != null ? result[0].toString() : null;
            Long count = result[1] != null ? ((Number) result[1]).longValue() : 0L;

            if (criteres != null && !criteres.trim().isEmpty()) {
                String[] criteresArray = criteres.split(",");
                for (String critere : criteresArray) {
                    String trimmedCritere = critere.trim();
                    if (data.containsKey(trimmedCritere)) {
                        data.put(trimmedCritere, data.get(trimmedCritere) + count);
                    }
                }
            }
        }

        Map<String, Object> response = new HashMap<>();
        response.put("data", data);
        return response;
    }

    public Map<String, Object> getStatsByTypeProduitAndGravite() {
        Map<String, Map<String, Long>> data = new LinkedHashMap<>();

        // Cosmétiques — type produit depuis produit_suspecte
        List<Object[]> cosmo = produitSuspecteRepository.findStatsByTypeProduitAndGravite();
        for (Object[] r : cosmo) {
            String typeProduit = r[0] != null ? r[0].toString() : "Non spécifié";
            Boolean gravite = toBoolean(r[1]);
            Long count = r[2] != null ? ((Number) r[2]).longValue() : 0L;
            String label = gravite ? "Grave" : "Non grave";
            data.putIfAbsent(typeProduit, new LinkedHashMap<>(Map.of("Grave", 0L, "Non grave", 0L)));
            data.get(typeProduit).merge(label, count, Long::sum);
        }

        // Compléments alimentaires
        String caType = "Complément alimentaire";
        data.putIfAbsent(caType, new LinkedHashMap<>(Map.of("Grave", 0L, "Non grave", 0L)));
        for (ComplementAlimentaire ca : complementAlimentaireRepository.findAll()) {
            if (ca.getEffetIndesirable() == null) continue;
            Boolean gravite = ca.getEffetIndesirable().getGravite();
            String label = Boolean.TRUE.equals(gravite) ? "Grave" : "Non grave";
            data.get(caType).merge(label, 1L, Long::sum);
        }

        // Dispositifs médicaux
        String dmType = "Dispositif médical";
        data.putIfAbsent(dmType, new LinkedHashMap<>(Map.of("Grave", 0L, "Non grave", 0L)));
        for (DispositifMedical dm : dispositifMedicalRepository.findAll()) {
            List<EffetIndesirableDM> effets = effetIndesirableDMRepository.findByDispositifMedicalId(dm.getId());
            boolean grave = effets.stream().anyMatch(e -> e.getGravite() != null && !e.getGravite().isBlank() && !"non".equalsIgnoreCase(e.getGravite()));
            String label = grave ? "Grave" : "Non grave";
            data.get(dmType).merge(label, 1L, Long::sum);
        }

        Map<String, Object> response = new HashMap<>();
        response.put("data", data);
        return response;
    }

    public Map<String, Object> getStatsByClassification() {
        List<Object[]> results = declarationRepository.findStatsByStatut();

        Map<String, Long> data = new LinkedHashMap<>();

        for (Object[] result : results) {
            String statut = result[0] != null ? result[0].toString() : "inconnu";
            Long count = result[1] != null ? ((Number) result[1]).longValue() : 0L;

            String statutLabel = getStatutLabel(statut);
            data.put(statutLabel, count);
        }

        Map<String, Object> response = new HashMap<>();
        response.put("data", data);
        return response;
    }

    public Map<String, Object> getAllStatistics() {
        Map<String, Object> allStats = new HashMap<>();
        try { allStats.put("ageGravite", getStatsByAgeAndGravite().get("data")); } catch (Exception e) { allStats.put("ageGravite", new HashMap<>()); System.err.println("ageGravite error: " + e.getMessage()); }
        try { allStats.put("sexeGravite", getStatsBySexeAndGravite().get("data")); } catch (Exception e) { allStats.put("sexeGravite", new HashMap<>()); System.err.println("sexeGravite error: " + e.getMessage()); }
        try { allStats.put("notifiantGravite", getStatsByNotifiantAndGravite().get("data")); } catch (Exception e) { allStats.put("notifiantGravite", new HashMap<>()); System.err.println("notifiantGravite error: " + e.getMessage()); }
        try { allStats.put("criteresGravite", getStatsByCriteresGravite().get("data")); } catch (Exception e) { allStats.put("criteresGravite", new HashMap<>()); System.err.println("criteresGravite error: " + e.getMessage()); }
        try { allStats.put("typeProduitGravite", getStatsByTypeProduitAndGravite().get("data")); } catch (Exception e) { allStats.put("typeProduitGravite", new HashMap<>()); System.err.println("typeProduitGravite error: " + e.getMessage()); }
        try { allStats.put("classification", getStatsByClassification().get("data")); } catch (Exception e) { allStats.put("classification", new HashMap<>()); System.err.println("classification error: " + e.getMessage()); }
        return allStats;
    }

    public Map<String, Object> getGlobalStatistics() {
        Map<String, Object> globalStats = new HashMap<>();

        long cosmetiquesCount = declarationRepository.count();
        long complementsCount = complementAlimentaireRepository.count();
        long dispositifsCount = dispositifMedicalRepository.count();
        long totalCount = cosmetiquesCount + complementsCount + dispositifsCount;

        Map<String, Long> countByModule = new LinkedHashMap<>();
        countByModule.put("Cosmétiques", cosmetiquesCount);
        countByModule.put("Compléments alimentaires", complementsCount);
        countByModule.put("Dispositifs médicaux", dispositifsCount);
        countByModule.put("Total", totalCount);

        Map<String, Long> cosmetiquesStatuts = new LinkedHashMap<>();
        List<Object[]> cosmetiquesStatutResults = declarationRepository.findStatsByStatut();
        for (Object[] result : cosmetiquesStatutResults) {
            String statut = result[0] != null ? result[0].toString() : "inconnu";
            Long count = result[1] != null ? ((Number) result[1]).longValue() : 0L;
            cosmetiquesStatuts.put(getStatutLabel(statut), count);
        }

        long complementsNouveaux = complementAlimentaireRepository.countByStatut(DeclarationStatus.nouveau);
        long complementsEnCours = complementAlimentaireRepository.countByStatut(DeclarationStatus.en_cours);
        long complementsTraites = complementAlimentaireRepository.countByStatut(DeclarationStatus.traite);

        Map<String, Long> complementsStatuts = new LinkedHashMap<>();
        complementsStatuts.put("Nouveau", complementsNouveaux);
        complementsStatuts.put("En cours", complementsEnCours);
        complementsStatuts.put("Traité", complementsTraites);

        long dispositifsNouveaux = dispositifMedicalRepository.findByStatut("EN_ATTENTE").size();
        long dispositifsEnCours = dispositifMedicalRepository.findByStatut("EN_COURS").size();
        long dispositifsTraites = dispositifMedicalRepository.findByStatut("TRAITEE").size();

        Map<String, Long> dispositifsStatuts = new LinkedHashMap<>();
        dispositifsStatuts.put("Nouveau", dispositifsNouveaux);
        dispositifsStatuts.put("En cours", dispositifsEnCours);
        dispositifsStatuts.put("Traité", dispositifsTraites);

        globalStats.put("countByModule", countByModule);
        globalStats.put("cosmetiquesStatuts", cosmetiquesStatuts);
        globalStats.put("complementsStatuts", complementsStatuts);
        globalStats.put("dispositifsStatuts", dispositifsStatuts);

        return globalStats;
    }

    private String getAgeCategory(Integer age, String ageUnite) {
        return getAgeCategory(age, ageUnite, null);
    }

    private String getAgeCategory(Integer age, String ageUnite, String dateNaissance) {
        int ageInYears;

        if (age != null) {
            ageInYears = age;
            if (ageUnite != null && "mois".equalsIgnoreCase(ageUnite)) {
                ageInYears = age / 12;
            } else if (ageUnite != null && ("jour".equalsIgnoreCase(ageUnite) || "jours".equalsIgnoreCase(ageUnite))) {
                ageInYears = age / 365;
            } else if (ageUnite != null && ("heure".equalsIgnoreCase(ageUnite) || "heures".equalsIgnoreCase(ageUnite))) {
                ageInYears = 0;
            }
        } else if (dateNaissance != null && !dateNaissance.isBlank()) {
            try {
                java.time.LocalDate dob;
                // Supporte formats: YYYY-MM-DD ou DD/MM/YYYY
                if (dateNaissance.contains("-")) {
                    String[] parts = dateNaissance.split("-");
                    if (parts[0].length() == 4) {
                        dob = java.time.LocalDate.parse(dateNaissance);
                    } else {
                        dob = java.time.LocalDate.of(Integer.parseInt(parts[2]), Integer.parseInt(parts[1]), Integer.parseInt(parts[0]));
                    }
                } else {
                    dob = java.time.LocalDate.parse(dateNaissance);
                }
                ageInYears = java.time.Period.between(dob, java.time.LocalDate.now()).getYears();
            } catch (Exception e) {
                return "Non spécifié";
            }
        } else {
            return "Non spécifié";
        }

        if (ageInYears <= 2) return "0-2 ans";
        if (ageInYears <= 11) return "3-11 ans";
        if (ageInYears <= 17) return "12-17 ans";
        if (ageInYears <= 64) return "18-64 ans";
        return "65+ ans";
    }

    private String getNotifiantLabel(String type) {
        if (type == null) return "Non spécifié";

        switch (type.toLowerCase()) {
            case "professionnel_sante":
                return "Professionnel de santé";
            case "patient":
                return "Patient";
            case "representant_legal":
                return "Représentant légal";
            default:
                return type;
        }
    }

    private String getStatutLabel(String statut) {
        if (statut == null) return "Non spécifié";

        switch (statut.toLowerCase()) {
            case "nouveau":
                return "Nouveau";
            case "en_cours":
                return "En cours";
            case "traite":
                return "Traité";
            case "cloture":
                return "Clôturé";
            case "rejete":
                return "Rejeté";
            default:
                return statut;
        }
    }

    private boolean toBoolean(Object val) {
        if (val == null) return false;
        if (val instanceof Boolean) return (Boolean) val;
        if (val instanceof Number) return ((Number) val).intValue() == 1;
        return false;
    }
}
