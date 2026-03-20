import React, { useState, useEffect } from "react";
import { useHistory, useLocation } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Payment = () => {
  const history = useHistory();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [transactionDetails, setTransactionDetails] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("card");
  
  // Form states
  const [cardNumber, setCardNumber] = useState("");
  const [cardHolder, setCardHolder] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");
  const [saveCard, setSaveCard] = useState(false);
  
  // Mobile payment states
  const [mobileNumber, setMobileNumber] = useState("");
  const [mobileProvider, setMobileProvider] = useState("dialog");
  
  // Bank transfer states
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");
  const [bankName, setBankName] = useState("");
  
  // QR payment states
  const [showQR, setShowQR] = useState(false);
  
  const baseUrl = process.env.REACT_APP_API_BASE_URL || "http://localhost:8088/EV";

  // Load transaction details from location state or fetch from API
  useEffect(() => {
    if (location.state && location.state.transactionDetails) {
      setTransactionDetails(location.state.transactionDetails);
      toast.info("Transaction details loaded", {
        position: "top-right",
        autoClose: 2000,
      });
    } else {
      // Try to get from localStorage or fetch from API
      const savedTransaction = localStorage.getItem("lastTransaction");
      if (savedTransaction) {
        setTransactionDetails(JSON.parse(savedTransaction));
      }
    }
  }, [location]);

  const formatCurrency = (amount) => {
    if (!amount) return "$0.00";
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(parseFloat(amount));
  };

  const calculateTax = (amount) => {
    const subtotal = parseFloat(amount) || 0;
    const taxRate = 0.08; // 8% tax
    return (subtotal * taxRate).toFixed(2);
  };

  const calculateTotal = (amount) => {
    const subtotal = parseFloat(amount) || 0;
    const tax = parseFloat(calculateTax(amount));
    return (subtotal + tax).toFixed(2);
  };

  const validateCard = () => {
    if (!cardNumber.trim() || cardNumber.replace(/\s/g, '').length !== 16) {
      toast.error("Please enter a valid 16-digit card number", {
        position: "top-right",
      });
      return false;
    }
    
    if (!cardHolder.trim()) {
      toast.error("Please enter card holder name", {
        position: "top-right",
      });
      return false;
    }
    
    if (!expiryDate.match(/^(0[1-9]|1[0-2])\/\d{2}$/)) {
      toast.error("Please enter a valid expiry date (MM/YY)", {
        position: "top-right",
      });
      return false;
    }
    
    if (!cvv.match(/^\d{3,4}$/)) {
      toast.error("Please enter a valid CVV (3 or 4 digits)", {
        position: "top-right",
      });
      return false;
    }
    
    return true;
  };

  const validateMobilePayment = () => {
    if (!mobileNumber.trim() || mobileNumber.length !== 10) {
      toast.error("Please enter a valid 10-digit mobile number", {
        position: "top-right",
      });
      return false;
    }
    
    if (!mobileProvider) {
      toast.error("Please select a mobile provider", {
        position: "top-right",
      });
      return false;
    }
    
    return true;
  };

  const validateBankTransfer = () => {
    if (!accountNumber.trim()) {
      toast.error("Please enter account number", {
        position: "top-right",
      });
      return false;
    }
    
    if (!accountName.trim()) {
      toast.error("Please enter account name", {
        position: "top-right",
      });
      return false;
    }
    
    if (!bankName.trim()) {
      toast.error("Please enter bank name", {
        position: "top-right",
      });
      return false;
    }
    
    return true;
  };

  const handleCardNumberChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 16) value = value.slice(0, 16);
    value = value.replace(/(\d{4})(?=\d)/g, '$1 ');
    setCardNumber(value);
  };

  const handleExpiryDateChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length >= 2) {
      value = value.slice(0, 2) + '/' + value.slice(2, 4);
    }
    setExpiryDate(value);
  };

  const handleCvvChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 4) value = value.slice(0, 4);
    setCvv(value);
  };

  const handleMobileNumberChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 10) value = value.slice(0, 10);
    setMobileNumber(value);
  };

  const processPayment = async () => {
    if (!transactionDetails) {
      toast.error("No transaction found to pay for", {
        position: "top-right",
      });
      return;
    }

    let isValid = false;
    
    switch (paymentMethod) {
      case "card":
        isValid = validateCard();
        break;
      case "mobile":
        isValid = validateMobilePayment();
        break;
      case "bank":
        isValid = validateBankTransfer();
        break;
      case "qr":
        isValid = true;
        break;
      default:
        toast.error("Please select a payment method", {
          position: "top-right",
        });
        return;
    }

    if (!isValid) return;

    setIsProcessing(true);
    
    // Simulate payment processing
    setTimeout(async () => {
      try {
        // In a real app, you would call your payment API here
        // const response = await fetch(`${baseUrl}/api/payment/process`, {
        //   method: "POST",
        //   headers: { "Content-Type": "application/json" },
        //   body: JSON.stringify({
        //     transactionId: transactionDetails.transactionId,
        //     amount: calculateTotal(transactionDetails.cost),
        //     paymentMethod: paymentMethod,
        //     timestamp: new Date().toISOString()
        //   })
        // });

        // For demo purposes, we'll simulate success
        const paymentData = {
          paymentId: "PAY-" + Date.now(),
          transactionId: transactionDetails.transactionId,
          amount: calculateTotal(transactionDetails.cost),
          paymentMethod: paymentMethod,
          status: "COMPLETED",
          timestamp: new Date().toISOString()
        };

        // Save payment record to localStorage (simulating backend)
        localStorage.setItem(`payment_${paymentData.paymentId}`, JSON.stringify(paymentData));
        localStorage.setItem("lastPayment", JSON.stringify(paymentData));

        // --- Call backend to forward billing data ---
        if (transactionDetails?.transactionId) {
            try {
                const billingResponse = await fetch(`${baseUrl}/api/billing/send-to-billing`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ transactionId: transactionDetails.transactionId })
                });
                const billingResult = await billingResponse.json();
                console.log("Billing API result:", billingResult);
            } catch (billingError) {
                console.error("Billing API call error:", billingError);
            }
        }

        setIsProcessing(false);
        setPaymentSuccess(true);
        
        toast.success("Payment successful! Generating receipt...", {
          position: "top-right",
          autoClose: 3000,
        });

        // Auto-redirect after 3 seconds
        setTimeout(() => {
          history.push({
            pathname: "/smartplug/receipt",
            state: { 
              paymentDetails: paymentData,
              transactionDetails: transactionDetails 
            }
          });
        }, 3000);

      } catch (error) {
        setIsProcessing(false);
        toast.error(`Payment failed: ${error.message}`, {
          position: "top-right",
          autoClose: 5000,
        });
      }
    }, 2000);
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  const handleDownloadReceipt = () => {
    const receiptContent = `
      EV Charging Receipt
      ====================
      Transaction ID: ${transactionDetails?.transactionId || 'N/A'}
      Date: ${new Date().toLocaleDateString()}
      Time: ${new Date().toLocaleTimeString()}
      
      Charging Details:
      - Energy: ${transactionDetails?.powerConsumed || '0.00'} kWh
      - Duration: ${transactionDetails?.durationMinutes || '0'} minutes
      - Subtotal: ${formatCurrency(transactionDetails?.cost)}
      - Tax (8%): $${calculateTax(transactionDetails?.cost)}
      - Total: ${formatCurrency(calculateTotal(transactionDetails?.cost))}
      
      Payment Method: ${paymentMethod.toUpperCase()}
      Payment Status: COMPLETED
      
      Thank you for choosing EV Charging!
    `;
    
    const blob = new Blob([receiptContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `EV-Receipt-${transactionDetails?.transactionId || Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success("Receipt downloaded successfully!", {
      position: "top-right",
      autoClose: 3000,
    });
  };

  const renderPaymentForm = () => {
    switch (paymentMethod) {
      case "card":
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Card Number
              </label>
              <input
                type="text"
                value={cardNumber}
                onChange={handleCardNumberChange}
                placeholder="1234 5678 9012 3456"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition duration-300"
                maxLength="19"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Card Holder Name
              </label>
              <input
                type="text"
                value={cardHolder}
                onChange={(e) => setCardHolder(e.target.value)}
                placeholder="John Doe"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition duration-300"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Expiry Date
                </label>
                <input
                  type="text"
                  value={expiryDate}
                  onChange={handleExpiryDateChange}
                  placeholder="MM/YY"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition duration-300"
                  maxLength="5"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  CVV
                </label>
                <input
                  type="password"
                  value={cvv}
                  onChange={handleCvvChange}
                  placeholder="123"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition duration-300"
                  maxLength="4"
                />
              </div>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="saveCard"
                checked={saveCard}
                onChange={(e) => setSaveCard(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="saveCard" className="ml-2 block text-sm text-gray-700">
                Save card details for future payments
              </label>
            </div>
          </div>
        );
      
      case "mobile":
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mobile Provider
              </label>
              <select
                value={mobileProvider}
                onChange={(e) => setMobileProvider(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition duration-300"
              >
                <option value="dialog">Dialog</option>
                <option value="mobitel">Mobitel</option>
                <option value="airtel">Airtel</option>
                <option value="hutch">Hutch</option>
                <option value="other">Other</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mobile Number
              </label>
              <input
                type="tel"
                value={mobileNumber}
                onChange={handleMobileNumberChange}
                placeholder="07X XXX XXXX"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition duration-300"
                maxLength="10"
              />
              <p className="text-xs text-gray-500 mt-2">
                You will receive a payment confirmation SMS
              </p>
            </div>
          </div>
        );
      
      case "bank":
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bank Name
              </label>
              <input
                type="text"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                placeholder="Commercial Bank, BOC, etc."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition duration-300"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Account Holder Name
              </label>
              <input
                type="text"
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
                placeholder="As it appears in bank account"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition duration-300"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Account Number
              </label>
              <input
                type="text"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                placeholder="XXXX-XXXX-XXXX-XXXX"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition duration-300"
              />
            </div>
          </div>
        );
      
      case "qr":
        return (
          <div className="space-y-6 text-center">
            <button
              type="button"
              onClick={() => setShowQR(true)}
              className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-lg font-medium transition duration-300"
            >
              <i className="fas fa-qrcode mr-2"></i>
              Generate QR Code for Payment
            </button>
            
            {showQR && (
              <div className="bg-white p-6 rounded-xl border border-gray-200">
                <div className="flex justify-center mb-4">
                  <div className="w-48 h-48 bg-gray-100 flex items-center justify-center rounded-lg border border-gray-300">
                    {/* This would be a real QR code in production */}
                    <div className="text-center">
                      <div className="text-4xl mb-2">💰</div>
                      <p className="text-sm text-gray-500">Scan to Pay</p>
                      <p className="text-xs text-gray-400 mt-1">Amount: {formatCurrency(calculateTotal(transactionDetails?.cost))}</p>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-gray-600">
                  Scan this QR code with your mobile banking app to complete payment
                </p>
              </div>
            )}
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="relative md:ml-64 bg-blueGray-100 min-h-screen">
      {/* Header */}
      <div className="relative bg-gradient-to-r from-blue-600 to-indigo-700 md:pt-24 pb-24 pt-12 shadow-lg">
        <div className="px-4 md:px-10 mx-auto w-full">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                Payment Gateway
              </h1>
              <p className="text-blue-100 text-lg">
                Secure payment for your EV charging session
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              <button
                onClick={() => history.goBack()}
                className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg font-medium transition duration-300"
              >
                <i className="fas fa-arrow-left mr-2"></i>
                Back to Charging
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="px-4 md:px-10 mx-auto w-full -mt-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Payment Details */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-xl p-6 mb-8 border border-gray-200">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <i className="fas fa-credit-card text-blue-500 mr-3"></i>
                Payment Method
              </h2>
              
              {/* Payment Method Selector */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <button
                  onClick={() => setPaymentMethod("card")}
                  className={`p-4 rounded-xl border-2 transition-all duration-300 ${paymentMethod === "card" 
                    ? "border-blue-500 bg-blue-50" 
                    : "border-gray-200 hover:border-gray-300"}`}
                >
                  <div className="flex flex-col items-center">
                    <i className="fas fa-credit-card text-2xl text-blue-500 mb-2"></i>
                    <span className="font-medium text-gray-700">Credit/Debit Card</span>
                  </div>
                </button>
                
                <button
                  onClick={() => setPaymentMethod("mobile")}
                  className={`p-4 rounded-xl border-2 transition-all duration-300 ${paymentMethod === "mobile" 
                    ? "border-green-500 bg-green-50" 
                    : "border-gray-200 hover:border-gray-300"}`}
                >
                  <div className="flex flex-col items-center">
                    <i className="fas fa-mobile-alt text-2xl text-green-500 mb-2"></i>
                    <span className="font-medium text-gray-700">Mobile Payment</span>
                  </div>
                </button>
                
                <button
                  onClick={() => setPaymentMethod("bank")}
                  className={`p-4 rounded-xl border-2 transition-all duration-300 ${paymentMethod === "bank" 
                    ? "border-purple-500 bg-purple-50" 
                    : "border-gray-200 hover:border-gray-300"}`}
                >
                  <div className="flex flex-col items-center">
                    <i className="fas fa-university text-2xl text-purple-500 mb-2"></i>
                    <span className="font-medium text-gray-700">Bank Transfer</span>
                  </div>
                </button>
                
                <button
                  onClick={() => setPaymentMethod("qr")}
                  className={`p-4 rounded-xl border-2 transition-all duration-300 ${paymentMethod === "qr" 
                    ? "border-yellow-500 bg-yellow-50" 
                    : "border-gray-200 hover:border-gray-300"}`}
                >
                  <div className="flex flex-col items-center">
                    <i className="fas fa-qrcode text-2xl text-yellow-500 mb-2"></i>
                    <span className="font-medium text-gray-700">QR Payment</span>
                  </div>
                </button>
              </div>
              
              {/* Payment Form */}
              <div className="mb-8">
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                  <i className={`fas ${
                    paymentMethod === "card" ? "fa-credit-card text-blue-500" :
                    paymentMethod === "mobile" ? "fa-mobile-alt text-green-500" :
                    paymentMethod === "bank" ? "fa-university text-purple-500" :
                    "fa-qrcode text-yellow-500"
                  } mr-3`}></i>
                  {paymentMethod === "card" && "Card Details"}
                  {paymentMethod === "mobile" && "Mobile Payment Details"}
                  {paymentMethod === "bank" && "Bank Transfer Details"}
                  {paymentMethod === "qr" && "QR Code Payment"}
                </h3>
                
                {renderPaymentForm()}
              </div>
              
              {/* Security Note */}
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <div className="flex items-start">
                  <i className="fas fa-shield-alt text-blue-500 text-xl mt-1 mr-3"></i>
                  <div>
                    <h4 className="font-bold text-blue-800 mb-1">Secure Payment</h4>
                    <p className="text-blue-700 text-sm">
                      Your payment information is encrypted and secure. We never store your full card details.
                      All transactions are protected by SSL encryption.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Right Column - Order Summary */}
          <div>
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-200 sticky top-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <i className="fas fa-receipt text-gray-500 mr-3"></i>
                Order Summary
              </h2>
              
              {transactionDetails ? (
                <>
                  {/* Transaction Details */}
                  <div className="space-y-4 mb-6">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Transaction ID</span>
                      <span className="font-medium">#{transactionDetails.transactionId}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-600">Energy Consumed</span>
                      <span className="font-medium">{transactionDetails.powerConsumed} kWh</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-600">Duration</span>
                      <span className="font-medium">
                        {transactionDetails.durationFormatted || 
                         `${Math.floor(transactionDetails.durationMinutes / 60)}h ${transactionDetails.durationMinutes % 60}m`}
                      </span>
                    </div>
                    
                    <div className="border-t border-gray-200 pt-4">
                      <div className="flex justify-between mb-2">
                        <span className="text-gray-600">Subtotal</span>
                        <span className="font-medium">{formatCurrency(transactionDetails.cost)}</span>
                      </div>
                      
                      <div className="flex justify-between mb-2">
                        <span className="text-gray-600">Tax (8%)</span>
                        <span className="font-medium">${calculateTax(transactionDetails.cost)}</span>
                      </div>
                      
                      <div className="flex justify-between text-lg font-bold border-t border-gray-200 pt-4">
                        <span className="text-gray-800">Total</span>
                        <span className="text-green-600">{formatCurrency(calculateTotal(transactionDetails.cost))}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Payment Success Message */}
                  {paymentSuccess ? (
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200 mb-6">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                          <i className="fas fa-check text-green-600"></i>
                        </div>
                        <div>
                          <h4 className="font-bold text-green-800">Payment Successful!</h4>
                          <p className="text-green-700 text-sm">
                            Your payment has been processed successfully. Redirecting to receipt...
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : null}
                  
                  {/* Action Buttons */}
                  <div className="space-y-3">
                    <button
                      onClick={processPayment}
                      disabled={isProcessing || paymentSuccess}
                      className={`w-full py-4 rounded-xl font-bold text-white flex items-center justify-center transition-all duration-300 ${
                        isProcessing || paymentSuccess
                          ? 'bg-gray-400 cursor-not-allowed'
                          : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl'
                      }`}
                    >
                      {isProcessing ? (
                        <>
                          <i className="fas fa-spinner fa-spin mr-2"></i>
                          Processing...
                        </>
                      ) : paymentSuccess ? (
                        <>
                          <i className="fas fa-check mr-2"></i>
                          Payment Successful
                        </>
                      ) : (
                        <>
                          <i className="fas fa-lock mr-2"></i>
                          Pay {formatCurrency(calculateTotal(transactionDetails.cost))}
                        </>
                      )}
                    </button>
                    
                    <button
                      onClick={handlePrintReceipt}
                      className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition duration-300"
                    >
                      <i className="fas fa-print mr-2"></i>
                      Print Receipt
                    </button>
                    
                    <button
                      onClick={handleDownloadReceipt}
                      className="w-full py-3 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg font-medium transition duration-300"
                    >
                      <i className="fas fa-download mr-2"></i>
                      Download Receipt
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i className="fas fa-exclamation-triangle text-gray-400 text-2xl"></i>
                  </div>
                  <h4 className="text-lg font-medium text-gray-700 mb-2">No Transaction Found</h4>
                  <p className="text-gray-500 mb-6">
                    Please complete a charging session first or enter a transaction ID
                  </p>
                  <button
                    onClick={() => history.push("/smartplug/charging")}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg font-medium transition duration-300"
                  >
                    <i className="fas fa-bolt mr-2"></i>
                    Go to Charging
                  </button>
                </div>
              )}
              
              {/* Payment Security Logos */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="text-xs text-gray-500 mb-3">Secured by</p>
                <div className="flex justify-between">
                  <div className="w-12 h-8 bg-gray-100 rounded flex items-center justify-center">
                    <i className="fas fa-lock text-gray-400"></i>
                  </div>
                  <div className="w-12 h-8 bg-gray-100 rounded flex items-center justify-center">
                    <span className="text-xs font-bold text-gray-500">SSL</span>
                  </div>
                  <div className="w-12 h-8 bg-gray-100 rounded flex items-center justify-center">
                    <i className="fas fa-shield-alt text-gray-400"></i>
                  </div>
                  <div className="w-12 h-8 bg-gray-100 rounded flex items-center justify-center">
                    <span className="text-xs font-bold text-gray-500">PCI</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Help Section */}
            <div className="mt-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
              <h4 className="font-bold text-blue-800 mb-2 flex items-center">
                <i className="fas fa-question-circle text-blue-500 mr-2"></i>
                Need Help?
              </h4>
              <p className="text-blue-700 text-sm mb-3">
                For payment assistance, contact our support team
              </p>
              <div className="space-y-2">
                <a href="tel:+94112345678" className="flex items-center text-blue-600 hover:text-blue-800">
                  <i className="fas fa-phone-alt text-xs mr-2"></i>
                  <span className="text-sm">+94 11 234 5678</span>
                </a>
                <a href="mailto:support@evcharging.com" className="flex items-center text-blue-600 hover:text-blue-800">
                  <i className="fas fa-envelope text-xs mr-2"></i>
                  <span className="text-sm">support@evcharging.com</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ToastContainer 
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
    </div>
  );
};

export default Payment;