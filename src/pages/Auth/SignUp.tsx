import React from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { validateEmail, validatePassword } from '../../utils/validation';
import { GENDER_IDENTITIES, SEXUAL_ORIENTATIONS } from '../../utils/constants';

interface SignUpForm {
  email: string;
  password: string;
  username: string;
  genderIdentity: string;
  sexualOrientation: string;
  birthDate: string;
}

export default function SignUp() {
  const { register, handleSubmit, formState: { errors } } = useForm<SignUpForm>();
  const { signUp, error, clearError } = useAuthStore();

  const onSubmit = async (data: SignUpForm) => {
    try {
      clearError();
      const birthDate = new Date(data.birthDate);
      const age = new Date().getFullYear() - birthDate.getFullYear();
      
      if (age < 18) {
        return;
      }

      await signUp(data.email, data.password, {
        username: data.username,
        genderIdentity: data.genderIdentity,
        sexualOrientation: data.sexualOrientation,
        age,
        bio: '',
        interests: [],
        preferredAgeRange: { min: 18, max: 50 },
        preferredDistance: 50,
      });
    } catch (err) {
      console.error('Signup error:', err);
    }
  };

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 shadow-xl">
      <div className="text-center mb-8">
        <Heart className="w-12 h-12 text-white mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-white">Create Account</h1>
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
            {...register('username', {
              required: 'Username is required',
              minLength: {
                value: 3,
                message: 'Username must be at least 3 characters'
              }
            })}
            type="text"
            placeholder="Username"
            className="input-primary"
          />
          {errors.username && (
            <p className="mt-1 text-sm text-red-200">{errors.username.message}</p>
          )}
        </div>

        <div>
          <input
            {...register('password', {
              required: 'Password is required',
              validate: (value) => {
                const validation = validatePassword(value);
                return validation.isValid || validation.errors[0];
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

        <div>
          <select
            {...register('genderIdentity', {
              required: 'Gender identity is required'
            })}
            className="input-primary"
            defaultValue=""
          >
            <option value="" disabled>Select Gender Identity</option>
            {GENDER_IDENTITIES.map((gender) => (
              <option key={gender} value={gender}>{gender}</option>
            ))}
          </select>
          {errors.genderIdentity && (
            <p className="mt-1 text-sm text-red-200">{errors.genderIdentity.message}</p>
          )}
        </div>

        <div>
          <select
            {...register('sexualOrientation', {
              required: 'Sexual orientation is required'
            })}
            className="input-primary"
            defaultValue=""
          >
            <option value="" disabled>Select Sexual Orientation</option>
            {SEXUAL_ORIENTATIONS.map((orientation) => (
              <option key={orientation} value={orientation}>{orientation}</option>
            ))}
          </select>
          {errors.sexualOrientation && (
            <p className="mt-1 text-sm text-red-200">{errors.sexualOrientation.message}</p>
          )}
        </div>

        <div>
          <input
            {...register('birthDate', {
              required: 'Birth date is required',
              validate: (value) => {
                const age = new Date().getFullYear() - new Date(value).getFullYear();
                return age >= 18 || 'You must be at least 18 years old';
              }
            })}
            type="date"
            className="input-primary"
          />
          {errors.birthDate && (
            <p className="mt-1 text-sm text-red-200">{errors.birthDate.message}</p>
          )}
        </div>

        {error && (
          <p className="text-sm text-red-200 text-center">{error}</p>
        )}

        <button type="submit" className="w-full btn-primary">
          Sign Up
        </button>

        <p className="text-center text-white">
          Already have an account?{' '}
          <Link to="/auth?mode=signin" className="text-white underline hover:text-white/80">
            Sign In
          </Link>
        </p>
      </form>
    </div>
  );
}