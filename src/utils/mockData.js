// =====================================================================
// SPARK Mock Data - Pre-populated dummy data for demonstration
// =====================================================================

export const COLLEGES = [
  'MIT College of Engineering',
  'Anna University',
  'VIT University',
  'SRM Institute of Science and Technology',
  'PSG College of Technology',
  'Coimbatore Institute of Technology',
  'Sri Venkateswara College of Engineering',
  'Kongu Engineering College',
];

export const DEPARTMENTS = [
  'Computer Science and Engineering',
  'Information Technology',
  'Electronics and Communication Engineering',
  'Mechanical Engineering',
  'Civil Engineering',
  'Electrical and Electronics Engineering',
  'Artificial Intelligence and Data Science',
  'Biomedical Engineering',
];

export const ROLES = {
  SYSTEM_ADMIN: 'SYSTEM_ADMIN',
  COLLEGE_ADMIN: 'COLLEGE_ADMIN',
  HOD: 'HOD',
  MENTOR: 'MENTOR',
  STUDENT: 'STUDENT',
};

// Full SAPT Activity Categories with subcategories and exact points
export const ACTIVITY_CATEGORIES = {
  'Hackathons': [
    { label: 'Participation', points: 20 },
    { label: 'College-Level Winner', points: 35 },
    { label: 'State-Level Winner', points: 50 },
    { label: 'National-Level Winner', points: 75 },
    { label: 'International-Level Winner', points: 100 },
    { label: 'Top Finalist', points: 40 },
    { label: 'Organizer / Coordinator', points: 25 },
  ],
  'Ideathons': [
    { label: 'Participation', points: 15 },
    { label: 'Shortlisted Idea', points: 25 },
    { label: 'Winner', points: 40 },
    { label: 'State/National Recognition', points: 60 },
  ],
  'Coding Competitions': [
    { label: 'Participation', points: 15 },
    { label: 'Top 10 Rank', points: 35 },
    { label: 'Winner', points: 50 },
    { label: 'Online Platform Milestone', points: 20 },
  ],
  'Workshops': [
    { label: '1-Day Workshop', points: 5 },
    { label: '2–3 Day Workshop', points: 10 },
    { label: 'Certified Workshop', points: 15 },
    { label: 'Hands-On Technical Workshop', points: 20 },
    { label: 'Workshop Organizer', points: 20 },
  ],
  'Seminars & Guest Lectures': [
    { label: 'Attendance', points: 3 },
    { label: 'Certified Participation', points: 5 },
    { label: 'Presenter / Speaker', points: 20 },
    { label: 'Organizer', points: 15 },
  ],
  'Conferences': [
    { label: 'Participation', points: 10 },
    { label: 'Paper Presentation', points: 30 },
    { label: 'Best Paper Award', points: 60 },
    { label: 'International Conference Paper', points: 80 },
  ],
  'Research & Publications': [
    { label: 'Research Participation', points: 25 },
    { label: 'Journal Publication', points: 60 },
    { label: 'Scopus Indexed Publication', points: 100 },
    { label: 'IEEE Publication', points: 90 },
    { label: 'Patent Filed', points: 120 },
    { label: 'Patent Granted', points: 200 },
  ],
  'Internships': [
    { label: '1–4 Week Internship', points: 25 },
    { label: '1–2 Month Internship', points: 40 },
    { label: '3+ Month Internship', points: 60 },
    { label: 'Paid Internship Bonus', points: 15 },
    { label: 'Internship Report Submission', points: 10 },
    { label: 'Internship with PPO', points: 100 },
  ],
  'Industrial Visits': [
    { label: 'Participation', points: 5 },
    { label: 'Report Submission', points: 10 },
    { label: 'Coordinator', points: 15 },
  ],
  'Mini Projects': [
    { label: 'Mini Project Completion', points: 20 },
    { label: 'Innovative Project', points: 35 },
    { label: 'Project Demonstration', points: 15 },
    { label: 'Department Recognition', points: 40 },
  ],
  'Major Projects': [
    { label: 'Major Project Completion', points: 50 },
    { label: 'Industry-Based Project', points: 75 },
    { label: 'Sponsored Project', points: 100 },
    { label: 'Best Project Award', points: 120 },
  ],
  'Open Source Contributions': [
    { label: 'First Contribution', points: 20 },
    { label: 'Regular Contributions', points: 40 },
    { label: 'Maintainer Role', points: 75 },
    { label: 'Significant Repository Contribution', points: 60 },
  ],
  'Startup & Innovation': [
    { label: 'Startup Idea Submission', points: 20 },
    { label: 'Incubation Selection', points: 60 },
    { label: 'Prototype Development', points: 40 },
    { label: 'Startup Registration', points: 100 },
    { label: 'Funding Received', points: 150 },
  ],
  'Certifications & Online Courses': [
    { label: 'Basic Certification', points: 10 },
    { label: 'Industry Certification', points: 25 },
    { label: 'Advanced Technical Certification', points: 40 },
    { label: 'Global Certification (AWS/GCP/Cisco/MS/Oracle)', points: 60 },
  ],
  'Competitive Exams': [
    { label: 'Exam Qualification', points: 25 },
    { label: 'National Rank Achievement', points: 75 },
    { label: 'Advanced Round Qualification', points: 40 },
  ],
  'Sports & Games': [
    { label: 'Participation', points: 10 },
    { label: 'College-Level Winner', points: 20 },
    { label: 'State-Level Winner', points: 40 },
    { label: 'National-Level Winner', points: 70 },
    { label: 'Team Captain', points: 20 },
    { label: 'Organizer', points: 15 },
  ],
  'Cultural Activities': [
    { label: 'Participation', points: 10 },
    { label: 'Performer', points: 15 },
    { label: 'Winner', points: 30 },
    { label: 'State/National Recognition', points: 60 },
    { label: 'Organizer', points: 20 },
  ],
  'NSS / NCC / Social Service': [
    { label: 'Camp Participation', points: 20 },
    { label: 'Leadership Role', points: 35 },
    { label: 'Community Service Initiative', points: 40 },
    { label: 'Blood Donation', points: 15 },
    { label: 'Awareness Program Organizer', points: 20 },
  ],
  'Leadership & Student Bodies': [
    { label: 'Club Member', points: 10 },
    { label: 'Club Coordinator', points: 25 },
    { label: 'Student Representative', points: 30 },
    { label: 'Event Lead', points: 35 },
    { label: 'Department Representative', points: 40 },
  ],
  'Event Organization': [
    { label: 'Volunteer', points: 10 },
    { label: 'Coordinator', points: 20 },
    { label: 'Core Organizer', points: 35 },
    { label: 'Event Lead', points: 50 },
  ],
  'Placement Preparation': [
    { label: 'Aptitude Training Completion', points: 10 },
    { label: 'Mock Interview Participation', points: 10 },
    { label: 'Placement Readiness Program', points: 20 },
    { label: 'Placement Offer Received', points: 100 },
  ],
  'Academic Performance': [
    { label: 'Semester Grade Sheet Upload', points: 10 },
    { label: 'SGPA Above 8.0', points: 25 },
    { label: 'SGPA Above 9.0', points: 40 },
    { label: 'Department Topper', points: 75 },
    { label: 'University Rank', points: 120 },
  ],
  'Attendance & Discipline': [
    { label: '90%+ Attendance', points: 15 },
    { label: '95%+ Attendance', points: 25 },
    { label: 'No Disciplinary Issues', points: 10 },
  ],
  'Daily Logs & Consistency': [
    { label: 'Daily Log Submission (Reviewed)', points: 1 },
    { label: '7-Day Consistency Streak', points: 5 },
    { label: '30-Day Consistency Streak', points: 25 },
    { label: 'Mentor Excellence Remark', points: 10 },
  ],
  'Freelancing & Real-World Work': [
    { label: 'Freelance Project Completion', points: 30 },
    { label: 'Client Appreciation', points: 20 },
    { label: 'Revenue Milestone', points: 50 },
  ],
  'Content Creation & Technical Community': [
    { label: 'Technical Blog Published', points: 15 },
    { label: 'YouTube Educational Content', points: 20 },
    { label: 'Technical Community Contribution', points: 25 },
    { label: 'Public Speaking', points: 30 },
  ],
  'Entrepreneurship & Business': [
    { label: 'Business Plan Submission', points: 25 },
    { label: 'Startup Competition Participation', points: 30 },
    { label: 'Revenue Generation Milestone', points: 75 },
    { label: 'Registered Business Entity', points: 120 },
  ],
  'Faculty Recommendations & Excellence': [
    { label: 'Exceptional Contribution Recognition', points: 25 },
    { label: 'Mentor Special Recommendation', points: 30 },
    { label: 'Institutional Excellence Award', points: 75 },
  ],
  'Presentations': [
    { label: 'In-Class Presentation', points: 5 },
    { label: 'Department-Level Presentation', points: 15 },
    { label: 'Inter-College Presentation', points: 25 },
    { label: 'National-Level Presentation', points: 40 },
    { label: 'International Presentation', points: 60 },
    { label: 'Best Presenter Award', points: 50 },
  ],
};

