package com.trustly.auth.service;

import com.trustly.common.exception.EmailSendingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.ClassPathResource;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;

@Service
@RequiredArgsConstructor
public class EmailService {
    private final JavaMailSender mailSender;
    private String loadTemplate(String fileName){
        try {
            ClassPathResource resource = new ClassPathResource("templates/" + fileName);
            return new String(resource.getInputStream().readAllBytes(), StandardCharsets.UTF_8);
        } catch (Exception e) {
            throw new EmailSendingException("Failed to send email");
        }
    }
    public void sendOtpEmail(String email, String otp) {
        try{
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");
            helper.setTo(email);
            helper.setSubject("Your OTP Code");
            String htmlContent = loadTemplate("otp-email.html");
            htmlContent = htmlContent.replace("{{OTP}}", otp);
            helper.setText(htmlContent, true); // true = HTML
            mailSender.send(mimeMessage);
        }catch (Exception e){
            throw new EmailSendingException("Failed to send email");
        }
    }
    public void sendWelcomeEmail(String email,String name){
        try{
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");
            helper.setTo(email);
            helper.setSubject("Welcome to Task Manager");
            String html = loadTemplate("welcome-email.html");
            html = html.replace("{{NAME}}", name);
            helper.setText(html, true);
            mailSender.send(mimeMessage);
        }catch (Exception e){
            throw new EmailSendingException("Failed to send email");
        }
    }
}
