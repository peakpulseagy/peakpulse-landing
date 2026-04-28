export interface PageObject {
  slug: {
    slug: string;
  };
}

export interface HeaderSubMenuItem {
  title: string;
  page: PageObject;
  custom_links: string
}


export interface HeaderMenuItem {
  title: string;
  linkId: string;
  page: PageObject;
  subMenu : HeaderSubMenuItem[]
}

export interface HeaderValues {
  title: string;
  header_logo2: string;
  _type: string;
  header_menu: HeaderMenuItem[];
  footer_logo: string;
  header_logo: string;
  footer_menu: FooterMenuItem[];
  contact_email:
  Array<{
    _type: string;
    style?: string;
    children?: Array<{
      _type: string;
      text?: string;
    }>;
  }>;
  location:
   Array<{
    _type: string;
    style?: string;
    children?: Array<{
      _type: string;
      text?: string;
    }>;
   }>;
   services:
   Array<{
    _type: string;
    style?: string;
    children?: Array<{
      _type: string;
      text?: string;
    }>;
  }>;
   about:
   Array<{
    _type: string;
    style?: string;
    children?: Array<{
      _type: string;
      text?: string;
    }>;
   }>;
   company_info:
   Array<{
    _type: string;
    style?: string;
    children?: Array<{
      _type: string;
      text?: string;
    }>;
  }>;
  copywrite: string
}


export interface FooterMenuItem {
  title: string;
  link: string;
}

export interface AllMenusColor {
  _type: string
  menuColor: string
  slug: string
}


export interface FooterValues {
  footer_logo: string;
  header_logo: string;
  footer_menu: FooterMenuItem[];
  contact_email:
  Array<{
    _type: string;
    style?: string;
    children?: Array<{
      _type: string;
      text?: string;
    }>;
  }>;
  location:
   Array<{
    _type: string;
    style?: string;
    children?: Array<{
      _type: string;
      text?: string;
    }>;
   }>;
   services:
   Array<{
    _type: string;
    style?: string;
    children?: Array<{
      _type: string;
      text?: string;
    }>;
  }>;
   about:
   Array<{
    _type: string;
    style?: string;
    children?: Array<{
      _type: string;
      text?: string;
    }>;
   }>;
   company_info:
   Array<{
    _type: string;
    style?: string;
    children?: Array<{
      _type: string;
      text?: string;
    }>;
  }>;
  copywrite: string
}