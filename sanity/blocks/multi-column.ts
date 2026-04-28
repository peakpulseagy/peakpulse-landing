import { ALL_FIELDS_GROUP, defineField, defineType } from "sanity";

export default defineType({
  name: "multi_column_section",
  title: "Multi Column Section",
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
      {
        name: "title_padding",
        title: "Title Item Padding Settings",
        
        options: { collapsible: true, collapsed: true },
      },
      {
        name: "title_alignment",
        title: "Title Item Alignment Settings",
        
        options: { collapsible: true, collapsed: true },
      },
      {
        name: "title_font_size",
        title: "Title Item Font Size Settings",
        
        options: { collapsible: true, collapsed: true },
      },
    ],
  fields: [
    defineField({
      name: "section_title",
      title: "Section Title",
      type: "string",
      description: "Optional heading for this section",
      group: "content"
    }),
    defineField({
      name: "sectionId",
      title: "Section Id",
      type: "string",
      description: "Section Id",
      group: "content"
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "array",
      of: [{type: 'block'}],
      description: "Optional heading for this section",
      group: "content"
    }),

    defineField({
      name: "buttonLink",
      title: "Button Link",
      type: "string",
      group: "content"
    }),
     defineField({
      name: "buttonLabel",
      title: "Button Label",
      type: "string",
      group: "content"
    }),
    
   
    defineField({
      name: "allow_mobile_slider",
      title: "Allow Mobile Slider",
      type: "boolean",
      group: "settings",
    }),

    defineField({
      name: "icons_layout",
      title: "Icon layout",
      type: "boolean",
      group: "settings",
    }),

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
      group: "settings",
      fieldset: "padding",

    }),
    defineField({
      name: "padding_bottom_mobile",
      title: "Padding Bottom Mobile",
      type: "number",
      fieldset: "padding",
      group: "settings",
    }),
   
    defineField({
      name: "columns",
      title: "Columns",
      type: "array",
      group: "content",

      of: [
        defineField({
          name: "column",
          title: "Column",
          type: "object",
          fields: [
            defineField({
              name: "title",
              title: "Title",
              type: "string",
              description: "Item Card Title",
            }),
            defineField({
                name: "iconBgColor",
                title: "Icon Bg Color",
                type: "string",
                options: {
                  list: [
                    {title: "red", value: "#f37272"},
                    {title: "green", value: "#22c55e"},
                    {title: "light-green", value: "#57d1c7"},
                  ],
                  layout: "radio",
                },
                initialValue: "medium",
            }),
              defineField({
              name: "svg",
              title: "Svg",
              type: "image",
              description: "Svg Icon",
            }),
            {
              name: "description",
              title: "Description",
              type: "array",
              of: [{type: 'block'}],
              description: "Item Card Description",
            },
            defineField({
              name: "linkId",
              title: "LinkId",
              type: "string",
              description: "Item Card Link",
            }),
            defineField({
              name: "link",
              title: "Link",
              type: "string",
              description: "Item Card Link",
            }),
          ],
          preview: {
            select: { title: "title" },
            prepare: ({ title }) => ({
              title: title,
            }),
          },
        }),
      ],
    }),
  ],
  preview: {
    select: {
      title: "section_title",
    },
    prepare: ({ title }) => ({
      title: title || "Multi Column Section",
    }),
  },
});
