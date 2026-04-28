import { defineField, defineType } from "sanity";

export default defineType({
  name: "multi_column_3",
  title: "Multi Column 3",
  type: "object",
  fields: [
    defineField({
      name: "title",
      title: " Title",
      type: "string",
    }),
    defineField({
      name: "sectionId",
      title: "Section ID",
      type: "string",
    }),
    defineField({
      name: "multiColumns3_items",
      title: "Multi Columns3 Items",
      type: "array",
      of: [
        {
          name: "column",
          title: "Column",
          type: "object",
          fields: [
            {
              name: "name",
              title: "Name",
              type: "string",
            },
            {
              name: "position",
              title: "Position",
              type: "string",
            },
            {
              name: "description",
              title: "Description",
              type: "text",
            },
            {
              name: "badge",
              title: "Badge Label",
              type: "string",
            },
            {
              name: "rating",
              title: "Star Rating",
              type: "number",
              validation: (Rule) => Rule.min(0).max(5),
            },
            {
              name: "featured",
              title: "Featured Card",
              type: "boolean",
            },
          ],
        },
      ],
    }),
  ],
  preview: {
    select: { title: "section_title" },
    prepare: ({ title }) => ({
      title: title || "Multi Column 3",
    }),
  },
});
