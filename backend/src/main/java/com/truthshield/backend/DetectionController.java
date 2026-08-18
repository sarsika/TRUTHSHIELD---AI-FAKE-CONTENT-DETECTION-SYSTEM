package com.truthshield.backend;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class DetectionController {

    @Autowired
    private DetectionService service;

    @Autowired
    private ScanHistoryRepository historyRepo;

    @Autowired
    private EmailService emailService;

    @PostMapping("/detect")
    public DetectionResult detect(@RequestBody Map<String, String> body, HttpServletRequest request) {
        String url = body.get("url");
        String text = body.get("text");
        String userEmail = body.get("userEmail");

        // Trust the JWT-verified email over whatever the client claims in the body.
        Object authEmail = request.getAttribute("authEmail");
        if (authEmail != null) {
            userEmail = authEmail.toString();
        }

        // Input validation — previously an empty/missing url AND text silently
        // fell through to service.analyze(null/""), which was undefined behavior.
        if ((url == null || url.isBlank()) && (text == null || text.isBlank())) {
            return new DetectionResult("ERROR", "NONE", 0,
                    "Please provide either a url or text to analyze.");
        }

        String input;
        if (url != null && !url.isBlank()) {
            input = service.fetchUrl(url);
            if (input.equals("ERROR_FETCHING")) {
                return new DetectionResult("ERROR", "NONE", 0,
                        "Could not fetch the given URL. Check that it's a valid, reachable link.");
            }
        } else {
            input = text;
            url = "text-input";
        }

        DetectionResult result = service.analyze(input);
        result.setUrl(url);

        historyRepo.save(new ScanHistory(
                url, result.getStatus(),
                result.getCategory(), result.getScore(), userEmail));

        if ("FAKE".equals(result.getStatus())) {
            try {
                if (userEmail != null && !userEmail.isEmpty()) {
                    emailService.sendFakeAlert(userEmail, input);
                }
            } catch (Exception e) {
                System.out.println("Email error: " + e.getMessage());
            }
        }

        return result;
    }

    @GetMapping("/history")
    public List<ScanHistory> getHistory(HttpServletRequest request) {
        // Per-user history — the JwtAuthFilter guarantees this endpoint only
        // reaches here with a valid token, so authEmail is always present.
        String authEmail = (String) request.getAttribute("authEmail");
        return historyRepo.findByUserEmailOrderByScannedAtDesc(authEmail);
    }
}
