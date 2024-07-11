import { createCustomer } from './create';
import { deleteCustomer } from './delete';
import { getCustomerByID } from './get_by_id';
import { fetchCustomers } from './search';
import { editCustomer } from './update';

export const crmCoreEndpoint = process.env.CRM_CORE_ENDPOINT;
export const crmCoreApiKey = process.env.CRM_CORE_API_KEY;

export {
  createCustomer, deleteCustomer, editCustomer, fetchCustomers, getCustomerByID
};

