import { ALL_FIELDS_GROUP, defineField, defineType } from "sanity";

export default defineType({
  name: "contact",
  title: "contact",
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
      name: "title",
      title: "Section Title",
      type: "string",
      description: "Optional heading for this section",
      group: "content"
    }),
    defineField({
      name: "one_booking_a_day",
      title: "One Booking Per Day",
      type: "boolean",
      description: "Optional text to indicate one booking per day",
      group: "content"
    }),
  ],
  preview: {
    select: {
      title: "title",
    },
    prepare: ({ title }) => ({
      title: title || "Contact",
    }),
  },
});
