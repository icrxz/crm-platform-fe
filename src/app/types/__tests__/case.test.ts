import { CaseCategory, parseCaseCategory } from '../case';

describe('parseCaseCategory', () => {
  it('should return the category when it is a known value', () => {
    expect(parseCaseCategory('d+')).toBe(CaseCategory.D_PLUS);
    expect(parseCaseCategory('furniture')).toBe(CaseCategory.FURNITURE);
  });

  it('should return undefined when the value is unknown', () => {
    expect(parseCaseCategory('unknown')).toBeUndefined();
  });

  it('should return undefined when the value is missing', () => {
    expect(parseCaseCategory(undefined)).toBeUndefined();
  });
});
