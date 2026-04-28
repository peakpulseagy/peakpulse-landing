"use client";

import { MultiCol2Items } from "@/components/global/component";
import "./multi-column2.css";
import { PortableText } from "next-sanity";

interface MultiCol2 {
  sectionId?: string;
  title?: string;
  multiCol_items?: MultiCol2Items[]
}

export default function MultiColumn2({ sectionId, title, multiCol_items }: MultiCol2) {
  if (!multiCol_items?.length) return null;

  return (
    <section id={sectionId} className="multi-column-2">
      <div className="container">
        {title && <h3 className="section-title">{title}</h3>}

        <div className="cards-grid">
          {multiCol_items.map((multiCol_items, i) => (
            <div
              key={i}
              className={`card ${multiCol_items.featured ? "card-featured" : ""}`}
            >
              <span className="card-accent" />

              <h4 className="card-title">{multiCol_items.title}</h4>

              {multiCol_items.description && (
                <div className="card-description"><PortableText value={multiCol_items.description}/></div>
              )}

              {multiCol_items.badge && (
                <span className="card-badge">{multiCol_items.badge}</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}