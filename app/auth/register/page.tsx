'use client';

import { useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { registerUser } from '@/app/actions/auth';
import { PasswordInput } from '@/components/password-input';

export const dynamic = 'force-dynamic';

type UserType = 'human';

function RegisterForm() {
  const [userType] = useState<UserType>('human');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate form
    if (!email || !password || !passwordConfirm) {
      setError('Tous les champs sont obligatoires');
      return;
    }

    if (password !== passwordConfirm) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    if (password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères');
      return;
    }

    // Check password strength
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);

    if (!hasUpperCase || !hasLowerCase || !hasNumber) {
      setError(
        'Le mot de passe doit contenir des majuscules, minuscules et chiffres'
      );
      return;
    }

    setLoading(true);

    try {
      // Call Server Action instead of API endpoint
      const result = await registerUser({
        email,
        password,
        name: name || undefined,
        userType,
      });

      if (result.error) {
        setError(result.error);
        toast.error(result.error);
        setLoading(false);
        return;
      }

      if (result.success) {
        toast.success('Compte créé avec succès! Veuillez vous connecter.');
        router.push(`/auth/login?email=${encodeURIComponent(email)}`);
      }
    } catch (err) {
      setError('Une erreur est survenue');
      toast.error('Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            Créer un compte
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            Ou{' '}
            <Link
              href="/auth/login"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              se connecter
            </Link>
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="rounded-md bg-red-50 dark:bg-red-900/20 p-4">
              <p className="text-sm font-medium text-red-800 dark:text-red-200">
                {error}
              </p>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Nom (optionnel)
              </label>
              <input
                id="name"
                name="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 text-gray-900 dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-800"
                placeholder="Votre nom"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 text-gray-900 dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-800"
                placeholder="votre@email.com"
              />
            </div>

            <PasswordInput
              id="password"
              name="password"
              value={password}
              onChange={setPassword}
              label="Mot de passe"
              placeholder="8+ caractères"
              autoComplete="new-password"
              required
              hint="Doit contenir: majuscules, minuscules, chiffres"
            />

            <PasswordInput
              id="passwordConfirm"
              name="passwordConfirm"
              value={passwordConfirm}
              onChange={setPasswordConfirm}
              label="Confirmer le mot de passe"
              placeholder="Confirmer le mot de passe"
              autoComplete="new-password"
              required
            />
          </div>

          <div className="space-y-4">
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Inscription en cours...' : 'Créer mon compte'}
            </button>


          </div>
        </form>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400">Chargement...</p>
        </div>
      </div>
    }>
      <RegisterForm />
    </Suspense>
  );
}
