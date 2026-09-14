import { addComment } from './add_comment';
import { getCaseComments } from './get_case_comments';
import { addAttachmentToComment } from './add_attachment_to_comment';
import { updateCommentContent } from './update_comment_content';

export const crmCoreEndpoint = process.env.CRM_CORE_ENDPOINT;
export const crmCoreApiKey = process.env.CRM_CORE_API_KEY;

export {
  addComment,
  getCaseComments,
  addAttachmentToComment,
  updateCommentContent,
};
