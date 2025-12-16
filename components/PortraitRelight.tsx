'use client'

import { useCallback, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useDropzone } from 'react-dropzone'
import { useTranslations } from 'next-intl'
import toast from 'react-hot-toast'
import { DownloadOptionsModal } from './DownloadOptionsModal'
import {
  LoginPrompt,
  ImageComparison,
  CreditsInfo,
  ErrorMessage,
  ActionButton,
  CreditCostBadge,
  CopyLinkButton,
} from './shared'
import { useAnalytics } from '@/hooks/useAnalytics'

interface ProcessingResult {
  id: string
  originalUrl: string
  processedUrl: string
  filename: string
  creditsRemaining: number
}

interface PortraitRelightProps {
  userRole?: 'user' | 'premium' | 'admin'
}

const LIGHTING_PRESETS = [
  { id: 'studio', icon: '💡', labelKey: 'studio' },
  { id: 'golden', icon: '🌅', labelKey: 'golden' },
  { id: 'dramatic', icon: '🎭', labelKey: 'dramatic' },
  { id: 'neon', icon: '🌈', labelKey: 'neon' },
  { id: 'natural', icon: '🪟', labelKey: 'natural' },
  { id: 'rembrandt', icon: '🎨', labelKey: 'rembrandt' },
]

export function PortraitRelight({ userRole = 'user' }: PortraitRelightProps) {
  const { data: session } = useSession()
  const t = useTranslations('portraitRelight')
  const tCommon = useTranslations('common')
  const { trackImageUploaded, trackImageDownloaded } = useAnalytics()
  const [processing, setProcessing] = useState(false)
  const [result, setResult] = useState<ProcessingResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showDownloadModal, setShowDownloadModal] = useState(false)
  const [selectedPreset, setSelectedPreset] = useState('studio')
  const [customPrompt, setCustomPrompt] = useState('')
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return

    const file = acceptedFiles[0]
    trackImageUploaded(file.size, file.type)
    setUploadedFile(file)
    setPreviewUrl(URL.createObjectURL(file))
    setError(null)
    setResult(null)
  }, [trackImageUploaded])

  const processImage = async () => {
    if (!uploadedFile) return

    setProcessing(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('file', uploadedFile)
      formData.append('preset', selectedPreset)
      if (customPrompt.trim()) {
        formData.append('prompt', customPrompt.trim())
      }

      toast.loading(t('processing'), { id: 'portrait-relight' })

      const response = await fetch('/api/portrait-relight', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to process image')
      }

      const data = await response.json()
      setResult(data.image)
      toast.success(t('success'), { id: 'portrait-relight' })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      setError(errorMessage)
      toast.error(errorMessage, { id: 'portrait-relight' })
    } finally {
      setProcessing(false)
    }
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/webp': ['.webp']
    },
    maxFiles: 1,
    maxSize: 20 * 1024 * 1024,
    disabled: processing
  })

  const reset = () => {
    setResult(null)
    setUploadedFile(null)
    setPreviewUrl(null)
    setError(null)
    setCustomPrompt('')
  }

  // Show login prompt for unauthenticated users
  if (!session) {
    return (
      <LoginPrompt
        title={t('auth.title')}
        description={t('auth.description')}
        callbackUrl="/tools/portrait-relight"
        accentColor="purple"
        features={[t('auth.feature1'), t('auth.feature2'), t('auth.feature3')]}
      />
    )
  }

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8">
      {/* Upload Area - show when no file uploaded */}
      {!uploadedFile && !result && (
        <div
          {...getRootProps()}
          className={`
            relative border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer
            transition-all duration-300 ease-in-out
            ${isDragActive
              ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20 scale-[1.02]'
              : 'border-gray-300 dark:border-gray-700 hover:border-amber-400 hover:bg-gray-100 dark:hover:bg-gray-800/50'
            }
            ${processing ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          <input {...getInputProps()} />

          <div className="space-y-6">
            {/* Icon */}
            <div className="flex justify-center">
              <div className="w-20 h-20 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
            </div>

            {/* Text */}
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
              {isDragActive ? tCommon('dropImageHere') : t('upload.title')}
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {t('upload.subtitle')}
            </p>
            <div className="flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-500">
              <span>{t('upload.formats')}</span>
              <CreditCostBadge tool="portrait_relight" size="md" />
            </div>
          </div>
        </div>
      )}

      {/* Settings Panel - show when file uploaded but not processed */}
      {uploadedFile && !result && (
        <div className="space-y-6">
          {/* Preview */}
          <div className="bg-gray-100 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">{t('preview.title')}</h3>
            <div className="flex justify-center">
              <img
                src={previewUrl!}
                alt="Preview"
                className="max-h-80 rounded-lg object-contain"
              />
            </div>
          </div>

          {/* Lighting Presets */}
          <div className="bg-gray-100 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">{t('settings.presets')}</h3>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
              {LIGHTING_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => setSelectedPreset(preset.id)}
                  disabled={processing}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    selectedPreset === preset.id
                      ? 'border-amber-500 bg-amber-500/10'
                      : 'border-gray-300 dark:border-gray-600 hover:border-amber-400'
                  }`}
                >
                  <span className="text-2xl block mb-1">{preset.icon}</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {t(`presets.${preset.labelKey}`)}
                  </span>
                </button>
              ))}
            </div>

            {/* Custom Prompt */}
            <div className="mt-6">
              <label className="block text-sm font-medium mb-2 text-gray-900 dark:text-white">
                {t('settings.customPrompt')}
              </label>
              <textarea
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder={t('settings.customPromptPlaceholder')}
                className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 resize-none"
                rows={3}
                disabled={processing}
              />
              <p className="text-xs text-gray-500 mt-1">{t('settings.customPromptHint')}</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <ActionButton
              onClick={processImage}
              icon="lightning"
              accentColor="purple"
              disabled={processing}
            >
              {processing ? t('buttons.processing') : t('buttons.relight')}
            </ActionButton>
            <ActionButton
              onClick={reset}
              icon="upload"
              variant="secondary"
              accentColor="gray"
              disabled={processing}
            >
              {t('buttons.changeImage')}
            </ActionButton>
          </div>

          {/* Processing indicator */}
          {processing && (
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
            </div>
          )}
        </div>
      )}

      {/* Error */}
      {error && <ErrorMessage message={error} />}

      {/* Result */}
      {result && (
        <div className="space-y-6">
          {/* Before/After Comparison */}
          <ImageComparison
            originalUrl={result.originalUrl}
            processedUrl={result.processedUrl}
            originalLabel={t('result.before')}
            processedLabel={t('result.after')}
            accentColor="purple"
          />

          {/* Credits Info */}
          <CreditsInfo
            message={t('result.success')}
            creditsRemaining={result.creditsRemaining}
            accentColor="purple"
          />

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <ActionButton
              onClick={() => setShowDownloadModal(true)}
              icon="download"
              accentColor="purple"
            >
              {t('buttons.download')}
            </ActionButton>
            <CopyLinkButton imageId={result.id} accentColor="purple" />
            <ActionButton
              onClick={reset}
              icon="upload"
              variant="secondary"
              accentColor="gray"
            >
              {t('buttons.processAnother')}
            </ActionButton>
          </div>
        </div>
      )}

      {/* Download Modal */}
      {result && showDownloadModal && (
        <DownloadOptionsModal
          imageId={result.id}
          originalFilename={result.filename}
          userRole={userRole}
          onClose={() => setShowDownloadModal(false)}
        />
      )}
    </div>
  )
}
