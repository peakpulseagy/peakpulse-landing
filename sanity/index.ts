import { type SchemaTypeDefinition } from 'sanity'
import { homeType } from './schemaTypes/singleton/home'
import banner from './blocks/banner'
import { blockContentType } from './schemaTypes/blockContentType'
import navigation from './schemaTypes/singleton/navigation'
import multiColumn from './blocks/multi-column'
import statsSection from './blocks/stats-section'
import multiColumn2 from './blocks/multi-column2'
import multiColumn3 from './blocks/multi-column3'
import contact from './blocks/contact'
import page from './schemaTypes/multiple/page'

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [
    // documents
    homeType,
    blockContentType,
    navigation,
    page,
    // blocks
    banner,
    multiColumn,
    statsSection,
    multiColumn2,
    multiColumn3,
    contact
  ],
}
