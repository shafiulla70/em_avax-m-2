import { useState, useEffect } from "react";
import { ethers } from "ethers";
import atm_abi from "../artifacts/contracts/Assessment.sol/Assessment.json";

export default function HomePage() {
  const [ethWallet, setEthWallet] = useState(undefined);
  const [account, setAccount] = useState(undefined);
  const [atm, setATM] = useState(undefined);
  const [balance, setBalance] = useState(undefined);
  const [contractBalance, setContractBalance] = useState(undefined);

  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const atmABI = atm_abi.abi;

  const getWallet = async () => {
    if (window.ethereum) {
      setEthWallet(window.ethereum);
    }

    if (ethWallet) {
      const accounts = await ethWallet.request({ method: "eth_accounts" });
      handleAccount(accounts);
    }
  };

  const handleAccount = (accounts) => {
    if (accounts.length > 0) {
      console.log("Account connected:", accounts[0]);
      setAccount(accounts[0]);
    } else {
      console.log("No account found");
    }
  };

  const connectAccount = async () => {
    if (!ethWallet) {
      alert("First connect your wallet to the metamask");
      return;
    }

    try {
      const accounts = await ethWallet.request({ method: "eth_requestAccounts" });
      handleAccount(accounts);
      getATMContract();
    } catch (error) {
      console.log("Error while connecting account:", error);
    }
  };

  const getATMContract = () => {
    const provider = new ethers.providers.Web3Provider(ethWallet);
    const signer = provider.getSigner();
    const atmContract = new ethers.Contract(contractAddress, atmABI, signer);

    setATM(atmContract);
  };

  const getBalance = async () => {
    if (atm) {
      const userBalance = await atm.getBalance();
      setBalance(userBalance.toNumber());
    }
  };

  const deposit = async () => {
    if (atm) {
      let tx = await atm.deposit(56);
      await tx.wait();
      getBalance();
    }
  };

  const withdraw = async () => {
    if (atm) {
      let tx = await atm.withdraw(34);
      await tx.wait();
      getBalance();
    }
  };

  const getContractBalance = async () => {
    if (atm) {
      const contractBalance = await ethWallet.provider.getBalance(contractAddress);
      setContractBalance(ethers.utils.formatEther(contractBalance));
    }
  };

  const transferFunds = async () => {
    if (atm) {
      const recipientAddress = prompt("Enter recipient's Ethereum address:");
      const amount = ethers.utils.parseEther(prompt("Enter the amount to transfer (ETH):"));

      if (recipientAddress && amount) {
        const tx = await atm.transferFunds(recipientAddress, amount);
        await tx.wait();
        getBalance();
        getContractBalance();
      } else {
        console.log("Invalid input");
      }
    }
  };

  const initUser = () => {
    if (!ethWallet) {
      return <p>Please install Metamask in order to use this ATM.</p>;
    }

    if (!account) {
      return <button onClick={connectAccount}>Please connect your Metamask wallet</button>;
    }

    if (balance === undefined) {
      getBalance();
    }

    return (
      <div>
        <p>Your Account: {account}</p>
        <p>Your Balance: {balance}</p>
        <button onClick={deposit}>Deposit 56 ETH</button>
        <button onClick={withdraw}>Withdraw 34 ETH</button>
        <p>Contract Balance: {contractBalance}</p>
        <button onClick={getContractBalance}>Check Contract Balance</button>
        <button onClick={transferFunds}>Transfer Funds</button>
      </div>
    );
  };

  useEffect(() => {
    getWallet();
  }, []);

  return (
    <main className="container">
      <header>
        <h1>This is Himanshu's Wallet</h1>
      </header>
      {initUser()}
      <style jsx>{`
        .container {
          text-align: center;
        }
      `}</style>
    </main>
  );
}
