interface TypeProps {
  id: string;
  name: string;
}

export interface FormatTypeProps extends TypeProps {}
export interface NewsTypeProps extends TypeProps {}
export interface RoleTypeProps extends TypeProps {}
export interface PublicationProps extends TypeProps {}
export interface PublicationMediaTypeProps {
  mediatype: string;
}
export interface PublicationTierProps extends TypeProps {}
export interface RegionProps extends TypeProps {}

export interface JournalistProps {
  id?: string;
  uuid?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  valid_email?: boolean;
  user_approved?: boolean;
  phone?: string;
  ddi?: string;
  mobile?: string;
  linkedin?: string;
  twitter?: string;
  datasource?: string;
  format_types?: Array<{
    id: string;
    name: string;
  }>;
  news_types?: Array<{
    id: string;
    name: string;
  }>;
  role_types?: Array<{
    id: string;
    name: string;
  }>;
  publications?: Array<{
    id: string;
    name: string;
    mediatypes?: Array<string>;
    tiers?: Array<string>;
  }>;
  regions?: Array<{
    id: string;
    name: string;
  }>;
}
