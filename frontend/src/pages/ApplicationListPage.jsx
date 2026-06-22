import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { useToast } from '../components/Toast';
import { applicationApi, attachmentApi, companyApi } from '../services/api';
import ApplicationDetailsModal from '../components/ApplicationDetailsModal';

/* ── SVG Icons ─────────────────────────────────────────── */
function BriefcaseIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-12 h-12">
      <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

// Unused icons deleted to satisfy no-unused-vars rule

function SpinnerIcon() {
  return (
    <svg className="animate-spin h-5 w-5 text-[var(--brand)]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
  );
}

export default function ApplicationListPage() {
  const toast = useToast();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [modalInitialEditMode, setModalInitialEditMode] = useState(false);

  // Attachments State
  const [attachments, setAttachments] = useState([]);
  const [uploadingAttachment, setUploadingAttachment] = useState(false);
  const [newFileType, setNewFileType] = useState('CV');

  // Custom Delete Confirmation Modal State
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, id: null, title: '', company: '' });


  useEffect(() => {
    let active = true;
    const loadApps = async () => {
      try {
        const res = await applicationApi.getAll();
        if (active) {
          setJobs(res.data);
          setLoading(false);
        }
      } catch (err) {
        if (active) {
          toast.error('Failed to load applications', err.response?.data?.message || 'Connection error.');
          setLoading(false);
        }
      }
    };
    loadApps();
    return () => {
      active = false;
    };
  }, [toast]);

  // Fetch attachments whenever the selected job changes
  useEffect(() => {
    if (!selectedJobId) {
      const timer = setTimeout(() => setAttachments([]), 0);
      return () => clearTimeout(timer);
    }

    let active = true;
    const fetchAttachments = async () => {
      try {
        const res = await attachmentApi.getAll(selectedJobId);
        if (active) {
          setAttachments(res.data);
        }
      } catch (err) {
        console.error('Failed to fetch attachments:', err);
      }
    };

    fetchAttachments();
    return () => {
      active = false;
    };
  }, [selectedJobId]);

  const triggerDeleteConfirm = (id, title, company) => {
    setDeleteConfirm({ isOpen: true, id, title, company });
  };

  const executeDeleteJob = async () => {
    const { id, title } = deleteConfirm;
    try {
      await applicationApi.delete(id);
      setJobs(prev => prev.filter(j => j.id !== id));
      if (selectedJobId === id) {
        setSelectedJobId(null);
      }
      toast.success('Removed application', `No longer tracking ${title}`);
    } catch (err) {
      toast.error('Delete failed', err.response?.data?.message || 'Could not delete application.');
    } finally {
      setDeleteConfirm({ isOpen: false, id: null, title: '', company: '' });
    }
  };

  const handleStatusChange = async (job, newStatus) => {
    try {
      const payload = {
        companyId: job.company.id,
        jobTitle: job.jobTitle,
        jobUrl: job.jobUrl,
        location: job.location,
        appliedDate: job.appliedDate,
        status: newStatus,
        salaryRange: job.salaryRange,
        source: job.source
      };
      const res = await applicationApi.update(job.id, payload);
      setJobs(prev => prev.map(j => j.id === job.id ? res.data : j));
      toast.success('Status updated', `Updated status to "${newStatus}"`);
    } catch (err) {
      toast.error('Failed to update status', err.response?.data?.message || 'Update failed.');
    }
  };

  const handleUploadInlineAttachment = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File too large', 'Max file size allowed is 10MB.');
      return;
    }

    try {
      setUploadingAttachment(true);
      const res = await attachmentApi.upload(selectedJobId, file, newFileType);
      setAttachments(prev => [...prev, res.data]);
      toast.success('File uploaded!', 'Attachment successfully stored.');
    } catch (err) {
      toast.error('Upload failed', err.response?.data?.message || 'Failed to upload attachment.');
    } finally {
      setUploadingAttachment(false);
      e.target.value = null; // Clear file input
    }
  };

  const handleDeleteAttachment = async (attachmentId) => {
    try {
      await attachmentApi.delete(selectedJobId, attachmentId);
      setAttachments(prev => prev.filter(att => att.id !== attachmentId));
      toast.success('File deleted', 'Attachment successfully removed.');
    } catch (err) {
      toast.error('Deletion failed', err.response?.data?.message || 'Failed to delete attachment.');
    }
  };

  // Status mapping to progress block count (1-5)
  const getProgressCount = (status) => {
    switch (status) {
      case 'APPLIED': return 1;
      case 'UNDER_REVIEW': return 2;
      case 'INTERVIEW_SCHEDULED': return 3;
      case 'INTERVIEWED': return 4;
      case 'OFFER':
      case 'REJECTED':
      case 'WITHDRAWN':
        return 5;
      default: return 1;
    }
  };

  const filteredJobs = jobs.filter(job => {
    const query = searchQuery.toLowerCase();
    return (
      job.jobTitle.toLowerCase().includes(query) ||
      (job.company?.name || '').toLowerCase().includes(query) ||
      (job.location || '').toLowerCase().includes(query) ||
      (job.source || '').toLowerCase().includes(query) ||
      job.status.toLowerCase().includes(query)
    );
  });

  const currentDate = new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric'
  });

  const handleOpenDetails = (jobId) => {
    setSelectedJobId(jobId);
    setModalInitialEditMode(false);
    setIsDetailsOpen(true);
  };

  const handleEditClick = (e, jobId) => {
    e.stopPropagation();
    setSelectedJobId(jobId);
    setModalInitialEditMode(true);
    setIsDetailsOpen(true);
  };

  const handleSaveDetails = async (jobId, jobPayload, companyId, companyPayload) => {
    try {
      if (companyId) {
        await companyApi.update(companyId, companyPayload);
      }
      const res = await applicationApi.update(jobId, jobPayload);
      setJobs(prev => prev.map(j => j.id === jobId ? res.data : j));
      toast.success('Changes saved', 'Details updated successfully.');
    } catch (err) {
      console.error(err);
      toast.error('Save failed', err.response?.data?.message || 'Could not update details.');
      throw err;
    }
  };

  return (
    <div className="db-container">
      <Sidebar activeTab="applications" />
      <main className="db-main">
        <header className="db-header">
          <div>
            <span className="text-xs text-[var(--steel)] uppercase tracking-wider font-semibold">My Tracker</span>
            <h1 className="db-header-title">Applied Jobs</h1>
          </div>
          <div className="db-header-meta">
            <span className="db-date-display">{currentDate}</span>
          </div>
        </header>

        <div className="flex flex-col gap-6 fade-up">
          {/* Search filter wrapper */}
          <div className="db-search-wrapper">
            <span className="db-search-icon">
              <SearchIcon />
            </span>
            <input
              type="text"
              placeholder="Search jobs by title, company, location, source or status..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="db-search-input"
            />
          </div>

          <div className="db-section">
            <div className="db-section-header">
              <h2 className="db-section-title">
                {searchQuery ? `Search Results (${filteredJobs.length})` : `All Tracked Jobs (${jobs.length})`}
              </h2>
            </div>

            <div className="db-applied-list">
              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <SpinnerIcon />
                  <span className="ml-3 text-sm text-[var(--steel)] font-medium">Fetching applications...</span>
                </div>
              ) : filteredJobs.length > 0 ? (
                filteredJobs.map(job => {
                  const isSelected = selectedJobId === job.id;
                  const progressVal = getProgressCount(job.status);
                  
                  return (
                    <div
                      key={job.id}
                      className={`db-job-card cursor-pointer flex flex-col gap-4${isSelected ? ' db-job-card--selected' : ''}`}
                      onClick={() => handleOpenDetails(job.id)}
                    >
                      {/* Main Job Card Row */}
                      <div className="flex items-center justify-between w-full flex-wrap gap-4">
                        <div className="db-job-main">
                          <div className="db-company-logo">
                            {job.company?.name ? job.company.name[0].toUpperCase() : 'J'}
                          </div>
                          <div className="db-job-details">
                            <h3 className="db-job-title">{job.jobTitle}</h3>
                            <div className="db-company-meta">
                              <span className="font-semibold text-[var(--navy)]">{job.company?.name}</span>
                              {job.location && (
                                <>
                                  <span className="db-meta-dot" />
                                  <span>{job.location}</span>
                                </>
                              )}
                              {job.appliedDate && (
                                <>
                                  <span className="db-meta-dot" />
                                  <span>Applied: {new Date(job.appliedDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="db-job-status-section">
                          <span className={`db-status-badge db-status-badge--${job.status.toLowerCase()}`}>
                            {job.status.replace('_', ' ')}
                          </span>
                          <div className="db-progress-wrapper">
                            <span className="db-progress-label">Progress</span>
                            <div className="db-progress-blocks">
                              {[1, 2, 3, 4, 5].map(b => (
                                <span
                                  key={b}
                                  className={`db-progress-block${b <= progressVal ? ' db-progress-block--filled' : ''}`}
                                  style={{
                                    backgroundColor: b <= progressVal 
                                      ? (job.status === 'REJECTED' ? '#c0392b' : job.status === 'OFFER' ? '#27ae60' : 'var(--brand)')
                                      : 'rgba(114, 136, 174, 0.2)'
                                  }}
                                />
                              ))}
                            </div>
                          </div>
                          <button
                            onClick={(e) => handleEditClick(e, job.id)}
                            className="db-card-action-btn border border-indigo-200 text-[var(--brand)] hover:bg-indigo-50 hover:border-indigo-400 mr-2"
                          >
                            Edit
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              triggerDeleteConfirm(job.id, job.jobTitle, job.company?.name);
                            }}
                            className="db-card-action-btn border border-red-200 text-red-500 hover:bg-red-50 hover:border-red-400"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="db-empty-state">
                  <BriefcaseIcon />
                  <h3 className="db-empty-title">No applications found</h3>
                  <p className="db-empty-desc">
                    Try adjusting your search query, or navigate to "Create Application" to add a new job.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Application Details Modal */}
      <ApplicationDetailsModal
        isOpen={isDetailsOpen}
        onClose={() => {
          setIsDetailsOpen(false);
          setSelectedJobId(null);
        }}
        application={jobs.find(j => j.id === selectedJobId)}
        attachments={attachments}
        onStatusChange={handleStatusChange}
        onUploadAttachment={handleUploadInlineAttachment}
        onDeleteAttachment={handleDeleteAttachment}
        uploadingAttachment={uploadingAttachment}
        newFileType={newFileType}
        onNewFileTypeChange={setNewFileType}
        initialEditMode={modalInitialEditMode}
        onSaveDetails={handleSaveDetails}
      />

      {/* Custom Delete Confirmation Modal */}
      {deleteConfirm.isOpen && (
        <div className="fixed inset-0 bg-slate-900 bg-opacity-40 backdrop-blur-[2px] z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-slate-100 fade-up flex flex-col gap-4">
            <div className="flex items-center gap-3 text-red-500">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <h3 className="text-lg font-bold text-[var(--navy)]">Delete Application</h3>
            </div>
            <p className="text-sm text-[var(--steel)] leading-relaxed">
              Are you sure you want to stop tracking <strong className="text-[var(--navy)]">"{deleteConfirm.title}"</strong> at <strong className="text-[var(--navy)]">"{deleteConfirm.company}"</strong>? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3 mt-2">
              <button
                onClick={() => setDeleteConfirm({ isOpen: false, id: null, title: '', company: '' })}
                className="db-card-action-btn px-4 py-2 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={executeDeleteJob}
                className="bg-red-500 hover:bg-red-600 text-white font-semibold text-xs px-4 py-2 rounded-lg transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

