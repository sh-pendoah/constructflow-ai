"use client";

import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import Modal from "@/components/modal";
import Input from "@/components/input";

interface UpdatePaymentMethodModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (data: {
    cardNumber: string;
    expiryDate: string;
    cvv: string;
    cardholderName: string;
  }) => void;
}

const UpdatePaymentMethodModal: React.FC<UpdatePaymentMethodModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [cardNumber, setCardNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");
  const [cardholderName, setCardholderName] = useState("");

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setCardNumber("");
      setExpiryDate("");
      setCvv("");
      setCardholderName("");
    }
  }, [isOpen]);

  const handleSubmit = () => {
    if (!cardNumber.trim() || !expiryDate.trim() || !cvv.trim() || !cardholderName.trim()) {
      return;
    }
    onSubmit?.({
      cardNumber,
      expiryDate,
      cvv,
      cardholderName,
    });
    onClose();
  };

  // Format card number with spaces
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = e.target.value.replace(/\s+/g, "").replace(/\D/g, "");
    const formatted = value.match(/.{1,4}/g)?.join(" ") || value;
    setCardNumber(formatted.slice(0, 19)); // Max 16 digits + 3 spaces
  };

  // Format expiry date as MM/YY
  const handleExpiryDateChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = e.target.value.replace(/\D/g, "");
    let formatted = value;
    if (value.length >= 2) {
      formatted = value.slice(0, 2) + "/" + value.slice(2, 4);
    }
    setExpiryDate(formatted.slice(0, 5));
  };

  // Limit CVV to 3-4 digits
  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 4);
    setCvv(value);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="672px">
      <div className="flex flex-col" style={{ padding: "24px 32px 32px", gap: "32px" }}>
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-h3 text-primary font-poppins font-semibold">
            Update Payment Method
          </h2>
          <button
            onClick={onClose}
            className="w-11 h-11 flex items-center justify-center text-primary hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Fields */}
        <div className="flex flex-col" style={{ gap: "16px" }}>
          {/* New Card Number */}
          <Input
            label="New Card Number"
            type="text"
            value={cardNumber}
            onChange={handleCardNumberChange}
            labelStyle="supporting"
            inputStyle="body-copy"
            name="cardNumber"
            placeholder="1234 5678 9012 3456"
          />

          {/* Card Details Row */}
          <div className="flex flex-row" style={{ gap: "20px" }}>
            {/* Expiry Date */}
            <div className="flex-1">
              <Input
                label="Expiry Date"
                type="text"
                value={expiryDate}
                onChange={handleExpiryDateChange}
                labelStyle="supporting"
                inputStyle="body-copy"
                name="expiryDate"
                placeholder="MM/YY"
              />
            </div>

            {/* CVV */}
            <div className="flex-1">
              <Input
                label="CVV"
                type="text"
                value={cvv}
                onChange={handleCvvChange}
                labelStyle="supporting"
                inputStyle="body-copy"
                name="cvv"
                placeholder="123"
              />
            </div>
          </div>

          {/* Cardholder Name */}
          <Input
            label="Cardholder Name"
            type="text"
            value={cardholderName}
            onChange={(e) => setCardholderName(e.target.value)}
            labelStyle="supporting"
            inputStyle="body-copy"
            name="cardholderName"
            placeholder="Michael Brown"
          />
        </div>

        {/* Update Card Details Button */}
        <button
          onClick={handleSubmit}
          disabled={!cardNumber.trim() || !expiryDate.trim() || !cvv.trim() || !cardholderName.trim()}
          className="w-full h-[50px] cursor-pointer flex items-center justify-center gap-2 bg-[#1F6F66] text-[#F3F5F7] rounded-lg hover:bg-[#1a5d55] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ padding: "20px 12px" }}
        >
          <span className="text-button font-poppins font-semibold">
            Update Card Details
          </span>
        </button>
      </div>
    </Modal>
  );
};

export default UpdatePaymentMethodModal;

