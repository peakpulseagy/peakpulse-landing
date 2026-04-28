import { defineField, defineType } from "sanity";

export default defineType({
  name: "stats_section",
  title: "Stats Section",
  type: "object",

  fields: [
    defineField({
      name: "sectionId",
      title: "Section ID",
      type: "string",
      description: "Used for anchor links (e.g. portfolio)",
    }),

    defineField({
      name: "stats",
      title: "Stats",
      type: "array",
      of: [
        defineField({
          name: "stat",
          type: "object",
          fields: [
            {
              name: "value",
              title: "Value",
              type: "string",
              description: "95%, 50+, 24/7",
            },
            {
              name: "numericValue",
              title: "Numeric Value",
              type: "number",
              description: "Used for count animation (95, 50, 100, 24)",
            },
            {
              name: "suffix",
              title: "Suffix",
              type: "string",
              description: "%, +, /7",
            },
            {
              name: "label",
              title: "Label",
              type: "string",
            },
          ],
        }),
      ],
    }),

    /* ===== Padding ===== */
    defineField({
      name: "padding_top",
      title: "Padding Top (Desktop)",
      type: "number",
    }),
    defineField({
      name: "padding_bottom",
      title: "Padding Bottom (Desktop)",
      type: "number",
    }),
    defineField({
      name: "padding_top_mobile",
      title: "Padding Top (Mobile)",
      type: "number",
    }),
    defineField({
      name: "padding_bottom_mobile",
      title: "Padding Bottom (Mobile)",
      type: "number",
    }),
  ],

  preview: {
    prepare() {
      return { title: "Stats Section" };
    },
  },
});
