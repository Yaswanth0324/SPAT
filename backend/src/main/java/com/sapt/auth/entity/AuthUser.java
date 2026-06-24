package com.sapt.auth.entity;

/**
 * @deprecated Replaced by {@link com.sapt.auth.entity.User} which maps to the unified `users` table.
 * This entity is kept as a stub so Hibernate does NOT try to manage auth_users.
 */
@Deprecated
@Entity
@Table(name = "_auth_users_deprecated")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthUser {
    // REMOVED — use com.sapt.auth.entity.User
}
