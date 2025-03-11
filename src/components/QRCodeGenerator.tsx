import { useState, useRef, ChangeEvent, useEffect } from 'react';
import QRCode from 'qrcode.react';
import { HexColorPicker } from 'react-colorful';
import toast from 'react-hot-toast';
import AppLogo from '@/app/logo.png';
import {
  LinkIcon,
  EnvelopeIcon,
  PhoneIcon,
  WifiIcon,
  ChatBubbleBottomCenterTextIcon,
  ArrowDownTrayIcon,
  PhotoIcon,
} from '@heroicons/react/24/outline';
import Image from 'next/image';

type QRType = 'url' | 'text' | 'email' | 'phone' | 'wifi';

interface QRData {
  type: QRType;
  content: string;
  email?: { subject?: string; body?: string };
  wifi?: { ssid: string; password: string; encryption: 'WPA' | 'WEP' | '' };
}

export default function QRCodeGenerator() {
  const [qrData, setQRData] = useState<QRData>({
    type: 'url',
    content: '',
    email: { subject: '', body: '' },
    wifi: { ssid: '', password: '', encryption: 'WPA' },
  });
  const [fgColor, setFgColor] = useState('#000000');
  const [bgColor, setBgColor] = useState('#ffffff');
  const [showFgPicker, setShowFgPicker] = useState(false);
  const [showBgPicker, setShowBgPicker] = useState(false);
  const [logo, setLogo] = useState<string | null>(null);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [qrImageUrl, setQrImageUrl] = useState<string>('');
  
  const qrRef = useRef<HTMLDivElement>(null);
  const fgPickerRef = useRef<HTMLDivElement>(null);
  const bgPickerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (fgPickerRef.current && !fgPickerRef.current.contains(event.target as Node)) {
        setShowFgPicker(false);
      }
      if (bgPickerRef.current && !bgPickerRef.current.contains(event.target as Node)) {
        setShowBgPicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (qrRef.current) {
      const canvas = qrRef.current.querySelector('canvas');
      if (canvas) {
        setQrImageUrl(canvas.toDataURL('image/png'));
      }
    }
  }, [qrData, fgColor, bgColor, logo]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      if (parent === 'email' || parent === 'wifi') {
        setQRData(prev => ({
          ...prev,
          [parent]: {
            ...(prev[parent] as object),
            [child]: value,
          },
        }));
      }
    } else {
      setQRData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleLogoUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1024 * 1024) {
        toast.error('Logo size should be less than 1MB');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        setLogo(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeLogo = () => {
    setLogo(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getQRValue = () => {
    switch (qrData.type) {
      case 'url':
        return qrData.content;
      case 'email':
        return `mailto:${qrData.content}?subject=${encodeURIComponent(qrData.email?.subject || '')}&body=${encodeURIComponent(qrData.email?.body || '')}`;
      case 'phone':
        return `tel:${qrData.content}`;
      case 'wifi':
        return `WIFI:T:${qrData.wifi?.encryption};S:${qrData.wifi?.ssid};P:${qrData.wifi?.password};;`;
      default:
        return qrData.content;
    }
  };

  const downloadQRCode = () => {
    if (!qrRef.current) return;
    
    const canvas = qrRef.current.querySelector('canvas');
    if (!canvas) return;

    const url = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = url;
    link.download = 'qr-code.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('QR Code downloaded successfully!');
  };

  const copyQRCode = async () => {
    if (!qrRef.current) return;
    
    const canvas = qrRef.current.querySelector('canvas');
    if (!canvas) return;

    try {
      // Try modern clipboard API first
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((blob) => {
          resolve(blob as Blob);
        }, 'image/png');
      });

      try {
        // Try to copy as image
        const data = new ClipboardItem({ 'image/png': blob });
        await navigator.clipboard.write([data]);
        toast.success('QR Code image copied to clipboard!');
      } catch (err) {
        // Fallback: Copy to clipboard using canvas data URL
        const dataUrl = canvas.toDataURL('image/png');
        const img = document.createElement('img');
        img.src = dataUrl;
        
        // Create a temporary textarea for copying
        const textarea = document.createElement('textarea');
        textarea.value = dataUrl;
        document.body.appendChild(textarea);
        textarea.select();
        
        try {
          document.execCommand('copy');
          toast.success('QR Code copied to clipboard! (as data URL)');
        } catch (err) {
          toast.error('Failed to copy QR Code');
        } finally {
          document.body.removeChild(textarea);
        }
      }
    } catch (err) {
      console.error('Failed to copy:', err);
      toast.error('Failed to copy QR Code');
    }
  };

  const inputClassName = "block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 transition-all duration-200 hover:border-indigo-300 dark:hover:border-indigo-700 focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-800 px-4 py-3 text-base";

  const textareaClassName = `${inputClassName} py-2.5`;

  const labelClassName = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 transition-colors duration-200";

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-6">
          <div className="flex justify-center mb-4">
            <Image
              src={AppLogo}
              alt="QR Code Generator Logo"
              width={64}
              height={64}
              priority
              className="transform transition-all duration-300 hover:scale-110"
            />
          </div>
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-600 mb-2">
            QR Code Generator
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Create beautiful QR codes for your URLs, text, emails, and more
          </p>
        </div>

        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg shadow-2xl rounded-2xl p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-6">
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 shadow-sm">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  QR Code Type
                </label>
                <div className="flex flex-wrap">
                  {[
                    { value: 'url', icon: LinkIcon, label: 'URL' },
                    { value: 'text', icon: ChatBubbleBottomCenterTextIcon, label: 'Text' },
                    { value: 'email', icon: EnvelopeIcon, label: 'Email' },
                    { value: 'phone', icon: PhoneIcon, label: 'Phone' },
                    { value: 'wifi', icon: WifiIcon, label: 'Wi-Fi' },
                  ].map(({ value, icon: Icon, label }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setQRData((prev: QRData) => ({ ...prev, type: value as QRType }))}
                      className={`flex-1 basis-[calc(50%-0.25rem)] sm:basis-[calc(20%-0.8rem)] min-w-[70px] m-1 flex flex-col items-center justify-center p-2 rounded-lg text-xs font-medium transition-colors ${
                        qrData.type === value
                          ? 'bg-indigo-500 text-white'
                          : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      <Icon className="w-5 h-5 mb-1" />
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {qrData.type === 'wifi' ? (
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6 shadow-sm space-y-4 hover:shadow-md transition-shadow duration-200">
                  <div>
                    <label className={labelClassName}>
                      Network Name (SSID)
                    </label>
                    <input
                      type="text"
                      name="wifi.ssid"
                      value={qrData.wifi?.ssid}
                      onChange={handleInputChange}
                      className={inputClassName}
                      placeholder="Enter network name"
                    />
                  </div>
                  <div>
                    <label className={labelClassName}>
                      Password
                    </label>
                    <input
                      type="password"
                      name="wifi.password"
                      value={qrData.wifi?.password}
                      onChange={handleInputChange}
                      className={inputClassName}
                      placeholder="Enter network password"
                    />
                  </div>
                  <div>
                    <label className={labelClassName}>
                      Security
                    </label>
                    <select
                      name="wifi.encryption"
                      value={qrData.wifi?.encryption}
                      onChange={handleInputChange}
                      className={inputClassName}
                    >
                      <option value="WPA">WPA/WPA2</option>
                      <option value="WEP">WEP</option>
                      <option value="">None</option>
                    </select>
                  </div>
                </div>
              ) : qrData.type === 'email' ? (
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6 shadow-sm space-y-4 hover:shadow-md transition-shadow duration-200">
                  <div>
                    <label className={labelClassName}>
                      Email Address
                    </label>
                    <input
                      type="email"
                      name="content"
                      value={qrData.content}
                      onChange={handleInputChange}
                      className={inputClassName}
                      placeholder="example@email.com"
                    />
                  </div>
                  <div>
                    <label className={labelClassName}>
                      Subject
                    </label>
                    <input
                      type="text"
                      name="email.subject"
                      value={qrData.email?.subject}
                      onChange={handleInputChange}
                      className={inputClassName}
                      placeholder="Enter email subject"
                    />
                  </div>
                  <div>
                    <label className={labelClassName}>
                      Body
                    </label>
                    <textarea
                      name="email.body"
                      value={qrData.email?.body}
                      onChange={handleInputChange}
                      rows={2}
                      className={`${textareaClassName} resize-y min-h-[80px]`}
                      placeholder="Enter email body"
                    />
                  </div>
                </div>
              ) : (
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
                  <label className={labelClassName}>
                    {qrData.type === 'url' ? 'URL' : qrData.type === 'phone' ? 'Phone Number' : 'Text'}
                  </label>
                  <input
                    type={qrData.type === 'url' ? 'url' : qrData.type === 'phone' ? 'tel' : 'text'}
                    name="content"
                    value={qrData.content}
                    onChange={handleInputChange}
                    className={inputClassName}
                    placeholder={
                      qrData.type === 'url'
                        ? 'https://example.com'
                        : qrData.type === 'phone'
                        ? '+1234567890'
                        : 'Enter your text here'
                    }
                  />
                </div>
              )}

              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
                  <div className="flex-1">
                    <label className={labelClassName}>
                      Logo (optional)
                    </label>
                    <div className="flex items-center">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        ref={fileInputRef}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="group relative flex items-center px-4 py-2.5 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl hover:border-indigo-500 dark:hover:border-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all duration-200"
                      >
                        <PhotoIcon className="h-5 w-5 mr-2 text-gray-400 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors duration-200" />
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-300 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors duration-200">
                          {logo ? 'Change Logo' : 'Upload Logo'}
                        </span>
                      </button>
                      {logo && (
                        <button
                          type="button"
                          onClick={removeLogo}
                          className="inline-flex items-center text-red-500 hover:text-red-600 text-sm font-medium transition-colors duration-200 hover:bg-red-50 dark:hover:bg-red-900/20 px-3 py-1.5 rounded-lg"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    {logo && (
                      <div className="mt-3 flex items-center space-x-2">
                        <div className="w-8 h-8 rounded-lg border-2 border-gray-200 dark:border-gray-600 overflow-hidden">
                          <img src={logo} alt="Logo preview" className="w-full h-full object-cover" />
                        </div>
                        <span className="text-xs text-gray-500 dark:text-gray-400">Logo preview</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className={labelClassName}>
                      Colors
                    </label>
                    <div className="flex space-x-4">
                      <div className="relative">
                        <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1.5">
                          FG
                        </label>
                        <div
                          className="w-10 h-10 rounded-xl border-2 border-gray-200 dark:border-gray-600 cursor-pointer shadow-sm transition-all duration-200 hover:scale-105 hover:shadow-md"
                          style={{ backgroundColor: fgColor }}
                          onClick={() => setShowFgPicker(!showFgPicker)}
                        />
                        {showFgPicker && (
                          <div className="absolute z-10 mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-xl p-2" ref={fgPickerRef}>
                            <HexColorPicker color={fgColor} onChange={setFgColor} />
                          </div>
                        )}
                      </div>
                      <div className="relative">
                        <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1.5">
                          BG
                        </label>
                        <div
                          className="w-10 h-10 rounded-xl border-2 border-gray-200 dark:border-gray-600 cursor-pointer shadow-sm transition-all duration-200 hover:scale-105 hover:shadow-md"
                          style={{ backgroundColor: bgColor }}
                          onClick={() => setShowBgPicker(!showBgPicker)}
                        />
                        {showBgPicker && (
                          <div className="absolute z-10 mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-xl p-2" ref={bgPickerRef}>
                            <HexColorPicker color={bgColor} onChange={setBgColor} />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-center justify-center lg:sticky lg:top-8" ref={qrRef}>
              <div className="bg-white dark:bg-gray-700 rounded-2xl p-6 shadow-xl transform transition-all duration-300 hover:scale-105">
                <QRCode
                  value={getQRValue()}
                  size={220}
                  fgColor={fgColor}
                  bgColor={bgColor}
                  level="H"
                  includeMargin
                  imageSettings={logo ? {
                    src: logo,
                    x: undefined,
                    y: undefined,
                    height: 44,
                    width: 44,
                    excavate: true,
                  } : undefined}
                />
              </div>
              <div className="mt-6 flex items-center space-x-4">
                <button
                  onClick={downloadQRCode}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-xl text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transform transition-all duration-200 hover:scale-105 shadow-lg"
                >
                  <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                  Download
                </button>
                
                <button
                  onClick={copyQRCode}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-xl text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transform transition-all duration-200 hover:scale-105 shadow-lg"
                >
                  <svg className="w-4 h-4 mr-2 text-gray-500 dark:text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                  </svg>
                  Copy QR Code
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Kreattix Footer */}
        <div className="mt-8 text-center">
          <div className="inline-flex items-center space-x-2 text-gray-600 dark:text-gray-300">
            <span className="text-sm">Powered by</span>
            <svg
              className="h-5 w-auto"
              viewBox="0 0 120 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M0 12C0 5.373 5.373 0 12 0h96c6.627 0 12 5.373 12 12s-5.373 12-12 12H12C5.373 24 0 18.627 0 12z"
                className="fill-current"
                fillOpacity="0.1"
              />
              <text
                x="60"
                y="16"
                textAnchor="middle"
                className="fill-current font-bold text-sm"
              >
                KREATTIX
              </text>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
} 