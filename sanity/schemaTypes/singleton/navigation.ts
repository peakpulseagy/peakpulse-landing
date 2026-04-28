import { ALL_FIELDS_GROUP, defineField, defineType } from "sanity";
import { ListIcon } from "@sanity/icons";

export default defineType({
  name: "navigation",
  title: "Navigation",
  type: "document",
  icon: ListIcon,
  groups: [
    {
      name: "content",
      title: "Content",
    },
    {
      name: "logo",
      title: "LOGO",
    },
    {
      name: "links",
      title: "LINKS",
    },
    {
      ...ALL_FIELDS_GROUP,
      hidden: true
    }
  ],
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      group: "content"
    }),

    defineField({
      name: "header_logo",
      title: "Header Logo",
      type: "image",
      group: "logo"

    }),
    defineField({
      name: "header_logo2",
      title: "Header Logo 2",
      type: "image",
      group: "logo"

    }),

    defineField({
      name: "footer_logo",
      title: "Footer Logo",
      type: "image",
      group: "logo"

    }),

defineField({
  name: "header_menu",
  title: "Header Menu",
  type: "array",
  group: "links",
  of: [
    {
      type: "object",
      fields: [
        {
          name: "title",
          title: "Title",
          type: "string",
        },
        {
          name: "page",
          title: "Internal Page",
          type: "object",
          fields: [
            {
              title: "slug",
              name: "slug",
              type: "reference",
              to: [{ type: "page" }, { type: "home" }],
            },
          ],
        },
        {
          name: "linkId",
          type: "string",
          title: "LinkId"
        },
        {
          name: "link",
          title: "External Link",
          type: "url",
          description: "Optional — use this instead of page for external URLs (e.g. https://revolutpeople.com/...)",
        },
      ],
    },
  ],
}),


    defineField({
      name: "footer_menu",
      title: "Footer Menu",
      type: "array",
      group: "links",

      of: [
        {
          type: "object",
          fields: [
            {
              name: "title",
              title: "Title",
              type: "string",
            },
            {
              name: "link",
              title: "Link",
              type: "string",
              initialValue: "about",
            },
          ],
        },
      ],
    }),

      defineField({
        name: "contact_email",
        title: "Contact Email",
        type: "array",
        of: [{ type: "block" }],
      group: "content",

      }),
      defineField({
        name: "services",
        title: "services",
        type: "array",
        of: [{ type: "block" }],
      group: "content",

      }),
      defineField({
        name: "about",
        title: "about",
        type: "array",
        of: [{ type: "block" }],
      group: "content",

      }),
      defineField({
        name: "company_info",
        title: "Company Info",
        type: "array",
        of: [{ type: "block" }],
      group: "content",
      }),
  ],
});
