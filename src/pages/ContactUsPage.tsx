import React, { useState } from 'react';
import { BrandImage } from '../components/ui/BrandImage';
import { BRAND_INFO } from '../data/content';
import { Mail, Clock, ShieldCheck, CheckCircle2 } from 'lucide-react';

export const ContactUsPage: React.FC = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    message: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setSuccess(true);
      setFormData({
        firstName: '',
        lastName: '',
        phone: '',
        email: '',
        message: '',
      });
      setTimeout(() => setSuccess(false), 5000);
    }, 1000);
  };

  return (
    <div className="w-full bg-white select-none">
      {/* Banner */}
      <div className="relative w-full h-[220px] sm:h-[280px] lg:h-[340px] overflow-hidden bg-[#DFBEDB] flex items-center justify-center text-center">
        <BrandImage
          src="https://cdn.sanity.io/images/03h1hklz/production/ff6e93f6880662c9fbcb1055fd48daa07d1aa9bd-1200x450.png"
          alt="Contact Us Banner"
          fallbackLabel="Contact Us"
          containerClassName="absolute inset-0 w-full h-full"
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-stone-900/40 z-[1]" />
        <h1
          className="relative z-10 font-serif text-5xl sm:text-7xl lg:text-8xl text-[#F8FAFC] leading-none drop-shadow-md"
          style={{ fontFamily: "'Alex Brush', 'Cormorant Garamond', serif" }}
        >
          Contact Us
        </h1>
      </div>

      <div className="max-w-[1440px] mx-auto px-4 lg:px-20 py-12 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          {/* Form Column (Cols 1-7) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="space-y-1">
              <h2 className="text-2xl sm:text-3xl font-bold text-[#A06A98]">
                Contact Us
              </h2>
              <p className="text-sm font-bold text-[#333333]">
                Fill out the form below to get in touch with our team
              </p>
            </div>

            {success ? (
              <div className="p-6 bg-[#FDF2F8] border border-[#F0DEF7] rounded-brand text-center space-y-3">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                <h3 className="text-lg font-bold text-[#333333]">Message Sent Successfully</h3>
                <p className="text-xs text-[#666666]">
                  Thank you for reaching out. Our support concierge will reply to your inquiry shortly at the email provided.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#555555] block">
                      First Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="First name"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      className="w-full h-10 px-3 bg-white border border-[#F0DEF7] rounded-brand text-sm text-[#333333] placeholder-[#888888] focus:outline-none focus:ring-2 focus:ring-[#A06A98]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#555555] block">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Last name"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      className="w-full h-10 px-3 bg-white border border-[#F0DEF7] rounded-brand text-sm text-[#333333] placeholder-[#888888] focus:outline-none focus:ring-2 focus:ring-[#A06A98]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#555555] block">
                      Phone Number (Optional)
                    </label>
                    <input
                      type="tel"
                      placeholder="Phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full h-10 px-3 bg-white border border-[#F0DEF7] rounded-brand text-sm text-[#333333] placeholder-[#888888] focus:outline-none focus:ring-2 focus:ring-[#A06A98]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#555555] block">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="Email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full h-10 px-3 bg-white border border-[#F0DEF7] rounded-brand text-sm text-[#333333] placeholder-[#888888] focus:outline-none focus:ring-2 focus:ring-[#A06A98]"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#555555] block">
                    Message *
                  </label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Message"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full min-h-[100px] p-3 bg-white border border-[#F0DEF7] rounded-brand text-sm text-[#333333] placeholder-[#888888] focus:outline-none focus:ring-2 focus:ring-[#A06A98]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full sm:w-auto px-8 h-10 bg-[#A06A98] hover:bg-[#774170] text-[#F8FAFC] text-xs font-bold uppercase tracking-wider rounded-brand transition-colors disabled:opacity-50"
                >
                  {submitting ? 'Submitting...' : 'Submit'}
                </button>
              </form>
            )}
          </div>

          {/* Business Information Column (Cols 8-12) */}
          <div className="lg:col-span-5 space-y-6 lg:pl-6 lg:border-l border-[#E2E8F0]">
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-[#A06A98]">
                Company Information
              </h2>
              <div className="p-5 bg-[#FDF2F8]/60 border border-[#F0DEF7] rounded-brand space-y-4 text-xs sm:text-sm text-[#444444]">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-widest text-[#76416F] block">
                    Official Entity
                  </span>
                  <p className="font-bold text-base text-[#333333] mt-0.5">
                    {BRAND_INFO.company}
                  </p>
                </div>

                <div className="flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-[#A06A98] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-[#333333]">Registered GST</span>
                    <p className="font-mono text-[#555555]">{BRAND_INFO.gst}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-[#A06A98] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-[#333333]">Support Concierge</span>
                    <p>
                      <a href={`mailto:${BRAND_INFO.supportEmail}`} className="text-[#A06A98] hover:underline font-medium">
                        {BRAND_INFO.supportEmail}
                      </a>
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-[#A06A98] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-[#333333]">Concierge Desk Hours</span>
                    <p className="text-[#555555]">Monday – Friday: 9:00 AM – 6:00 PM GST</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
