export type PartnerListItem = {
  partner_id: string;
  first_name: string;
  last_name: string;
  partner_type: string;
  document: string;
  city?: string;
  state?: string;
  active: boolean;
};
