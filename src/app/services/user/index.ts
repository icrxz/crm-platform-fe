import { getUserByID } from './get_by_id';
import { fetchUsers } from './search';
import { updateUser } from './update';

export const crmCoreEndpoint = process.env.CRM_CORE_ENDPOINT;
export const crmCoreApiKey = process.env.CRM_CORE_API_KEY;

export {
  fetchUsers,
  getUserByID,
  updateUser
};

