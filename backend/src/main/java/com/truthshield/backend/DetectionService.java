package com.truthshield.backend;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.ResponseEntity;
import java.io.*;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class DetectionService {

    // Previously hardcoded to http://127.0.0.1:5000/detect — now configurable
    // via ml.service.url (env var ML_SERVICE_URL in production).
    @Value("${ml.service.url:http://127.0.0.1:5000/detect}")
    private String mlServiceUrl;

    public String fetchUrl(String url) {
        try {
            RestTemplate restTemplate = new RestTemplate();
            return restTemplate.getForObject(url, String.class);
        } catch (Exception e) {
            return "ERROR_FETCHING";
        }
    }

    public DetectionResult analyze(String input) {
        List<String> fake = readLines("fake.txt");
        List<String> scam = readLines("scam.txt");
        List<String> fraud = readLines("fraud.txt");
        List<String> rumor = readLines("rumor.txt");
        List<String> real = readLines("real.txt");
        List<String> official = readLines("official.txt"); // previously loaded but never used

        int fakeMatches = countMatches(input, fake);
        int scamMatches = countMatches(input, scam);
        int fraudMatches = countMatches(input, fraud);
        int rumorMatches = countMatches(input, rumor);
        int realMatches = countMatches(input, real);
        int officialMatches = countMatches(input, official);

        int maxFakeMatches = Math.max(fakeMatches, Math.max(scamMatches,
                Math.max(fraudMatches, rumorMatches)));
        // Official-source language (government/PIB phrasing) counts as a genuine signal too.
        int genuineMatches = realMatches + officialMatches;

        String status = maxFakeMatches > 0 ? "FAKE" : (genuineMatches > 0 ? "REAL" : "FAKE");

        String category = "FAKE";
        if (scamMatches >= fraudMatches && scamMatches >= rumorMatches && scamMatches >= fakeMatches)
            category = "SCAM";
        else if (fraudMatches >= rumorMatches && fraudMatches >= fakeMatches)
            category = "FRAUD";
        else if (rumorMatches >= fakeMatches)
            category = "RUMOR";
        else if (fakeMatches > 0)
            category = "FAKE";
        if (genuineMatches > maxFakeMatches)
            category = officialMatches > 0 ? "OFFICIAL" : "GENUINE";

        // FIX — previously "score" was the raw keyword match COUNT (e.g. 2, 3),
        // returned directly to the frontend which displays it as a percentage
        // ("2.0%"). That made keyword-only fallback results (when the ML
        // service is unreachable) look confusingly low even for a confirmed
        // FAKE result. Now normalized to the same 0-99 scale the ML-combined
        // path uses.
        int matchesForScore = Math.max(maxFakeMatches, genuineMatches);
        double score = normalizeScore(matchesForScore);

        try {
            RestTemplate restTemplate = new RestTemplate();
            Map<String, String> request = new HashMap<>();
            request.put("text", input);

            ResponseEntity<Map> response = restTemplate.postForEntity(
                    mlServiceUrl, request, Map.class);
            Map mlResult = response.getBody();

            if (mlResult != null) {
                boolean mlIsFake = (boolean) mlResult.get("isFake");
                String mlCategory = (String) mlResult.get("category");
                double mlConfidence = ((Number) mlResult.get("confidence"))
                        .doubleValue();

                if (mlIsFake && maxFakeMatches > 0) {
                    score = Math.min((score + mlConfidence) / 2 + 10, 99.0);
                    category = mlCategory;
                    status = "FAKE";
                } else if (!mlIsFake && genuineMatches > 0) {
                    score = Math.min((score + mlConfidence) / 2, 99.0);
                    category = "GENUINE";
                    status = "REAL";
                }
            }
        } catch (Exception e) {
            // Graceful degradation — keyword-only result above is still returned.
            System.out.println("ML Server not available, using keyword-only detection: " + e.getMessage());
        }

        return new DetectionResult(status, category, score);
    }

    /**
     * Converts a raw keyword-match count into a 0-99 style confidence score
     * so keyword-only fallback results are on the same scale as ML-combined
     * results, instead of showing tiny raw counts like "2.0%".
     */
    private double normalizeScore(int matches) {
        if (matches <= 0) return 0;
        double score = 40 + (matches * 15); // 1 match ≈ 55%, scales up from there
        return Math.min(score, 95.0);
    }

    private List<String> readLines(String filename) {
        try {
            InputStream is = getClass().getClassLoader()
                    .getResourceAsStream("data/" + filename);
            if (is == null)
                return new ArrayList<>();
            BufferedReader reader = new BufferedReader(
                    new InputStreamReader(is));
            return reader.lines().collect(Collectors.toList());
        } catch (Exception e) {
            return new ArrayList<>();
        }
    }

    private int countMatches(String input, List<String> lines) {
        if (lines == null || lines.isEmpty() || input == null)
            return 0;
        String lowerInput = input.toLowerCase();
        return (int) lines.stream()
                .filter(line -> line != null &&
                        lowerInput.contains(line.toLowerCase().trim()))
                .count();
    }
}
