package com.cosmetovigilance.service;

import com.cosmetovigilance.repository.DeclarationRepository;
import com.cosmetovigilance.repository.EffetIndesirableRepository;
import com.cosmetovigilance.repository.PersonneExposeeRepository;
import com.cosmetovigilance.repository.ProduitSuspecteRepository;
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

    public Map<String, Object> getStatsByAgeAndGravite() {
        List<Object[]> results = declarationRepository.findStatsByAgeAndGravite();

        Map<String, Map<String, Long>> data = new LinkedHashMap<>();
        data.put("0-2 ans", new LinkedHashMap<>());
        data.put("3-11 ans", new LinkedHashMap<>());
        data.put("12-17 ans", new LinkedHashMap<>());
        data.put("18-64 ans", new LinkedHashMap<>());
        data.put("65+ ans", new LinkedHashMap<>());

        for (Map.Entry<String, Map<String, Long>> entry : data.entrySet()) {
            entry.getValue().put("Grave", 0L);
            entry.getValue().put("Non grave", 0L);
        }

        for (Object[] result : results) {
            Integer age = (Integer) result[0];
            String ageUnite = (String) result[1];
            Boolean gravite = (Boolean) result[2];
            Long count = (Long) result[3];

            String tranche = getAgeCategory(age, ageUnite);
            String graviteLabel = (gravite != null && gravite) ? "Grave" : "Non grave";

            if (data.containsKey(tranche)) {
                data.get(tranche).put(graviteLabel, data.get(tranche).get(graviteLabel) + count);
            }
        }

        Map<String, Object> response = new HashMap<>();
        response.put("data", data);
        return response;
    }

    public Map<String, Object> getStatsBySexeAndGravite() {
        List<Object[]> results = declarationRepository.findStatsBySexeAndGravite();

        Map<String, Map<String, Long>> data = new LinkedHashMap<>();
        data.put("Masculin", Map.of("Grave", 0L, "Non grave", 0L));
        data.put("Féminin", Map.of("Grave", 0L, "Non grave", 0L));

        Map<String, Map<String, Long>> mutableData = new LinkedHashMap<>();
        for (Map.Entry<String, Map<String, Long>> entry : data.entrySet()) {
            mutableData.put(entry.getKey(), new LinkedHashMap<>(entry.getValue()));
        }

        for (Object[] result : results) {
            String sexe = (String) result[0];
            Boolean gravite = (Boolean) result[1];
            Long count = (Long) result[2];

            String sexeLabel = "M".equalsIgnoreCase(sexe) ? "Masculin" : "Féminin";
            String graviteLabel = (gravite != null && gravite) ? "Grave" : "Non grave";

            if (mutableData.containsKey(sexeLabel)) {
                mutableData.get(sexeLabel).put(graviteLabel,
                    mutableData.get(sexeLabel).get(graviteLabel) + count);
            }
        }

        Map<String, Object> response = new HashMap<>();
        response.put("data", mutableData);
        return response;
    }

    public Map<String, Object> getStatsByNotifiantAndGravite() {
        List<Object[]> results = declarationRepository.findStatsByNotifiantAndGravite();

        Map<String, Map<String, Long>> data = new LinkedHashMap<>();

        for (Object[] result : results) {
            String type = (String) result[0];
            Boolean gravite = (Boolean) result[1];
            Long count = (Long) result[2];

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
            String criteres = (String) result[0];
            Long count = (Long) result[1];

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
        List<Object[]> results = produitSuspecteRepository.findStatsByTypeProduitAndGravite();

        Map<String, Map<String, Long>> data = new LinkedHashMap<>();

        for (Object[] result : results) {
            String typeProduit = (String) result[0];
            Boolean gravite = (Boolean) result[1];
            Long count = (Long) result[2];

            String graviteLabel = (gravite != null && gravite) ? "Grave" : "Non grave";

            data.putIfAbsent(typeProduit, new LinkedHashMap<>());
            data.get(typeProduit).put(graviteLabel, count);
        }

        Map<String, Object> response = new HashMap<>();
        response.put("data", data);
        return response;
    }

    public Map<String, Object> getStatsByClassification() {
        List<Object[]> results = declarationRepository.findStatsByStatut();

        Map<String, Long> data = new LinkedHashMap<>();

        for (Object[] result : results) {
            String statut = (String) result[0];
            Long count = (Long) result[1];

            String statutLabel = getStatutLabel(statut);
            data.put(statutLabel, count);
        }

        Map<String, Object> response = new HashMap<>();
        response.put("data", data);
        return response;
    }

    public Map<String, Object> getAllStatistics() {
        Map<String, Object> allStats = new HashMap<>();
        allStats.put("ageGravite", getStatsByAgeAndGravite().get("data"));
        allStats.put("sexeGravite", getStatsBySexeAndGravite().get("data"));
        allStats.put("notifiantGravite", getStatsByNotifiantAndGravite().get("data"));
        allStats.put("criteresGravite", getStatsByCriteresGravite().get("data"));
        allStats.put("typeProduitGravite", getStatsByTypeProduitAndGravite().get("data"));
        allStats.put("classification", getStatsByClassification().get("data"));
        return allStats;
    }

    private String getAgeCategory(Integer age, String ageUnite) {
        if (age == null) return "Non spécifié";

        int ageInYears = age;
        if ("mois".equalsIgnoreCase(ageUnite)) {
            ageInYears = age / 12;
        } else if ("jours".equalsIgnoreCase(ageUnite)) {
            ageInYears = age / 365;
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
}
