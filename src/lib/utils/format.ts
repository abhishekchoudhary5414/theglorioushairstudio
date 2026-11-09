export const formatINR = (amount: number): string => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(amount);
};

export const sanitizeString = (str: string): string => {
  return str.trim().replace(/<[^>]*>?/gm, "");
};

export const validateIndianPhone = (phone: string): boolean => {
  // Matches valid Indian 10-digit mobile numbers with optional +91 or 0 prefix
  const cleaned = phone.replace(/[\s\-()]/g, "");
  const indianPhoneRegex = /^(?:(?:\+|0{0,2})91(\s*[\-]\s*)?|[0]?)?[6789]\d{9}$/;
  return indianPhoneRegex.test(cleaned);
};

export const validateEmail = (email: string): boolean => {
  if (!email) return true; // Email is optional for salon guest booking
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

