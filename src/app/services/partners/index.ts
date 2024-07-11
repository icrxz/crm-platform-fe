import { createPartner } from './create';
import { deletePartner } from './delete';
import { getPartnerByID } from './get_by_id';
import { fetchPartners } from './search';
import { editPartner } from './update';

export const crmCoreEndpoint = process.env.CRM_CORE_ENDPOINT;
export const crmCoreApiKey = process.env.CRM_CORE_API_KEY;

export {
  createPartner,
  deletePartner,
  editPartner,
  fetchPartners,
  getPartnerByID
};

