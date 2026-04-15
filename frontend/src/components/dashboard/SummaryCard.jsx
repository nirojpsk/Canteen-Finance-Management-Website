import Card from "react-bootstrap/Card";

const SummaryCard = ({ label, value, tone = "primary", helper }) => (
  <Card className={`summary-card summary-card-${tone}`}>
    <Card.Body>
      <p className="summary-label">{label}</p>
      <div className="summary-value">{value}</div>
      {helper ? <p className="summary-helper">{helper}</p> : null}
    </Card.Body>
  </Card>
);

export default SummaryCard;
