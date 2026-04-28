/* eslint-disable @typescript-eslint/no-explicit-any */
import { Key } from "react";

/* =========================
   Portable Text (KEEP)
========================= */
export interface PortableTextChild {
  _type: string;
  text?: string;
}

export interface PortableTextBlock {
  _type: string;
  style?: string;
  children?: PortableTextChild[];
}

/* =========================
   Multi Column Types
========================= */
export interface MultiColumnItem {
  title?: string;
  description?: PortableTextBlock[];
  link?: string;
  linkId?: string;
  iconBgColor?: string;
  svg: string
}

export interface MultiColumnData {
  section_title?: string;
  description?: PortableTextBlock[];
  columns?: MultiColumnItem[];
  backgroundColor?: {
    label: string;
    value: string;
  };
  textColor?: {
    label: string;
    value: string;
  };
  padding_top?: number;
  padding_bottom?: number;
  padding_top_mobile?: number;
  padding_bottom_mobile?: number;
}

/* =========================
   Hero Banner Types
========================= */
export interface HeroBannerData {
  title_block: PortableTextBlock[];
  description: PortableTextBlock[];
  buttonLabel?: string;
  buttonLink?: string;
  sectionId?: string;
  section_size?: string;
  removeBg?: boolean;
}

export interface Stats {
  value: string;
  numericValue: number;
  suffix: string;
  label: string
}

export interface MultiCol2Items {
  title: string;
  description: PortableTextBlock[];
  badge: string;
  featured: boolean;
}
export interface MultiCol3Items {
  name: string;
  position: string;
  description: string;
  badge: string;
  featured: boolean;
  rating: number;
}

/* =========================
   Shared Component Wrapper
========================= */
export interface COMPONENTS {
  _key?: Key;
  _type: string;

  /* Hero Banner */
  title: string;
  title_block?: PortableTextBlock[];
  description?: PortableTextBlock[];
  buttonLabel?: string;
  buttonLink?: string;
  sectionId?: string;
  section_size?: string;
  removeBg?: boolean;
  image: string;
  logo: string
  font_size: string
  icons_layout: string

  /* Multi Column */
  section_title?: string;
  columns?: MultiColumnItem[];
  backgroundColor?: {
    label: string;
    value: string;
  };
  textColor?: {
    label: string;
    value: string;
  };
  padding_top?: number;
  padding_bottom?: number;
  padding_top_mobile?: number;
  padding_bottom_mobile?: number;

  // booleans
  one_booking_a_day: boolean

  // stats 
  stats: Stats[]

  // multi column 2
  multiCol_items: MultiCol2Items[]

  // multi column 3
  multiColumns3_items:MultiCol3Items[]
}
