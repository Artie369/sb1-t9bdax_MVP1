import React from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { validateEmail } from '../../utils/validation';

interface SignInForm {
  email: string;
  password: string;
}

export default function SignIn() {
  const { register, handleSubmit, formState: { errors } } = useForm<SignInForm>();
  const { signIn, error, clearError } = useAuthStore();

  const onSubmit = async (data: SignInForm) => {
    try {
      clearError();
      await signIn(data.email, data.password);
    } catch (err) {
      console.error('Signin error:', err);
    }
  };

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 shadow-xl">
      <div className="text-center mb-8">
        <Heart className="w-12 h-12 text-white mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-white">Welcome Back</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <input
            {...register('email', {
              required: 'Email is required',
              validate: (value) => validateEmail(value) || 'Invalid email address'
            })}
            type="email"
            placeholder="Email"
            className="input-primary"
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-200">{errors.email.message}</p>
          )}
        </div>

        <div>
          <input
            {...register('password', {
              required: 'Password is required',
              minLength: {
                value: 8,
                message: 'Password must be at least 8 characters'
              }
            })}
            type="password"
            placeholder="Password"
            className="input-primary"
          />
          {errors.password && (
            <p className="mt-1 text-sm text-red-200">{errors.password.message}</p>
          )}
        </div>

        {error && (
          <p className="text-sm text-red-200 text-center">{error}</p>
        )}

        <button type="submit" className="w-full btn-primary">
          Sign In
        </button>

        <p className="text-center text-white">
          Don't have an account?{' '}
          <Link to="/auth?mode=signup" className="text-white underline hover:text-white/80">
            Sign Up
          </Link>
        </p>
      </form>
    </div>
  );
}