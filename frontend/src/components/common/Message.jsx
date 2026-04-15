import Alert from "react-bootstrap/Alert";

const Message = ({ children, variant = "info", className = "" }) => {
  if (!children) {
    return null;
  }

  return (
    <Alert variant={variant} className={className}>
      {children}
    </Alert>
  );
};

export default Message;
