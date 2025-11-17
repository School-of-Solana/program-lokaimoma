import { LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import { useTipJarHooks } from "hooks/useTipJarHooks";
import type { NextPage } from "next";
import Head from "next/head";
import { useEffect, useState } from "react";

const TipperSpace: NextPage = (props) => {
  const [currentJar, setCurrenctJar] = useState("");
  const [amount, setAmount] = useState(0.0);
  const {
    getTipJars,
    tipCreator,
    getTipRecords,
    wallet,
    tipJars,
    tipRecords,
    deleteTipRecord,
  } = useTipJarHooks();
  const walletConnected = wallet.connected;

  useEffect(() => {
    if (walletConnected) {
      getTipJars();
      getTipRecords();
    }
  }, [walletConnected]);

  const handleTip = async (e) => {
    e.preventDefault();
    if (!currentJar) {
      alert("Please select a tip jar first.");
      return;
    }
    const tx = await tipCreator(amount, new PublicKey(currentJar));
    alert(`Creator tipped (${tx}). Refetching creator history.`);
    getTipRecords();
    setAmount(0.0);
    setCurrenctJar("");
  };

  return (
    <div className="container mx-auto p-4">
      <Head>
        <title>Tipper Space</title>
        <meta name="description" content="Support creators by sending tips" />
      </Head>

      <h1 className="text-3xl font-bold text-center mb-8">Tipper Space</h1>

      {!walletConnected ? (
        <div className="text-center p-8 bg-base-200 rounded-lg">
          <p className="text-xl">Please connect your wallet to send tips.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Tip Jars Section */}
          <div>
            <h2 className="text-2xl font-semibold mb-4">Available Tip Jars</h2>
            <div className="flex flex-col gap-4 max-h-[60vh] overflow-y-auto p-2">
              {tipJars.length > 0 ? (
                tipJars.map((tipJar) => (
                  <div
                    key={tipJar.publicKey.toString()}
                    className={`p-4 bg-base-200 rounded-lg shadow-md transition-all ${
                      currentJar === tipJar.publicKey.toString()
                        ? "ring-2 ring-primary-focus"
                        : ""
                    }`}
                  >
                    <p className="font-semibold">Creator:</p>
                    <p className="font-mono text-sm break-all mb-2">
                      {tipJar.account.creator.toString()}
                    </p>
                    <p className="font-semibold">Jar Address:</p>
                    <p className="font-mono text-sm break-all mb-4">
                      {tipJar.publicKey.toString()}
                    </p>
                    <button
                      className="btn btn-sm btn-primary"
                      onClick={() => {
                        setCurrenctJar(tipJar.publicKey.toString());
                      }}
                    >
                      Select to Tip
                    </button>
                  </div>
                ))
              ) : (
                <p>No tip jars found.</p>
              )}
            </div>
          </div>

          {/* Tipping Form and Records Section */}
          <div>
            {/* Tipping Form */}
            <div className="p-6 bg-base-200 rounded-lg shadow-md mb-8">
              <h2 className="text-2xl font-semibold mb-4">Send a Tip</h2>
              <form onSubmit={handleTip} className="flex flex-col gap-4">
                <div>
                  <label htmlFor="creatorTipJarAddr" className="label">
                    <span className="label-text">Selected Tip Jar</span>
                  </label>
                  <input
                    id="creatorTipJarAddr"
                    value={currentJar}
                    disabled
                    type="text"
                    className="input input-bordered w-full"
                    placeholder="Select a jar from the list"
                  />
                </div>
                <div>
                  <label htmlFor="amount" className="label">
                    <span className="label-text">Amount (SOL)</span>
                  </label>
                  <input
                    id="amount"
                    type="number"
                    step="0.01"
                    min="0.01"
                    disabled={!currentJar}
                    className="input input-bordered w-full"
                    value={amount}
                    onChange={(e) =>
                      setAmount(parseFloat(e.target.value) || 0.0)
                    }
                    placeholder="Enter tip amount"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={amount <= 0 || !currentJar}
                >
                  Tip Creator
                </button>
              </form>
            </div>

            {/* User's Tip Records */}
            <div>
              <h2 className="text-2xl font-semibold mb-4">Your Tip History</h2>
              <div className="flex flex-col gap-4 max-h-[40vh] overflow-y-auto p-2">
                {tipRecords.length > 0 ? (
                  tipRecords.map((tipRecord) => (
                    <div
                      key={tipRecord.publicKey.toString()}
                      className="p-4 bg-base-200 rounded-lg shadow-md"
                    >
                      <p className="font-semibold">Tipped Jar:</p>
                      <p className="font-mono text-sm break-all mb-2">
                        {tipRecord.account.tipJar.toString()}
                      </p>
                      <p className="font-semibold">Total Tipped:</p>
                      <p className="text-lg mb-4">
                        {tipRecord.account.totalTips.toNumber() /
                          LAMPORTS_PER_SOL}{" "}
                        SOL
                      </p>
                      <button
                        className="btn btn-sm btn-error"
                        onClick={async () => {
                          const tx = await deleteTipRecord(
                            tipRecord.account.tipJar,
                          );
                          alert(
                            `Tip record deleted (${tx}). Refetching records`,
                          );
                          getTipRecords();
                        }}
                      >
                        Delete Record
                      </button>
                    </div>
                  ))
                ) : (
                  <p>You haven&apos;t tipped anyone yet.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TipperSpace;
