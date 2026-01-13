"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { buildDeeplinkUrl } from "@seapay/deeplink";
import { useStyledQrCode } from "@seapay/deeplink/react";
import styles from "./receive.module.css";

export default function ReceivePage() {
  const router = useRouter();
  const [rawAmount, setRawAmount] = useState("0");
  const [showQrCode, setShowQrCode] = useState(false);
  const qrContainerRef = useRef<HTMLDivElement>(null);

  const formatDisplay = (value: string): string => {
    if (value === "0" || value === "") {
      return "0.00";
    }
    if (!value.includes(".")) {
      return `${value}.00`;
    }
    const parts = value.split(".");
    const integer = parts[0] || "0";
    const decimal = (parts[1] || "").padEnd(2, "0").slice(0, 2);
    return `${integer}.${decimal}`;
  };

  const displayAmount = formatDisplay(rawAmount);
  const hasAmount = rawAmount !== "0" && parseFloat(displayAmount) > 0;

  const handleNumberPress = (num: string) => {
    if (rawAmount === "0") {
      setRawAmount(num);
    } else {
      const parts = rawAmount.split(".");
      if (parts.length === 1 || !parts[1]) {
        // No decimal or empty decimal part
        setRawAmount(rawAmount + num);
      } else if (parts[1].length < 2) {
        // Add to decimal part (max 2 digits)
        setRawAmount(rawAmount + num);
      }
    }
  };

  const handleDecimalPress = () => {
    if (!rawAmount.includes(".")) {
      setRawAmount(rawAmount + ".");
    }
  };

  const handleBackspace = () => {
    if (rawAmount.length <= 1) {
      setRawAmount("0");
    } else {
      setRawAmount(rawAmount.slice(0, -1));
    }
  };

  const handleContinue = () => {
    if (hasAmount) {
      setShowQrCode(true);
    }
  };

  const handleCloseQrCode = () => {
    setShowQrCode(false);
  };

  // Build the payment URL
  const paymentUrl = (() => {
    const defaultAddress = process.env.NEXT_PUBLIC_DEFAULT_RECEIVE_ADDRESS || "";
    const params = new URLSearchParams();
    if (defaultAddress) {
      params.set("address", defaultAddress);
    }
    params.set("amount", displayAmount.replace("$", ""));
    return `https://app.seapay.ai/pay-mobile?${params.toString()}`;
  })();

  const deeplinkUrl = showQrCode ? buildDeeplinkUrl(paymentUrl) : null;

  // Render QR code
  useStyledQrCode(deeplinkUrl, qrContainerRef, {
    width: 280,
    height: 280,
  });

  if (showQrCode) {
    return (
      <div className={styles.qrContainer}>
        {/* Header */}
        <header className={styles.qrHeader}>
          <button
            className={styles.qrBackButton}
            onClick={handleCloseQrCode}
            aria-label="Close"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M15 18L9 12L15 6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <h1 className={styles.qrTitle}>SeaPay</h1>
          <div style={{ width: "24px" }} />
        </header>

        {/* QR Code Content */}
        <div className={styles.qrContent}>
          <p className={styles.qrSubtitle}>Scan to pay</p>
          <div className={styles.qrAmount}>${displayAmount}</div>
          <div
            ref={qrContainerRef}
            className={styles.qrCodeContainer}
          />
        </div>

        {/* Close Button */}
        <button
          className={styles.qrCloseButton}
          onClick={handleCloseQrCode}
          aria-label="Close"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M18 6L6 18M6 6L18 18"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <button
          className={styles.backButton}
          onClick={() => router.back()}
          aria-label="Go back"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M15 18L9 12L15 6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        <h1 className={styles.title}>SeaPay</h1>
        <div style={{ width: "24px" }} /> {/* Spacer for centering */}
      </header>

      {/* Amount Display */}
      <div className={styles.amountDisplay}>
        ${displayAmount}
      </div>

      {/* Number Pad */}
      <div className={styles.keypad}>
        <div className={styles.keypadRow}>
          <button
            className={styles.keypadKey}
            onClick={() => handleNumberPress("1")}
          >
            1
          </button>
          <button
            className={styles.keypadKey}
            onClick={() => handleNumberPress("2")}
          >
            2
          </button>
          <button
            className={styles.keypadKey}
            onClick={() => handleNumberPress("3")}
          >
            3
          </button>
        </div>
        <div className={styles.keypadRow}>
          <button
            className={styles.keypadKey}
            onClick={() => handleNumberPress("4")}
          >
            4
          </button>
          <button
            className={styles.keypadKey}
            onClick={() => handleNumberPress("5")}
          >
            5
          </button>
          <button
            className={styles.keypadKey}
            onClick={() => handleNumberPress("6")}
          >
            6
          </button>
        </div>
        <div className={styles.keypadRow}>
          <button
            className={styles.keypadKey}
            onClick={() => handleNumberPress("7")}
          >
            7
          </button>
          <button
            className={styles.keypadKey}
            onClick={() => handleNumberPress("8")}
          >
            8
          </button>
          <button
            className={styles.keypadKey}
            onClick={() => handleNumberPress("9")}
          >
            9
          </button>
        </div>
        <div className={styles.keypadRow}>
          <button
            className={styles.keypadKey}
            onClick={handleDecimalPress}
          >
            .
          </button>
          <button
            className={styles.keypadKey}
            onClick={() => handleNumberPress("0")}
          >
            0
          </button>
          <button
            className={styles.keypadKey}
            onClick={handleBackspace}
            aria-label="Backspace"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M21 4H8L1 12L8 20H21C21.5304 20 22.0391 19.7893 22.4142 19.4142C22.7893 19.0391 23 18.5304 23 18V6C23 5.46957 22.7893 4.96086 22.4142 4.58579C22.0391 4.21071 21.5304 4 21 4V4Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M18 9L12 15"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M12 9L18 15"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Continue Button */}
      <button
        className={styles.continueButton}
        onClick={handleContinue}
      >
        {hasAmount ? "Charge" : "Enter amount"}
      </button>
    </div>
  );
}