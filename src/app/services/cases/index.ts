import { assignOwner } from './assign_owner';
import { changePartner } from './change_partner';
import { changeStatus } from './change_status';
import { createCaseBatch } from './create_batch';
import { createCase } from './create_case';
import { getCaseByID } from './get_by_id';
import { publishCase } from './publish_case';
import { fetchCases } from './search_cases';

export const crmCoreEndpoint = process.env.CRM_CORE_ENDPOINT;
export const crmCoreApiKey = process.env.CRM_CORE_API_KEY;

export {
  assignOwner,
  changePartner,
  changeStatus,
  createCase,
  fetchCases,
  getCaseByID,
  createCaseBatch,
  publishCase,
};

