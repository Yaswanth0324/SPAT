import { useState, useEffect } from 'react';
import { Users, FileText, CheckCircle, XCircle, Eye, Download, BookOpen, Link as LinkIcon, UserCheck } from 'lucide-react';
import { getUsers, getSubmissionsByMentor, updateSubmission, getTotalCredits, getLogsByStudent, getSubmissions, getLogsByMentor, updateLog, updateUser } from '../../../utils/localStorage';
import { ROLES } from '../../../utils/mockData';
import { useAuth } from '../../../context/AuthContext';
import { Modal, Badge, useToast, EmptyState, Avatar } from '../../../components/ui/UIComponents';
import { apiGetUsersByMentor, apiUpdateUserStatus } from '../../../utils/api';


// =====================================================================
// File Preview Placeholder (file viewing requires backend file-serving)
// =====================================================================
const FilePreviewPlaceholder = ({ title, type }) => (
  <div className="flex flex-col items-center justify-center min-h-[40vh] gap-4 p-8 bg-slate-50 dark:bg-dark-900 rounded-2xl border-2 border-dashed border-slate-200 dark:border-dark-700">
    <div className="p-4 rounded-2xl bg-orange-100 dark:bg-orange-950/40">
      <BookOpen className="w-10 h-10 text-orange-500" />
    </div>
    <div className="text-center">
      <p className="font-bold text-slate-800 dark:text-white text-sm">{title}</p>
      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs">
        {type === 'presentation' ? 'Presentation' : 'Document'} preview will be available once backend file-serving is connected.
      </p>
    </div>
  </div>
);

export const MentorStudents = () => {
  const { user } = useAuth();
  const [selected, setSelected] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const fetchStudents = async () => {
      if (!user?.id) return;
      try {
        const list = await apiGetUsersByMentor(user.id);
        const filtered = list
          .filter(u => u.role === 'STUDENT' && u.status && u.status.toUpperCase() === 'APPROVED')
          .map(u => ({
            ...u,
            status: 'approved',
            college: u.collegeName,
            department: u.departmentName
          }));
        if (active) {
          setStudents(filtered);
          setLoading(false);
        }
      } catch (err) {
        setLoading(false);
      }
    };
    fetchStudents();
    return () => { active = false; };
  }, [user?.id]);

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
                const credits = getTotalCredits(s.id);
                return (
                  <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-dark-700 transition-colors">
                    <td className="table-td flex items-center gap-3">
                      <Avatar name={s.name} src={s.avatar} size="sm" />
                      <span className="font-medium text-slate-900 dark:text-white">{s.name}</span>
                    </td>
                    <td className="table-td text-slate-500 dark:text-slate-400 font-semibold">{s.rollNo || 'â€“'}</td>
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
                              <img src="/spark-logo1.png" style="width: 32px; height: 32px; object-fit: contain; border-radius: 8px;" />
                              <span class="logo-text">SPARK</span>
                            </div>
                            <div class="college-name">${selected.college || 'SPARK Partner Institute'}</div>
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
                                  <td>${s.date || s.submittedAt || 'â€“'}</td>
                                  <td><strong>${s.title}</strong></td>
                                  <td>${s.type}</td>
                                  <td>${s.achievementType || 'â€“'}</td>
                                  <td>${s.credits || 0}</td>
                                  <td>${s.review || 'â€“'}</td>
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
                              <img src="/spark-logo1.png" style="width: 32px; height: 32px; object-fit: contain; border-radius: 8px;" />
                              <span class="logo-text">SPARK</span>
                            </div>
                            <div class="college-name">${selected.college || 'SPARK Partner Institute'}</div>
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
                                  <td>${l.links ? `<a href="${l.links}" target="_blank" style="color: #3b82f6; text-decoration: underline;">${l.links}</a>` : 'â€“'}</td>
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
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-0.5">ðŸ“„ {selectedDocs.certificateFile}</p>
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
                    ðŸ” View Fullscreen
                  </button>
                </div>
              )}
              {selectedDocs.presentationFile && (
                <div className="p-4 bg-slate-50 dark:bg-dark-850 rounded-xl border border-slate-200 dark:border-dark-750 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Presentation File</p>
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-0.5">ðŸ“Š {selectedDocs.presentationFile}</p>
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
                    ðŸ” View slides
                  </button>
                </div>
              )}
              {selectedDocs.documentFile && (
                <div className="p-4 bg-slate-50 dark:bg-dark-850 rounded-xl border border-slate-200 dark:border-dark-750 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Project Document</p>
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-0.5">ðŸ“ {selectedDocs.documentFile}</p>
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
                    ðŸ” View Pages
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
                <p className="text-slate-400 text-xs mt-4 font-bold uppercase tracking-wider">ðŸ“„ Certificate: {fullscreenDoc.title}</p>
              </div>
            );
          } else if (fullscreenDoc.type === 'presentation') {
            return <FilePreviewPlaceholder title={fullscreenDoc.title} type="presentation" />;
          } else if (fullscreenDoc.type === 'document') {
            return <FilePreviewPlaceholder title={fullscreenDoc.title} type="document" />;
          }
          return null;
        })()}
      </Modal>
    </div>
  );
};

// ---- Logs Page ----
export const MentorLogs = () => {
  const { user } = useAuth();
  const { showToast, ToastComponent } = useToast();
  const [logs, setLogs] = useState(() => getLogsByMentor(user.id));
  const [reviewModal, setReviewModal] = useState(null);
  const [review, setReview] = useState('');

  const handleApprove = () => {
    updateLog(reviewModal.id, { reviewStatus: 'approved', review });
    setLogs(prev => prev.map(l => l.id === reviewModal.id ? { ...l, reviewStatus: 'approved', review } : l));
    showToast('Log reviewed & approved!', 'success');
    setReviewModal(null);
    setReview('');
  };

  const handleReject = () => {
    updateLog(reviewModal.id, { reviewStatus: 'rejected', review });
    setLogs(prev => prev.map(l => l.id === reviewModal.id ? { ...l, reviewStatus: 'rejected', review } : l));
    showToast('Log rejected.', 'error');
    setReviewModal(null);
    setReview('');
  };

  const statusColor = { approved: 'green', rejected: 'red', pending: 'yellow' };

  return (
    <div className="animate-fade-in">
      {ToastComponent}
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-slate-900 dark:text-white">Student Logs</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Review daily activity logs submitted by your students</p>
      </div>

      {logs.length === 0 ? (
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