// Flat list of category names for quick access
export const ACTIVITY_TYPES = Object.keys(ACTIVITY_CATEGORIES);

// Credit range per category (min/max from subcategory points)
export const CREDIT_MAP = Object.fromEntries(
  Object.entries(ACTIVITY_CATEGORIES).map(([cat, subs]) => [
    cat,
    {
      min: Math.min(...subs.map(s => s.points)),
      max: Math.max(...subs.map(s => s.points)),
    },
  ])
);

export const STAR_THRESHOLDS = [
  { stars: 1, credits: 100 },
  { stars: 2, credits: 250 },
  { stars: 3, credits: 500 },
  { stars: 4, credits: 1000 },
  { stars: 5, credits: 2000 },
];

export const getStars = (credits) => {
  let stars = 0;
  for (const t of STAR_THRESHOLDS) {
    if (credits >= t.credits) stars = t.stars;
  }
  return stars;
};

export const getAchievementBadge = (stars) => {
  const badges = ['Beginner', 'Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond'];
  return badges[stars] || 'Beginner';
};

// Pre-populated mock users
export const INITIAL_USERS = [
  {
    id: 'sa_001',
    role: ROLES.SYSTEM_ADMIN,
    name: 'Super Admin',
    email: 'admin@spark.edu',
    password: 'admin123',
    adminId: 'SA001',
  },
  {
    id: 'ca_001',
    role: ROLES.COLLEGE_ADMIN,
    name: 'Dr. Ramesh Kumar',
    email: 'ramesh@mit.edu',
    password: 'admin123',
    college: 'MIT College of Engineering',
    department: 'Computer Science and Engineering',
    adminId: 'CA001',
  },
  {
    id: 'hod_001',
    role: ROLES.HOD,
    name: 'Dr. Priya Sharma',
    email: 'priya@mit.edu',
    password: 'hod123',
    college: 'MIT College of Engineering',
    department: 'Computer Science and Engineering',
    status: 'approved',
    phone: '+91 9876543210',
  },
  {
    id: 'mentor_001',
    role: ROLES.MENTOR,
    name: 'Prof. Arun Vijay',
    email: 'arun@mit.edu',
    password: 'mentor123',
    college: 'MIT College of Engineering',
    department: 'Computer Science and Engineering',
    hodId: 'hod_001',
    status: 'approved',
    phone: '+91 9876543211',
  },
  {
    id: 'mentor_002',
    role: ROLES.MENTOR,
    name: 'Prof. Kavitha Raj',
    email: 'kavitha@mit.edu',
    password: 'mentor123',
    college: 'MIT College of Engineering',
    department: 'Computer Science and Engineering',
    hodId: 'hod_001',
    status: 'pending',
    phone: '+91 9876543212',
  },
  {
    id: 'student_001',
    role: ROLES.STUDENT,
    name: 'Rahul Mehta',
    email: 'rahul@student.mit.edu',
    password: 'student123',
    college: 'MIT College of Engineering',
    department: 'Computer Science and Engineering',
    mentorId: 'mentor_001',
    mentorName: 'Prof. Arun Vijay',
    rollNo: 'CS21001',
    status: 'approved',
    phone: '+91 9876543213',
    avatar: null,
  },
  {
    id: 'student_002',
    role: ROLES.STUDENT,
    name: 'Sneha Patel',
    email: 'sneha@student.mit.edu',
    password: 'student123',
    college: 'MIT College of Engineering',
    department: 'Computer Science and Engineering',
    mentorId: 'mentor_001',
    mentorName: 'Prof. Arun Vijay',
    rollNo: 'CS21002',
    status: 'approved',
    phone: '+91 9876543214',
    avatar: null,
  },
  {
    id: 'student_003',
    role: ROLES.STUDENT,
    name: 'Ankit Sharma',
    email: 'ankit@student.mit.edu',
    password: 'student123',
    college: 'MIT College of Engineering',
    department: 'Computer Science and Engineering',
    mentorId: 'mentor_001',
    mentorName: 'Prof. Arun Vijay',
    rollNo: 'CS21003',
    status: 'approved',
    phone: '+91 9876543215',
    avatar: null,
  },
];

