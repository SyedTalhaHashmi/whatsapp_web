"use client"

import { useState, useRef, useEffect } from 'react'
import { Input } from './input'

interface OtpInputProps {
  value: string
  onChange: (value: string) => void
  length?: number
  disabled?: boolean
  className?: string
}

export function OtpInput({ 
  value, 
  onChange, 
  length = 6, 
  disabled = false,
  className = "" 
}: OtpInputProps) {
  const [otp, setOtp] = useState<string[]>(new Array(length).fill(''))
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    // Update internal state when external value changes
    if (value) {
      const otpArray = value.split('').slice(0, length)
      const newOtp = [...otpArray, ...new Array(length - otpArray.length).fill('')]
      setOtp(newOtp)
    } else {
      setOtp(new Array(length).fill(''))
    }
  }, [value, length])

  const handleChange = (element: HTMLInputElement, index: number) => {
    if (element.value.length > 1) {
      element.value = element.value[0]
    }

    const newOtp = [...otp]
    newOtp[index] = element.value
    setOtp(newOtp)

    // Update parent component
    onChange(newOtp.join(''))

    // Move to next input if current input is filled
    if (element.value && index < length - 1) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace') {
      if (otp[index] && index > 0) {
        // If current input has value, clear it
        const newOtp = [...otp]
        newOtp[index] = ''
        setOtp(newOtp)
        onChange(newOtp.join(''))
      } else if (index > 0) {
        // If current input is empty, move to previous input
        inputRefs.current[index - 1]?.focus()
      }
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text/plain').slice(0, length)
    const pastedArray = pastedData.split('')
    
    const newOtp = [...otp]
    pastedArray.forEach((char, index) => {
      if (index < length && /^\d$/.test(char)) {
        newOtp[index] = char
      }
    })
    
    setOtp(newOtp)
    onChange(newOtp.join(''))
    
    // Focus the next empty input or the last input
    const nextEmptyIndex = newOtp.findIndex(char => !char)
    const focusIndex = nextEmptyIndex === -1 ? length - 1 : nextEmptyIndex
    inputRefs.current[focusIndex]?.focus()
  }

  return (
    <div className={`flex gap-2 justify-center ${className}`}>
      {otp.map((digit, index) => (
        <Input
          key={index}
          ref={(el) => (inputRefs.current[index] = el)}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={1}
          value={digit}
          onChange={(e) => handleChange(e.target, index)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          onPaste={handlePaste}
          className="w-12 h-12 text-center text-lg font-semibold border-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          disabled={disabled}
          autoComplete="one-time-code"
        />
      ))}
    </div>
  )
} 