import type { StructureResolver } from 'sanity/structure'
// import { orderableDocumentListDeskItem } from '@sanity/orderable-document-list'
import {AddDocumentIcon,AddUserIcon} from "@sanity/icons";


export const structure: StructureResolver = (S, context) =>
  S.list()
    .title('Peak Pulse')
    .items([
      // S.documentTypeListItem('settings').title('Settings'),
      // S.documentTypeListItem('navigation').title('Navigation'),
      S.documentTypeListItem('home').title('Home'),
      S.documentTypeListItem('navigation').title('Navigation'),

      S.divider(),

      // Other document types EXCEPT page & team
      ...S.documentTypeListItems().filter(
        (item) =>
          item.getId() &&
          !['settings', 'navigation', 'home', 'page', 'news', "users"].includes(
            item.getId()!
          )
      ),

      S.documentTypeListItem('page').title('Pages'),

      // S.divider(),
      // orderableDocumentListDeskItem({
      //   type: 'news',
      //   title: 'News',
      //   icon:AddDocumentIcon ,
      //   S,
      //   context,
      // }),
      // S.divider(),
      // orderableDocumentListDeskItem({
      //   type: 'users',
      //   title: 'Users',
      //   icon: AddUserIcon,
      //   S,
      //   context,
      // }),
    ])