export const INITIAL_SUBMISSIONS = [
  {
    id: 'sub_001',
    studentId: 'student_001',
    studentName: 'Rahul Mehta',
    mentorId: 'mentor_001',
    title: 'Smart Attendance System - Hackathon Winner',
    type: 'Hackathons',
    achievementType: 'National-Level Winner',
    date: '2024-02-15',
    description: 'Built an AI-powered attendance system using face recognition. Won 1st place at CodeFest 2024.',
    status: 'approved',
    credits: 75,
    review: 'Excellent work! Very innovative approach.',
    fileUrl: '#',
    submittedAt: '2024-02-20',
    certificateFile: 'certificate_dummy.png',
    presentationFile: 'presentation_dummy.png',
    documentFile: 'document_dummy.png'
  },
  {
    id: 'sub_002',
    studentId: 'student_001',
    studentName: 'Rahul Mehta',
    mentorId: 'mentor_001',
    title: 'AWS Cloud Practitioner Certification',
    type: 'Certifications & Online Courses',
    achievementType: 'Global Certification (AWS/GCP/Cisco/MS/Oracle)',
    date: '2024-01-10',
    description: 'Successfully cleared AWS Cloud Practitioner certification exam with score 850/1000.',
    status: 'approved',
    credits: 60,
    review: 'Great achievement!',
    fileUrl: '#',
    submittedAt: '2024-01-15',
    certificateFile: 'certificate_dummy.png'
  },
  {
    id: 'sub_003',
    studentId: 'student_001',
    studentName: 'Rahul Mehta',
    mentorId: 'mentor_001',
    title: 'Machine Learning Research Paper',
    type: 'Research & Publications',
    achievementType: 'IEEE Publication',
    date: '2024-03-01',
    description: 'Published research paper on "Federated Learning for Healthcare" in IEEE conference.',
    status: 'pending',
    credits: 0,
    review: '',
    fileUrl: '#',
    submittedAt: '2024-03-05',
    certificateFile: 'certificate_dummy.png',
    documentFile: 'document_dummy.png'
  },
  {
    id: 'sub_004',
    studentId: 'student_002',
    studentName: 'Sneha Patel',
    mentorId: 'mentor_001',
    title: 'React.js Workshop Completion',
    type: 'Workshops',
    achievementType: '2–3 Day Workshop',
    date: '2024-02-01',
    description: 'Completed 3-day intensive workshop on Advanced React and Next.js.',
    status: 'approved',
    credits: 10,
    review: 'Good participation.',
    fileUrl: '#',
    submittedAt: '2024-02-05',
    certificateFile: 'certificate_dummy.png'
  },
  {
    id: 'sub_005',
    studentId: 'student_002',
    studentName: 'Sneha Patel',
    mentorId: 'mentor_001',
    title: 'National Basketball Championship',
    type: 'Sports & Games',
    achievementType: 'National-Level Winner',
    date: '2024-01-20',
    description: 'Represented college in National Basketball Championship, secured 3rd place.',
    status: 'rejected',
    credits: 0,
    review: 'Missing official certificate. Please resubmit with proper documentation.',
    fileUrl: '#',
    submittedAt: '2024-01-25',
    certificateFile: 'certificate_dummy.png'
  },
  {
    id: 'sub_006',
    studentId: 'student_003',
    studentName: 'Ankit Sharma',
    mentorId: 'mentor_001',
    title: 'Summer Internship at TCS',
    type: 'Internships',
    achievementType: '1–2 Month Internship',
    date: '2024-05-01',
    description: 'Completed 2-month summer internship at TCS, Bangalore. Worked on cloud migration project.',
    status: 'approved',
    credits: 40,
    review: 'Outstanding! Great company placement.',
    fileUrl: '#',
    submittedAt: '2024-07-10',
    certificateFile: 'certificate_dummy.png',
    documentFile: 'document_dummy.png'
  },
];

