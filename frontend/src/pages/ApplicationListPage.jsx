import { useState } from 'react';
import Sidebar from '../components/Sidebar';

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
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

const INITIAL_JOBS = [
  { id: '1', company: 'Google', title: 'Software Engineer', recruiter: 'Courtney Henry', status: 'interviewing', time: 'Yesterday', progress: 3 },
  { id: '2', company: 'Stripe', title: 'Frontend Developer', recruiter: 'Esther Howard', status: 'offer', time: '3 days ago', progress: 5, selected: true },
  { id: '3', company: 'Figma', title: 'Product Designer', recruiter: 'Arlene McCoy', status: 'applied', time: 'Just now', progress: 1 },
  { id: '4', company: 'Netflix', title: 'Senior React Dev', recruiter: 'Kristin Watson', status: 'interviewing', time: '1 week ago', progress: 4 },
  { id: '5', company: 'Apple', title: 'Frontend Engineer', recruiter: 'Jacob Jones', status: 'applied', time: '2 weeks ago', progress: 2 },
  { id: '6', company: 'Vercel', title: 'UI Engineer', recruiter: 'Ronald Richards', status: 'offer', time: '1 month ago', progress: 5 },
  { id: '7', company: 'Slack', title: 'Staff Engineer', recruiter: 'Darlene Robertson', status: 'rejected', time: '2 months ago', progress: 2 },
  { id: '8', company: 'Linear', title: 'Developer Advocate', recruiter: 'Brooklyn Simmons', status: 'interviewing', time: '3 weeks ago', progress: 4 },
  { id: '9', company: 'Discord', title: 'Engineering Manager', recruiter: 'Wade Warren', status: 'offer', time: '1 month ago', progress: 5 },
  { id: '10', company: 'Notion', title: 'Frontend Developer', recruiter: 'Jane Cooper', status: 'applied', time: '2 weeks ago', progress: 1 }
];

export default function ApplicationListPage() {
  const [jobs, setJobs] = useState(() => {
    const stored = localStorage.getItem('jt_jobs');
    if (stored) return JSON.parse(stored);
    localStorage.setItem('jt_jobs', JSON.stringify(INITIAL_JOBS));
    return INITIAL_JOBS;
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedJobId, setSelectedJobId] = useState('2');

  const handleDeleteJob = (id) => {
    const updated = jobs.filter(j => j.id !== id);
    setJobs(updated);
    localStorage.setItem('jt_jobs', JSON.stringify(updated));
  };

  const filteredJobs = jobs.filter(job =>
    job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job.recruiter.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job.status.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const currentDate = new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric'
  });

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
            <SearchIcon />
            <input
              type="text"
              placeholder="Search jobs by title, company, recruiter or status..."
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
              {filteredJobs.length > 0 ? (
                filteredJobs.map(job => (
                  <div
                    key={job.id}
                    onClick={() => setSelectedJobId(job.id)}
                    className={`db-job-card cursor-pointer${selectedJobId === job.id ? ' db-job-card--selected' : ''}`}
                  >
                    <div className="db-job-main">
                      <div className="db-company-logo">
                        {job.company[0]}
                      </div>
                      <div className="db-job-details">
                        <h3 className="db-job-title">{job.title}</h3>
                        <div className="db-company-meta">
                          <span>{job.company}</span>
                          <span className="db-meta-dot" />
                          <span>Recruiter: {job.recruiter}</span>
                          <span className="db-meta-dot" />
                          <span>{job.time}</span>
                        </div>
                      </div>
                    </div>
                    <div className="db-job-status-section">
                      <span className={`db-status-badge db-status-badge--${job.status}`}>
                        {job.status}
                      </span>
                      <div className="db-progress-wrapper">
                        <span className="db-progress-label">Progress</span>
                        <div className="db-progress-blocks">
                          {[1, 2, 3, 4, 5].map(b => (
                            <span
                              key={b}
                              className={`db-progress-block${b <= job.progress ? ' db-progress-block--filled' : ''}`}
                            />
                          ))}
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteJob(job.id);
                        }}
                        className="db-card-action-btn"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))
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
    </div>
  );
}
