package com.truthshield.backend;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Tests DetectionService's keyword-matching + scoring logic.
 * The ML service isn't running during tests, so these exercise the
 * keyword-only fallback path deliberately (ml.service.url points at an
 * unreachable port so the call fails fast and falls back).
 */
@SpringBootTest
@TestPropertySource(properties = {
        "ml.service.url=http://127.0.0.1:59999/detect",
        "jwt.secret=test-secret-key-for-unit-tests-only-32chars"
})
class DetectionServiceTest {

    @Autowired
    private DetectionService detectionService;

    @Test
    void scamKeywords_areDetectedAsFake() {
        DetectionResult result = detectionService.analyze("free iphone lottery winner claim now urgent");
        assertEquals("FAKE", result.getStatus());
        assertEquals("SCAM", result.getCategory());
        assertTrue(result.getScore() > 0, "Score should be > 0 for a detected scam");
    }

    @Test
    void fraudKeywords_areDetectedAsFraud() {
        DetectionResult result = detectionService.analyze("your account suspended, verify identity with otp now");
        assertEquals("FAKE", result.getStatus());
        assertEquals("FRAUD", result.getCategory());
    }

    @Test
    void officialLanguage_isDetectedAsGenuine() {
        DetectionResult result = detectionService.analyze(
                "Government of India, Press Information Bureau official statement on the new policy");
        assertEquals("REAL", result.getStatus());
    }

    @Test
    void plainNeutralText_defaultsToFake() {
        // Current behavior: no keyword matches at all defaults to FAKE
        // (see DetectionService.analyze — status defaults to FAKE when
        // neither a fake-signal nor a genuine-signal keyword is found).
        // This is a known, intentionally-conservative design choice, not a bug —
        // documented here so it doesn't silently change unnoticed.
        DetectionResult result = detectionService.analyze("the weather is nice today");
        assertEquals("FAKE", result.getStatus());
        assertEquals(0.0, result.getScore(), 0.01);
    }

    @Test
    void scoreIsNormalizedToPercentageScale_notRawMatchCount() {
        // Regression test for the score-scale bug: a single keyword match
        // used to return a raw count like "1.0" or "2.0" (displayed as an
        // implausibly low "2.0%" for a FAKE result). It should now be a
        // realistic-looking confidence score.
        DetectionResult result = detectionService.analyze("free iphone lottery winner");
        assertTrue(result.getScore() >= 50.0,
                "A keyword match should score well above a raw match count like 1-3");
    }
}
