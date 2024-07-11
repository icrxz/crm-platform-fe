import { addComment } from './add_comment';
import { getCaseComments } from './get_case_comments';

export const crmCoreEndpoint = process.env.CRM_CORE_ENDPOINT;
export const crmCoreApiKey = process.env.CRM_CORE_API_KEY;

export {
  addComment,
  getCaseComments
};

