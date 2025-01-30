import { createProduct } from './create';
import { getProductByID } from './get_by_id';
import { updateProduct } from './update';

export const crmCoreEndpoint = process.env.CRM_CORE_ENDPOINT;
export const crmCoreApiKey = process.env.CRM_CORE_API_KEY;

export {
  getProductByID,
  createProduct,
  updateProduct,
};
