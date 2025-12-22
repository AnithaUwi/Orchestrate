import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginForm = z.infer<typeof loginSchema>;

const Login: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    console.log('Login attempt:', data);
  };

  // Get current time and date
  const currentTime = new Date().toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit', 
    second: '2-digit',
    hour12: false 
  });
  
  const currentDate = new Date().toLocaleDateString([], { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  return (
    <div className="min-h-screen bg-white flex">
      {/* LEFT SIDE: Login Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center px-4 lg:px-12">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-left mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Log in to Orchestrate
            </h1>
            <p className="text-sm text-gray-600">
               A comprehensive system for project management and resource booking
          
            </p>
          </div>

          {/* Create Account Link - TOP */}
          <div className="text-left mb-6">
            <p className="text-sm text-gray-700">
              New Here?{' '}
              <button className="text-primary-500 font-medium hover:text-primary-600">
                Create Account
              </button>
            </p>
          </div>

          {/* Login Form */}
          <div className="bg-white">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Email Field */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  Email or Phone Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    {...register('email')}
                    type="email"
                    className="w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-sm text-sm placeholder:text-gray-500 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                    placeholder="Enter your email"
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>
                )}
              </div>

              {/* Password Field */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm font-medium text-gray-900">
                    Password
                  </label>
                  <button
                    type="button"
                    className="text-xs text-primary-500 hover:text-primary-600"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    {...register('password')}
                    type={showPassword ? 'text' : 'password'}
                    className="w-full pl-10 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-sm text-sm placeholder:text-gray-500 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-500" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400 hover:text-gray-500" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>
                )}
              </div>

              {/* Login Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-primary-500 text-white py-2.5 px-4 text-sm font-medium rounded-sm hover:bg-primary-600 active:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Logging in...' : 'Log in'}
              </button>
            </form>
          </div>

          {/* Footer */}
          <div className="mt-8"> <center>
            <p className="text-xs text-gray-500">
             © 2025 Orchestrate
            </p>
            <p className="mt-1 text-xs text-gray-500">
              A comprehensive system for project management and resource booking system
          
            </p></center>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE: Background Image with Timer */}
     <div className="hidden lg:flex lg:w-1/2 bg-cover bg-center relative" 
     style={{ backgroundImage: 'url(/login.jpg)' }}>
  {/* Timer and Date Display */}
 <div className="absolute bottom-8 right-8 text-right">
  <div className="inline-block px-6 py-4 rounded-lg backdrop-blur-sm bg-gradient-to-br from-black/40 to-black/20">
    <div className="text-white">
      <div className="text-4xl font-mono font-bold tracking-wider">
        {currentTime}
      </div>
      <div className="text-lg mt-2 font-medium">
        {currentDate}
      </div>
    </div>
  </div>
</div>
</div>
    </div>
  );
};

export default Login;