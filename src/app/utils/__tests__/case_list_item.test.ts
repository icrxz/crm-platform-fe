import { CaseFull } from '../../types/case';
import { mapCasesToListItems } from '../case_list_item';

function buildCaseFull(overrides: Partial<CaseFull> = {}): CaseFull {
  return {
    case_id: 'case-001',
    contractor_id: 'contractor-001',
    origin_channel: 'web',
    type: 'repair',
    priority: 'medium' as CaseFull['priority'],
    status: 'New' as CaseFull['status'],
    created_at: '2024-01-01T00:00:00Z',
    created_by: 'user-1',
    updated_at: '2024-01-01T00:00:00Z',
    updated_by: 'user-1',
    due_date: '2024-02-01T00:00:00Z',
    external_reference: 'SIN-001',
    ...overrides,
  };
}

describe('mapCasesToListItems', () => {
  it('should map the base case fields', () => {
    // Arrange
    const cases = [
      buildCaseFull({ case_id: 'case-002', external_reference: 'SIN-002' }),
    ];

    // Act
    const result = mapCasesToListItems(cases);

    // Assert
    expect(result).toEqual([
      expect.objectContaining({
        case_id: 'case-002',
        external_reference: 'SIN-002',
        status: 'New',
        due_date: '2024-02-01T00:00:00Z',
      }),
    ]);
  });

  it('should map nested customer, contractor and partner fields when present', () => {
    // Arrange
    const cases = [
      buildCaseFull({
        customer: {
          first_name: 'João',
          last_name: 'Silva',
          shipping: { city: 'São Paulo' },
        } as CaseFull['customer'],
        contractor: {
          company_name: 'Seguradora ABC',
        } as CaseFull['contractor'],
        partner: { first_name: 'Maria' } as CaseFull['partner'],
      }),
    ];

    // Act
    const [result] = mapCasesToListItems(cases);

    // Assert
    expect(result.customer_first_name).toBe('João');
    expect(result.customer_last_name).toBe('Silva');
    expect(result.customer_city).toBe('São Paulo');
    expect(result.contractor_company_name).toBe('Seguradora ABC');
    expect(result.partner_first_name).toBe('Maria');
  });

  it('should leave optional fields undefined when nested relations are missing', () => {
    // Arrange
    const cases = [buildCaseFull()];

    // Act
    const [result] = mapCasesToListItems(cases);

    // Assert
    expect(result.customer_first_name).toBeUndefined();
    expect(result.customer_last_name).toBeUndefined();
    expect(result.customer_city).toBeUndefined();
    expect(result.contractor_company_name).toBeUndefined();
    expect(result.partner_first_name).toBeUndefined();
  });

  it('should return an empty array for an empty input', () => {
    // Act
    const result = mapCasesToListItems([]);

    // Assert
    expect(result).toEqual([]);
  });
});
