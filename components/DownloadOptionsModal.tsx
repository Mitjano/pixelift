'use client'

import { useState } from 'react'

type Resolution = 'low' | 'medium' | 'high' | 'original'
type Format = 'png' | 'jpg'

interface DownloadOptionsModalProps {
  imageId: string
  originalFilename: string
  userRole: 'user' | 'premium' | 'admin'
  onClose: () => void
}

const resolutionOptions = [
  { value: 'low' as Resolution, label: 'Low (512px)', premium: false },
  { value: 'medium' as Resolution, label: 'Medium (1024px)', premium: true },
  { value: 'high' as Resolution, label: 'High (2048px)', premium: true },
  { value: 'original' as Resolution, label: 'Original', premium: true },
]

const formatOptions = [
  { value: 'png' as Format, label: 'PNG (Transparent)', premium: false },
  { value: 'jpg' as Format, label: 'JPG (Smaller)', premium: true },
]

export function DownloadOptionsModal({ imageId, originalFilename, userRole, onClose }: DownloadOptionsModalProps) {
  const [selectedResolution, setSelectedResolution] = useState<Resolution>('low')
  const [selectedFormat, setSelectedFormat] = useState<Format>('png')
  const [downloading, setDownloading] = useState(false)

  const isFreeUser = userRole === 'user'
  const isPremiumOrAdmin = userRole === 'premium' || userRole === 'admin'

  const handleDownload = async () => {
    try {
      setDownloading(true)

      // Check if free user is trying to access premium features
      if (isFreeUser && (selectedResolution !== 'low' || selectedFormat !== 'png')) {
        alert('This option is only available for Premium users. Please upgrade your account.')
        return
      }

      // Build download URL with options
      const params = new URLSearchParams({
        resolution: selectedResolution,
        format: selectedFormat,
      })

      const response = await fetch(`/api/processed-images/${imageId}/download?${params}`)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Download failed')
      }

      // Get filename from response headers or use default
      const contentDisposition = response.headers.get('content-disposition')
      let filename = originalFilename.replace(/\.[^.]+$/, `.${selectedFormat}`)

      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?(.+)"?/i)
        if (filenameMatch) {
          filename = filenameMatch[1]
        }
      }

      // Download the file
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      onClose()
    } catch (error) {
      console.error('Download error:', error)
      alert(error instanceof Error ? error.message : 'Failed to download image')
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="relative w-full max-w-lg bg-white dark:bg-gray-800 rounded-xl shadow-2xl" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            Download Options
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Free User Notice */}
          {isFreeUser && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 mb-4">
              <p className="text-xs text-blue-800 dark:text-blue-300">
                <strong>Free Account:</strong> Low resolution PNG only. <a href="/pricing" className="underline">Upgrade to Premium</a> for more options.
              </p>
            </div>
          )}

          {/* Selects in horizontal layout */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            {/* Resolution Select */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                Resolution
              </label>
              <select
                value={selectedResolution}
                onChange={(e) => {
                  const newValue = e.target.value as Resolution
                  const option = resolutionOptions.find(o => o.value === newValue)
                  if (isFreeUser && option?.premium) {
                    alert('This option is only available for Premium users. Please upgrade your account.')
                    return
                  }
                  setSelectedResolution(newValue)
                }}
                className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              >
                {resolutionOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label} {isFreeUser && option.premium ? '🔒' : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Format Select */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                Format
              </label>
              <select
                value={selectedFormat}
                onChange={(e) => {
                  const newValue = e.target.value as Format
                  const option = formatOptions.find(o => o.value === newValue)
                  if (isFreeUser && option?.premium) {
                    alert('This option is only available for Premium users. Please upgrade your account.')
                    return
                  }
                  setSelectedFormat(newValue)
                }}
                className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              >
                {formatOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label} {isFreeUser && option.premium ? '🔒' : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Download Button */}
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="w-full px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {downloading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Downloading...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
