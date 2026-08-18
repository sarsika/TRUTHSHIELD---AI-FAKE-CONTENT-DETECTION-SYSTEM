package com.truthshield.backend;

public class DetectionResult {
    private String url;
    private String status;
    private String category;
    private double score;
    private String message; // populated for ERROR results (e.g. validation failures)

    public DetectionResult() {
    }

    public DetectionResult(String status,
            String category,
            double score) {
        this.status = status;
        this.category = category;
        this.score = score;
    }

    public DetectionResult(String status,
            String category,
            double score,
            String message) {
        this.status = status;
        this.category = category;
        this.score = score;
        this.message = message;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getUrl() {
        return url;
    }

    public void setUrl(String url) {
        this.url = url;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String s) {
        this.status = s;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String c) {
        this.category = c;
    }

    public double getScore() {
        return score;
    }

    public void setScore(double s) {
        this.score = s;
    }
}