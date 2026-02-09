const MAX_MESSAGE_LENGTH = 1000;

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

export function validateMessage(content: string): ValidationResult {
  const trimmed = content.trim();
  
  if (!trimmed) {
    return { valid: false, error: 'Message cannot be empty' };
  }
  
  if (trimmed.length > MAX_MESSAGE_LENGTH) {
    return { 
      valid: false, 
      error: `Message exceeds ${MAX_MESSAGE_LENGTH} character limit` 
    };
  }
  
  return { valid: true };
}

export function validateDisplayName(name: string): ValidationResult {
  const trimmed = name.trim();
  
  if (!trimmed) {
    return { valid: false, error: 'Display name cannot be empty' };
  }
  
  if (trimmed.length > 50) {
    return { valid: false, error: 'Display name must be 50 characters or less' };
  }
  
  return { valid: true };
}
