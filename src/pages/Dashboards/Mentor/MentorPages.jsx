import { useState } from 'react';
import { Users, FileText, CheckCircle, XCircle, Eye, Download, Phone, Mail, Clock } from 'lucide-react';
import { getUsers, getSubmissionsByMentor, updateSubmission, getTotalCredits, getLogsByStudent, getSubmissions } from '../../../utils/localStorage';
import { ROLES } from '../../../utils/mockData';
import { useAuth } from '../../../context/AuthContext';
import { StatCard, Modal, Badge, useToast, EmptyState, Avatar } from '../../../components/ui/UIComponents';

// =====================================================================
// Local Sub-Components for Premium Document Previews
// =====================================================================

// --- High-Fidelity Slides Deck Presentation Viewer ---
const PptViewer = ({ title }) => {
  const [currentSlide, setCurrentSlide] = useState(1);
  const slides = [
    {
      type: 'image',
      src: '/presentation_dummy.png',
      caption: 'Title Slide - Project Overview'
    },
    {
      type: 'slide',
      title: 'Project Architecture & Tech Stack',
      content: (
        <div className="space-y-4 text-slate-350 text-sm">
          <p className="text-xs text-slate-400">The application is built using a modern, high-performance stack designed for scale and rich visual environments.</p>
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 bg-slate-900 rounded-xl border border-orange-500/20 text-center">
              <span className="text-xl">⚛️</span>
              <p className="font-bold text-white text-xs mt-1">React 18</p>
              <p className="text-[9px] text-slate-400">Core Framework</p>
            </div>
            <div className="p-3 bg-slate-900 rounded-xl border border-orange-500/20 text-center">
              <span className="text-xl">⚡</span>
              <p className="font-bold text-white text-xs mt-1">Vite + Bundler</p>
              <p className="text-[9px] text-slate-400">HMR Dev Environment</p>
            </div>
            <div className="p-3 bg-slate-900 rounded-xl border border-orange-500/20 text-center">
              <span className="text-xl">📊</span>
              <p className="font-bold text-white text-xs mt-1">Recharts</p>
              <p className="text-[9px] text-slate-400">Visual Analytics</p>
            </div>
          </div>
          <div className="p-2.5 bg-dark-900 rounded-lg text-[10px] font-mono text-orange-400 border-l-2 border-orange-500">
            $ npm run build &bull; compiled dist/ in 3.63 seconds!
          </div>
        </div>
      )
    },
    {
      type: 'slide',
      title: 'Academic Points Framework (SAPT)',
      content: (
        <div className="space-y-4 text-slate-350 text-xs">
          <p className="text-xs text-slate-400">Our credit mapping structure automatically evaluates student achievements against official criteria.</p>
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-700 text-slate-400 text-[10px] uppercase font-bold">
                <th className="pb-1.5">Category</th>
                <th className="pb-1.5">Milestone Level</th>
                <th className="pb-1.5 text-right">Credits Approved</th>
              </tr>
            </thead>
            <tbody className="text-white divide-y divide-slate-800">
              <tr><td className="py-1.5 font-medium">Hackathons</td><td className="py-1.5">National-Level Winner</td><td className="py-1.5 text-right text-orange-400">75 points</td></tr>
              <tr><td className="py-1.5 font-medium">Certifications</td><td className="py-1.5">Advanced Technical</td><td className="py-1.5 text-right text-orange-400">60 points</td></tr>
              <tr><td className="py-1.5 font-medium">Internships</td><td className="py-1.5">3+ Month Duration</td><td className="py-1.5 text-right text-orange-400">60 points</td></tr>
            </tbody>
          </table>
        </div>
      )
    }
  ];

  return (
    <div className="flex flex-col bg-slate-900 text-white rounded-2xl overflow-hidden border border-slate-800 min-h-[50vh]">
      <div className="flex items-center justify-between p-4 bg-slate-950 border-b border-slate-800">
        <p className="font-bold truncate text-xs sm:text-sm text-orange-500">📺 Presentation Viewer: {title}</p>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setCurrentSlide(c => Math.max(c - 1, 1))}
            disabled={currentSlide === 1}
            className="px-3 py-1 bg-slate-850 hover:bg-slate-800 rounded-lg text-xs font-bold disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Prev
          </button>
          <span className="text-xs text-slate-400 font-mono">Slide {currentSlide} of {slides.length}</span>
          <button
            onClick={() => setCurrentSlide(c => Math.min(c + 1, slides.length))}
            disabled={currentSlide === slides.length}
            className="px-3 py-1 bg-slate-850 hover:bg-slate-800 rounded-lg text-xs font-bold disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center p-6 bg-slate-900 min-h-[40vh]">
        {slides[currentSlide - 1].type === 'image' ? (
          <div className="w-full flex flex-col justify-between items-center">
            <img src={slides[currentSlide - 1].src} alt={slides[currentSlide - 1].caption} className="max-h-[35vh] w-auto object-contain rounded-lg shadow-2xl border border-slate-800" />
            <p className="text-center text-xs text-slate-400 mt-3 italic">{slides[currentSlide - 1].caption}</p>
          </div>
        ) : (
          <div className="w-full max-w-lg bg-slate-850 p-6 rounded-2xl border border-slate-750 shadow-2xl animate-fade-in flex flex-col justify-between min-h-[30vh]">
            <div>
              <h4 className="text-lg font-extrabold text-orange-500 mb-4 flex items-center gap-2">
                <span className="inline-block w-2 h-5 bg-orange-500 rounded-full" />
                {slides[currentSlide - 1].title}
              </h4>
              {slides[currentSlide - 1].content}
            </div>
            <div className="text-[9px] text-slate-500 text-right mt-5 border-t border-slate-850 pt-2 font-mono">
              SPARK Slide Deck Engine v1.0
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// --- High-Fidelity PDF Scrollable Document Viewer ---
const PdfViewer = ({ title }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const pages = [
    {
      type: 'image',
      src: '/document_dummy.png',
      title: 'Page 1 - Executive Capstone Cover'
    },
    {
      type: 'page',
      title: 'Section 2: Table of Contents & Executive Summary',
      content: (
        <div className="space-y-3 text-slate-600 dark:text-slate-350 text-xs sm:text-sm leading-relaxed">
          <p className="font-bold text-slate-800 dark:text-white">1. Background Overview</p>
          <p>
            This project dossier outlines the engineering, system design, and execution milestones achieved during the integration of our decentralized credits reporting engine.
          </p>
          <p className="font-bold text-slate-800 dark:text-white">2. Scope & Target Parameters</p>
          <ul className="list-disc list-inside space-y-1 text-xs pl-2">
            <li>Deploy atomic local storage transactions</li>
            <li>Enable seamless multi-tier role routing layout</li>
            <li>Maintain data integrity across user handovers</li>
          </ul>
          <p>
            By implementing a state-of-the-art visual client layout, the platform maintains responsive micro-second rendering under heavy simulation loads.
          </p>
        </div>
      )
    },
    {
      type: 'page',
      title: 'Section 3: System Specifications & Architecture',
      content: (
        <div className="space-y-3 text-slate-600 dark:text-slate-350 text-xs">
          <p className="font-bold text-slate-800 dark:text-white">3. Network Component Diagram</p>
          <div className="p-3 bg-slate-50 dark:bg-dark-900/40 rounded-xl border border-slate-200 dark:border-dark-750 flex items-center justify-between text-[11px] font-mono">
            <div>
              <p className="font-bold text-slate-800 dark:text-slate-200">Client Engine (React 18)</p>
              <p className="text-slate-400 mt-0.5">Component Layer Renders</p>
            </div>
            <span className="text-orange-500 font-bold">↔</span>
            <div className="text-right">
              <p className="font-bold text-slate-800 dark:text-slate-200">Storage API (LocalDB)</p>
              <p className="text-slate-400 mt-0.5">JSON Serialization Layer</p>
            </div>
          </div>
          <p className="font-bold text-slate-800 dark:text-white mt-3">4. Metrics & Performance Assessment</p>
          <div className="grid grid-cols-2 gap-3 text-[11px]">
            <div className="p-2.5 bg-slate-50 dark:bg-dark-900/40 rounded-xl border border-slate-100 dark:border-dark-800">
              <p className="font-bold text-orange-600 dark:text-orange-400">Technical Rigor</p>
              <p className="text-slate-400 mt-0.5">Assessed via hackathons won, projects logged, and Scopus publications.</p>
            </div>
            <div className="p-2.5 bg-slate-50 dark:bg-dark-900/40 rounded-xl border border-slate-100 dark:border-dark-800">
              <p className="font-bold text-blue-600 dark:text-blue-400">Professional Development</p>
              <p className="text-slate-400 mt-0.5">Tracked using corporate internships, global certifications, and industrial visits.</p>
            </div>
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="flex bg-slate-50 dark:bg-dark-950 text-slate-800 dark:text-white rounded-2xl overflow-hidden border border-slate-200 dark:border-dark-850 min-h-[50vh]">
      {/* Thumbnail Sidebar */}
      <div className="w-36 bg-slate-100 dark:bg-dark-900 border-r border-slate-200 dark:border-dark-800 p-3 space-y-3 overflow-y-auto hidden sm:block shrink-0">
        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-2">Pages</p>
        {pages.map((p, idx) => (
          <div
            key={idx}
            onClick={() => setCurrentPage(idx + 1)}
            className={`p-1.5 rounded-lg border cursor-pointer transition-all text-center ${
              currentPage === idx + 1
                ? 'border-orange-500 bg-orange-500/5 shadow-sm'
                : 'border-slate-200 dark:border-dark-800 hover:border-slate-350 dark:hover:border-dark-750'
            }`}
          >
            <div className="w-full h-14 bg-slate-200 dark:bg-dark-800 rounded flex items-center justify-center font-bold text-[10px] text-slate-500">
              P. {idx + 1}
            </div>
          </div>
        ))}
      </div>

      {/* Main Page Area */}
      <div className="flex-1 flex flex-col min-h-[45vh]">
        <div className="flex items-center justify-between p-3 bg-white dark:bg-dark-900 border-b border-slate-200 dark:border-dark-800">
          <p className="font-bold text-xs truncate">📄 PDF: {title}</p>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setCurrentPage(c => Math.max(c - 1, 1))}
              disabled={currentPage === 1}
              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-dark-800 rounded-lg text-xs font-bold disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Prev
            </button>
            <span className="text-xs text-slate-400 font-mono">Page {currentPage} of {pages.length}</span>
            <button
              onClick={() => setCurrentPage(c => Math.min(c + 1, pages.length))}
              disabled={currentPage === pages.length}
              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-dark-800 rounded-lg text-xs font-bold disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4 bg-slate-100 dark:bg-dark-900 flex justify-center items-center">
          {pages[currentPage - 1].type === 'image' ? (
            <img src={pages[currentPage - 1].src} alt={pages[currentPage - 1].title} className="max-h-[35vh] w-auto object-contain rounded shadow-lg border border-slate-300 dark:border-dark-800" />
          ) : (
            <div className="w-full max-w-lg bg-white dark:bg-dark-850 p-6 rounded-2xl shadow-xl border border-slate-200 dark:border-dark-750 min-h-[30vh] flex flex-col justify-between text-slate-700 dark:text-white">
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-dark-800 pb-2 mb-4">
                  {pages[currentPage - 1].title}
                </h4>
                {pages[currentPage - 1].content}
              </div>
              <div className="text-[9px] text-slate-400 text-right mt-5 border-t border-slate-100 dark:border-dark-800 pt-2 font-mono">
                SPARK PDF engine v1.0
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// =====================================================================
// Page Components
// =====================================================================

// ---- Students Page ----
export const MentorStudents = () => {
  const { user } = useAuth();
  const [selected, setSelected] = useState(null);
  const students = getUsers().filter(u => u.role === ROLES.STUDENT && u.mentorId === user.id);

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-slate-900 dark:text-white">My Students</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">{students.length} students under your mentorship</p>
      </div>

      {students.length === 0 ? (
        <div className="card"><EmptyState icon={<Users className="w-12 h-12" />} title="No students assigned" /></div>
      ) : (
        <div className="card p-0 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr>
                <th className="table-th">Student Name</th>
                <th className="table-th">Roll Number</th>
                <th className="table-th">Credits</th>
                <th className="table-th text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.map(s => {
                const credits = getTotalCredits(s.id);
                return (
                  <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-dark-700 transition-colors">
                    <td className="table-td flex items-center gap-3">
                      <Avatar name={s.name} src={s.avatar} size="sm" />
                      <span className="font-medium text-slate-900 dark:text-white">{s.name}</span>
                    </td>
                    <td className="table-td text-slate-500 dark:text-slate-400 font-semibold">{s.rollNo || '–'}</td>
                    <td className="table-td">
                      <Badge variant="purple">{credits} pts</Badge>
                    </td>
                    <td className="table-td text-right">
                      <button
                        onClick={() => setSelected(s)}
                        className="btn-ghost text-xs py-1 px-3"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <Modal isOpen={!!selected} onClose={() => setSelected(null)} title="Student Details">
        {selected && (() => {
          const credits = getTotalCredits(selected.id);
          return (
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-dark-850 rounded-xl">
                <Avatar name={selected.name} src={selected.avatar} size="xl" />
                <div>
                  <p className="text-xl font-bold text-slate-900 dark:text-white">{selected.name}</p>
                  <p className="text-sm text-slate-500">{selected.rollNo || 'No roll number'}</p>
                </div>
              </div>
              
              <div className="p-4 bg-slate-50 dark:bg-dark-850 rounded-xl space-y-2">
                <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Contact Details</p>
                <div className="text-sm text-slate-700 dark:text-slate-350 space-y-1">
                  <p><strong>Email:</strong> {selected.email}</p>
                  <p><strong>Phone:</strong> {selected.phone || 'Not provided'}</p>
                  <p><strong>Credits:</strong> <span className="font-bold text-primary-600">{credits} pts</span></p>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    const studentSubs = getSubmissions().filter(s => s.studentId === selected.id && s.status === 'approved');
                    const printWindow = window.open('', '_blank');
                    if (!printWindow) return;
                    const content = `
                      <html>
                        <head>
                          <title>Student Performance Report - ${selected.name}</title>
                          <style>
                            body { font-family: 'Inter', sans-serif; padding: 40px; color: #1e293b; }
                            .header { border-bottom: 2px solid #ea580c; padding-bottom: 10px; margin-bottom: 20px; }
                            .title { font-size: 24px; font-weight: bold; }
                            .details { margin-bottom: 20px; font-size: 14px; }
                            .table { width: 100%; border-collapse: collapse; margin-top: 15px; }
                            .table th, .table td { border: 1px solid #cbd5e1; padding: 10px; text-align: left; font-size: 13px; }
                            .table th { background: #f8fafc; }
                          </style>
                        </head>
                        <body>
                          <div class="header">
                            <div class="title">Student Achievement & Submissions Report</div>
                            <p style="margin: 5px 0 0 0; color: #ea580c; font-weight: bold;">SPARK Mentorship Platform</p>
                          </div>
                          <div class="details">
                            <p><strong>Student Name:</strong> ${selected.name}</p>
                            <p><strong>Roll Number:</strong> ${selected.rollNo || 'N/A'}</p>
                            <p><strong>Email:</strong> ${selected.email}</p>
                            <p><strong>Phone:</strong> ${selected.phone || 'N/A'}</p>
                            <p><strong>Total Earned Credits:</strong> ${credits} points</p>
                          </div>
                          <h3>Approved Achievements</h3>
                          <table class="table">
                            <thead>
                              <tr>
                                <th>Date</th>
                                <th>Achievement Title</th>
                                <th>Category</th>
                                <th>Type</th>
                                <th>Credits</th>
                                <th>Review Comments</th>
                              </tr>
                            </thead>
                            <tbody>
                              ${studentSubs.map(s => `
                                <tr>
                                  <td>${s.date || s.submittedAt || '–'}</td>
                                  <td><strong>${s.title}</strong></td>
                                  <td>${s.type}</td>
                                  <td>${s.achievementType || '–'}</td>
                                  <td>${s.credits || 0}</td>
                                  <td>${s.review || '–'}</td>
                                </tr>
                              `).join('')}
                              ${studentSubs.length === 0 ? '<tr><td colspan="6" style="text-align: center;">No achievements uploaded yet.</td></tr>' : ''}
                            </tbody>
                          </table>
                          <script>window.onload = function() { window.print(); }</script>
                        </body>
                      </html>
                    `;
                    printWindow.document.write(content);
                    printWindow.document.close();
                  }}
                  className="btn-success flex-1 justify-center py-2.5 text-xs flex items-center gap-1.5"
                >
                  <Download className="w-4 h-4" /> Download Report
                </button>

                <button
                  onClick={() => {
                    const studentLogs = getLogsByStudent(selected.id);
                    const printWindow = window.open('', '_blank');
                    if (!printWindow) return;
                    const content = `
                      <html>
                        <head>
                          <title>Daily Activity Logs - ${selected.name}</title>
                          <style>
                            body { font-family: 'Inter', sans-serif; padding: 40px; color: #1e293b; }
                            .header { border-bottom: 2px solid #3b82f6; padding-bottom: 10px; margin-bottom: 20px; }
                            .title { font-size: 24px; font-weight: bold; }
                            .details { margin-bottom: 20px; font-size: 14px; }
                            .table { width: 100%; border-collapse: collapse; margin-top: 15px; }
                            .table th, .table td { border: 1px solid #cbd5e1; padding: 10px; text-align: left; font-size: 13px; }
                            .table th { background: #f8fafc; }
                          </style>
                        </head>
                        <body>
                          <div class="header">
                            <div class="title">Daily Activity Logs Report</div>
                            <p style="margin: 5px 0 0 0; color: #3b82f6; font-weight: bold;">SPARK Mentorship Platform</p>
                          </div>
                          <div class="details">
                            <p><strong>Student Name:</strong> ${selected.name}</p>
                            <p><strong>Roll Number:</strong> ${selected.rollNo || 'N/A'}</p>
                            <p><strong>Email:</strong> ${selected.email}</p>
                          </div>
                          <h3>Logged Daily Activities</h3>
                          <table class="table">
                            <thead>
                              <tr>
                                <th style="width: 120px;">Date</th>
                                <th style="width: 200px;">Task Title</th>
                                <th>Detailed Description</th>
                                <th>Resource Links</th>
                              </tr>
                            </thead>
                            <tbody>
                              ${studentLogs.map(l => `
                                <tr>
                                  <td>${l.date}</td>
                                  <td><strong>${l.title}</strong></td>
                                  <td>${l.description}</td>
                                  <td>${l.links ? `<a href="${l.links}" target="_blank" style="color: #3b82f6; text-decoration: underline;">${l.links}</a>` : '–'}</td>
                                </tr>
                              `).join('')}
                              ${studentLogs.length === 0 ? '<tr><td colspan="4" style="text-align: center;">No daily logs submitted yet.</td></tr>' : ''}
                            </tbody>
                          </table>
                          <script>window.onload = function() { window.print(); }</script>
                        </body>
                      </html>
                    `;
                    printWindow.document.write(content);
                    printWindow.document.close();
                  }}
                  className="btn-secondary flex-1 justify-center py-2.5 text-xs flex items-center gap-1.5"
                >
                  <Download className="w-4 h-4" /> Download Logs
                </button>
              </div>
            </div>
          );
        })()}
      </Modal>
    </div>
  );
};

// ---- Submissions Page ----
export const MentorSubmissions = () => {
  const { user } = useAuth();
  const { showToast, ToastComponent } = useToast();
  const [submissions, setSubmissions] = useState(() => getSubmissionsByMentor(user.id));
  const [reviewModal, setReviewModal] = useState(null);
  const [selectedDocs, setSelectedDocs] = useState(null);
  const [fullscreenDoc, setFullscreenDoc] = useState(null);
  const [review, setReview] = useState({ text: '' });

  const handleAction = (id, action, submission) => {
    const credits = action === 'approved' ? (submission?.suggestedCredits || 0) : 0;
    updateSubmission(id, { status: action, credits });
    setSubmissions(prev => prev.map(s => s.id === id ? { ...s, status: action, credits } : s));
    showToast(`Submission ${action}`, action === 'approved' ? 'success' : 'error');
  };

  const handleReview = () => {
    const credits = reviewModal.suggestedCredits || 0;
    updateSubmission(reviewModal.id, { review: review.text, credits, status: 'approved' });
    setSubmissions(prev => prev.map(s => s.id === reviewModal.id ? { ...s, review: review.text, credits, status: 'approved' } : s));
    showToast('Review submitted and approved!', 'success');
    setReviewModal(null);
    setReview({ text: '' });
  };

  const handleReviewReject = () => {
    updateSubmission(reviewModal.id, { review: review.text, credits: 0, status: 'rejected' });
    setSubmissions(prev => prev.map(s => s.id === reviewModal.id ? { ...s, review: review.text, credits: 0, status: 'rejected' } : s));
    showToast('Review submitted and rejected!', 'error');
    setReviewModal(null);
    setReview({ text: '' });
  };

  const statusColor = { approved: 'green', rejected: 'red', pending: 'yellow' };

  return (
    <div className="animate-fade-in">
      {ToastComponent}
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-slate-900 dark:text-white">Submissions</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Review student activity submissions</p>
      </div>

      {submissions.length === 0 ? (
        <div className="card"><EmptyState icon={<FileText className="w-12 h-12" />} title="No submissions yet" /></div>
      ) : (
        <div className="card p-0 overflow-hidden">
          <table className="w-full">
            <thead><tr>
              <th className="table-th">Title</th>
              <th className="table-th">Category</th>
              <th className="table-th">Achievement Type</th>
              <th className="table-th">Student</th>
              <th className="table-th">Date</th>
              <th className="table-th">Documents</th>
              <th className="table-th">Status</th>
              <th className="table-th">Actions</th>
            </tr></thead>
            <tbody>
              {submissions.map(s => (
                <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-dark-700 transition-colors">
                  <td className="table-td font-medium max-w-xs truncate">{s.title}</td>
                  <td className="table-td"><Badge variant="blue">{s.type}</Badge></td>
                  <td className="table-td text-xs text-slate-500 dark:text-slate-400">{s.achievementType || '–'}</td>
                  <td className="table-td">{s.studentName}</td>
                  <td className="table-td text-slate-400 text-xs">{s.date}</td>
                  <td className="table-td">
                    {(s.certificateFile || s.presentationFile || s.documentFile) ? (
                      <button
                        onClick={() => setSelectedDocs(s)}
                        className="inline-flex items-center gap-1 text-xs text-primary-600 hover:text-primary-700 font-bold"
                      >
                        📄 View Docs
                      </button>
                    ) : (
                      <span className="text-xs text-slate-400">–</span>
                    )}
                  </td>
                  <td className="table-td"><Badge variant={statusColor[s.status]}>{s.status}</Badge></td>
                  <td className="table-td">
                    <div className="flex gap-1">
                      <button onClick={() => { setReviewModal(s); setReview({ text: s.review || '' }); }} className="btn-ghost text-xs py-1 px-2 flex items-center gap-1">
                        <Eye className="w-3 h-3" /> Review
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Review Modal */}
      <Modal isOpen={!!reviewModal} onClose={() => setReviewModal(null)} title="Review Submission">
        {reviewModal && (
          <div className="space-y-4">
            <div className="p-4 bg-slate-50 dark:bg-dark-850 rounded-xl space-y-2">
              <p className="font-semibold text-slate-900 dark:text-white">{reviewModal.title}</p>
              {reviewModal.achievementType && (
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="blue">{reviewModal.type}</Badge>
                  <span className="text-xs text-slate-500">→</span>
                  <Badge variant="purple">{reviewModal.achievementType}</Badge>
                </div>
              )}
              <p className="text-sm text-slate-500 mt-1">{reviewModal.description}</p>
              {reviewModal.suggestedCredits != null && (
                <div className="mt-2 flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-xs font-semibold px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-700">
                    ✅ Auto-awarded on approval: {reviewModal.suggestedCredits} pts
                  </span>
                </div>
              )}
              {/* Uploaded files listing */}
              {(reviewModal.certificateFile || reviewModal.presentationFile || reviewModal.documentFile) && (
                <div className="mt-2 pt-2 border-t border-slate-200 dark:border-dark-700 space-y-1">
                  <p className="text-xs font-semibold text-slate-500">Uploaded Files:</p>
                  {reviewModal.certificateFile && <p className="text-xs text-slate-600 dark:text-slate-400">📄 {reviewModal.certificateFile}</p>}
                  {reviewModal.presentationFile && <p className="text-xs text-slate-600 dark:text-slate-400">📊 {reviewModal.presentationFile}</p>}
                  {reviewModal.documentFile && <p className="text-xs text-slate-600 dark:text-slate-400">📝 {reviewModal.documentFile}</p>}
                </div>
              )}
            </div>
            <div>
              <label className="label-field">Review Comments</label>
              <textarea className="input-field h-28 resize-none" placeholder="Write your review comments here (required to enable review actions)..." value={review.text} onChange={e => setReview(r => ({ ...r, text: e.target.value }))} />
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleReview}
                disabled={!review.text.trim()}
                className="btn-success flex-1 justify-center py-2 text-xs font-bold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Submit & Approve
              </button>
              <button
                onClick={handleReviewReject}
                disabled={!review.text.trim()}
                className="btn-danger flex-1 justify-center py-2 text-xs font-bold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Reject
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Documents Modal */}
      <Modal isOpen={!!selectedDocs} onClose={() => setSelectedDocs(null)} title="Submission Documents">
        {selectedDocs && (
          <div className="space-y-4">
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-350">
              Attached files for: <span className="text-primary-600 font-bold">{selectedDocs.title}</span>
            </p>
            <div className="grid grid-cols-1 gap-4">
              {selectedDocs.certificateFile && (
                <div className="p-4 bg-slate-50 dark:bg-dark-850 rounded-xl border border-slate-200 dark:border-dark-750 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Certificate File</p>
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-0.5">📄 {selectedDocs.certificateFile}</p>
                    </div>
                    <Badge variant="blue">Verified</Badge>
                  </div>
                  <div className="border border-slate-200 dark:border-dark-700 rounded-lg overflow-hidden max-h-48 flex justify-center bg-slate-100 dark:bg-dark-900 cursor-pointer" onClick={() => setFullscreenDoc({ type: 'certificate', file: selectedDocs.certificateFile, title: selectedDocs.title })}>
                    <img src={`/${selectedDocs.certificateFile}`} alt="Certificate Preview" className="h-full object-contain max-h-48 w-auto hover:scale-105 transition-transform duration-300" />
                  </div>
                  <button
                    onClick={() => setFullscreenDoc({ type: 'certificate', file: selectedDocs.certificateFile, title: selectedDocs.title })}
                    className="w-full mt-1 btn-secondary text-xs py-1.5 justify-center flex items-center gap-1.5"
                  >
                    🔍 View Fullscreen
                  </button>
                </div>
              )}
              {selectedDocs.presentationFile && (
                <div className="p-4 bg-slate-50 dark:bg-dark-850 rounded-xl border border-slate-200 dark:border-dark-750 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Presentation File</p>
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-0.5">📊 {selectedDocs.presentationFile}</p>
                    </div>
                    <Badge variant="purple">PowerPoint</Badge>
                  </div>
                  <div className="border border-slate-200 dark:border-dark-700 rounded-lg overflow-hidden max-h-48 flex justify-center bg-slate-100 dark:bg-dark-900 cursor-pointer" onClick={() => setFullscreenDoc({ type: 'presentation', file: selectedDocs.presentationFile, title: selectedDocs.title })}>
                    <img src={`/${selectedDocs.presentationFile}`} alt="Presentation Preview" className="h-full object-contain max-h-48 w-auto hover:scale-105 transition-transform duration-300" />
                  </div>
                  <button
                    onClick={() => setFullscreenDoc({ type: 'presentation', file: selectedDocs.presentationFile, title: selectedDocs.title })}
                    className="w-full mt-1 btn-secondary text-xs py-1.5 justify-center flex items-center gap-1.5"
                  >
                    🔍 View slides
                  </button>
                </div>
              )}
              {selectedDocs.documentFile && (
                <div className="p-4 bg-slate-50 dark:bg-dark-850 rounded-xl border border-slate-200 dark:border-dark-750 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Project Document</p>
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-0.5">📝 {selectedDocs.documentFile}</p>
                    </div>
                    <Badge variant="blue">Document</Badge>
                  </div>
                  <div className="border border-slate-200 dark:border-dark-700 rounded-lg overflow-hidden max-h-48 flex justify-center bg-slate-100 dark:bg-dark-900 cursor-pointer" onClick={() => setFullscreenDoc({ type: 'document', file: selectedDocs.documentFile, title: selectedDocs.title })}>
                    <img src={`/${selectedDocs.documentFile}`} alt="Document Preview" className="h-full object-contain max-h-48 w-auto hover:scale-105 transition-transform duration-300" />
                  </div>
                  <button
                    onClick={() => setFullscreenDoc({ type: 'document', file: selectedDocs.documentFile, title: selectedDocs.title })}
                    className="w-full mt-1 btn-secondary text-xs py-1.5 justify-center flex items-center gap-1.5"
                  >
                    🔍 View Pages
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Fullscreen Document Viewer Modal */}
      <Modal isOpen={!!fullscreenDoc} onClose={() => setFullscreenDoc(null)} title="Fullscreen Document Viewer" size="xl">
        {fullscreenDoc && (() => {
          if (fullscreenDoc.type === 'certificate') {
            return (
              <div className="flex flex-col items-center justify-center p-4 bg-slate-900 rounded-2xl border border-slate-800 max-h-[75vh] overflow-y-auto">
                <img src={`/${fullscreenDoc.file}`} alt="Certificate Fullscreen" className="max-h-[60vh] w-auto object-contain rounded-lg shadow-2xl" />
                <p className="text-slate-400 text-xs mt-4 font-bold uppercase tracking-wider">📄 Certificate: {fullscreenDoc.title}</p>
              </div>
            );
          } else if (fullscreenDoc.type === 'presentation') {
            return <PptViewer title={fullscreenDoc.title} />;
          } else if (fullscreenDoc.type === 'document') {
            return <PdfViewer title={fullscreenDoc.title} />;
          }
          return null;
        })()}
      </Modal>
    </div>
  );
};
