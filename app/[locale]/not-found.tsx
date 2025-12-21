import Link from 'next/link';
import { getTranslations } from 'next-intl/server';

export default async function NotFound() {
  const t = await getTranslations('notFound');

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="max-w-lg w-full text-center">
        <div className="mb-8">
          <div className="w-24 h-24 mx-auto bg-gray-800 rounded-full flex items-center justify-center mb-6">
            <span className="text-5xl font-bold text-green-400">404</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-4">
            {t('title')}
          </h1>
          <p className="text-gray-400 mb-6">
            {t('description')}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          <Link
            href="/"
            className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-medium rounded-lg transition-colors"
          >
            {t('goHome')}
          </Link>
          <Link
            href="/tools"
            className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-lg transition-colors"
          >
            {t('browseTools')}
          </Link>
        </div>

        <div className="border-t border-gray-800 pt-8">
          <p className="text-sm text-gray-500 mb-4">{t('popularTools')}</p>
          <div className="flex flex-wrap justify-center gap-2">
            <Link
              href="/tools/upscaler"
              className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm rounded-lg transition-colors"
            >
              AI Upscaler
            </Link>
            <Link
              href="/tools/background-remover"
              className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm rounded-lg transition-colors"
            >
              Background Remover
            </Link>
            <Link
              href="/tools/image-enhancer"
              className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm rounded-lg transition-colors"
            >
              Image Enhancer
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
