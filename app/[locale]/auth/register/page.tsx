import Link from "next/link";
import { getTranslations } from 'next-intl/server';
import RegisterForm from "@/components/auth/RegisterForm";

export default async function RegisterPage({ searchParams }: { searchParams: Promise<{ callbackUrl?: string }> }) {
  const t = await getTranslations('auth');
  const params = await searchParams;
  const callbackUrl = params.callbackUrl || "/dashboard";

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="flex min-h-screen items-center justify-center">
          <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Side - Branding */}
            <div className="hidden lg:block space-y-8">
              <Link href="/" className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-blue-500 rounded-xl"></div>
                <span className="text-3xl font-bold">Pixelift</span>
              </Link>

              <div>
                <h1 className="text-5xl font-bold mb-4 leading-tight">
                  {t('register.createAccount')}{" "}
                  <span className="bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
                    Pixelift
                  </span>
                </h1>
                <p className="text-xl text-gray-400">
                  {t('register.startEnhancing')}
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl">🎁</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">{t('register.freeCredits')}</h3>
                    <p className="text-gray-400">{t('register.freeCreditsDesc')}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl">⚡</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">{t('register.instantAccess')}</h3>
                    <p className="text-gray-400">{t('register.instantAccessDesc')}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl">🛡️</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">{t('register.noHiddenFees')}</h3>
                    <p className="text-gray-400">{t('register.noHiddenFeesDesc')}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-green-500/10 to-blue-500/10 border border-green-500/20 rounded-2xl p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="text-4xl font-bold bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
                    13+
                  </div>
                  <div className="text-sm">
                    <div className="font-semibold">{t('register.aiToolsAvailable')}</div>
                    <div className="text-gray-400">{t('register.upscaleRemoveRestore')}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - Registration Form */}
            <div className="w-full">
              {/* Mobile Logo */}
              <Link href="/" className="flex lg:hidden items-center justify-center gap-3 mb-8">
                <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-blue-500 rounded-xl"></div>
                <span className="text-3xl font-bold">Pixelift</span>
              </Link>

              <div className="bg-gray-800/50 backdrop-blur-xl rounded-3xl border border-gray-700/50 p-8 lg:p-10 shadow-2xl">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold mb-2">{t('register.createYourAccount')}</h2>
                  <p className="text-gray-400">{t('register.getStartedFree')}</p>
                </div>

                <RegisterForm callbackUrl={callbackUrl} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
