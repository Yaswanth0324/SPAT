import { useState, useEffect } from 'react';
import { Users, FileText, CheckCircle, XCircle, Eye, Download, BookOpen, Link as LinkIcon, UserCheck, UploadCloud } from 'lucide-react';
import { getUsers, getSubmissionsByMentor, updateSubmission, getTotalCredits, getLogsByStudent, getSubmissions, getLogsByMentor, updateLog, updateUser } from '../../../utils/localStorage';
import { ROLES } from '../../../utils/mockData';
import { useAuth } from '../../../context/AuthContext';
import { Modal, Badge, useToast, EmptyState, Avatar } from '../../../components/ui/UIComponents';
import { apiGetUsersByMentor, apiUpdateUserStatus, mentorApi } from '../../../utils/api';
import tunnelConfig from '../../../utils/tunnel.json';

// =====================================================================
// Inline File Viewer (supports Image, PDF, and Google Docs Embedded)
// =====================================================================
const InlineFileViewer = ({ fileUrl, filename, title }) => {
  const ext = filename ? filename.split('.').pop().toLowerCase() : '';
  const isImg = ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'].includes(ext);
  const isPdf = ext === 'pdf';
  const isOffice = ['ppt', 'pptx', 'doc', 'docx', 'xls', 'xlsx'].includes(ext);
  
  const downloadUrl = `/api/submission/files/download?path=${encodeURIComponent(fileUrl)}`;
  // Route requests through the secure public tunnel so Google docs viewer can pull the content from localhost
  const absoluteDownloadUrl = (tunnelConfig?.url || window.location.origin) + downloadUrl;

  if (fileUrl === '#' || !fileUrl) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[45vh] gap-4 p-8 bg-slate-50 dark:bg-dark-900 rounded-2xl border border-slate-200 dark:border-dark-700 w-full">
        <div className="p-4 rounded-2xl bg-red-100 dark:bg-red-950/40">
          <XCircle className="w-10 h-10 text-red-500 animate-pulse" />
        </div>
        <div className="text-center max-w-md bg-transparent">
          <p className="font-bold text-slate-800 dark:text-white text-sm">{filename}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
            ⚠️ <strong>Document Not Found:</strong> No document payload was stored for this path.
          </p>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
            This is a placeholder entry created when MongoDB was offline or unreachable during the student's upload. Please ask the student to re-submit this activity.
          </p>
        </div>
      </div>
    );
  }
  
  if (isImg) {
    return (
      <div className="flex flex-col items-center justify-center p-4 bg-slate-900 rounded-2xl border border-slate-800 w-full max-h-[75vh] overflow-y-auto">
        <img src={downloadUrl} alt={title} className="max-h-[60vh] w-auto object-contain rounded-lg shadow-2xl" />
        <p className="text-slate-400 text-xs mt-4 font-bold uppercase tracking-wider">📷 Image: {filename}</p>
      </div>
    );
  }
  
  if (isPdf || isOffice) {
    const officeViewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(absoluteDownloadUrl)}&embedded=true`;
    
    return (
      <div className="flex flex-col w-full h-[70vh] rounded-2xl overflow-hidden border border-slate-200 dark:border-dark-750 bg-white">
        <div className="bg-slate-50 dark:bg-dark-900 border-b border-slate-200 dark:border-dark-750 px-4 py-2 flex items-center justify-between shrink-0">
          <span className="text-xs text-slate-700 dark:text-slate-350 font-semibold truncate max-w-[70%]">
            📄 Original Document: <strong>{filename}</strong>
          </span>
          <a 
            href={downloadUrl} 
            download={filename} 
            className="text-xs text-primary-600 hover:text-primary-700 underline font-bold"
          >
            Download Original
          </a>
        </div>
        <iframe src={officeViewerUrl} className="w-full flex-1" title={title} frameBorder="0" />
      </div>
    );
  }

  // Fallback
  return (
    <div className="flex flex-col items-center justify-center min-h-[30vh] gap-4 p-6 bg-slate-50 dark:bg-dark-900 rounded-2xl border border-slate-200 dark:border-dark-700 w-full">
      <FileText className="w-10 h-10 text-blue-500" />
      <div className="text-center">
        <p className="font-bold text-slate-800 dark:text-white text-sm">{filename}</p>
        <p className="text-xs text-slate-500 mt-1">This file type cannot be previewed inline. Please download to view.</p>
        <a href={downloadUrl} download={filename} className="mt-3 btn-primary text-xs py-1.5 px-4 justify-center">
          📥 Download File
        </a>
      </div>
    </div>
  );
};

export const MentorStudents = () => {
  const { user } = useAuth();
  const [selected, setSelected] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [studentSubmissions, setStudentSubmissions] = useState([]);
  const [studentLogs, setStudentLogs] = useState([]);
  const [loadingDetails, setLoadingDetails] = useState(false);

  useEffect(() => {
    let active = true;
    const fetchStudents = async () => {
      try {
        const list = await mentorApi.getStudents();
        if (active && list) {
          setStudents(list);
          setLoading(false);
        }
      } catch (err) {
        if (active) setLoading(false);
      }
    };
    fetchStudents();
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!selected?.id) {
      setStudentSubmissions([]);
      setStudentLogs([]);
      return;
    }
    let active = true;
    const loadDetails = async () => {
      setLoadingDetails(true);
      try {
        const [subs, allLogs] = await Promise.all([
          mentorApi.getStudentSubmissions(selected.id),
          mentorApi.getLogs()
        ]);
        if (active) {
          setStudentSubmissions(subs || []);
          setStudentLogs((allLogs || []).filter(l => l.studentId === selected.id));
        }
      } catch (err) {
        console.error("Failed to load student details:", err);
      } finally {
        if (active) setLoadingDetails(false);
      }
    };
    loadDetails();
    return () => { active = false; };
  }, [selected?.id]);

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-slate-900 dark:text-white">My Students</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">{students.length} students under your mentorship</p>
      </div>

      {loading ? (
        <div className="card flex items-center justify-center p-8">Loading students...</div>
      ) : students.length === 0 ? (
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
                const credits = s.credits;
                return (
                  <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-dark-700 transition-colors">
                    <td className="table-td flex items-center gap-3">
                      <Avatar name={s.name} src={s.avatar} size="sm" />
                      <span className="font-medium text-slate-900 dark:text-white">{s.name}</span>
                    </td>
                    <td className="table-td text-slate-500 dark:text-slate-400 font-semibold">{s.rollNo || '—'}</td>
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
          const credits = selected.credits;
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
                  disabled={loadingDetails}
                  onClick={() => {
                    const studentSubs = studentSubmissions.filter(s => s.status?.toUpperCase() === 'APPROVED');
                    const printWindow = window.open('', '_blank');
                    if (!printWindow) return;
                    const content = `
                      <html>
                        <head>
                          <title>Student Performance Report - ${selected.name}</title>
                          <style>
                            body { font-family: 'Inter', sans-serif; padding: 40px; color: #1e293b; }
                            .header { display: flex; align-items: center; justify-content: space-between; border-bottom: 3px solid #ea580c; padding-bottom: 15px; margin-bottom: 30px; }
                            .logo-container { display: flex; align-items: center; gap: 10px; }
                            .logo-text { font-size: 26px; font-weight: 900; color: #ea580c; font-family: 'Outfit', sans-serif; letter-spacing: -0.5px; }
                            .college-name { font-size: 14px; font-weight: 700; color: #7c2d12; text-align: right; text-transform: uppercase; letter-spacing: 0.5px; }
                            .title { font-size: 24px; font-weight: bold; }
                            .details { margin-bottom: 20px; font-size: 14px; }
                            .table { width: 100%; border-collapse: collapse; margin-top: 15px; }
                            .table th, .table td { border: 1px solid #cbd5e1; padding: 10px; text-align: left; font-size: 13px; }
                            .table th { background: #f8fafc; }
                          </style>
                        </head>
                        <body>
                          <div class="header">
                            <div class="logo-container">
                              <img src="/spat-logo1.png" style="width: 32px; height: 32px; object-fit: contain; border-radius: 8px;" />
                              <span class="logo-text">SPAT</span>
                            </div>
                            <div class="college-name">${selected.college || 'SPAT Partner Institute'}</div>
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
                                  <td>${s.date || s.submittedAt || '—'}</td>
                                  <td><strong>${s.title}</strong></td>
                                  <td>${s.type}</td>
                                  <td>${s.achievementType || '—'}</td>
                                  <td>${s.credits || 0}</td>
                                  <td>${s.review || '—'}</td>
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
                  className="btn-success flex-1 justify-center py-2.5 text-xs flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Download className="w-4 h-4" /> {loadingDetails ? 'Loading...' : 'Download Report'}
                </button>

                <button
                  disabled={loadingDetails}
                  onClick={() => {
                    const printWindow = window.open('', '_blank');
                    if (!printWindow) return;
                    const content = `
                      <html>
                        <head>
                          <title>Daily Activity Logs - ${selected.name}</title>
                          <style>
                            body { font-family: 'Inter', sans-serif; padding: 40px; color: #1e293b; }
                            .header { display: flex; align-items: center; justify-content: space-between; border-bottom: 3px solid #ea580c; padding-bottom: 15px; margin-bottom: 30px; }
                            .logo-container { display: flex; align-items: center; gap: 10px; }
                            .logo-text { font-size: 26px; font-weight: 900; color: #ea580c; font-family: 'Outfit', sans-serif; letter-spacing: -0.5px; }
                            .college-name { font-size: 14px; font-weight: 700; color: #7c2d12; text-align: right; text-transform: uppercase; letter-spacing: 0.5px; }
                            .title { font-size: 24px; font-weight: bold; }
                            .details { margin-bottom: 20px; font-size: 14px; }
                            .table { width: 100%; border-collapse: collapse; margin-top: 15px; }
                            .table th, .table td { border: 1px solid #cbd5e1; padding: 10px; text-align: left; font-size: 13px; }
                            .table th { background: #f8fafc; }
                          </style>
                        </head>
                        <body>
                          <div class="header">
                            <div class="logo-container">
                              <img src="/spat-logo1.png" style="width: 32px; height: 32px; object-fit: contain; border-radius: 8px;" />
                              <span class="logo-text">SPAT</span>
                            </div>
                            <div class="college-name">${selected.college || 'SPAT Partner Institute'}</div>
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
                                  <td>${l.links ? `<a href="${l.links}" target="_blank" style="color: #3b82f6; text-decoration: underline;">${l.links}</a>` : '—'}</td>
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
                  className="btn-secondary flex-1 justify-center py-2.5 text-xs flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Download className="w-4 h-4" /> {loadingDetails ? 'Loading...' : 'Download Logs'}
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
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewModal, setReviewModal] = useState(null);
  const [selectedDocs, setSelectedDocs] = useState(null);
  const [fullscreenDoc, setFullscreenDoc] = useState(null);
  const [review, setReview] = useState({ text: '' });

  useEffect(() => {
    let active = true;
    const loadSubmissions = async () => {
      try {
        const list = await mentorApi.getPendingSubmissions();
        if (active && list) {
          setSubmissions(list);
          setLoading(false);
        }
      } catch (err) {
        console.error("Failed to load submissions:", err);
        if (active) setLoading(false);
      }
    };
    loadSubmissions();
    return () => { active = false; };
  }, []);

  const handleAction = async (id, action, submission) => {
    try {
      const credits = action === 'approved' ? (submission?.suggestedCredits || 0) : 0;
      if (action === 'approved') {
        await mentorApi.approveSubmission(id, "Approved", credits);
      } else {
        await mentorApi.rejectSubmission(id, "Rejected");
      }
      setSubmissions(prev => prev.filter(s => s.id !== id));
      showToast(`Submission ${action}`, 'success');
    } catch (err) {
      showToast(err.message || 'Action failed', 'error');
    }
  };

  const handleReview = async () => {
    try {
      const credits = reviewModal.suggestedCredits || 0;
      await mentorApi.approveSubmission(reviewModal.id, review.text, credits);
      setSubmissions(prev => prev.filter(s => s.id !== reviewModal.id));
      showToast('Review submitted and approved!', 'success');
      setReviewModal(null);
      setReview({ text: '' });
    } catch (err) {
      showToast(err.message || 'Review failed', 'error');
    }
  };

  const handleReviewReject = async () => {
    try {
      await mentorApi.rejectSubmission(reviewModal.id, review.text);
      setSubmissions(prev => prev.filter(s => s.id !== reviewModal.id));
      showToast('Review submitted and rejected!', 'error');
      setReviewModal(null);
      setReview({ text: '' });
    } catch (err) {
      showToast(err.message || 'Review failed', 'error');
    }
  };

  const statusColor = { approved: 'green', rejected: 'red', pending: 'yellow' };

  return (
    <div className="animate-fade-in">
      {ToastComponent}
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-slate-900 dark:text-white">Submissions</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Review student activity submissions</p>
      </div>

      {loading ? (
        <div className="card flex items-center justify-center p-8">Loading submissions...</div>
      ) : submissions.length === 0 ? (
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
                  <td className="table-td text-xs text-slate-500 dark:text-slate-400">{s.achievementType || 'â€“'}</td>
                  <td className="table-td">{s.studentName}</td>
                  <td className="table-td text-slate-400 text-xs">{s.date}</td>
                  <td className="table-td">
                    {(s.certificateFile || s.presentationFile || s.documentFile) ? (
                      <button
                        onClick={() => setSelectedDocs(s)}
                        className="inline-flex items-center gap-1 text-xs text-primary-600 hover:text-primary-700 font-bold"
                      >
                        ðŸ“„ View Docs
                      </button>
                    ) : (
                      <span className="text-xs text-slate-400">â€“</span>
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
                  <span className="text-xs text-slate-500">â†’</span>
                  <Badge variant="purple">{reviewModal.achievementType}</Badge>
                </div>
              )}
              <p className="text-sm text-slate-500 mt-1">{reviewModal.description}</p>
              {reviewModal.suggestedCredits != null && (
                <div className="mt-2 flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-xs font-semibold px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-700">
                    âœ… Auto-awarded on approval: {reviewModal.suggestedCredits} pts
                  </span>
                </div>
              )}
              {/* Uploaded files listing */}
              {(reviewModal.certificateFile || reviewModal.presentationFile || reviewModal.documentFile) && (
                <div className="mt-2 pt-2 border-t border-slate-200 dark:border-dark-700 space-y-1">
                  <p className="text-xs font-semibold text-slate-500">Uploaded Files:</p>
                  {reviewModal.certificateFile && <p className="text-xs text-slate-600 dark:text-slate-400">ðŸ“„ {reviewModal.certificateFile}</p>}
                  {reviewModal.presentationFile && <p className="text-xs text-slate-600 dark:text-slate-400">ðŸ“Š {reviewModal.presentationFile}</p>}
                  {reviewModal.documentFile && <p className="text-xs text-slate-600 dark:text-slate-400">ðŸ“ {reviewModal.documentFile}</p>}
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
                  <div 
                    className="border border-slate-200 dark:border-dark-700 rounded-lg overflow-hidden max-h-48 flex justify-center bg-slate-100 dark:bg-dark-900 cursor-pointer" 
                    onClick={() => setFullscreenDoc({ file: selectedDocs.fileUrl, name: selectedDocs.certificateFile, title: selectedDocs.title })}
                  >
                    {(() => {
                      const isCertImage = selectedDocs.certificateFile.toLowerCase().endsWith('.png') ||
                                          selectedDocs.certificateFile.toLowerCase().endsWith('.jpg') ||
                                          selectedDocs.certificateFile.toLowerCase().endsWith('.jpeg') ||
                                          selectedDocs.certificateFile.toLowerCase().endsWith('.webp');
                      if (isCertImage) {
                        return <img src={`/api/submission/files/download?path=${encodeURIComponent(selectedDocs.fileUrl)}`} alt="Certificate Preview" className="h-full object-contain max-h-48 w-auto hover:scale-105 transition-transform duration-300" />;
                      }
                      return (
                        <div className="flex flex-col items-center justify-center p-6 bg-slate-50 dark:bg-dark-900 rounded-lg min-h-[120px] w-full">
                          <FileText className="w-8 h-8 text-blue-500 mb-2 animate-pulse" />
                          <span className="text-xs text-slate-500 font-medium">Click to view Certificate PDF / Document</span>
                        </div>
                      );
                    })()}
                  </div>
                  <button
                    onClick={() => setFullscreenDoc({ file: selectedDocs.fileUrl, name: selectedDocs.certificateFile, title: selectedDocs.title })}
                    className="w-full mt-1 btn-secondary text-xs py-1.5 justify-center flex items-center gap-1.5"
                  >
                    🔍 View Document
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
                  <div 
                    className="border border-slate-200 dark:border-dark-700 rounded-lg overflow-hidden max-h-48 flex justify-center bg-slate-100 dark:bg-dark-900 cursor-pointer"
                    onClick={() => setFullscreenDoc({ file: selectedDocs.presentationUrl, name: selectedDocs.presentationFile, title: selectedDocs.title })}
                  >
                    <div className="flex flex-col items-center justify-center p-6 bg-slate-50 dark:bg-dark-900 rounded-lg min-h-[120px] w-full">
                      <UploadCloud className="w-8 h-8 text-purple-500 mb-2 animate-bounce-subtle" />
                      <span className="text-xs text-slate-500 font-medium">PowerPoint Presentation (Click to View)</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setFullscreenDoc({ file: selectedDocs.presentationUrl, name: selectedDocs.presentationFile, title: selectedDocs.title })}
                    className="w-full mt-1 btn-secondary text-xs py-1.5 justify-center flex items-center gap-1.5"
                  >
                    🔍 View Slides
                  </button>
                </div>
              )}
              {selectedDocs.documentFile && (
                <div className="p-4 bg-slate-50 dark:bg-dark-850 rounded-xl border border-slate-200 dark:border-dark-750 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Project Document</p>
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-0.5">📄 {selectedDocs.documentFile}</p>
                    </div>
                    <Badge variant="blue">Document</Badge>
                  </div>
                  <div 
                    className="border border-slate-200 dark:border-dark-700 rounded-lg overflow-hidden max-h-48 flex justify-center bg-slate-100 dark:bg-dark-900 cursor-pointer"
                    onClick={() => setFullscreenDoc({ file: selectedDocs.documentUrl, name: selectedDocs.documentFile, title: selectedDocs.title })}
                  >
                    <div className="flex flex-col items-center justify-center p-6 bg-slate-50 dark:bg-dark-900 rounded-lg min-h-[120px] w-full">
                      <BookOpen className="w-8 h-8 text-emerald-500 mb-2" />
                      <span className="text-xs text-slate-500 font-medium">Project Sheet / Document (Click to View)</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setFullscreenDoc({ file: selectedDocs.documentUrl, name: selectedDocs.documentFile, title: selectedDocs.title })}
                    className="w-full mt-1 btn-secondary text-xs py-1.5 justify-center flex items-center gap-1.5"
                  >
                    🔍 View Document
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Fullscreen Document Viewer Modal */}
      <Modal isOpen={!!fullscreenDoc} onClose={() => setFullscreenDoc(null)} title="Fullscreen Document Viewer" size="xl">
        {fullscreenDoc && (
          <InlineFileViewer 
            fileUrl={fullscreenDoc.file} 
            filename={fullscreenDoc.name} 
            title={fullscreenDoc.title} 
          />
        )}
      </Modal>
    </div>
  );
};

// ---- Logs Page ----
export const MentorLogs = () => {
  const { user } = useAuth();
  const { showToast, ToastComponent } = useToast();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewModal, setReviewModal] = useState(null);
  const [review, setReview] = useState('');

  useEffect(() => {
    let active = true;
    const loadLogs = async () => {
      try {
        const list = await mentorApi.getLogs();
        if (active && list) {
          setLogs(list);
          setLoading(false);
        }
      } catch (err) {
        console.error("Failed to load logs:", err);
        if (active) setLoading(false);
      }
    };
    loadLogs();
    return () => { active = false; };
  }, []);

  const handleApprove = async () => {
    try {
      await mentorApi.reviewLog(reviewModal.id, 'approved', review);
      setLogs(prev => prev.map(l => l.id === reviewModal.id ? { ...l, reviewStatus: 'approved', review } : l));
      showToast('Log reviewed & approved!', 'success');
      setReviewModal(null);
      setReview('');
    } catch (err) {
      showToast(err.message || 'Failed to approve log', 'error');
    }
  };

  const handleReject = async () => {
    try {
      await mentorApi.reviewLog(reviewModal.id, 'rejected', review);
      setLogs(prev => prev.map(l => l.id === reviewModal.id ? { ...l, reviewStatus: 'rejected', review } : l));
      showToast('Log rejected.', 'error');
      setReviewModal(null);
      setReview('');
    } catch (err) {
      showToast(err.message || 'Failed to reject log', 'error');
    }
  };

  const statusColor = { approved: 'green', rejected: 'red', pending: 'yellow' };

  return (
    <div className="animate-fade-in">
      {ToastComponent}
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-slate-900 dark:text-white">Student Logs</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Review daily activity logs submitted by your students</p>
      </div>

      {loading ? (
        <div className="card flex items-center justify-center p-8">Loading logs...</div>
      ) : logs.length === 0 ? (
        <div className="card"><EmptyState icon={<BookOpen className="w-12 h-12" />} title="No logs submitted yet" /></div>
      ) : (
        <div className="card p-0 overflow-hidden">
          <table className="w-full">
            <thead><tr>
              <th className="table-th">Log Title</th>
              <th className="table-th">Student</th>
              <th className="table-th">Date</th>
              <th className="table-th">Description</th>
              <th className="table-th">Link</th>
              <th className="table-th">Status</th>
              <th className="table-th">Actions</th>
            </tr></thead>
            <tbody>
              {logs.map(l => (
                <tr key={l.id} className="hover:bg-slate-50 dark:hover:bg-dark-700 transition-colors">
                  <td className="table-td font-medium max-w-[180px] truncate">{l.title}</td>
                  <td className="table-td">{l.studentName}</td>
                  <td className="table-td text-slate-400 text-xs">{l.date}</td>
                  <td className="table-td text-xs text-slate-500 dark:text-slate-400 max-w-[220px] truncate">{l.description}</td>
                  <td className="table-td">
                    {l.links ? (
                      <a
                        href={l.links}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-primary-600 hover:text-primary-700 font-bold"
                      >
                        <LinkIcon className="w-3 h-3" /> View Link
                      </a>
                    ) : (
                      <span className="text-xs text-slate-400">â€“</span>
                    )}
                  </td>
                  <td className="table-td">
                    <Badge variant={statusColor[l.reviewStatus || 'pending']}>
                      {l.reviewStatus || 'pending'}
                    </Badge>
                  </td>
                  <td className="table-td">
                    <button
                      onClick={() => { setReviewModal(l); setReview(l.review || ''); }}
                      className="btn-ghost text-xs py-1 px-2 flex items-center gap-1"
                    >
                      <Eye className="w-3 h-3" /> Review
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Review Modal */}
      <Modal isOpen={!!reviewModal} onClose={() => { setReviewModal(null); setReview(''); }} title="Review Log Entry">
        {reviewModal && (
          <div className="space-y-4">
            <div className="p-4 bg-slate-50 dark:bg-dark-850 rounded-xl space-y-2">
              <p className="font-semibold text-slate-900 dark:text-white">{reviewModal.title}</p>
              <p className="text-xs text-slate-500">{reviewModal.date} &nbsp;Â·&nbsp; <span className="font-medium">{reviewModal.studentName}</span></p>
              <p className="text-sm text-slate-600 dark:text-slate-350 leading-relaxed">{reviewModal.description}</p>
              {reviewModal.links && (
                <a
                  href={reviewModal.links}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-primary-500 hover:text-primary-600 flex items-center gap-1 font-medium break-all"
                >
                  <LinkIcon className="w-3 h-3 shrink-0" /> {reviewModal.links}
                </a>
              )}
            </div>
            <div>
              <label className="label-field">Review Comments</label>
              <textarea
                className="input-field h-28 resize-none"
                placeholder="Write your review comments here (required to enable actions)..."
                value={review}
                onChange={e => setReview(e.target.value)}
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleApprove}
                disabled={!review.trim()}
                className="btn-success flex-1 justify-center py-2 text-xs font-bold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Submit &amp; Approve
              </button>
              <button
                onClick={handleReject}
                disabled={!review.trim()}
                className="btn-danger flex-1 justify-center py-2 text-xs font-bold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Reject
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

// ---- Student Approvals Page ----
export const MentorStudentApprovals = () => {
  const { user } = useAuth();
  const { showToast, ToastComponent } = useToast();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [approvedCount, setApprovedCount] = useState(0);
  const [rejectedCount, setRejectedCount] = useState(0);

  useEffect(() => {
    let active = true;
    const fetchStudents = async () => {
      if (!user?.id) return;
      try {
        const list = await apiGetUsersByMentor(user.id);
        const filtered = list
          .filter(u => u.role === 'STUDENT' && u.status && u.status.toUpperCase() === 'PENDING')
          .map(u => ({
            ...u,
            status: 'pending',
            college: u.collegeName,
            department: u.departmentName
          }));
        if (active) {
          setStudents(filtered);
          setLoading(false);
        }
      } catch (err) {
        if (active) setLoading(false);
      }
    };
    fetchStudents();
    return () => { active = false; };
  }, [user?.id]);

  const handleApprove = async (studentId) => {
    try {
      await apiUpdateUserStatus(studentId, 'APPROVED');
      setStudents(prev => prev.filter(s => s.id !== studentId));
      setApprovedCount(c => c + 1);
      showToast('Student approved! They can now login.', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to approve student', 'error');
    }
  };

  const handleReject = async (studentId) => {
    try {
      await apiUpdateUserStatus(studentId, 'REJECTED');
      setStudents(prev => prev.filter(s => s.id !== studentId));
      setRejectedCount(c => c + 1);
      showToast('Student registration rejected.', 'error');
    } catch (err) {
      showToast(err.message || 'Failed to reject student', 'error');
    }
  };

  return (
    <div className="animate-fade-in">
      {ToastComponent}
      <div className="mb-8 flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-slate-900 dark:text-white">Student Approvals</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            New student registrations awaiting your approval before they can login
          </p>
        </div>
        {(approvedCount > 0 || rejectedCount > 0) && (
          <div className="flex gap-3">
            {approvedCount > 0 && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-700">
                <CheckCircle className="w-3.5 h-3.5" /> {approvedCount} approved this session
              </span>
            )}
            {rejectedCount > 0 && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-700">
                <XCircle className="w-3.5 h-3.5" /> {rejectedCount} rejected
              </span>
            )}
          </div>
        )}
      </div>

      {loading ? (
        <div className="card flex items-center justify-center p-8">Loading student registrations...</div>
      ) : students.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={<UserCheck className="w-12 h-12" />}
            title="All caught up!"
            description="No pending student registrations at the moment."
          />
        </div>
      ) : (
        <div className="card p-0 overflow-hidden">
          <table className="w-full">
            <thead><tr>
              <th className="table-th">Student Name</th>
              <th className="table-th">Email</th>
              <th className="table-th">College</th>
              <th className="table-th">Department</th>
              <th className="table-th">Roll No.</th>
              <th className="table-th">Status</th>
              <th className="table-th text-right">Actions</th>
            </tr></thead>
            <tbody>
              {students.map(s => (
                <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-dark-700 transition-colors">
                  <td className="table-td">
                    <div className="flex items-center gap-3">
                      <Avatar name={s.name} src={s.avatar} size="sm" />
                      <span className="font-medium text-slate-900 dark:text-white">{s.name}</span>
                    </div>
                  </td>
                  <td className="table-td text-xs text-slate-500">{s.email}</td>
                  <td className="table-td text-xs text-slate-500 max-w-[150px] truncate">{s.college}</td>
                  <td className="table-td text-xs text-slate-500 max-w-[150px] truncate">{s.department}</td>
                  <td className="table-td text-slate-500 dark:text-slate-400 font-semibold">{s.rollNo || 'â€“'}</td>
                  <td className="table-td">
                    <Badge variant="yellow">Pending Approval</Badge>
                  </td>
                  <td className="table-td text-right">
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => handleApprove(s.id)}
                        className="btn-success text-xs py-1 px-3 flex items-center gap-1"
                      >
                        <CheckCircle className="w-3 h-3" /> Approve
                      </button>
                      <button
                        onClick={() => handleReject(s.id)}
                        className="btn-danger text-xs py-1 px-3 flex items-center gap-1"
                      >
                        <XCircle className="w-3 h-3" /> Reject
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
