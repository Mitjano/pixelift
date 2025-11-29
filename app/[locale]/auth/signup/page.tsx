import { FcGoogle } from "react-icons/fc";
import Link from "next/link";
import { signIn } from "@/lib/auth";

async function handleGoogleSignUp() {
  "use server";
  await signIn("google", { redirectTo: "/dashboard" });
}

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="flex min-h-screen items-center justify-center">
          <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Side - Branding & Features */}
            <div className="hidden lg:block space-y-8">
              <Link href="/" className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-blue-500 rounded-xl"></div>
                <span className="text-3xl font-bold">Pixelift</span>
              </Link>

              <div>
                <h1 className="text-5xl font-bold mb-4 leading-tight">
                  Transform Your Images with{" "}
                  <span className="bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
                    AI Power
                  </span>
                </h1>
                <p className="text-xl text-gray-400">
                  Join thousands of users enhancing their images with cutting-edge AI technology
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl">⚡</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">Lightning Fast Processing</h3>
                    <p className="text-gray-400">Upscale images in 10-20 seconds with our optimized AI pipeline</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl">🎨</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">Up to 8x Upscaling</h3>
                    <p className="text-gray-400">Enhance image quality with 2x, 4x, or 8x upscaling options</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl">✨</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">Face Enhancement</h3>
                    <p className="text-gray-400">Advanced AI models for professional face restoration</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-8 pt-4">
                <div>
                  <div className="text-3xl font-bold">10,000+</div>
                  <div className="text-sm text-gray-400">Happy Users</div>
                </div>
                <div>
                  <div className="text-3xl font-bold">500K+</div>
                  <div className="text-sm text-gray-400">Images Enhanced</div>
                </div>
                <div>
                  <div className="text-3xl font-bold">4.9/5</div>
                  <div className="text-sm text-gray-400">User Rating</div>
                </div>
              </div>
            </div>

            {/* Right Side - Signup Form */}
            <div className="w-full">
              {/* Mobile Logo */}
              <Link href="/" className="flex lg:hidden items-center justify-center gap-3 mb-8">
                <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-blue-500 rounded-xl"></div>
                <span className="text-3xl font-bold">Pixelift</span>
              </Link>

              <div className="bg-gray-800/50 backdrop-blur-xl rounded-3xl border border-gray-700/50 p-8 lg:p-10 shadow-2xl">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold mb-2">Create your account</h2>
                  <p className="text-gray-400">Start enhancing your images today</p>
                </div>

                {/* Google Sign Up Button */}
                <form action={handleGoogleSignUp} className="space-y-4">
                  <button
                    type="submit"
                    className="w-full flex items-center justify-center gap-3 bg-white text-gray-900 hover:bg-gray-50 py-4 px-6 rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    <FcGoogle className="text-2xl" />
                    Continue with Google
                  </button>
                </form>

                <div className="my-6 flex items-center gap-4">
                  <div className="flex-1 h-px bg-gray-700"></div>
                  <span className="text-sm text-gray-500">Quick & Secure</span>
                  <div className="flex-1 h-px bg-gray-700"></div>
                </div>

                {/* Features List */}
                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-2 text-sm text-gray-300">
                    <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Free tier with 10 credits monthly</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-300">
                    <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>No credit card required</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-300">
                    <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Cancel anytime</span>
                  </div>
                </div>

                {/* Sign In Link */}
                <div className="pt-6 border-t border-gray-700">
                  <p className="text-center text-sm text-gray-400">
                    Already have an account?{" "}
                    <Link href="/auth/signin" className="text-green-400 hover:text-green-300 font-semibold">
                      Sign in →
                    </Link>
                  </p>
                </div>
              </div>

              {/* Terms */}
              <p className="text-center text-xs text-gray-500 mt-6">
                By signing up, you agree to our{" "}
                <Link href="/terms" className="hover:underline hover:text-gray-400">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="/privacy" className="hover:underline hover:text-gray-400">
                  Privacy Policy
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
