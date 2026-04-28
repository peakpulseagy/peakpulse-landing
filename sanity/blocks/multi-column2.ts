import { ALL_FIELDS_GROUP, defineField, defineType } from "sanity";

export default defineType({
  name: "multi_column_2",
  title: "Multi Column 2",
  type: "object",

  groups: [
    { name: "content", title: "Content" },
    { name: "settings", title: "Settings" },
    { ...ALL_FIELDS_GROUP, hidden: true },
  ],

  fieldsets: [
    {
      name: "padding",
      title: "Padding Settings",
      options: { collapsible: true, collapsed: true },
    },
  ],

  fields: [
    /* ================= CONTENT ================= */

    defineField({
      name: "title",
      title: "Section Title",
      type: "string",
      group: "content",
    }),

    defineField({
      name: "sectionId",
      title: "Section Id",
      type: "string",
      description: "Used for anchor links",
      group: "content",
    }),

    defineField({
      name: "multiCol_items",
      title: "Cards",
      type: "array",
      group: "content",
      of: [
        defineField({
          name: "item",
          title: "Card Item",
          type: "object",
          fields: [
            defineField({
              name: "title",
              title: "Title",
              type: "string",
              validation: (Rule) => Rule.required(),
            }),

            defineField({
              name: "description",
              title: "Description",
              type: "blockContent",
            }),

            defineField({
              name: "badge",
              title: "Badge Text",
              type: "string",
              description: "e.g. Most Popular, Best Value",
            }),

            defineField({
              name: "featured",
              title: "Featured Card",
              type: "boolean",
              description: "Highlights the card visually",
              initialValue: false,
            }),
          ],
          preview: {
            select: {
              title: "title",
              badge: "badge",
              featured: "featured",
            },
            prepare({ title, badge, featured }) {
              return {
                title,
                subtitle: badge,
                media: featured ? "⭐" : undefined,
              };
            },
          },
        }),
      ],
    }),

    /* ================= SETTINGS ================= */

    defineField({
      name: "padding_top",
      title: "Padding Top",
      type: "number",
      fieldset: "padding",
      group: "settings",
    }),

    defineField({
      name: "padding_bottom",
      title: "Padding Bottom",
      type: "number",
      fieldset: "padding",
      group: "settings",
    }),

    defineField({
      name: "padding_top_mobile",
      title: "Padding Top Mobile",
      type: "number",
      fieldset: "padding",
      group: "settings",
    }),

    defineField({
      name: "padding_bottom_mobile",
      title: "Padding Bottom Mobile",
      type: "number",
      fieldset: "padding",
      group: "settings",
    }),
  ],

  preview: {
    select: {
      title: "section_title",
      multiCol_items: "multiCol_items",
    },
    prepare({ title, multiCol_items }) {
      return {
        title: title || "Multi Column 2",
        subtitle: `${multiCol_items?.length || 0} cards`,
      };
    },
  },
});
