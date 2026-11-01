package com.lingora;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "engzi_users", indexes = @Index(name = "idx_engzi_user_email", columnList = "email", unique = true))
public class AppUser {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 254)
    private String email;

    // Null for Google-only accounts; local passwords are BCrypt hashes.
    @Column(length = 100)
    private String passwordHash;

    @Column(length = 80)
    private String displayName;

    @Column(nullable = false, length = 20)
    private String provider = "LOCAL";

    @Column(nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    public Long getId() { return id; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPasswordHash() { return passwordHash; }
    public void setPasswordHash(String passwordHash) { this.passwordHash = passwordHash; }
    public String getDisplayName() { return displayName; }
    public void setDisplayName(String displayName) { this.displayName = displayName; }
    public String getProvider() { return provider; }
    public void setProvider(String provider) { this.provider = provider; }
    public Instant getCreatedAt() { return createdAt; }
}
