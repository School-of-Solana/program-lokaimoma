import Link from "next/link";
import { FC } from "react";

export const TipJarWelcomePage: FC = () => {
  return (
    <div className="hero">
      <div className="hero-content text-center">
        <div className="max-w-md">
          <h1 className="text-5xl font-bold">Welcome to the Tip Jar</h1>
          <p className="py-6">
            A decentralized application on the Solana blockchain that allows
            creators to receive tips and tippers to support their favorite
            creators.
          </p>
          <div className="flex justify-center gap-4">
            <Link className="btn btn-primary" href="/creator">
              Creator Space
            </Link>
            <Link className="btn" href="/tipper">
              Tipper Space
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
