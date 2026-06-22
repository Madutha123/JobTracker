import { useState } from 'react';
import Sidebar from '../components/Sidebar';

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

export default function DashboardPage() {
  const [jobs, setJobs] = useState(() => {
    const stored = localStorage.getItem('jt_jobs');
    if (stored) return JSON.parse(stored);
    localStorage.setItem('jt_jobs', JSON.stringify(INITIAL_JOBS));
    return INITIAL_JOBS;
  });
  const [selectedJobId, setSelectedJobId] = useState('2');

  const handleDeleteJob = (id) => {
    const updated = jobs.filter(j => j.id !== id);
    setJobs(updated);
    localStorage.setItem('jt_jobs', JSON.stringify(updated));
  };

  const currentDate = new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="db-container">
      <Sidebar activeTab="dashboard" />
      <main className="db-main">
        <header className="db-header">
          <div>
            <span className="text-xs text-[var(--steel)] uppercase tracking-wider font-semibold">Overview</span>
            <h1 className="db-header-title">Dashboard Summary</h1>
          </div>
          <div className="db-header-meta">
            <span className="db-date-display">{currentDate}</span>
          </div>
        </header>

        <div className="flex flex-col gap-6 fade-up">
          {/* Stat Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col gap-1">
              <span className="text-xs text-[var(--steel)] font-semibold uppercase">Total Applications</span>
              <span className="text-3xl font-bold text-[var(--navy)]">{jobs.length}</span>
            </div>
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col gap-1">
              <span className="text-xs text-[var(--steel)] font-semibold uppercase">Interviewing</span>
              <span className="text-3xl font-bold text-[var(--brand)]">
                {jobs.filter(j => j.status === 'interviewing').length}
              </span>
            </div>
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col gap-1">
              <span className="text-xs text-[var(--steel)] font-semibold uppercase">Offers Received</span>
              <span className="text-3xl font-bold text-emerald-600">
                {jobs.filter(j => j.status === 'offer').length}
              </span>
            </div>
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col gap-1">
              <span className="text-xs text-[var(--steel)] font-semibold uppercase">Success Rate</span>
              <span className="text-3xl font-bold text-[var(--navy)]">
                {jobs.length ? Math.round((jobs.filter(j => j.status === 'offer').length / jobs.length) * 100) : 0}%
              </span>
            </div>
          </div>

          {/* Quick overview of latest applications */}
          <div className="db-section">
            <div className="db-section-header">
              <h2 className="db-section-title">Recent Activity</h2>
            </div>
            <div className="db-applied-list">
              {jobs.slice(0, 3).map(job => (
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
              ))}
              {jobs.length === 0 && (
                <div className="db-empty-state">
                  <h3 className="db-empty-title">No applications tracked yet</h3>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
