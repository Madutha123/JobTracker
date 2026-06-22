import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { useToast } from '../components/Toast';
import { companyApi, applicationApi, attachmentApi } from '../services/api';

/* ── SVG Icons ─────────────────────────────────────────── */
function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

function UploadIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  );
}

function SpinnerIcon() {
  return (
    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
  );
}

export default function CreateApplicationPage() {
  const navigate = useNavigate();
  const toast = useToast();

  // Core Form Fields
  const [jobTitle, setJobTitle] = useState('');
  const [jobUrl, setJobUrl] = useState('');
  const [location, setLocation] = useState('');
  const [appliedDate, setAppliedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0]; // YYYY-MM-DD
  });
  const [status, setStatus] = useState('APPLIED');
  const [salaryRange, setSalaryRange] = useState('');
  const [source, setSource] = useState('');

  // Company autocomplete & details
  const [companyName, setCompanyName] = useState('');
  const [selectedCompanyId, setSelectedCompanyId] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showCompanyDetails, setShowCompanyDetails] = useState(false);
  const [companyWebsite, setCompanyWebsite] = useState('');
  const [companyIndustry, setCompanyIndustry] = useState('');
  const [companyNotes, setCompanyNotes] = useState('');

  // Attachments (Maximum of 2 files)
  const [attachments, setAttachments] = useState([
    { file: null, fileType: 'CV' },
    { file: null, fileType: 'FLIER' }
  ]);

  const [submitting, setSubmitting] = useState(false);
  const autocompleteRef = useRef(null);

  // Close company suggestions dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (autocompleteRef.current && !autocompleteRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch company suggestions as typing
  useEffect(() => {
    if (companyName.trim().length < 2) {
      const timer = setTimeout(() => setSuggestions([]), 0);
      return () => clearTimeout(timer);
    }

    const delayDebounceFn = setTimeout(async () => {
      try {
        const response = await companyApi.search(companyName);
        setSuggestions(response.data);
      } catch (err) {
        console.error('Failed to search companies:', err);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [companyName]);

  const handleSelectCompany = (company) => {
    setCompanyName(company.name);
    setSelectedCompanyId(company.id);
    setCompanyWebsite(company.website || '');
    setCompanyIndustry(company.industry || '');
    setCompanyNotes(company.notes || '');
    setShowSuggestions(false);
    setShowCompanyDetails(false); // Hide optional creation panel since we picked an existing one
  };

  const handleCompanyInputChange = (e) => {
    const value = e.target.value;
    setCompanyName(value);
    setSelectedCompanyId(null); // Reset ID since user is typing
    setShowSuggestions(true);
  };

  const handleFileChange = (index, e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File too large', 'Max file size allowed is 10MB.');
        return;
      }
      setAttachments(prev => {
        const updated = [...prev];
        updated[index].file = file;
        return updated;
      });
    }
  };

  const handleRemoveFile = (index) => {
    setAttachments(prev => {
      const updated = [...prev];
      updated[index].file = null;
      return updated;
    });
  };

  const handleFileTypeChange = (index, type) => {
    setAttachments(prev => {
      const updated = [...prev];
      updated[index].fileType = type;
      return updated;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!jobTitle.trim() || !companyName.trim()) {
      toast.error('Validation Error', 'Job Title and Company Name are required.');
      return;
    }

    setSubmitting(true);

    try {
      let finalCompanyId = selectedCompanyId;

      // 1. Resolve or Create the Company
      if (!finalCompanyId) {
        const companyPayload = {
          name: companyName.trim(),
          website: companyWebsite.trim() || null,
          industry: companyIndustry.trim() || null,
          notes: companyNotes.trim() || null
        };
        const companyRes = await companyApi.create(companyPayload);
        finalCompanyId = companyRes.data.id;
      }

      // 2. Create the Job Application
      const applicationPayload = {
        companyId: finalCompanyId,
        jobTitle: jobTitle.trim(),
        jobUrl: jobUrl.trim() || null,
        location: location.trim() || null,
        appliedDate: appliedDate || null,
        status: status,
        salaryRange: salaryRange.trim() || null,
        source: source.trim() || null
      };

      const applicationRes = await applicationApi.create(applicationPayload);
      const createdApp = applicationRes.data;

      // 3. Upload Attachments (if any)
      const uploadPromises = attachments
        .filter(att => att.file !== null)
        .map(att => attachmentApi.upload(createdApp.id, att.file, att.fileType));

      if (uploadPromises.length > 0) {
        await Promise.all(uploadPromises);
      }

      toast.success('Application added!', `Tracked "${jobTitle}" at "${companyName}"`);
      navigate('/applications');
    } catch (err) {
      console.error(err);
      const errMsg = err.response?.data?.detail || err.response?.data?.message || 'Failed to submit application.';
      toast.error('Submission Failed', errMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const currentDateText = new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="db-container">
      <Sidebar activeTab="create" />
      <main className="db-main">
        <header className="db-header">
          <div>
            <span className="text-xs text-[var(--steel)] uppercase tracking-wider font-semibold">New Tracking Entry</span>
            <h1 className="db-header-title">Track New Application</h1>
          </div>
          <div className="db-header-meta">
            <span className="db-date-display">{currentDateText}</span>
          </div>
        </header>

        {/* FIX: Removed vertical centering constraints so it sits perfectly below the header */}
        <div className="w-full flex justify-center p-4 mt-6">
          
          {/* Inner presentation card container */}
          <div className="w-full max-w-2xl bg-white p-8 rounded-2xl shadow-sm border border-slate-100 fade-up">
            <h2 className="text-xl font-bold text-[var(--navy)] mb-6 font-display border-b pb-3 border-slate-100">
              Application Details
            </h2>
            <form onSubmit={handleSubmit} className="auth-form">
              
              {/* Job Title & Company Name */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="field">
                  <label className="field__label" htmlFor="job-title">Job Title *</label>
                  <input
                    id="job-title"
                    type="text"
                    placeholder="e.g. Software Engineer"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    className="field__input"
                    required
                    disabled={submitting}
                  />
                </div>

                <div className="field relative" ref={autocompleteRef}>
                  <label className="field__label" htmlFor="job-company">Company Name *</label>
                  <input
                    id="job-company"
                    type="text"
                    placeholder="e.g. Google"
                    value={companyName}
                    onChange={handleCompanyInputChange}
                    onFocus={() => setShowSuggestions(true)}
                    className="field__input"
                    required
                    disabled={submitting}
                    autoComplete="off"
                  />

                  {/* Suggestions Dropdown */}
                  {showSuggestions && suggestions.length > 0 && (
                    <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-50 max-h-48 overflow-y-auto">
                      {suggestions.map((comp) => (
                        <button
                          key={comp.id}
                          type="button"
                          onClick={() => handleSelectCompany(comp)}
                          className="w-full text-left px-4 py-2 hover:bg-[var(--cream-light)] text-sm text-[var(--navy)] font-medium transition-colors"
                        >
                          {comp.name}
                          {comp.industry && <span className="text-xs text-[var(--steel)] ml-2">({comp.industry})</span>}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Optional New Company Details Toggle */}
              {!selectedCompanyId && companyName.trim() && (
                <div className="border border-dashed border-slate-200 p-4 rounded-xl bg-[var(--cream-light)] bg-opacity-30 mt-4">
                  <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-[var(--brand)] font-semibold uppercase tracking-wider">
                    <input
                      type="checkbox"
                      checked={showCompanyDetails}
                      onChange={(e) => setShowCompanyDetails(e.target.checked)}
                      className="accent-[var(--brand)]"
                    />
                    Configure details for new company "{companyName}"
                  </label>

                  {showCompanyDetails && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3 pt-3 border-t border-slate-200 border-opacity-60 fade-up">
                      <div className="field">
                        <label className="field__label" htmlFor="comp-website">Website</label>
                        <input
                          id="comp-website"
                          type="url"
                          placeholder="https://company.com"
                          value={companyWebsite}
                          onChange={(e) => setCompanyWebsite(e.target.value)}
                          className="field__input text-sm"
                          disabled={submitting}
                        />
                      </div>
                      <div className="field">
                        <label className="field__label" htmlFor="comp-industry">Industry</label>
                        <input
                          id="comp-industry"
                          type="text"
                          placeholder="e.g. Technology"
                          value={companyIndustry}
                          onChange={(e) => setCompanyIndustry(e.target.value)}
                          className="field__input text-sm"
                          disabled={submitting}
                        />
                      </div>
                      <div className="field md:col-span-2">
                        <label className="field__label" htmlFor="comp-notes">About / Notes</label>
                        <textarea
                          id="comp-notes"
                          placeholder="Brief summary or context about this company..."
                          value={companyNotes}
                          onChange={(e) => setCompanyNotes(e.target.value)}
                          className="field__input text-sm resize-none h-16"
                          disabled={submitting}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Location & Job URL */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="field">
                  <label className="field__label" htmlFor="job-location">Location</label>
                  <input
                    id="job-location"
                    type="text"
                    placeholder="e.g. Colombo, Remote"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="field__input"
                    disabled={submitting}
                  />
                </div>
                <div className="field">
                  <label className="field__label" htmlFor="job-url">Job URL</label>
                  <input
                    id="job-url"
                    type="url"
                    placeholder="e.g. https://linkedin.com/jobs/..."
                    value={jobUrl}
                    onChange={(e) => setJobUrl(e.target.value)}
                    className="field__input"
                    disabled={submitting}
                  />
                </div>
              </div>

              {/* Salary Range & Job Source */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="field">
                  <label className="field__label" htmlFor="job-salary">Salary Range</label>
                  <input
                    id="job-salary"
                    type="text"
                    placeholder="e.g. $80,000 - $100,000"
                    value={salaryRange}
                    onChange={(e) => setSalaryRange(e.target.value)}
                    className="field__input"
                    disabled={submitting}
                  />
                </div>
                <div className="field">
                  <label className="field__label" htmlFor="job-source">Source</label>
                  <input
                    id="job-source"
                    type="text"
                    placeholder="e.g. LinkedIn, Referral"
                    value={source}
                    onChange={(e) => setSource(e.target.value)}
                    className="field__input"
                    disabled={submitting}
                  />
                </div>
              </div>

              {/* Status & Applied Date */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="field">
                  <label className="field__label" htmlFor="job-date">Applied Date</label>
                  <input
                    id="job-date"
                    type="date"
                    value={appliedDate}
                    onChange={(e) => setAppliedDate(e.target.value)}
                    className="field__input"
                    disabled={submitting}
                  />
                </div>

                <div className="field">
                  <label className="field__label" htmlFor="job-status">Current Status</label>
                  <select
                    id="job-status"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="field__input"
                    style={{ appearance: 'none', backgroundPosition: 'right 1rem center', backgroundRepeat: 'no-repeat' }}
                    disabled={submitting}
                  >
                    <option value="APPLIED">Applied</option>
                    <option value="UNDER_REVIEW">Under Review</option>
                    <option value="INTERVIEW_SCHEDULED">Interview Scheduled</option>
                    <option value="INTERVIEWED">Interviewed</option>
                    <option value="OFFER">Offer</option>
                    <option value="REJECTED">Rejected</option>
                    <option value="WITHDRAWN">Withdrawn</option>
                  </select>
                </div>
              </div>

              {/* Attachments Section (Maximum of 2 Files) */}
              <div className="mt-6 border-t border-slate-100 pt-6">
                <span className="field__label mb-3 block">Attachments (Max 2 files, 10MB limit)</span>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {attachments.map((att, idx) => (
                    <div key={idx} className="border border-slate-200 border-opacity-70 p-4 rounded-xl flex flex-col gap-3 bg-[var(--white)] shadow-sm">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-[var(--steel)] uppercase">Attachment {idx + 1}</span>
                        {att.file && (
                          <button
                            type="button"
                            onClick={() => handleRemoveFile(idx)}
                            className="text-red-500 hover:text-red-700 p-1 rounded-lg transition-colors hover:bg-red-50"
                            title="Remove file"
                          >
                            <TrashIcon />
                          </button>
                        )}
                      </div>

                      {!att.file ? (
                        <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 hover:border-[var(--brand)] rounded-lg p-5 cursor-pointer transition-colors bg-[var(--cream-light)] bg-opacity-20 group">
                          <UploadIcon />
                          <span className="text-xs text-[var(--steel)] group-hover:text-[var(--brand)] mt-2 font-medium">Select file</span>
                          <input
                            type="file"
                            className="hidden"
                            onChange={(e) => handleFileChange(idx, e)}
                            disabled={submitting}
                          />
                        </label>
                      ) : (
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center gap-2 text-xs font-semibold text-[var(--navy)] truncate">
                            <span className="bg-slate-100 px-2 py-0.5 rounded text-[10px] text-[var(--steel)] truncate">
                              {att.file.name}
                            </span>
                            <span className="text-[var(--steel)] text-[10px]">
                              ({(att.file.size / (1024 * 1024)).toFixed(2)} MB)
                            </span>
                          </div>

                          {/* File Type Selector */}
                          <div className="flex items-center gap-2 mt-1">
                            <label className="text-[10px] uppercase font-bold text-[var(--steel)]">Type:</label>
                            <select
                              value={att.fileType}
                              onChange={(e) => handleFileTypeChange(idx, e.target.value)}
                              className="text-xs border border-slate-200 rounded px-2 py-1 bg-white text-[var(--navy)] outline-none"
                              disabled={submitting}
                            >
                              <option value="CV">CV / Resume</option>
                              <option value="FLIER">Job Flier</option>
                              <option value="OTHER">Other</option>
                            </select>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 mt-6 pt-6 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => navigate('/applications')}
                  className="db-card-action-btn px-6 py-2.5"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary w-auto px-6 py-2.5 flex items-center gap-2"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <SpinnerIcon />
                      Saving...
                    </>
                  ) : (
                    <>
                      <PlusIcon />
                      Track Application
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}