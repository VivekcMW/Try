'use client'

import { useState } from 'react'
import { Loader2, CheckCircle2, AlertCircle, Shield } from 'lucide-react'

interface AadhaarVerificationProps {
  onSuccess?: (data: any) => void
  onError?: (error: string) => void
  className?: string
}

export default function AadhaarVerification({
  onSuccess,
  onError,
  className = '',
}: AadhaarVerificationProps) {
  const [step, setStep] = useState<'input' | 'otp' | 'success'>('input')
  const [aadhaarNumber, setAadhaarNumber] = useState('')
  const [otp, setOtp] = useState('')
  const [transactionId, setTransactionId] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [verifiedData, setVerifiedData] = useState<any>(null)

  const handleSendOTP = async () => {
    setError('')
    setLoading(true)

    try {
      // Validate Aadhaar number
      if (!/^\d{12}$/.test(aadhaarNumber)) {
        throw new Error('Please enter a valid 12-digit Aadhaar number')
      }

      const response = await fetch('/api/aadhaar/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ aadhaarNumber }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send OTP')
      }

      setTransactionId(data.transactionId)
      setStep('otp')

    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to send OTP'
      setError(message)
      onError?.(message)
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOTP = async () => {
    setError('')
    setLoading(true)

    try {
      // Validate OTP
      if (!/^\d{6}$/.test(otp)) {
        throw new Error('Please enter a valid 6-digit OTP')
      }

      const response = await fetch('/api/aadhaar/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          aadhaarNumber,
          otp,
          transactionId,
        }),
      })

      const data = await response.json()

      if (!response.ok || !data.verified) {
        throw new Error(data.error || 'Invalid OTP')
      }

      setVerifiedData(data.data)
      setStep('success')
      onSuccess?.(data.data)

    } catch (err) {
      const message = err instanceof Error ? err.message : 'Verification failed'
      setError(message)
      onError?.(message)
    } finally {
      setLoading(false)
    }
  }

  const formatAadhaar = (value: string) => {
    const cleaned = value.replace(/\D/g, '')
    const match = cleaned.match(/(\d{0,4})(\d{0,4})(\d{0,4})/)
    if (match) {
      return [match[1], match[2], match[3]].filter(Boolean).join(' ')
    }
    return cleaned
  }

  return (
    <div className={`max-w-md mx-auto p-6 bg-white rounded-lg shadow-md ${className}`}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Shield className="w-8 h-8 text-blue-600" />
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Aadhaar Verification</h2>
          <p className="text-sm text-gray-500">Verify your identity securely</p>
        </div>
      </div>

      {/* Step 1: Aadhaar Input */}
      {step === 'input' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Aadhaar Number
            </label>
            <input
              type="text"
              value={formatAadhaar(aadhaarNumber)}
              onChange={(e) => setAadhaarNumber(e.target.value.replace(/\D/g, ''))}
              placeholder="1234 5678 9012"
              maxLength={14} // 12 digits + 2 spaces
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg tracking-wider"
              disabled={loading}
            />
            <p className="mt-2 text-xs text-gray-500">
              OTP will be sent to your Aadhaar-linked mobile number
            </p>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            onClick={handleSendOTP}
            disabled={loading || aadhaarNumber.length !== 12}
            className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Sending OTP...</span>
              </>
            ) : (
              <span>Send OTP</span>
            )}
          </button>
        </div>
      )}

      {/* Step 2: OTP Input */}
      {step === 'otp' && (
        <div className="space-y-4">
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
            OTP sent to your Aadhaar-linked mobile number
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Enter OTP
            </label>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              placeholder="123456"
              maxLength={6}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg text-center tracking-widest"
              disabled={loading}
              autoFocus
            />
            <p className="mt-2 text-xs text-gray-500">
              Valid for 10 minutes
            </p>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={() => {
                setStep('input')
                setOtp('')
                setError('')
              }}
              disabled={loading}
              className="px-4 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 disabled:opacity-50"
            >
              Back
            </button>
            <button
              onClick={handleVerifyOTP}
              disabled={loading || otp.length !== 6}
              className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Verifying...</span>
                </>
              ) : (
                <span>Verify OTP</span>
              )}
            </button>
          </div>

          <button
            onClick={handleSendOTP}
            disabled={loading}
            className="w-full text-sm text-blue-600 hover:text-blue-700 disabled:opacity-50"
          >
            Resend OTP
          </button>
        </div>
      )}

      {/* Step 3: Success */}
      {step === 'success' && verifiedData && (
        <div className="space-y-4">
          <div className="flex items-center justify-center py-6">
            <CheckCircle2 className="w-16 h-16 text-green-500" />
          </div>

          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900">Verification Successful!</h3>
            <p className="text-sm text-gray-500 mt-1">Your Aadhaar has been verified</p>
          </div>

          <div className="p-4 bg-gray-50 rounded-lg space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Name:</span>
              <span className="font-medium text-gray-900">{verifiedData.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Aadhaar:</span>
              <span className="font-medium text-gray-900">{verifiedData.aadhaarNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">DOB:</span>
              <span className="font-medium text-gray-900">{verifiedData.dob}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Gender:</span>
              <span className="font-medium text-gray-900">
                {verifiedData.gender === 'M' ? 'Male' : verifiedData.gender === 'F' ? 'Female' : 'Other'}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 text-green-600 text-sm">
            <CheckCircle2 className="w-4 h-4" />
            <span>Aadhaar Verified Badge Activated</span>
          </div>
        </div>
      )}
    </div>
  )
}
