/* eslint-disable @typescript-eslint/no-explicit-any */
import {ALL_FIELDS_GROUP, defineField, defineType} from "sanity";
import { BookIcon} from "@sanity/icons";

export default defineType({
  name: "page",
  title: "Page",
  type: "document",
  icon: BookIcon,
  groups: [
    {
      name: "content",
      title: "Content",
    },
    {
      name: "seo",
      title: "SEO",
    },
    {
      name: "settings",
      title: "Settings",
    },
    {
      ...ALL_FIELDS_GROUP,
      hidden: true,
    },
  ],
  fieldsets: [
      {
        name: "title_settings",
        title: "Title Settings",
        
        options: { collapsible: true, collapsed: true },
      },
      
    ],
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      group: "content",
    }),
    defineField({
      name: "hide_title",
      title: "Hide Title",
      type: "boolean",
      group: "content",
    }),
    defineField({
      name: "padding_top",
      title: "Page Title Padding Top",
      type: "number",
      fieldset: "title_settings",
      group: "settings",
    }),
    defineField({
      name: "padding_bottom",
      title: "Page Title Padding Bottom",
      type: "number",
      fieldset: "title_settings",
      group: "settings",
    }),
    defineField({
      name: "padding_top_mobile",
      title: "Page Title Padding Top Mobile",
      type: "number",
      group: "settings",
      fieldset: "title_settings",

    }),
    defineField({
      name: "padding_bottom_mobile",
      title: "Page Title Padding Bottom Mobile",
      type: "number",
      fieldset: "title_settings",
      group: "settings",
    }),

    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: {
        source: "title",
        maxLength: 96,
      },
      group: "content",
    }),
    defineField({
      name: "publishedAt",
      title: "Published at",
      type: "datetime",
      group: "content",
    }),
    defineField({
      name: "menuColor",
      title: "Menu Color",
      type: "string",
      options: {
        list: [
          {title: "Dark", value: "dark"},
          {title: "Light", value: "light"},
        ], // <-- predefined values
        layout: "radio", // <-- defaults to 'dropdown'
      },
      group: "settings",
    }),
    defineField({
      name: "section_separator",
      title: "Section Separator",
      type: "boolean",
      group: "settings",
      description: "this will add a background on the bottom of section"
    }),
    defineField({
      name: "background_position",
      title: "Background Position",
      type: "string",
      options: {
        list: [
          {title: "Absolute", value: "absolute"},
          {title: "Fixed", value: "fixed"},
        ],
        layout: "radio", 
      },
      initialValue: "absolute",
      group: "settings",
    }),
    defineField({
      name: "meta_description",
      title: "Meta Description",
      type: "string",
      group: "seo",
    }),

    defineField({
      name: "meta_image",
      title: "Meta Image",
      type: "image",
      group: "seo",
    }),

    defineField({
      name: "enable_disclaimer",
      title: "Enable Disclaimer",
      type: "boolean",
      group: "content",
    }),

    defineField({
      name: "Message",
      title: "Message",
      type: "text",
      group: "content",
    }),

    defineField({
      name: "components",
      title: "Components",
      type: "array",
      group: "content",

      of: [
        {type: "stats_section"},
        {type: "contact"},
        {type: "multi_column_section"},
        { type: "banner" },
        { type: "multi_column_2" },
        { type: "multi_column_3" },
        // {type: "richtext_blocks"},
        // {type: "multi_text_banner"},
        // {type: "multi_text_content"},
        // {type: "text_with_image"},
        
      ],
      options: {
        insertMenu: {
          groups: [
            {
              name: "hero",
              title: "Hero",
              of: ["slider"],
            },
            {
              name: "text",
              title: "Text Blocks",
              of: [
                "multi_column_2",
                "multi_column_3",
                // "multiple_text",
                "text_with_image",
                // "text_with_image2",
                // "multipletext_with_banner",
                // "title_with_accordion",
                "multi_column_section",
                "stats_section",
                "multi_text_banner",
                "multi_text_content",
                "contact"
              ],
            },
            {
              name: "banner",
              title: "Banners",
              of: [
                "landing_banner",
                "banner"
              ],
            },
            {
              name: "image",
              title: "Images",
              of: [
                "image_with_text_block",
                "feature_section"
              ],
            },
          ],
          // views: [
          //   {
          //     name: "grid",
          //     previewImageUrl: (block: string ) =>
          //       `/sanity/preview/${block}.png`,
          //   },
          //   { name: "list" },
          // ],
        },
      },
    }),
  ],

  preview: {
    select: {
      title: "title",
    },
  },
});
