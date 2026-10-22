import { useState } from 'react';
import { CheckCircle, AlertCircle, XCircle } from './icons';
import { VerifiedBadge } from './VerifiedBadge';

interface JobListingFormProps {
  verificationStatus: 'Verified' | 'Unverified' | 'Pending';
  hasBan: boolean;
  testScenario?: 1 | 2 | 3 | 4 | 5 | 6;
  onBack?: () => void;
  desktop?: boolean;
}

interface JobListing {
  title: string;
  description: string;
  location: string;
  minCompensation: string;
  maxCompensation: string;
  employmentType: 'Full-time' | 'Part-time' | 'Contract' | '';
  skills: string;
}

type ModalType = 'success' | 'draft' | 'error' | null;

export function JobListingForm({ verificationStatus, hasBan, testScenario, onBack, desktop }: JobListingFormProps) {
  const [formData, setFormData] = useState<JobListing>({
    title: '',
    description: '',
    location: '',
    minCompensation: '',
    maxCompensation: '',
    employmentType: '',
    skills: '',
  });

  const [modalType, setModalType] = useState<ModalType>(null);
  const [missingFields, setMissingFields] = useState<string[]>([]);
  const [errorMessage, setErrorMessage] = useState('');

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRadioChange = (value: 'Full-time' | 'Part-time' | 'Contract') => {
    setFormData((prev) => ({ ...prev, employmentType: value }));
  };

  const validateRequiredFields = (): string[] => {
    const missing: string[] = [];
    if (!formData.title.trim()) missing.push('Job Title');
    if (!formData.description.trim()) missing.push('Job Description');
    if (!formData.location.trim()) missing.push('Location');
    if (!formData.minCompensation.trim() || !formData.maxCompensation.trim())
      missing.push('Compensation Range');
    if (!formData.employmentType) missing.push('Employment Type');
    return missing;
  };

  const handleSubmit = () => {
    if (testScenario === 1) {
      setModalType('success');
      return;
    }

    if (testScenario === 2) {
      const missing = validateRequiredFields();
      setMissingFields(
        missing.length > 0
          ? missing
          : ['Job Title', 'Job Description', 'Location', 'Compensation Range', 'Employment Type'],
      );
      setModalType('draft');
      return;
    }

    const accountError = getAccountError(verificationStatus, hasBan);
    if (accountError) {
      setErrorMessage(accountError);
      setModalType('error');
      return;
    }

    const missing = validateRequiredFields();
    if (missing.length > 0) {
      setMissingFields(missing);
      setModalType('draft');
    } else {
      setModalType('success');
    }
  };

  const handleSaveDraft = () => setModalType(null);
  const handleEditListing = () => setModalType(null);
  
  const handlePostAnother = () => {
    setFormData({
      title: '', description: '', location: '', minCompensation: '', maxCompensation: '', employmentType: '', skills: '',
    });
    setModalType(null);
  };

  const handleExit = () => setModalType(null);
  const handleTryAgain = () => setModalType(null);

  const getAccountError = (status: 'Verified' | 'Unverified' | 'Pending', ban: boolean): string | null => {
    if (status === 'Unverified' && ban) return 'Account must be verified and penalty-free!';
    if (status === 'Unverified')        return 'Account verification required to post jobs!';
    if (status === 'Pending')           return 'Your verification is currently under review!';
    if (ban)                            return 'Access denied: Your account has an active ban!';
    return null;
  };

  // ─── STYLING VARIABLES ───────────────────────────────────────────────────────
  const isDesktop = desktop;
  const containerBg = isDesktop ? '#1A2419' : '#FFFBF5';
  const labelColor = isDesktop ? '#FFFFFF' : '#1F2420';
  const inputBg = isDesktop ? 'rgba(255,255,255,0.04)' : '#FFFFFF';
  const inputBorder = isDesktop ? 'rgba(255,255,255,0.1)' : '#E0E0E0';
  const focusBorder = '#E8762F';
  const inputText = isDesktop ? '#FFFFFF' : '#1F2420';
  const placeholderTextClass = isDesktop ? 'placeholder-gray-500' : 'placeholder-gray-400';
  const buttonSecondaryBorder = isDesktop ? 'rgba(255,255,255,0.2)' : '#2D3E2C';
  const buttonSecondaryText = isDesktop ? '#FFFFFF' : '#2D3E2C';
  const buttonSecondaryHover = isDesktop ? 'rgba(255,255,255,0.05)' : '#F9FAFB';

  const modalBg = isDesktop ? '#222F21' : '#FFFFFF';
  const modalText = isDesktop ? '#FFFFFF' : '#1F2420';
  const modalSubText = isDesktop ? 'rgba(255,255,255,0.6)' : '#6B7269';
  const modalBorder = isDesktop ? '1px solid rgba(255,255,255,0.1)' : 'none';

  return (
    <div
      className="flex flex-col"
      style={{
        backgroundColor: containerBg,
        fontFamily: 'Inter, sans-serif',
        ...(isDesktop ? { width: '100%', minHeight: '100%' } : { width: '393px', height: '852px' }),
      }}
    >
      {/* Mobile Header */}
      {!isDesktop && (
        <div className="px-4 py-4 flex items-center gap-3 flex-shrink-0 justify-between" style={{ backgroundColor: '#2D3E2C', height: '56px' }}>
          <div className="flex items-center gap-3">
            <button className="text-white text-sm hover:opacity-80" onClick={onBack}>← Back</button>
            <h1 className="text-white" style={{ fontFamily: 'Playfair Display, serif', fontSize: '20px', lineHeight: '1.3' }}>
              Post a Job Listing
            </h1>
          </div>
          <VerifiedBadge />
        </div>
      )}

      {/* Form Container */}
      <div className={isDesktop ? "flex-1 overflow-y-auto px-8 w-full flex justify-center py-12" : "flex-1 overflow-y-auto px-4 py-3"}>
        <div className={isDesktop ? "w-full max-w-2xl" : "w-full space-y-4"}>
          
          {isDesktop && (
            <div className="mb-8 border-b pb-6" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
              <div className="flex justify-between items-end">
                <div>
                  <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '36px', color: '#FFFFFF', margin: '0 0 8px 0', lineHeight: 1.1 }}>Post a Job Listing</h2>
                  <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '15px', margin: 0 }}>Create a new opening to discover culinary talent.</p>
                </div>
                <div style={{ paddingBottom: '4px' }}>
                  <VerifiedBadge />
                </div>
              </div>
            </div>
          )}

          <div className={isDesktop ? "space-y-6" : "space-y-4"}>
            {/* Job Title */}
            <div>
              <label className="block mb-1.5" style={{ color: labelColor, fontSize: '14px', fontWeight: '500' }}>
                Job Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text" name="title" value={formData.title} onChange={handleInputChange}
                placeholder="e.g., Private Chef for Events"
                className={`w-full px-4 rounded-lg focus:outline-none transition-colors ${placeholderTextClass}`}
                style={{
                  height: isDesktop ? '48px' : '44px', fontSize: '15px', color: inputText,
                  backgroundColor: inputBg, border: `1px solid ${inputBorder}`,
                }}
                onFocus={(e) => (e.target.style.borderColor = focusBorder)}
                onBlur={(e) => (e.target.style.borderColor = inputBorder)}
              />
            </div>

            {/* Job Description */}
            <div>
              <label className="block mb-1.5" style={{ color: labelColor, fontSize: '14px', fontWeight: '500' }}>
                Job Description <span className="text-red-500">*</span>
              </label>
              <textarea
                name="description" value={formData.description} onChange={handleInputChange}
                placeholder="Describe the role, responsibilities..."
                className={`w-full px-4 py-3 rounded-lg focus:outline-none resize-none transition-colors ${placeholderTextClass}`}
                style={{
                  height: isDesktop ? '120px' : '72px', fontSize: '15px', color: inputText,
                  backgroundColor: inputBg, border: `1px solid ${inputBorder}`,
                }}
                onFocus={(e) => (e.target.style.borderColor = focusBorder)}
                onBlur={(e) => (e.target.style.borderColor = inputBorder)}
              />
            </div>

            {/* Location */}
            <div>
              <label className="block mb-1.5" style={{ color: labelColor, fontSize: '14px', fontWeight: '500' }}>
                Location <span className="text-red-500">*</span>
              </label>
              <input
                type="text" name="location" value={formData.location} onChange={handleInputChange}
                placeholder="City, Country"
                className={`w-full px-4 rounded-lg focus:outline-none transition-colors ${placeholderTextClass}`}
                style={{
                  height: isDesktop ? '48px' : '44px', fontSize: '15px', color: inputText,
                  backgroundColor: inputBg, border: `1px solid ${inputBorder}`,
                }}
                onFocus={(e) => (e.target.style.borderColor = focusBorder)}
                onBlur={(e) => (e.target.style.borderColor = inputBorder)}
              />
            </div>

            {/* Compensation Range */}
            <div>
              <label className="block mb-1.5" style={{ color: labelColor, fontSize: '14px', fontWeight: '500' }}>
                Compensation Range <span className="text-red-500">*</span>
              </label>
              <div className={`flex ${isDesktop ? 'gap-4' : 'flex-col gap-2'}`}>
                <input
                  type="number" name="minCompensation" value={formData.minCompensation} onChange={handleInputChange}
                  placeholder="Minimum ($)"
                  className={`w-full px-4 rounded-lg focus:outline-none transition-colors ${placeholderTextClass}`}
                  style={{
                    height: isDesktop ? '48px' : '44px', fontSize: '15px', color: inputText,
                    backgroundColor: inputBg, border: `1px solid ${inputBorder}`,
                  }}
                  onFocus={(e) => (e.target.style.borderColor = focusBorder)}
                  onBlur={(e) => (e.target.style.borderColor = inputBorder)}
                />
                <input
                  type="number" name="maxCompensation" value={formData.maxCompensation} onChange={handleInputChange}
                  placeholder="Maximum ($)"
                  className={`w-full px-4 rounded-lg focus:outline-none transition-colors ${placeholderTextClass}`}
                  style={{
                    height: isDesktop ? '48px' : '44px', fontSize: '15px', color: inputText,
                    backgroundColor: inputBg, border: `1px solid ${inputBorder}`,
                  }}
                  onFocus={(e) => (e.target.style.borderColor = focusBorder)}
                  onBlur={(e) => (e.target.style.borderColor = inputBorder)}
                />
              </div>
            </div>

            {/* Employment Type */}
            <div>
              <label className="block mb-2" style={{ color: labelColor, fontSize: '14px', fontWeight: '500' }}>
                Employment Type <span className="text-red-500">*</span>
              </label>
              <div className={`flex gap-6 ${isDesktop ? 'bg-black/20 p-4 rounded-lg' : ''}`} style={{ border: isDesktop ? `1px solid ${inputBorder}` : 'none' }}>
                {(['Full-time', 'Part-time', 'Contract'] as const).map((type) => (
                  <label key={type} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio" name="employmentType" checked={formData.employmentType === type} onChange={() => handleRadioChange(type)}
                      className="w-4 h-4 cursor-pointer" style={{ accentColor: focusBorder }}
                    />
                    <span style={{ color: labelColor, fontSize: '14px' }}>{type}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Skills */}
            <div>
              <label className="block mb-1.5" style={{ color: labelColor, fontSize: '14px', fontWeight: '500' }}>
                Required Skills (Optional)
              </label>
              <input
                type="text" name="skills" value={formData.skills} onChange={handleInputChange}
                placeholder="Add skills (comma separated)..."
                className={`w-full px-4 rounded-lg focus:outline-none transition-colors ${placeholderTextClass}`}
                style={{
                  height: isDesktop ? '48px' : '44px', fontSize: '15px', color: inputText,
                  backgroundColor: inputBg, border: `1px solid ${inputBorder}`,
                }}
                onFocus={(e) => (e.target.style.borderColor = focusBorder)}
                onBlur={(e) => (e.target.style.borderColor = inputBorder)}
              />
            </div>

            {/* Action Buttons */}
            <div className={`flex gap-3 pt-2 pb-6 ${isDesktop ? 'mt-8' : ''}`}>
              <button
                onClick={handleSaveDraft}
                className="flex-1 rounded-lg transition-all"
                style={{
                  height: isDesktop ? '52px' : '48px',
                  border: `2px solid ${buttonSecondaryBorder}`,
                  color: buttonSecondaryText,
                  fontSize: '15px', fontWeight: '600',
                  backgroundColor: 'transparent',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = buttonSecondaryHover)}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                Save as Draft
              </button>
              <button
                onClick={handleSubmit}
                className="flex-1 rounded-lg text-white hover:opacity-90 transition-all font-semibold"
                style={{
                  height: isDesktop ? '52px' : '48px',
                  backgroundColor: '#E8762F',
                  fontSize: '15px', boxShadow: isDesktop ? '0 4px 14px rgba(232,118,47,0.3)' : 'none',
                }}
              >
                Post Job →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ─── MODALS ──────────────────────────────────────────────────────────── */}
      
      {/* Success Modal */}
      {modalType === 'success' && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="absolute inset-0" style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)', backdropFilter: isDesktop ? 'blur(4px)' : 'none' }} onClick={handleExit} />
          <div className="relative rounded-2xl mx-4 shadow-2xl" style={{ backgroundColor: modalBg, border: modalBorder, fontFamily: 'Inter, sans-serif', maxWidth: '400px', width: '100%', padding: '32px' }}>
            <div className="flex flex-col items-center text-center">
              <div className="rounded-full flex items-center justify-center" style={{ backgroundColor: '#5A8F56', width: '72px', height: '72px', marginBottom: '24px' }}>
                <CheckCircle className="w-10 h-10 text-white" />
              </div>
              <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '28px', lineHeight: '1.2', color: modalText, marginBottom: '16px' }}>
                Job posted successfully!
              </h2>
              <p className="mb-8" style={{ color: modalSubText, fontSize: '15px', lineHeight: '1.6' }}>
                Your job listing is now live and visible to chefs and other professionals. 
              </p>
              <button onClick={handlePostAnother} className="w-full rounded-lg text-white hover:opacity-90 transition-all font-semibold" style={{ backgroundColor: '#E8762F', height: '50px', fontSize: '15px', marginBottom: '12px' }}>
                Post Another Job
              </button>
              <button onClick={handleExit} className="w-full rounded-lg transition-all font-semibold" 
                style={{ border: `2px solid ${buttonSecondaryBorder}`, color: buttonSecondaryText, height: '50px', fontSize: '15px', backgroundColor: 'transparent' }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = buttonSecondaryHover)}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                Back to Home
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Draft Modal */}
      {modalType === 'draft' && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="absolute inset-0" style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)', backdropFilter: isDesktop ? 'blur(4px)' : 'none' }} onClick={handleExit} />
          <div className="relative rounded-2xl mx-4 shadow-2xl" style={{ backgroundColor: modalBg, border: modalBorder, fontFamily: 'Inter, sans-serif', maxWidth: '440px', width: '100%', padding: '32px' }}>
            <div className="flex flex-col items-center text-center">
              <div className="rounded-full flex items-center justify-center" style={{ backgroundColor: '#F4A236', width: '72px', height: '72px', marginBottom: '24px' }}>
                <AlertCircle className="w-10 h-10 text-white" />
              </div>
              <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '24px', lineHeight: '1.3', color: '#F4A236', marginBottom: '16px' }}>
                Required job details missing! Please fill all the fields!
              </h2>
              <p className="mb-6" style={{ color: modalSubText, fontSize: '15px', lineHeight: '1.6' }}>
                Your job listing has been saved as a draft. Please complete all required fields.
              </p>
              
              <div className="mb-8 text-left w-full p-4 rounded-xl" style={{ backgroundColor: isDesktop ? 'rgba(0,0,0,0.2)' : '#FFFBF5', border: `1px solid ${isDesktop ? 'rgba(255,255,255,0.05)' : '#FDE68A'}` }}>
                <p style={{ color: modalText, fontSize: '14px', fontWeight: '600', marginBottom: '10px' }}>Missing Fields:</p>
                <ul className="space-y-2">
                  {missingFields.map((field) => (
                    <li key={field} className="flex items-center gap-2" style={{ color: '#E8762F', fontSize: '14px', fontWeight: '500' }}>
                      <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>
                      <span>{field}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button onClick={handleEditListing} className="w-full rounded-lg text-white hover:opacity-90 transition-all font-semibold" style={{ backgroundColor: '#E8762F', height: '50px', fontSize: '15px', marginBottom: '12px' }}>
                Edit Job Listing
              </button>
              <div className="flex gap-3 w-full">
                <button onClick={handlePostAnother} className="flex-1 rounded-lg transition-all font-semibold" 
                  style={{ border: `2px solid ${buttonSecondaryBorder}`, color: buttonSecondaryText, height: '48px', fontSize: '14px', backgroundColor: 'transparent' }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = buttonSecondaryHover)}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  Post Another
                </button>
                <button onClick={handleExit} className="flex-1 rounded-lg transition-all font-semibold" 
                  style={{ border: `2px solid ${buttonSecondaryBorder}`, color: buttonSecondaryText, height: '48px', fontSize: '14px', backgroundColor: 'transparent' }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = buttonSecondaryHover)}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  Save & Exit
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error Modal */}
      {modalType === 'error' && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="absolute inset-0" style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)', backdropFilter: isDesktop ? 'blur(4px)' : 'none' }} onClick={handleExit} />
          <div className="relative rounded-2xl mx-4 shadow-2xl" style={{ backgroundColor: modalBg, border: modalBorder, fontFamily: 'Inter, sans-serif', maxWidth: '400px', width: '100%', padding: '32px' }}>
            <div className="flex flex-col items-center text-center">
              <div className="rounded-full flex items-center justify-center" style={{ backgroundColor: '#C84538', width: '72px', height: '72px', marginBottom: '24px' }}>
                <XCircle className="w-10 h-10 text-white" />
              </div>
              <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '28px', lineHeight: '1.2', color: '#C84538', marginBottom: '16px' }}>
                Unable to post job listing
              </h2>
              <p className="mb-8 p-4 rounded-lg w-full" style={{ color: isDesktop ? '#FCA5A5' : '#B91C1c', backgroundColor: isDesktop ? 'rgba(200,69,56,0.1)' : '#FEF2F2', fontSize: '15px', lineHeight: '1.5', fontWeight: '500', border: `1px solid ${isDesktop ? 'rgba(200,69,56,0.2)' : '#FECACA'}` }}>
                {errorMessage}
              </p>
              <button onClick={handleTryAgain} className="w-full rounded-lg text-white hover:opacity-90 transition-all font-semibold" style={{ backgroundColor: '#E8762F', height: '50px', fontSize: '15px', marginBottom: '12px' }}>
                Try Again
              </button>
              <button onClick={handleExit} className="w-full rounded-lg transition-all font-semibold" 
                style={{ border: `2px solid ${buttonSecondaryBorder}`, color: buttonSecondaryText, height: '50px', fontSize: '15px', backgroundColor: 'transparent' }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = buttonSecondaryHover)}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                Go to Home
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}