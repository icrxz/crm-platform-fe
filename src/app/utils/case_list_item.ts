import { CaseFull } from '../types/case';
import { CaseListItem } from '../types/case-list-item';

export function mapCasesToListItems(cases: CaseFull[]): CaseListItem[] {
  return cases.map(
    (c): CaseListItem => ({
      case_id: c.case_id,
      external_reference: c.external_reference,
      status: c.status,
      due_date: c.due_date,
      customer_first_name: c.customer?.first_name,
      customer_last_name: c.customer?.last_name,
      customer_city: c.customer?.shipping?.city,
      contractor_company_name: c.contractor?.company_name,
      partner_first_name: c.partner?.first_name,
      category: c.metadata?.category,
    })
  );
}
