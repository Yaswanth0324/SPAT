package com.sapt;

import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class HashGeneratorTest {

    @Test
    void generateHash() {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        String hash = encoder.encode("spark@2403");
        System.out.println("=== BCRYPT HASH ===");
        System.out.println(hash);
        System.out.println("===================");
    }
}
