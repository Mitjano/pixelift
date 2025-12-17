import Link from "next/link";
import ForgotPasswordForm from "@/components/auth/ForgotPasswordForm";

export default async function ForgotPasswordPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="flex min-h-screen items-center justify-center">
          <div className="w-full max-w-md">
            {/* Logo */}
            <Link href="/" className="flex items-center justify-center gap-3 mb-8">
              <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-blue-500 rounded-xl"></div>
              <span className="text-3xl font-bold">Pixelift</span>
            </Link>

            <div className="bg-gray-800/50 backdrop-blur-xl rounded-3xl border border-gray-700/50 p-8 shadow-2xl">
              <ForgotPasswordForm />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
