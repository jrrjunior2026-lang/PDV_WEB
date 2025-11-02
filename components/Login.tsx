import React, { useState, useEffect, useCallback } from 'react';
import type { User } from '../types';

interface LoginProps {
    onLogin: (user: User) => void;
}

const MOCK_USERS_WITH_PASSWORDS = [
    { id: 'user-1', name: 'Admin User', email: 'admin@pdv.com', password: '123456', role: 'Admin', status: 'Active' },
    { id: 'user-2', name: 'Gerente User', email: 'gerente@pdv.com', password: '123456', role: 'Gerente', status: 'Active' },
    { id: 'user-3', name: 'Caixa User', email: 'caixa@pdv.com', password: '123456', role: 'Caixa', status: 'Active' },
];

const Spinner = () => (
    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);

const Login: React.FC<LoginProps> = ({ onLogin }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [formErrors, setFormErrors] = useState<{ email?: string; password?: string }>({});
    const [loginError, setLoginError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const validate = useCallback(() => {
        const errors: { email?: string; password?: string } = {};
        if (!email) {
            errors.email = 'O email é obrigatório.';
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            errors.email = 'O formato do email é inválido.';
        }
        if (!password) {
            errors.password = 'A senha é obrigatória.';
        }
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    }, [email, password]);

    useEffect(() => {
        validate();
    }, [email, password, validate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoginError(null);

        if (!validate()) return;

        setIsLoading(true);
        // Simulate network delay
        setTimeout(() => {
            const foundUser = MOCK_USERS_WITH_PASSWORDS.find(
                u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
            );

            if (foundUser && foundUser.status === 'Active') {
                const { password, ...userToLogin } = foundUser;
                onLogin(userToLogin as User);
            } else {
                setLoginError('Credenciais inválidas ou usuário inativo.');
            }
            setIsLoading(false);
        }, 500);
    };

    const isFormValid = Object.keys(formErrors).length === 0;

    return (
        <div className="flex items-center justify-center min-h-screen bg-brand-primary">
            <div className="w-full max-w-md p-8 space-y-8 bg-brand-secondary rounded-lg shadow-lg border border-brand-border">
                <div>
                    <h2 className="text-3xl font-bold text-center text-white">PDV Fiscal</h2>
                    <p className="mt-2 text-center text-sm text-brand-subtle">
                        Acesse sua conta para continuar
                    </p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit} noValidate>
                    <div>
                        <label htmlFor="email-address" className="block text-sm font-medium text-brand-subtle mb-1">Email</label>
                        <input
                            id="email-address"
                            name="email"
                            type="email"
                            autoComplete="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className={`appearance-none relative block w-full px-3 py-2 border bg-brand-primary placeholder-brand-subtle text-brand-text rounded-md focus:outline-none focus:ring-brand-accent focus:border-brand-accent sm:text-sm ${formErrors.email ? 'border-red-500' : 'border-brand-border'}`}
                            placeholder="seu@email.com"
                        />
                         {formErrors.email && <p className="mt-1 text-xs text-red-400">{formErrors.email}</p>}
                    </div>
                    <div>
                        <label htmlFor="password-for-ui" className="block text-sm font-medium text-brand-subtle mb-1">Senha</label>
                        <input
                            id="password-for-ui"
                            name="password"
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className={`appearance-none relative block w-full px-3 py-2 border bg-brand-primary placeholder-brand-subtle text-brand-text rounded-md focus:outline-none focus:ring-brand-accent focus:border-brand-accent sm:text-sm ${formErrors.password ? 'border-red-500' : 'border-brand-border'}`}
                            placeholder="••••••••"
                        />
                        {formErrors.password && <p className="mt-1 text-xs text-red-400">{formErrors.password}</p>}
                    </div>

                    {loginError && (
                        <p className="text-sm text-red-400 text-center bg-red-900/30 p-3 rounded-md">{loginError}</p>
                    )}
                    
                    <div className="text-xs text-brand-subtle text-center space-y-1 bg-brand-primary/50 p-3 rounded-md">
                        <p className="font-bold text-brand-text">Para testar:</p>
                        <p>Admin: <strong>admin@pdv.com</strong> (senha: 123456)</p>
                        <p>Gerente: <strong>gerente@pdv.com</strong> (senha: 123456)</p>
                        <p>Caixa: <strong>caixa@pdv.com</strong> (senha: 123456)</p>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={isLoading || !isFormValid}
                            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-brand-accent hover:bg-brand-accent/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-accent disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? <Spinner /> : 'Entrar'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Login;
