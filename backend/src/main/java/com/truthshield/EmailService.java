package com.truthshield.backend;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    public void sendFakeAlert(String toEmail, String content) {
        SimpleMailMessage msg = new SimpleMailMessage();
        msg.setTo(toEmail);
        msg.setSubject("⚠️ TruthShield - Fake Content Detected!");
        msg.setText(
                "Hello!\n\n" +
                        "TruthShield detected FAKE content:\n\n" +
                        "Content: " + content + "\n\n" +
                        "Please do not share this content.\n\n" +
                        "- TruthShield Team 🛡️");
        mailSender.send(msg);
    }
}