import CaseDetails from '../../components/cases/details';
import { CaseFull, CasePriority, CaseStatus } from '../../types/case';
import { CommentType } from '../../types/comment';
import { UserRole } from '../../types/user';
import { Shell } from '../shell';

// Deliberately uses long/unbroken values (username, address, comment) —
// this is what caught the CardText overflow bug (see card-text.tsx and
// form-details/comments.tsx), so keep them here rather than shortening
// for tidiness.
const crmCase = {
  case_id: 'case-1',
  owner_id: 'owner-1',
  customer_id: 'customer-1',
  partner_id: 'partner-1',
  contractor_id: 'contractor-1',
  origin_channel: 'web',
  type: 'repair',
  subject: 'Assunto do caso de exemplo com um texto um pouco mais longo',
  priority: CasePriority.MEDIUM,
  status: CaseStatus.ONGOING,
  created_at: '2026-09-01T10:00:00Z',
  created_by: 'user-1',
  updated_at: '2026-09-10T10:00:00Z',
  updated_by: 'user-1',
  due_date: '2026-09-30T10:00:00Z',
  target_date: '2026-10-01T10:00:00Z',
  external_reference: 'SIN-1000',
  metadata: { category: 'residential' },
  contractor: { company_name: 'Seguradora Exemplo' },
  owner: { username: 'operador.exemplo.com.longo' },
  partner: { first_name: 'Carlos', last_name: 'Eduardo Pereira' },
  customer: {
    first_name: 'João',
    last_name: 'Silva de Oliveira Nascimento',
    document: '00000000000',
    shipping: {
      address:
        'Avenida Bastante Longa Com Nome Extenso, 12345 - Complemento Bairro Distante',
      city: 'São Paulo',
      state: 'SP',
      zip_code: '01000-000',
    },
    personal_contact: {
      phone_number: '11999999999',
      email: 'joao.silva.oliveira.nascimento@example.com',
    },
  },
  product: {
    product_name: 'Máquina de lavar',
    product_description: 'Máquina de lavar 12kg',
    brand: 'Marca Exemplo',
    model: 'Modelo X',
    value: 2500,
    serial_number: 'SN-0001',
  },
  comments: [
    {
      comment_id: 'comment-1',
      case_id: 'case-1',
      content:
        'Este é um comentário bem mais longo pra testar se o texto quebra corretamente dentro do card sem estourar a largura da tela no mobile.',
      comment_type: CommentType.COMMENT,
      created_by: 'operador.exemplo.com.longo',
      created_at: '2026-09-05T10:00:00Z',
      updated_by: 'admin.exemplo',
      updated_at: '2026-09-06T10:00:00Z',
      // Local static assets, not a remote photo host: a committed visual
      // baseline can't depend on network availability/content drift, and
      // next.config.mjs's image remotePatterns only allows the real S3
      // attachments bucket anyway.
      attachments: [
        {
          attachment_id: 'a1',
          url: '/next.svg',
          file_name: 'foto1.svg',
        },
        {
          attachment_id: 'a2',
          url: '/vercel.svg',
          file_name: 'foto2.svg',
        },
      ],
    },
  ],
} as unknown as CaseFull;

export default function Page() {
  return (
    <Shell>
      <CaseDetails crmCase={crmCase} userRole={UserRole.ADMIN} />
    </Shell>
  );
}
