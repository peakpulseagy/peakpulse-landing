"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Head from "next/head";

export default function Error({
  error,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    console.error("Page Error:", error);
  }, [error]);

  const isNotFound =
    error.message?.toLowerCase().includes("not found") ||
    error.message?.toLowerCase().includes("404");

  return (
    <>
      {/* Meta Title */}
      <Head>
        <title>404: Lost in Space-Time Continuum</title>
      </Head>

      <div className="flex flex-col items-center justify-center min-h-screen text-center p-8">
        {/* Headline */}
        <h1 className="text-[29px] hidden md:block tracking-[0.29px] leading-[36px] lg:text-[40px] lg:tracking-[0.4px] lg:leading-[46px] 2xl:text-[2.604vw] 2xl:leading-[2.995vw] 2xl:tracking-[0.026vw] text-[#122F47] monteserrat_md lg:mb-[35px] mb-[20px]">
            Uh oh… this page drifted off the Profin.
        </h1>

        {/* Body text */}
        <p className="text-[13px] md:text-[14px] featured_description leading-[22px] tracking-[0.13px] text-[#122F47] monteserrat max-w-[1000px] mb-6">
          Looks like this entry never made it to the single source of truth.
          <br />
          But don’t worry — our systems are fully reconciled elsewhere.
        </p>

        {/* CTA */}
        <button
          onClick={() => router.push("/")}
          className="inline-block btn-primary cursor-pointer text-[16px] mt-2 bg-[#272361] text-[#EEF5FF] px-[22px] py-[9px] rounded-[30px] transition hover:text-[#EEF5FF]"
        >
          Back to Homepage
        </button>
      </div>
    </>
  );
}
