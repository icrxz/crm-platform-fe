import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { User, UserRole } from '../../../types/user';
import { ProfileForm } from '../profile-form';

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

jest.mock('next-auth/react', () => ({
  signOut: jest.fn(),
}));

jest.mock('../../../services/user', () => ({
  updateUser: jest.fn(),
  changePassword: jest.fn(),
  isEmailTaken: jest.fn(),
}));

const showSnackbar = jest.fn();
jest.mock('../../../context/SnackbarProvider', () => ({
  useSnackbar: () => ({ showSnackbar }),
}));

const { updateUser, changePassword, isEmailTaken } = jest.requireMock(
  '../../../services/user'
);

const mockUser: User = {
  user_id: 'user-1',
  username: 'joao.silva',
  first_name: 'João',
  last_name: 'Silva',
  email: 'joao@example.com',
  role: UserRole.OPERATOR,
  region: 1,
  created_at: '',
  updated_at: '',
  created_by: '',
  updated_by: '',
  active: true,
};

beforeEach(() => {
  jest.clearAllMocks();
  (useRouter as jest.Mock).mockReturnValue({ refresh: jest.fn() });
  isEmailTaken.mockResolvedValue(false);
  updateUser.mockResolvedValue({ success: true, message: 'ok' });
  changePassword.mockResolvedValue({ success: true, message: 'ok' });
});

describe('ProfileForm', () => {
  describe('rendering', () => {
    it('should render current user data as defaults', () => {
      render(<ProfileForm user={mockUser} />);

      expect(screen.getByLabelText('Nome')).toHaveValue('João');
      expect(screen.getByLabelText('Sobrenome')).toHaveValue('Silva');
      expect(screen.getByLabelText('Email')).toHaveValue('joao@example.com');
    });
  });

  describe('updating profile info', () => {
    it('should submit updated first name, last name and email', async () => {
      render(<ProfileForm user={mockUser} />);

      fireEvent.change(screen.getByLabelText('Nome'), {
        target: { value: 'Joaquim' },
      });
      fireEvent.click(screen.getByRole('button', { name: 'Salvar dados' }));

      await waitFor(() => {
        expect(updateUser).toHaveBeenCalledWith('user-1', {
          first_name: 'Joaquim',
          last_name: 'Silva',
          email: 'joao@example.com',
          updated_by: 'joao.silva',
        });
      });
      expect(showSnackbar).toHaveBeenCalledWith(
        'Dados atualizados com sucesso',
        'success'
      );
    });

    it('should block submission when the new email is already taken', async () => {
      isEmailTaken.mockResolvedValue(true);
      render(<ProfileForm user={mockUser} />);

      fireEvent.change(screen.getByLabelText('Email'), {
        target: { value: 'other@example.com' },
      });
      fireEvent.click(screen.getByRole('button', { name: 'Salvar dados' }));

      await waitFor(() => {
        expect(
          screen.getByText('Este email já está em uso por outro usuário')
        ).toBeInTheDocument();
      });
      expect(updateUser).not.toHaveBeenCalled();
    });

    it('should sign out when the update request is unauthorized', async () => {
      updateUser.mockResolvedValue({
        success: false,
        message: 'usuário não autorizado',
        unauthorized: true,
      });
      render(<ProfileForm user={mockUser} />);

      fireEvent.click(screen.getByRole('button', { name: 'Salvar dados' }));

      await waitFor(() => {
        expect(signOut).toHaveBeenCalledWith({ callbackUrl: '/login' });
      });
    });
  });

  describe('changing password', () => {
    function fillPasswordForm({
      current = 'oldPass123!',
      next = 'NewPass123!',
      confirm = 'NewPass123!',
    }: { current?: string; next?: string; confirm?: string } = {}) {
      fireEvent.change(screen.getByLabelText('Senha atual'), {
        target: { value: current },
      });
      fireEvent.change(screen.getByLabelText('Nova senha'), {
        target: { value: next },
      });
      fireEvent.change(screen.getByLabelText('Confirme a nova senha'), {
        target: { value: confirm },
      });
      fireEvent.click(screen.getByRole('button', { name: 'Alterar senha' }));
    }

    it('should submit the current and new password', async () => {
      render(<ProfileForm user={mockUser} />);

      fillPasswordForm();

      await waitFor(() => {
        expect(changePassword).toHaveBeenCalledWith('user-1', {
          old_password: 'oldPass123!',
          new_password: 'NewPass123!',
        });
      });
      expect(showSnackbar).toHaveBeenCalledWith(
        'Senha atualizada com sucesso',
        'success'
      );
    });

    it('should reject a new password shorter than 8 characters', async () => {
      render(<ProfileForm user={mockUser} />);

      fillPasswordForm({ next: 'Ab1!', confirm: 'Ab1!' });

      await waitFor(() => {
        expect(
          screen.getByText('A senha deve ter no mínimo 8 caracteres')
        ).toBeInTheDocument();
      });
      expect(changePassword).not.toHaveBeenCalled();
    });

    it('should reject a new password without a number', async () => {
      render(<ProfileForm user={mockUser} />);

      fillPasswordForm({ next: 'Abcdefgh!', confirm: 'Abcdefgh!' });

      await waitFor(() => {
        expect(
          screen.getByText('A senha deve conter ao menos 1 número')
        ).toBeInTheDocument();
      });
      expect(changePassword).not.toHaveBeenCalled();
    });

    it('should reject a new password without a special character', async () => {
      render(<ProfileForm user={mockUser} />);

      fillPasswordForm({ next: 'Abcdefg1', confirm: 'Abcdefg1' });

      await waitFor(() => {
        expect(
          screen.getByText('A senha deve conter ao menos 1 caractere especial')
        ).toBeInTheDocument();
      });
      expect(changePassword).not.toHaveBeenCalled();
    });

    it('should reject when confirmation does not match', async () => {
      render(<ProfileForm user={mockUser} />);

      fillPasswordForm({ confirm: 'Different123!' });

      await waitFor(() => {
        expect(
          screen.getByText('A nova senha e a confirmação devem corresponder')
        ).toBeInTheDocument();
      });
      expect(changePassword).not.toHaveBeenCalled();
    });

    it('should show the API error when the current password is wrong', async () => {
      changePassword.mockResolvedValue({
        success: false,
        message: 'old_password is incorrect',
      });
      render(<ProfileForm user={mockUser} />);

      fillPasswordForm();

      await waitFor(() => {
        expect(
          screen.getByText('old_password is incorrect')
        ).toBeInTheDocument();
      });
    });
  });
});
