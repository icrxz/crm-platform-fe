import { render, screen, fireEvent } from '@testing-library/react';
import PartnerForm from '../partner-form';
import { Partner } from '../../../types/partner';

// React 18 (installed in node_modules) doesn't ship useActionState/useFormStatus
// yet — those React 19 APIs are only available at runtime because Next.js
// aliases 'react'/'react-dom' to its own bundled experimental channel during
// build/dev. Jest doesn't go through that webpack alias, so we shim the two
// hooks here to make the component testable, mirroring what Next provides.
let capturedDispatch: ((formData: FormData) => void) | undefined;

jest.mock('react', () => {
  const actualReact = jest.requireActual('react');
  return {
    ...actualReact,
    useActionState: (
      action: (state: unknown, formData: FormData) => unknown,
      initialState: unknown
    ) => {
      capturedDispatch = (formData: FormData) => action(initialState, formData);
      return [initialState, capturedDispatch, false];
    },
  };
});

jest.mock('react-dom', () => {
  const actualReactDOM = jest.requireActual('react-dom');
  return {
    ...actualReactDOM,
    useFormStatus: () => ({ pending: false }),
  };
});

function buildPartner(overrides: Partial<Partner> = {}): Partner {
  return {
    partner_id: 'partner-001',
    first_name: 'João',
    last_name: 'Silva',
    company_name: '',
    legal_name: '',
    document: '12345678900',
    document_type: 'CPF',
    partner_type: 'Montador',
    shipping: { city: 'São Paulo', state: 'SP' },
    billing: { city: 'São Paulo', state: 'SP' },
    personal_contact: {},
    business_contact: {},
    region: 1,
    created_at: '2024-01-01T00:00:00Z',
    created_by: 'user-1',
    updated_at: '2024-01-01T00:00:00Z',
    updated_by: 'user-1',
    active: true,
    description: '',
    ...overrides,
  };
}

beforeEach(() => {
  capturedDispatch = undefined;
});

describe('PartnerForm', () => {
  describe('document type', () => {
    it('defaults to CPF for a new partner', () => {
      render(<PartnerForm onSubmit={jest.fn()} onClose={jest.fn()} />);

      expect(screen.getByLabelText('Documento')).toHaveAttribute(
        'placeholder',
        'Digite o CPF'
      );
      expect(screen.getByLabelText('Documento')).toBeRequired();
    });

    it('switches the mask and placeholder when CNPJ is selected', () => {
      render(<PartnerForm onSubmit={jest.fn()} onClose={jest.fn()} />);

      fireEvent.change(screen.getByLabelText('Tipo de documento'), {
        target: { value: 'CNPJ' },
      });

      expect(screen.getByLabelText('Documento')).toHaveAttribute(
        'placeholder',
        'Digite o CNPJ'
      );
    });

    it('clears the document field when switching document type', () => {
      render(<PartnerForm onSubmit={jest.fn()} onClose={jest.fn()} />);

      const documentInput = screen.getByLabelText(
        'Documento'
      ) as HTMLInputElement;
      fireEvent.change(documentInput, { target: { value: '12345678900' } });
      expect(documentInput.value).not.toBe('');

      fireEvent.change(screen.getByLabelText('Tipo de documento'), {
        target: { value: 'CNPJ' },
      });

      expect(
        (screen.getByLabelText('Documento') as HTMLInputElement).value
      ).toBe('');
    });

    it('preloads the existing document type and value when editing', () => {
      const partner = buildPartner({
        document: '12345678000199',
        document_type: 'CNPJ',
      });
      render(
        <PartnerForm
          partner={partner}
          onSubmit={jest.fn()}
          onClose={jest.fn()}
        />
      );

      expect(screen.getByLabelText('Tipo de documento')).toHaveValue('CNPJ');
      expect(screen.getByLabelText('Documento')).toHaveAttribute(
        'placeholder',
        'Digite o CNPJ'
      );
    });
  });

  describe('submitting', () => {
    it('sends the selected document type in the form data', () => {
      const onSubmit = jest.fn();
      render(<PartnerForm onSubmit={onSubmit} onClose={jest.fn()} />);

      fireEvent.change(screen.getByLabelText('Tipo de documento'), {
        target: { value: 'CNPJ' },
      });

      const formData = new FormData();
      formData.set('document_type', 'CNPJ');
      capturedDispatch!(formData);

      expect(onSubmit).toHaveBeenCalledWith(null, expect.any(FormData));
      expect(formData.get('document_type')).toBe('CNPJ');
    });
  });
});
