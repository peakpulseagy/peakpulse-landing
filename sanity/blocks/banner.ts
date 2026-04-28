import { ALL_FIELDS_GROUP, defineField, defineType } from "sanity";

export default defineType({
  name: "banner",
  title: "Banner",
  type: "object",
  groups: [
    {
      name: "content",
      title: "Content",
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
  fields: [
    defineField({
      name: "title_block",
      title: "Title",
      type: "array",
      of: [{ type: "block" }],
      group: "content",

    }),
    defineField({
      name: "image",
      title: "Image ",
      type: "image",
      group: "content",
    }),
    defineField({
      name: "logo",
      title: "Logo ",
      type: "image",
      group: "content",
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "array",
      of: [{ type: "block" }],
      group: "content",

    }),
     defineField({
      name: "buttonLabel",
       type: "string",
      group: "content",
      
    }),
    defineField({
      name: "buttonLink",
      type: "string",
      group: "content",
    }),
    
    defineField({
      name: "sectionId",
      type: "string",
      description: "Get Id of a section to scroll down",
      group: "content",
    }),
   
    defineField({
      name: "section_size",
      title: "Section size",
      type: "string",
      group: "settings",
      options: {
        list: [
          {title: "Small", value: "small"},
          {title: "Medium", value: "medium"},
          {title: "Large", value: "large"},
          {title: "Screen height", value: "screen"},
        ],
        layout: "radio",
      },
      initialValue: "medium",
    }),
    defineField({
      name: "font_size",
      title: "Font size",
      type: "string",
      group: "settings",
      options: {
        list: [
          {title: "Small", value: "small"},
          {title: "Medium", value: "medium"},
        ],
        layout: "radio",
      },
      initialValue: "medium",
    }),
    defineField({
      group: "settings",
      name: "removeBg",
      title: "Remove Bg",
      type: "boolean",
    }),
  ],

  preview: {
    select: {
      title: "title",
    },
  },
});
