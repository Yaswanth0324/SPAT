package com.sapt.util;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class HashGenerator {
    public static void main(String[] args) {
        String pwd = args.length > 0 ? args[0] : "spark@2403";
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        System.out.println("HASH:" + encoder.encode(pwd));
    }
}
