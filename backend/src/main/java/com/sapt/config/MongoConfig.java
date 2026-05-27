package com.sapt.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.data.mongodb.config.AbstractMongoClientConfiguration;
import org.springframework.beans.factory.annotation.Value;

/**
 * ============================================================
 * MongoConfig - MongoDB Configuration
 * ============================================================
 * Configures the MongoDB connection using environment variables.
 * MongoDB is used in SAPT for:
 *  - Activity submission logs / audit trail
 *  - Notification history
 *  - System event logs
 *
 * Connection is configured via application.properties:
 *   spring.data.mongodb.uri=${MONGO_URI}
 *   spring.data.mongodb.database=${MONGO_DATABASE}
 *
 * No extra configuration is needed for basic usage.
 * This class is a placeholder for custom MongoDB config if needed.
 *
 * TODO (Backend Team):
 *  - Add custom converters if using custom types
 *  - Configure MongoDB transactions if needed
 *  - Add indexes via @Document and @Indexed on MongoDB entities
 * ============================================================
 */
@Configuration
public class MongoConfig {

    // Spring Boot auto-configures MongoDB via application.properties.
    // This class is a placeholder for any custom configuration.

    // TODO: Add custom MongoTemplate or converters here if needed.
    // Example:
    //
    // @Bean
    // public MongoTemplate mongoTemplate(MongoDatabaseFactory factory) {
    //     return new MongoTemplate(factory);
    // }
}
