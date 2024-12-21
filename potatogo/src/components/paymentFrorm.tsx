import React, { useState } from "react";
import '../styles/paymentForm.css';

const PaymentForm: React.FC = () => {
  const [totalPrice, setTotalPrice] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<string>("");

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTotalPrice(parseFloat(e.target.value));
  };

  const handlePaymentMethodChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPaymentMethod(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log(`Total Price: $${totalPrice}, Payment Method: ${paymentMethod}`);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="totalPrice">Total Price: </label>
        <input
          type="number"
          id="totalPrice"
          value={totalPrice}
          onChange={handlePriceChange}
          min="0"
          step="0.01"
        />
      </div>
      <div>
        <label htmlFor="paymentMethod">Payment Method: </label>
        <select
          id="paymentMethod"
          value={paymentMethod}
          onChange={handlePaymentMethodChange}
        >
          <option value="">Select a method</option>
          <option value="creditCard">Credit Card</option>
          <option value="paypal">PayPal</option>
        </select>
      </div>
      <button type="submit">Pay</button>
    </form>
  );
};

export default PaymentForm;
