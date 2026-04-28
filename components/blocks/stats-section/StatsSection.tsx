"use client";

import { useEffect, useRef, useState } from "react";
import "./stats.css";
import { Stats } from "@/components/global/component";



type Props = {
  sectionId?: string;
  stats: Stats[];
  padding_top?: number;
  padding_bottom?: number;
  padding_top_mobile?: number;
  padding_bottom_mobile?: number;
};

export default function StatsSection({
  sectionId,
  stats,
  padding_top = 80,
  padding_bottom = 80,
  padding_top_mobile = 48,
  padding_bottom_mobile = 48,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => entry.isIntersecting && setVisible(true),
      { threshold: 1 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      id={sectionId}
      ref={ref}
      className="stats-section"
      style={{
        paddingTop: padding_top,
        paddingBottom: padding_bottom,
      }}
    >
      <div className="stats-container">
        {stats?.map((stat, i) => (
          <StatItem
            key={i}
            value={Number(stat.value) || 0}
            suffix={stat.suffix}
            label={stat.label}
            start={visible}
          />
        ))}
      </div>

      {/* mobile padding */}
      <style jsx>{`
        @media (max-width: 768px) {
          .stats-section {
            padding-top: ${padding_top_mobile}px;
            padding-bottom: ${padding_bottom_mobile}px;
          }
        }
      `}</style>
    </section>
  );
}

function StatItem({
  value,
  suffix,
  label,
  start,
}: {
  value: number;
  suffix?: string;
  label: string;
  start: boolean;
}) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!start) return;

    let current = 0;
    const increment = Math.ceil(value / 60);

    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        current = value;
        clearInterval(timer);
      }
      setCount(current);
    }, 20);

    return () => clearInterval(timer);
  }, [start, value]);

  return (
    <div className="stat-item">
      <div className="stat-value">
        {count}
        {suffix}
      </div>
      <div className="stat-label">{label}</div>
    </div>
  );
}
