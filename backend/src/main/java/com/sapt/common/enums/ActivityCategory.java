package com.sapt.common.enums;

/**
 * ============================================================
 * ActivityCategory - Categories for Student Activity Points
 * ============================================================
 * Defines the types of activities students can submit for points.
 *
 * TODO (Domain Team):
 *  - Add or remove categories based on institutional requirements
 *  - Each category may have different point weights
 * ============================================================
 */
public enum ActivityCategory {

    /** Technical events: hackathons, coding competitions, workshops */
    TECHNICAL,

    /** Cultural events: fests, drama, music, arts */
    CULTURAL,

    /** Sports events: inter-college or national level sports */
    SPORTS,

    /** Research and publications */
    RESEARCH,

    /** Social service, NSS, NCC activities */
    SOCIAL_SERVICE,

    /** Industry internships and training programs */
    INTERNSHIP,

    /** Online certifications and MOOCs */
    CERTIFICATION,

    /** Leadership roles: club president, event organizer */
    LEADERSHIP,

    /** Any activity not covered by the above categories */
    OTHER
}
