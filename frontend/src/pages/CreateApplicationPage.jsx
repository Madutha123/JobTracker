import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { useToast } from '../components/Toast';

/* ── SVG Icons ─────────────────────────────────────────── */
function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
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

export default function CreateApplicationPage() {
  const navigate = useNavigate();
  const toast = useToast();

  const [form, setForm] = useState({ company: '', title: '', recruiter: '', status: 'applied' });

  const handleCreateJob = (e) => {
    e.preventDefault();
    if (!form.company.trim() || !form.title.trim()) {
      toast.error('Validation Error', 'Company name and job title are required.');
      return;
    }

    const progressMap = { applied: 1, interviewing: 3, offer: 5, rejected: 2 };
    const newJob = {
      id: Date.now().toString(),
      company: form.company.trim(),
      title: form.title.trim(),
      recruiter: form.recruiter.trim() || 'Not Assigned',
      status: form.status,
      time: 'Just now',
      progress: progressMap[form.status] || 1
    };

    let currentJobs = INITIAL_JOBS;
    const stored = localStorage.getItem('jt_jobs');
    if (stored) {
      currentJobs = JSON.parse(stored);
    }

    const updated = [newJob, ...currentJobs];
    localStorage.setItem('jt_jobs', JSON.stringify(updated));

    toast.success('Application added!', `Tracked ${newJob.title} at ${newJob.company}`);
    navigate('/applications');
  };

  const currentDate = new Date().toLocaleDateString(undefined, {
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
            <span className="db-date-display">{currentDate}</span>
          </div>
        </header>

        <div className="max-w-2xl bg-white p-8 rounded-2xl shadow-sm border border-slate-100 fade-up">
          <h2 className="text-xl font-bold text-[var(--navy)] mb-6 font-display border-b pb-3 border-slate-100">
            New Application Details
          </h2>
          <form onSubmit={handleCreateJob} className="auth-form">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="field">
                <label className="field__label" htmlFor="job-company">Company Name *</label>
                <input
                  id="job-company"
                  type="text"
                  placeholder="e.g. Google"
                  value={form.company}
                  onChange={(e) => setForm(prev => ({ ...prev, company: e.target.value }))}
                  className="field__input"
                  required
                />
              </div>
              <div className="field">
                <label className="field__label" htmlFor="job-title">Job Title *</label>
                <input
                  id="job-title"
                  type="text"
                  placeholder="e.g. Software Engineer"
                  value={form.title}
                  onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
                  className="field__input"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="field">
                <label className="field__label" htmlFor="job-recruiter">Recruiter Name</label>
                <input
                  id="job-recruiter"
                  type="text"
                  placeholder="e.g. Courtney Henry"
                  value={form.recruiter}
                  onChange={(e) => setForm(prev => ({ ...prev, recruiter: e.target.value }))}
                  className="field__input"
                />
              </div>
              <div className="field">
                <label className="field__label" htmlFor="job-status">Current Status</label>
                <select
                  id="job-status"
                  value={form.status}
                  onChange={(e) => setForm(prev => ({ ...prev, status: e.target.value }))}
                  className="field__input"
                  style={{ appearance: 'none', backgroundPosition: 'right 1rem center', backgroundRepeat: 'no-repeat' }}
                >
                  <option value="applied">Applied</option>
                  <option value="interviewing">Interviewing</option>
                  <option value="offer">Offer</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </div>

            <div className="flex gap-4 mt-6 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => navigate('/applications')}
                className="db-card-action-btn px-6 py-2.5"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary w-auto px-6 py-2.5 flex items-center gap-2"
              >
                <PlusIcon />
                Track Job
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
