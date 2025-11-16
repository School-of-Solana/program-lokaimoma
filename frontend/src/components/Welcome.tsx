// TODO: SignMessage
import { verify } from "@noble/ed25519";
import { useWallet } from "@solana/wallet-adapter-react";
import bs58 from "bs58";
import Link from "next/link";
import { FC, useCallback } from "react";
import { notify } from "../utils/notifications";

export const TipJarWelcomePage: FC = () => {
  const { publicKey, signMessage } = useWallet();

  // const onClick = useCallback(async () => {
  //     try {
  //         // `publicKey` will be null if the wallet isn't connected
  //         if (!publicKey) throw new Error('Wallet not connected!');
  //         // `signMessage` will be undefined if the wallet doesn't support it
  //         if (!signMessage) throw new Error('Wallet does not support message signing!');
  //         // Encode anything as bytes
  //         const message = new TextEncoder().encode('Hello, world!');
  //         // Sign the bytes using the wallet
  //         const signature = await signMessage(message);
  //         // Verify that the bytes were signed using the private key that matches the known public key
  //         if (!verify(signature, message, publicKey.toBytes())) throw new Error('Invalid signature!');
  //         notify({ type: 'success', message: 'Sign message successful!', txid: bs58.encode(signature) });
  //     } catch (error: any) {
  //         notify({ type: 'error', message: `Sign Message failed!`, description: error?.message });
  //         console.log('error', `Sign Message failed! ${error?.message}`);
  //     }
  // }, [publicKey, notify, signMessage]);

  return (
    <div className="flex flex-row justify-center">
      <div className="flex flex-col gap-6">
        <h3>Welcom to my tip jar app</h3>
        <Link className="btn" href="/creator">
          Go to creator space
        </Link>
        <Link className="btn" href="/tipper">
          Go to tipper space
        </Link>
      </div>
    </div>
  );
};
