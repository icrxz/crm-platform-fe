import { createContractor } from './create';
import { getContractorByID } from './get_by_id';
import { fetchContractors } from './search';
import { updateContractor } from './update';
import { deleteContractor } from './delete';

export const crmCoreEndpoint = process.env.CRM_CORE_ENDPOINT;
export const crmCoreApiKey = process.env.CRM_CORE_API_KEY;

export {
    createContractor,
    getContractorByID,
    fetchContractors,
    updateContractor,
    deleteContractor
};
