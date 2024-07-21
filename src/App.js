import React, { useState } from 'react';
import { useWeb3Modal, useWeb3ModalAccount } from '@web3modal/ethers/react'
import './App.css';

function App() {
  const { open } = useWeb3Modal()
  const { isConnected } = useWeb3ModalAccount()

  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('ETH');
  const [presaleInfo, setPresaleInfo] = useState({
    tokenName: "MyToken",
    tokenSymbol: "MTK",
    tokenPrice: 0.00114,
    hardCap: 7519847,
    raisedAmount: 2460739,
    yourPurchased: 0,
    yourStakeable: 0
  });

  const progress = (presaleInfo.raisedAmount / presaleInfo.hardCap) * 100;

  const handlePurchase = async () => {
    if (!isConnected || !amount) return;

    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const purchasedAmount = Number(amount) / presaleInfo.tokenPrice;
      setPresaleInfo(prev => ({
        ...prev,
        raisedAmount: prev.raisedAmount + Number(amount),
        yourPurchased: prev.yourPurchased + purchasedAmount,
        yourStakeable: prev.yourStakeable + purchasedAmount
      }));
      
      alert('Purchase successful!');
      setAmount('');
    } catch (error) {
      console.error('Purchase failed:', error);
      alert('Purchase failed. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div className="App">
      <div className="presale-widget">
        <h1>{presaleInfo.tokenName} Pre-Sale</h1>
        <div className="info-box">
          <p>USDT Raised: ${presaleInfo.raisedAmount.toLocaleString()} / ${presaleInfo.hardCap.toLocaleString()}</p>
          <div className="progress-bar">
            <div className="progress" style={{ width: `${progress}%` }}></div>
          </div>
        </div>
        <div className="info-box">
          <p>Your Purchased {presaleInfo.tokenSymbol}: {presaleInfo.yourPurchased.toFixed(2)}</p>
          <p>Your Stakeable {presaleInfo.tokenSymbol}: {presaleInfo.yourStakeable.toFixed(2)}</p>
          <p>1 {presaleInfo.tokenSymbol} = ${presaleInfo.tokenPrice}</p>
        </div>
        <div className="payment-options">
          <button onClick={() => setPaymentMethod('ETH')} className={paymentMethod === 'ETH' ? 'active' : ''}>ETH</button>
          <button onClick={() => setPaymentMethod('USDT')} className={paymentMethod === 'USDT' ? 'active' : ''}>USDT</button>
        </div>
        <div className="purchase-form">
          <input 
            type="number" 
            value={amount} 
            onChange={(e) => setAmount(e.target.value)} 
            placeholder={`${paymentMethod} you pay`}
          />
          <input 
            type="number" 
            value={amount ? (amount / presaleInfo.tokenPrice).toFixed(2) : ''} 
            readOnly 
            placeholder={`${presaleInfo.tokenSymbol} you receive`}
          />
        </div>
        {isConnected ? (
          <button onClick={handlePurchase} disabled={loading} className="action-button">
            {loading ? 'Processing...' : 'Buy Tokens'}
          </button>
        ) : (
          <button onClick={() => open()} className="action-button">Connect Wallet</button>
        )}
      </div>
    </div>
  );
}

export default App;
