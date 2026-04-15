const Loader = ({ label = "Loading" }) => (
  <div className="d-inline-flex align-items-center gap-2 text-muted" role="status">
    <span className="spinner-border spinner-border-sm" aria-hidden="true" />
    <span>{label}</span>
  </div>
);

export default Loader;
