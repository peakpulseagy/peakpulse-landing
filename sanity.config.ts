'use client'

import {visionTool} from '@sanity/vision'
import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'

import {apiVersion, dataset, projectId} from './sanity/env'

import {structure} from './sanity/structure'
import { presentationTool } from 'sanity/presentation'
// import { simplerColorInput } from 'sanity-plugin-simpler-color-input'
import {schema} from "@/sanity/index"

export default defineConfig({
  basePath: '/admin',
  projectId,
  dataset,
  // Add and edit the content schema in the './sanity/schemaTypes' folder
  title: 'PeakPulse',
  schema,
  plugins: [
    structureTool({structure}),
    // Vision is for querying with GROQ from inside the Studio
    // https://www.sanity.io/docs/the-vision-plugin
    visionTool({ defaultApiVersion: apiVersion }),
    presentationTool({
      previewUrl: {
        origin:  process.env.SANITY_STUDIO_PREVIEW_ORIGIN ||
      'http://localhost:3000',
        preview: "/",
        previewMode: {
          enable: "/api/draft-mode/enable",
        },
      },
    }),
    // simplerColorInput({
    //   // Note: These are all optional
    //   defaultColorFormat: 'rgba',
    //   defaultColorList: [
    //     { label: 'Dark', value: '#0F2B25' },
    //     { label: 'Light', value: '#F1E8DA' },
    //     // { label: 'Accent', value: '#626754' },
    //     { label: 'Custom...', value: 'custom' },
    //   ],
    //   enableSearch: true,
    //   showColorValue: true,
    // })
  ],
})
