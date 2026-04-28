import {HomeIcon} from '@sanity/icons'
import {ALL_FIELDS_GROUP, defineArrayMember, defineField, defineType} from 'sanity'

export const homeType = defineType({
  name: 'home',
  title: 'Home',
  type: 'document',
  icon: HomeIcon,
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
  fields: [
    defineField({
      name: 'title',
      title: "String",
      type: 'string',
      group: "content",

    }),
    defineField({
      name: 'slug',
      type: 'slug',
      options: {
        source: 'title',
      },
      group: "content",

    }),
    defineField({
      name: 'mainImage',
      type: 'image',
      options: {
        hotspot: true,
      },
      group: "seo",

      fields: [
        defineField({
          name: 'alt',
          type: 'string',
          title: 'Alternative text',
        })
      ]
    }),
    defineField({
      name: 'publishedAt',
      type: 'datetime',
      group: "settings",

    }),
    defineField({
      name: 'body',
      type: 'blockContent',
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
    defineField({
      name: 'metaDescription',
      type: 'text',
      group: "seo",

    }),
  ],
  preview: {
    select: {
      title: 'title',
      media: 'mainImage',
    },
    prepare(selection) {
      return {...selection,}
    },
  },
})
