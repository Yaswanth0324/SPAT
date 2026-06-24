package com.sapt.config;

import com.mongodb.ConnectionString;
import com.mongodb.MongoClientSettings;
import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoClients;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.mongodb.config.AbstractMongoClientConfiguration;

import java.util.concurrent.TimeUnit;

/**
 * ============================================================
 * MongoConfig - MongoDB Configuration
 * ============================================================
 * Configures the MongoDB connection with:
 *  - 5s serverSelectionTimeout (fail fast instead of looping)
 *  - 5s connectTimeout
 *  - Retryable writes enabled
 *
 * MongoDB is used in SAPT for:
 *  - Activity submission logs / audit trail
 *  - Notification history
 *  - System event logs
 * ============================================================
 */
@Configuration
public class MongoConfig extends AbstractMongoClientConfiguration {

    @Value("${spring.data.mongodb.uri}")
    private String mongoUri;

    @Value("${spring.data.mongodb.database}")
    private String mongoDatabase;

    @Override
    protected String getDatabaseName() {
        return mongoDatabase;
    }

    @Override
    @Bean
    public MongoClient mongoClient() {
        MongoClientSettings settings = MongoClientSettings.builder()
                .applyConnectionString(new ConnectionString(mongoUri))
                // Fail fast: 5 seconds to find an available server
                .applyToClusterSettings(cluster ->
                        cluster.serverSelectionTimeout(5000, TimeUnit.MILLISECONDS))
                // 5 second connect timeout per socket
                .applyToSocketSettings(socket ->
                        socket.connectTimeout(5000, TimeUnit.MILLISECONDS)
                              .readTimeout(10000, TimeUnit.MILLISECONDS))
                .retryWrites(true)
                .build();
        return MongoClients.create(settings);
    }
}
