import React, { useState } from 'react';
import '../styles/contactPopUp.css';

interface ContactPopupProps {
  onClose: () => void;
}

const ContactPopup: React.FC<ContactPopupProps> = ({ onClose }) => {
  const [message, setMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSendMessage = () => {
    if (!message.trim()) {
      setError('Meddelandet kan inte vara tomt.');
      return;
    }
    setError(null);
    setSuccess(true);
    setMessage('');
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="contact-popup-overlay" onClick={handleOverlayClick}>
      <div className="contact-popup-content">
        <button className="close-button" onClick={onClose}>
          &times;
        </button>
        <h2>Contact us!</h2>
        <p>Do you have any questions or suggestions, please contact us!</p>
        <div className="contact-details">
          <p>
            <strong>Phone:</strong> 123-456-789
          </p>
          <p>
            <strong>Email:</strong> kontakt@potatogo.com
          </p>
          <p>
            <strong>Adress:</strong> Streetst. 12, 123 45 City
          </p>
        </div>
        <div className="message-form">
          <textarea
            placeholder="Write message here"
            value={message}
            onChange={e => setMessage(e.target.value)}
          ></textarea>
          {error && <p className="error-message">{error}</p>}
          {success && <p className="success-message">Message sent</p>}
          <button className="send-button" onClick={handleSendMessage}>
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default ContactPopup;
