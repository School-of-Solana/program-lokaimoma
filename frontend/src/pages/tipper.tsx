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
  }, [wallet]);

  return (
    <div>
      <Head>
        <title>Tipper space</title>
        <meta name="description" content="Basic Functionality" />
      </Head>
      <div className="flex flex-col gap-2">
        <h3>Tipper space space</h3>
        {!walletConnected && <p>Please connect wallet</p>}
        <div className="flex flex-col overflow-scroll-y h-[20vh]">
          <p>Tip jars</p>
          {walletConnected &&
            tipJars.map((tipJar) => (
              <div
                className="flex flex-col gap-6"
                key={tipJar.publicKey.toString()}
              >
                <p>
                  Creator: <span>{tipJar.account.creator.toString()}</span>
                </p>
                <p>
                  Jar: <span>{tipJar.publicKey.toString()}</span>
                </p>
                <button
                  className="btn"
                  onClick={() => {
                    setCurrenctJar(tipJar.publicKey.toString());
                  }}
                >
                  Tip
                </button>
              </div>
            ))}
        </div>

        <div className="flex flex-col overflow-scroll-y h-[20vh]">
          <p>Tip records</p>
          {walletConnected &&
            tipRecords.map((tipRecord) => (
              <div
                className="flex flex-col gap-6"
                key={tipRecord.publicKey.toString()}
              >
                <p>
                  Jar: <span>{tipRecord.account.tipJar.toString()}</span>
                </p>
                <p>
                  Total tips:{" "}
                  <span>
                    {tipRecord.account.totalTips.toNumber() / LAMPORTS_PER_SOL}{" "}
                    sol(s)
                  </span>
                </p>
                <button
                  className="btn"
                  onClick={async () => {
                    const tx = await deleteTipRecord(tipRecord.account.tipJar);
                    alert(`Tip record deleted (${tx}). Refetching records`);
                    getTipRecords();
                  }}
                >
                  Delete
                </button>
              </div>
            ))}
        </div>
        <input
          value={currentJar}
          disabled
          name="creatorTipJarAddr"
          type="text"
          className="text-black"
          placeholder="Enter creator's tip jar address"
          required
        />
        <input
          name="amount"
          type="number"
          disabled={!currentJar}
          className="text-black"
          value={amount}
          onChange={(e) => setAmount(parseFloat(e.target.value) || 0.0)}
          placeholder="Enter tip amount"
          required
        />
        <button
          className="btn"
          onClick={async (e) => {
            e.preventDefault();
            const tx = await tipCreator(amount, new PublicKey(currentJar));
            alert(`creator tipped (${tx}). Refetching creator history.`);
            getTipRecords();
          }}
          disabled={amount <= 0}
        >
          Tip creator
        </button>
      </div>
    </div>
  );
};

export default TipperSpace;
