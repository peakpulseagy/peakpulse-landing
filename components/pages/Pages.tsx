"use client";

import { PortableText, SanityDocument } from "next-sanity";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import SpreadComponents from "../global/SpreadComponents";

type PageProps = {
  page: SanityDocument;
};

export default function Pages({ page }: PageProps) {
  
  
  return (
    <>
      {!page.hide_title && 
        <div
          className="page-title">
            {page.title}
        </div>
      }
      {/* Only render content if user DID NOT decline */}
      {page && page.components != null && (
        <SpreadComponents components={page.components} />
      )}

    </>
  );
}
