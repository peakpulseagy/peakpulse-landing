/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";


import Banner from "../blocks/banner-blocks/HeroBanner";
import ContactCTA from "../blocks/contact/Contact";
import MultiColumnSection from "../blocks/multi-column/MultiColumnSection";
import MultiColumn2 from "../blocks/multi-column2/MultiColumn2";
import MultiColumn3 from "../blocks/multi-column3/MultiColumn3";
import StatsSection from "../blocks/stats-section/StatsSection";
import { COMPONENTS } from "./component";

export default function SpreadComponents({components}: {components: COMPONENTS[]}) {
  return (
    <>
      {components?.map((component: COMPONENTS, index: number) => {
        const componentMap: any = {
          banner: (
            <Banner
              key={component._key}
              title_block={component.title_block}
              image={component.image}
              logo={component.logo}
              buttonLabel={component.buttonLabel}
              buttonLink={component.buttonLink}
              description={component.description}
              section_size={component.section_size}
              font_size={component.font_size}
              sectionId={component.sectionId}
            />
          ),

          multi_column_section: (
            <MultiColumnSection
              key={component._key}
              sectionId={component.sectionId}
              section_title={component.section_title}
              description={component.description}
              columns={component.columns}
              padding_top={component.padding_top}
              padding_bottom={component.padding_bottom}
              padding_top_mobile={component.padding_top_mobile}
              padding_bottom_mobile={component.padding_bottom_mobile}
              textColor={component.textColor}
              backgroundColor={component.backgroundColor}
              icons_layout={component.icons_layout}
            />
          ),

          stats_section: (
            <StatsSection
              key={component._key}
              sectionId={component.sectionId}
              stats={component.stats}
              padding_top={component.padding_top}
              padding_bottom={component.padding_bottom}
              padding_top_mobile={component.padding_top_mobile}
              padding_bottom_mobile={component.padding_bottom_mobile}
            />
          ),
          multi_column_2: (
            <MultiColumn2
              key={component._key}
              sectionId={component.sectionId}
              title={component.title}
              multiCol_items={component.multiCol_items}
            />
          ),
          multi_column_3: (
            <MultiColumn3
              key={component._key}
              sectionId={component.sectionId}
              title={component.title}
              multiColumns3_items={component.multiColumns3_items}
            />
          ),
           contact: (
            <ContactCTA
              key={component._key}
              one_booking_a_day={component.one_booking_a_day}
            />
          ),
        };

        return (
          <div
            key={`${component._key}-${index}`}
            className={`${component._type}-section`}
          >
            {componentMap[component._type] ?? null}
          </div>
        );
      })}
    </>
  );
}
