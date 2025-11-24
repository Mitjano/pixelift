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
  { value: 'low' as Resolution, label: 'Low', size: '512px', description: 'Best for web thumbnails' },
  { value: 'medium' as Resolution, label: 'Medium', size: '1024px', description: 'Good for web use' },
  { value: 'high' as Resolution, label: 'High', size: '2048px', description: 'High quality images' },
  { value: 'original' as Resolution, label: 'Original', size: 'Original', description: 'Full resolution' },
]

const formatOptions = [
  { value: 'png' as Format, label: 'PNG', description: 'Transparent background, larger file' },
  { value: 'jpg' as Format, label: 'JPG', description: 'Smaller file size, no transparency' },
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            Download Options
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Free User Notice */}
          {isFreeUser && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <p className="text-sm text-blue-800 dark:text-blue-300">
                <strong>Free Account:</strong> You can download Low resolution PNG images.
                <a href="/pricing" className="underline ml-1">Upgrade to Premium</a> for more options.
              </p>
            </div>
          )}

          {/* Resolution Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">
              Resolution
            </label>
            <div className="space-y-2">
              {resolutionOptions.map((option) => {
                const isDisabled = isFreeUser && option.value !== 'low'
                return (
                  <button
                    key={option.value}
                    onClick={() => !isDisabled && setSelectedResolution(option.value)}
                    disabled={isDisabled}
                    className={`
                      w-full text-left p-4 rounded-lg border-2 transition-all
                      ${selectedResolution === option.value
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                      }
                      ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                    `}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900 dark:text-white">
                            {option.label}
                          </span>
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            ({option.size})
                          </span>
                          {isDisabled && (
                            <span className="text-xs bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 px-2 py-0.5 rounded-full">
                              Premium
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {option.description}
                        </p>
                      </div>
                      <div className={`
                        w-5 h-5 rounded-full border-2 flex items-center justify-center
                        ${selectedResolution === option.value
                          ? 'border-blue-500 bg-blue-500'
                          : 'border-gray-300 dark:border-gray-600'
                        }
                      `}>
                        {selectedResolution === option.value && (
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Format Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">
              Format
            </label>
            <div className="space-y-2">
              {formatOptions.map((option) => {
                const isDisabled = isFreeUser && option.value !== 'png'
                return (
                  <button
                    key={option.value}
                    onClick={() => !isDisabled && setSelectedFormat(option.value)}
                    disabled={isDisabled}
                    className={`
                      w-full text-left p-4 rounded-lg border-2 transition-all
                      ${selectedFormat === option.value
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                      }
                      ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                    `}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900 dark:text-white">
                            {option.label}
                          </span>
                          {isDisabled && (
                            <span className="text-xs bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 px-2 py-0.5 rounded-full">
                              Premium
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {option.description}
                        </p>
                      </div>
                      <div className={`
                        w-5 h-5 rounded-full border-2 flex items-center justify-center
                        ${selectedFormat === option.value
                          ? 'border-blue-500 bg-blue-500'
                          : 'border-gray-300 dark:border-gray-600'
                        }
                      `}>
                        {selectedFormat === option.value && (
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {downloading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Downloading...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
