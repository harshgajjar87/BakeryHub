import React from 'react';
import { Modal, Button } from 'react-bootstrap';

const OrderConfirmationModal = ({ show, onHide, onConfirm }) => {
  return (
    <Modal 
      show={show} 
      onHide={onHide} 
      centered
      backdrop="static"
      keyboard={false}
    >
      <Modal.Header closeButton>
        <Modal.Title>Order Confirmation</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="text-center mb-4">
          <i className="fas fa-info-circle fa-3x bakery-text-gold mb-3"></i>
          <h5>Important Information</h5>
        </div>
        <p>
          After clicking the "Confirm Order" button, your request for this cake order will be sent to our baker.
        </p>
        <p>
          He will review your order details and requirements. Once your order is approved, you will receive a notification.
        </p>
        <p>
          Only after approval will you be able to proceed with payment.
        </p>
        <div className="alert alert-warning">
          <i className="fas fa-exclamation-triangle me-2"></i>
          <strong>Please note:</strong> This is not an immediate confirmation. Our team will review your order and notify you of the approval status.
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Cancel
        </Button>
        <Button variant="primary" onClick={onConfirm}>
          Confirm Order
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default OrderConfirmationModal;
