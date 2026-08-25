export type PublicContactInfo = {
  email: string | null;
  phone: string | null;
  whatsapp: string | null;
};

export const EMPTY_CONTACT: PublicContactInfo = {
  email: null,
  phone: null,
  whatsapp: null,
};

export function hasAnyContact(info: PublicContactInfo): boolean {
  return Boolean(info.email || info.phone || info.whatsapp);
}
