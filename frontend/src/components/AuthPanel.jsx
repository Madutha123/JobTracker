import authPanelImg from '../assets/auth_panel.png';

/**
 * Left-side decorative panel shared by Login and Register.
 */
export default function AuthPanel() {
  return (
    <aside className="auth-panel">
      <img
        src={authPanelImg}
        alt="Abstract job tracking illustration"
        className="auth-panel__img"
      />
      <div className="auth-panel__overlay" />

      <div className="auth-panel__brand">
        <span className="auth-panel__brand-dot" />
        <span className="auth-panel__brand-name">JobTracker</span>
      </div>

      <div className="auth-panel__tagline">
        <h2>Every application.<br />One clear view.</h2>
        <p>Track roles, follow up on time, and land the job that fits.</p>
      </div>
    </aside>
  );
}
