"use client";
import { useEffect } from "react";
import "./multi-column3.css";
import { MultiCol3Items } from "@/components/global/component";
import { PortableText } from "next-sanity";

interface MultiCol3 {
  sectionId?: string;
  title?: string;
  multiColumns3_items?: MultiCol3Items[];
}

export default function MultiColumn3({ sectionId, title, multiColumns3_items }: MultiCol3) {
  useEffect(() => {
    const items = document.querySelectorAll(".fade-in");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
          }
        });
      },
      { threshold: 0.2 }
    );

    items.forEach((el) => observer.observe(el));
  }, []);

  return (
    <section
      className="multi-column-3"
      id={sectionId || undefined}
    >
      <div className="container">
        {title && (
          <h3 className="section-title fade-in">
            {title}
          </h3>
        )}

        <div className="columns-grid">
          {multiColumns3_items?.map((item, index) => {
            console.log(item.description)
            return (
              <div
                key={index}
                className={`card fade-in ${
                  item.featured ? "featured" : ""
                }`}
              >
                <div className="card-accent"></div>
                {item.rating > 0 && (
                  <div className="stars">
                    {Array.from({ length: item.rating }).map((_, i) => (
                      <span key={i}>★</span>
                    ))}
                  </div>
                )}


                <div
                  dangerouslySetInnerHTML={{__html: item.description}}
                  className="card-description">
                  
                </div>

                <div className="flex border-t border-solid border-[#dae0e780] pt-[16px] absolute bottom-5 gap-2.5">
                   {item.badge && (
                  <span className="badge h-max">{item.badge}</span>
                    )}
                  <div className="flex flex-col">
                    <h4 className="card-title">{item.name}</h4>
                    <h4 className="card-title-sub">{item.position}</h4>
                    </div>
               </div>

              </div>
            )
          })}
        </div>
      </div>
    </section>
  );
}
