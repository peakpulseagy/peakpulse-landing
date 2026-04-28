"use client";

import Image from "next/image";
import { PortableText } from "@portabletext/react";
import { PortableTextBlock } from "@/components/global/component";
import "./multi-column.css";

type Column = {
  title?: string;
  description?: PortableTextBlock[];
  svg?: string;
  iconBgColor?: string;
  linkId?: string;
  link?: string;
};

type MultiColumnSectionProps = {
  section_title?: string;
  description?: PortableTextBlock[];
  columns?: Column[];
  backgroundColor?: { value?: string };
  textColor?: { value?: string };
  padding_top?: number;
  padding_bottom?: number;
  padding_top_mobile?: number;
  padding_bottom_mobile?: number;
  icons_layout: string
  sectionId?: string
};

const MultiColumnSection = ({
  section_title,
  description = [],
  columns = [],
  backgroundColor,
  textColor,
  padding_top,
  padding_bottom,
  padding_top_mobile,
  padding_bottom_mobile,
  sectionId
}: MultiColumnSectionProps) => {
  const handleScroll = (id?: string) => {
    if (!id) return;
    const el = document.getElementById(id);
    if (!el) return;

    const offset = 80;
    const y = el.getBoundingClientRect().top + window.scrollY - offset;

    window.scrollTo({ top: y, behavior: "smooth" });
  };

  return (
    <section
      id={`${sectionId}`}
      className="multi-column"
      style={{
        backgroundColor: backgroundColor?.value,
        color: textColor?.value,
        paddingTop: padding_top_mobile,
        paddingBottom: padding_bottom_mobile,
      }}
    >
      <div className="container">
        {/* Header */}
        {(section_title || description.length > 0) && (
          <div className="multi-column__header">
            {section_title && (
              <h2 className="multi-column__title">{section_title}</h2>
            )}

            {description.length > 0 && (
              <div className="multi-column__description">
                <PortableText value={description} />
              </div>
            )}
          </div>
        )}

        {/* Grid */}
        <div className="multi-column__grid">
          {columns.map((column, index) => (
            <div key={index} className="multi-column__card">
              {/* Accent */}
              <span
                className="multi-column__accent"
                style={{ backgroundColor: column.iconBgColor }}
              />

              {/* Icon */}
              {column.svg && (
                <div
                  className="multi-column__icon"
                  style={{
                    backgroundColor: `${column.iconBgColor}20`,
                    color: column.iconBgColor,
                  }}
                >
                  <Image
                    src={column.svg}
                    alt={column.title || "Icon"}
                    width={28}
                    height={28}
                  />
                </div>
              )}

              {/* Content */}
              {column.title && (
                <h3 className="multi-column__card-title">
                  {column.title}
                </h3>
              )}

              {column?.description && (
                <div className="multi-column__card-description">
                  <PortableText value={column.description} />
                </div>
              )}

              {/* Link */}
              {(column.linkId || column.link) && (
                <button
                  className="multi-column__link"
                  onClick={() =>
                    column.linkId
                      ? handleScroll(column.linkId)
                      : window.open(column.link, "_self")
                  }
                >
                  Learn More <span>→</span>
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default MultiColumnSection;
