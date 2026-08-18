package com.truthshield.backend;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ScanHistoryRepository
        extends MongoRepository<ScanHistory, String> {

    // Per-user history — previously GET /api/history returned every user's
    // scans with no filtering at all.
    List<ScanHistory> findByUserEmailOrderByScannedAtDesc(String userEmail);
}