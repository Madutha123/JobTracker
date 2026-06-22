import { useState, useEffect } from 'react';

/* ── SVG Icons ─────────────────────────────────────────── */
function XIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function LinkIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  );
}

function FileTextIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-12 h-12 text-slate-400">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

function SpinnerIcon() {
  return (
    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
  );
}

export default function ApplicationDetailsModal({ 
  isOpen, 
  onClose, 
  application, 
  attachments, 
  onStatusChange,
  onUploadAttachment,
  onDeleteAttachment,
  uploadingAttachment,
  newFileType,
  onNewFileTypeChange
}) {
  const [activeTabIdx, setActiveTabIdx] = useState(0);

  // Reset active tab index when attachments or modal changes
  useEffect(() => {
    const timer = setTimeout(() => setActiveTabIdx(0), 0);
    return () => clearTimeout(timer);
  }, [attachments, application]);

  if (!isOpen || !application) return null;

  const getMediaType = (att) => {
    const url = (att.cloudinaryUrl || '').toLowerCase();
    if (url.endsWith('.pdf')) return 'pdf';
    if (
      url.endsWith('.png') ||
      url.endsWith('.jpg') ||
      url.endsWith('.jpeg') ||
      url.endsWith('.webp') ||
      url.endsWith('.gif')
    ) {
      return 'image';
    }
    // Fallbacks
    if (att.fileType === 'CV') return 'pdf';
    if (att.fileType === 'FLIER') return 'image';
    return 'other';
  };

  const activeAttachment = attachments && attachments[activeTabIdx];
  const mediaType = activeAttachment ? getMediaType(activeAttachment) : null;

  return (
    <div className="fixed inset-0 bg-slate-900 bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center p-4 md:p-6 transition-all duration-300">
      <div 
        className="bg-white rounded-3xl shadow-2xl border border-slate-100 flex flex-col md:flex-row w-full max-w-6xl h-[90vh] max-h-[850px] overflow-hidden fade-up"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Left Side: Job & Company Details (45%) */}
        <div className="w-full md:w-[45%] flex flex-col h-full border-r border-slate-100 bg-white">
          {/* Header */}
          <div className="p-6 border-b border-slate-100 flex justify-between items-start">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-[var(--cream-light)] text-[var(--brand)] flex items-center justify-center font-display text-2xl font-bold border border-slate-200 border-opacity-50 shadow-inner">
                {application.company?.name ? application.company.name[0].toUpperCase() : 'J'}
              </div>
              <div>
                <h2 className="text-lg font-bold text-[var(--navy)] leading-tight">{application.jobTitle}</h2>
                <span className="text-sm font-semibold text-[var(--brand)]">{application.company?.name}</span>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 p-2 hover:bg-slate-50 rounded-xl transition-all"
              title="Close modal"
            >
              <XIcon />
            </button>
          </div>

          {/* Details Scroll Area */}
          <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
            
            {/* Status section */}
            <div className="flex flex-col gap-2">
              <label className="text-[10px] uppercase font-bold tracking-wider text-[var(--steel)]">Tracking Status</label>
              <div className="flex items-center gap-3">
                <select
                  value={application.status}
                  onChange={(e) => onStatusChange(application, e.target.value)}
                  className="text-sm border border-slate-200 rounded-xl px-3 py-2 bg-white text-[var(--navy)] font-semibold outline-none focus:border-[var(--brand)] transition-colors cursor-pointer"
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

            {/* Position details */}
            <div className="flex flex-col gap-3">
              <h4 className="text-xs font-bold text-[var(--steel)] uppercase tracking-wider border-b pb-1 border-slate-100">Position Details</h4>
              <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-sm">
                <div>
                  <span className="text-[var(--steel)] text-xs block">Salary Range</span>
                  <span className="text-[var(--navy)] font-semibold">{application.salaryRange || 'Not specified'}</span>
                </div>
                <div>
                  <span className="text-[var(--steel)] text-xs block">Location</span>
                  <span className="text-[var(--navy)] font-semibold">{application.location || 'Not specified'}</span>
                </div>
                <div>
                  <span className="text-[var(--steel)] text-xs block">Applied Date</span>
                  <span className="text-[var(--navy)] font-semibold">
                    {application.appliedDate 
                      ? new Date(application.appliedDate).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })
                      : 'Not specified'}
                  </span>
                </div>
                <div>
                  <span className="text-[var(--steel)] text-xs block">Job Source</span>
                  <span className="text-[var(--navy)] font-semibold">{application.source || 'Not specified'}</span>
                </div>
                
                {application.jobUrl && (
                  <div className="col-span-2">
                    <span className="text-[var(--steel)] text-xs block mb-1">Posting Link</span>
                    <a
                      href={application.jobUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[var(--brand)] font-semibold hover:underline inline-flex items-center gap-1 text-xs"
                    >
                      View Original Posting URL <LinkIcon />
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Company notes */}
            {application.company && (
              <div className="flex flex-col gap-3">
                <h4 className="text-xs font-bold text-[var(--steel)] uppercase tracking-wider border-b pb-1 border-slate-100">Company Information</h4>
                <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-sm mb-2">
                  <div>
                    <span className="text-[var(--steel)] text-xs block">Industry</span>
                    <span className="text-[var(--navy)] font-semibold">{application.company.industry || 'Not specified'}</span>
                  </div>
                  <div>
                    <span className="text-[var(--steel)] text-xs block">Website</span>
                    {application.company.website ? (
                      <a
                        href={application.company.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[var(--brand)] font-semibold hover:underline block truncate"
                      >
                        {application.company.website.replace(/^https?:\/\//, '')}
                      </a>
                    ) : (
                      <span className="text-[var(--navy)] font-semibold">Not specified</span>
                    )}
                  </div>
                </div>
                {application.company.notes && (
                  <div>
                    <span className="text-[var(--steel)] text-xs block mb-1">Company Notes</span>
                    <p className="text-xs text-[var(--steel)] italic bg-slate-50 p-3.5 rounded-xl border border-slate-100 leading-relaxed">
                      {application.company.notes}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Document Live Previewer (55%) */}
        <div className="w-full md:w-[55%] flex flex-col h-full bg-slate-900 text-white relative">
          
          {/* Tabs header */}
          <div className="p-4 bg-slate-950 border-b border-slate-800 flex justify-between items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold tracking-wider text-slate-400 uppercase">Documents ({attachments ? attachments.length : 0})</span>
              {activeAttachment && onDeleteAttachment && (
                <button
                  onClick={() => onDeleteAttachment(activeAttachment.id)}
                  className="text-red-400 hover:text-red-500 p-1.5 hover:bg-slate-800 rounded-lg transition-colors ml-2"
                  title={`Delete ${activeAttachment.fileType} attachment`}
                >
                  <TrashIcon />
                </button>
              )}
            </div>
            
            <div className="flex items-center gap-3">
              {/* Attachment selector tabs */}
              {attachments && attachments.length > 0 && (
                <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800">
                  {attachments.map((att, idx) => (
                    <button
                      key={att.id}
                      onClick={() => setActiveTabIdx(idx)}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        activeTabIdx === idx 
                          ? 'bg-[var(--brand)] text-white shadow-md' 
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {att.fileType === 'CV' ? '📄 CV' : att.fileType === 'FLIER' ? '🖼️ Flier' : '📎 Other'}
                    </button>
                  ))}
                </div>
              )}

              {/* Inline attachment upload trigger (rendered in header if we have 1 file) */}
              {attachments && attachments.length === 1 && onUploadAttachment && (
                <div className="flex items-center gap-2">
                  <select
                    value={newFileType}
                    onChange={(e) => onNewFileTypeChange(e.target.value)}
                    className="text-xs border border-slate-700 rounded-lg p-1 bg-slate-800 text-white outline-none"
                    disabled={uploadingAttachment}
                  >
                    <option value="CV">CV / Resume</option>
                    <option value="FLIER">Job Flier</option>
                    <option value="OTHER">Other</option>
                  </select>
                  
                  <label className="flex items-center gap-1 text-xs font-bold text-white cursor-pointer bg-slate-800 hover:bg-slate-700 border border-slate-700 px-2.5 py-1 rounded-lg transition-all">
                    {uploadingAttachment ? (
                      <>
                        <SpinnerIcon />
                        ...
                      </>
                    ) : (
                      <>
                        <PlusIcon />
                        Add
                      </>
                    )}
                    <input
                      type="file"
                      className="hidden"
                      onChange={onUploadAttachment}
                      disabled={uploadingAttachment}
                    />
                  </label>
                </div>
              )}
            </div>
          </div>

          {/* Canvas Main Viewport */}
          <div className="flex-1 p-6 flex items-center justify-center overflow-hidden">
            {activeAttachment ? (
              <div className="w-full h-full flex flex-col items-center justify-center">
                {mediaType === 'pdf' ? (
                  <div className="w-full h-full bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden relative shadow-lg">
                    {/* Embedded Frame */}
                    <iframe
                      src={activeAttachment.cloudinaryUrl}
                      className="w-full h-full border-none"
                      title="Resume PDF Viewer"
                    />
                  </div>
                ) : mediaType === 'image' ? (
                  <div className="w-full h-full flex items-center justify-center bg-slate-950 rounded-2xl border border-slate-800 p-2 overflow-hidden shadow-lg group relative">
                    <img 
                      src={activeAttachment.cloudinaryUrl} 
                      alt="Job Flier Preview" 
                      className="max-w-full max-h-full object-contain rounded-lg transition-transform duration-300"
                    />
                    {/* Open Image Button overlay */}
                    <a
                      href={activeAttachment.cloudinaryUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="absolute bottom-4 right-4 bg-black bg-opacity-70 text-xs text-white px-3 py-2 rounded-lg border border-slate-700 hover:bg-opacity-95 transition-all flex items-center gap-1.5"
                    >
                      <span>Open Original</span>
                      <LinkIcon />
                    </a>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-4 text-center">
                    <FileTextIcon />
                    <div>
                      <h4 className="text-sm font-bold text-slate-200 mb-1">{activeAttachment.fileType} Document</h4>
                      <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
                        This attachment format cannot be previewed directly inside the reader canvas.
                      </p>
                    </div>
                    <a
                      href={activeAttachment.cloudinaryUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-[var(--brand)] hover:bg-indigo-700 text-white font-semibold text-xs px-5 py-2.5 rounded-xl shadow-md transition-colors inline-flex items-center gap-1.5"
                    >
                      <span>Download File</span>
                      <LinkIcon />
                    </a>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4 text-center">
                <div className="opacity-60 flex flex-col items-center gap-3">
                  <FileTextIcon />
                  <div>
                    <h4 className="text-sm font-bold text-slate-300 mb-1">No Documents Uploaded</h4>
                    <p className="text-xs text-slate-500 max-w-xs leading-relaxed">
                      Attach files like a CV/Resume or Job Flier to preview them instantly in this canvas.
                    </p>
                  </div>
                </div>

                {/* If 0 files, render upload dropzone directly in canvas */}
                {attachments && attachments.length === 0 && onUploadAttachment && (
                  <div className="mt-4 p-5 bg-slate-950 border border-dashed border-slate-800 rounded-2xl max-w-sm w-full flex flex-col gap-3 items-center">
                    <div className="flex items-center gap-2 w-full justify-center">
                      <label className="text-xs text-slate-400 uppercase font-bold">Type:</label>
                      <select
                        value={newFileType}
                        onChange={(e) => onNewFileTypeChange(e.target.value)}
                        className="text-xs border border-slate-700 rounded-lg p-1.5 bg-slate-800 text-white outline-none"
                        disabled={uploadingAttachment}
                      >
                        <option value="CV">CV / Resume</option>
                        <option value="FLIER">Job Flier</option>
                        <option value="OTHER">Other</option>
                      </select>
                    </div>
                    
                    <label className="w-full flex items-center justify-center gap-2 text-xs font-bold text-white cursor-pointer bg-[var(--brand)] hover:bg-indigo-700 px-4 py-3 rounded-xl shadow-md transition-all">
                      {uploadingAttachment ? (
                        <>
                          <SpinnerIcon />
                          Uploading Attachment...
                        </>
                      ) : (
                        <>
                          <PlusIcon />
                          Upload Attachment (Max 2)
                        </>
                      )}
                      <input
                        type="file"
                        className="hidden"
                        onChange={onUploadAttachment}
                        disabled={uploadingAttachment}
                      />
                    </label>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
