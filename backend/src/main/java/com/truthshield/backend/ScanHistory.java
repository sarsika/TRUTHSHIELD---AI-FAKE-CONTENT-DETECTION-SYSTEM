package com.truthshield.backend;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

@Document(collection = "scan_history")
public class ScanHistory {
    @Id
    private String id;
    private String url;
    private String status;
    private String category;
    private double score;
    private LocalDateTime scannedAt;
    private String userEmail; // owner of this scan — enables per-user history filtering

    public ScanHistory(String url, String status, String category, double score, String userEmail) {
        this.url = url;
        this.status = status;
        this.category = category;
        this.score = score;
        this.scannedAt = LocalDateTime.now();
        this.userEmail = userEmail;
    }

    public String getUserEmail() {
        return userEmail;
    }

    public String getId() {
        return id;
    }

    public String getUrl() {
        return url;
    }

    public String getStatus() {
        return status;
    }

    public String getCategory() {
        return category;
    }

    public double getScore() {
        return score;
    }

    public LocalDateTime getScannedAt() {
        return scannedAt;
    }
}