export const INITIAL_LOGS = [
  {
    id: 'log_001',
    studentId: 'student_001',
    title: 'Started preparation for AWS exam',
    date: '2024-01-05',
    description: 'Began studying AWS cloud concepts using official study guide.',
    links: 'https://aws.amazon.com/training/',
  },
  {
    id: 'log_002',
    studentId: 'student_001',
    title: 'Hackathon team formation',
    date: '2024-02-01',
    description: 'Formed a team of 4 for CodeFest 2024. Started brainstorming ideas.',
    links: '',
  },
  {
    id: 'log_003',
    studentId: 'student_001',
    title: 'Submitted research paper draft',
    date: '2024-03-01',
    description: 'Submitted first draft of ML research paper to supervisor for review.',
    links: '',
  },
];

export const INITIAL_COLLEGES_DATA = [
  {
    id: 'col_001',
    name: 'MIT College of Engineering',
    address: 'Paiyanoor, Old Mahabalipuram Road, Chennai - 603 104',
    state: 'Tamil Nadu',
    status: 'active',
    contractStart: '2026-05-30',
    contractEnd: '2028-05-30',
    adminId: 'ca_001',
    adminName: 'Dr. Ramesh Kumar',
    adminEmail: 'ramesh@mit.edu',
    adminPhone: '+91 98765 43210',
    totalUsers: 10,
    hods: 1,
    mentors: 2,
    students: 3,
    departments: ['Computer Science and Engineering', 'Information Technology'],
  },
];
