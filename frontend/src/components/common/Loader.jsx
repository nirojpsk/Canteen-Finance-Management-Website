const Loader = ({ label = "Loading" }) => (
  <div className="premium-loader d-inline-flex align-items-center gap-2 text-muted" role="status">
    <span className="spinner-border spinner-border-sm" aria-hidden="true" />
    <span className="premium-loader-label">{label}</span>
  </div>
);

export default Loader;
