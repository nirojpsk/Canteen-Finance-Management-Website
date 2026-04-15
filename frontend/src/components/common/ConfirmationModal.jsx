import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";

const ConfirmationModal = ({
  show,
  title = "Confirm action",
  message = "Are u sure, u want to delete?",
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  confirmVariant = "danger",
  isLoading = false,
  onCancel,
  onConfirm,
}) => (
  <Modal show={show} onHide={onCancel} centered className="confirmation-modal">
    <Modal.Header closeButton>
      <Modal.Title>{title}</Modal.Title>
    </Modal.Header>
    <Modal.Body>{message}</Modal.Body>
    <Modal.Footer>
      <Button variant="outline-secondary" onClick={onCancel} disabled={isLoading}>
        {cancelLabel}
      </Button>
      <Button variant={confirmVariant} onClick={onConfirm} disabled={isLoading}>
        {isLoading ? "Working..." : confirmLabel}
      </Button>
    </Modal.Footer>
  </Modal>
);

export default ConfirmationModal;
