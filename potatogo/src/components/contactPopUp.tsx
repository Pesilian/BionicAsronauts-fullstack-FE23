import React, { useState } from 'react';
import styles from '../styles/contactPopUp.module.css';

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
    <div className={styles.contactPopupOverlay} onClick={handleOverlayClick}>
      <div className={styles.contactPopupContent}>
        <button className={styles.closeButton} onClick={onClose}>
          &times;
        </button>
        <h2>Contact us!</h2>
        <p>Do you have any questions or suggestions, please contact us!</p>
        <div className={styles.contactDetails}>
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
        <div className={styles.messageForm}>
          <textarea
            placeholder="Write message here"
            value={message}
            onChange={e => setMessage(e.target.value)}
          ></textarea>
          {error && <p className={styles.errorMessage}>{error}</p>}
          {success && <p className={styles.successMessage}>Message sent</p>}
          <button className={styles.sendButton} onClick={handleSendMessage}>
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default ContactPopup;
