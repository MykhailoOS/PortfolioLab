import type { SectionType } from '../types';

export type FieldType = 'text' | 'textarea' | 'number' | 'select' | 'switch' | 'chips' | 'image' | 'gallery' | 'localized-text' | 'localized-textarea';

export interface FieldValidation {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  accept?: string[]; // For image/file fields (mime types)
  maxItems?: number; // For gallery/chips fields
  pattern?: string; // Regex pattern
}

export interface SelectOption {
  value: string;
  label: string;
}

export interface FieldSchema {
  name: string; // Field key in the data object
  label: string; // Display label
  type: FieldType;
  validation?: FieldValidation;
  options?: SelectOption[]; // For select fields
  placeholder?: string;
  helpText?: string;
  defaultValue?: any;
}

export interface BlockSchema {
  type: SectionType;
  title: string;
  fields: FieldSchema[];
}

// Schema for About Section
export const AboutBlockSchema: BlockSchema = {
  type: 'about' as SectionType,
  title: 'About Section',
  fields: [
    {
      name: 'title',
      label: 'Title',
      type: 'localized-text',
      validation: {
        required: true,
        minLength: 1,
        maxLength: 100,
      },
      placeholder: 'Enter section title',
    },
    {
      name: 'paragraph',
      label: 'Paragraph',
      type: 'localized-textarea',
      validation: {
        required: true,
        minLength: 10,
        maxLength: 1000,
      },
      placeholder: 'Enter your description',
      helpText: 'Minimum 10 characters required',
    },
    {
      name: 'avatar',
      label: 'Avatar Image',
      type: 'image',
      validation: {
        accept: ['image/png', 'image/jpeg', 'image/webp', 'image/avif'],
      },
      helpText: 'Upload an avatar image (max 5 MB, PNG/JPEG/WEBP/AVIF)',
    },
    {
      name: 'tags',
      label: 'Tags',
      type: 'chips',
      validation: {
        maxItems: 10,
      },
      placeholder: 'Add tags (press Enter)',
      helpText: 'Add relevant tags or keywords',
    },
    {
      name: 'layout',
      label: 'Layout',
      type: 'select',
      options: [
        { value: 'default', label: 'Default' },
        { value: 'centered', label: 'Centered' },
        { value: 'split', label: 'Split' },
      ],
      defaultValue: 'default',
    },
  ],
};

// Schema for Projects Section
export const ProjectsBlockSchema: BlockSchema = {
  type: 'projects' as SectionType,
  title: 'Projects Section',
  fields: [
    {
      name: 'title',
      label: 'Section Title',
      type: 'localized-text',
      validation: {
        required: true,
        minLength: 1,
        maxLength: 100,
      },
      placeholder: 'Enter section title',
    },
    // Note: Projects array items will be handled separately with their own schema
  ],
};

// Schema for individual Project items
export const ProjectItemSchema: FieldSchema[] = [
  {
    name: 'image',
    label: 'Project Image',
    type: 'image',
    validation: {
      accept: ['image/png', 'image/jpeg', 'image/webp', 'image/avif'],
    },
    helpText: 'Upload a project thumbnail (max 5 MB)',
  },
  {
    name: 'title',
    label: 'Project Title',
    type: 'localized-text',
    validation: {
      required: true,
      minLength: 1,
      maxLength: 100,
    },
    placeholder: 'Enter project title',
  },
  {
    name: 'description',
    label: 'Description',
    type: 'localized-textarea',
    validation: {
      maxLength: 500,
    },
    placeholder: 'Enter project description',
  },
  {
    name: 'tags',
    label: 'Tags',
    type: 'chips',
    validation: {
      maxItems: 10,
    },
    placeholder: 'Add tags (press Enter)',
    helpText: 'Add project tags or technologies',
  },
  {
    name: 'link',
    label: 'Project Link',
    type: 'text',
    placeholder: 'https://example.com',
    helpText: 'Link to the project or demo',
  },
];

// Export all schemas indexed by section type
export const BLOCK_SCHEMAS: Record<string, BlockSchema> = {
  about: AboutBlockSchema,
  projects: ProjectsBlockSchema,
};

/**
 * Get schema for a specific section type
 */
export function getBlockSchema(sectionType: SectionType): BlockSchema | null {
  return BLOCK_SCHEMAS[sectionType] || null;
}

/**
 * Validate a field value against its schema
 */
export function validateField(value: any, schema: FieldSchema): string | null {
  const { validation } = schema;
  if (!validation) return null;

  // Required validation
  if (validation.required) {
    if (value === undefined || value === null || value === '') {
      return `${schema.label} is required`;
    }
    // For localized fields, check if at least one locale has a value
    if (schema.type.startsWith('localized-') && typeof value === 'object') {
      const hasValue = Object.values(value).some((v) => v !== '');
      if (!hasValue) {
        return `${schema.label} is required`;
      }
    }
  }

  // String length validation
  if (typeof value === 'string') {
    if (validation.minLength && value.length < validation.minLength) {
      return `${schema.label} must be at least ${validation.minLength} characters`;
    }
    if (validation.maxLength && value.length > validation.maxLength) {
      return `${schema.label} must be no more than ${validation.maxLength} characters`;
    }
  }

  // Number validation
  if (typeof value === 'number') {
    if (validation.min !== undefined && value < validation.min) {
      return `${schema.label} must be at least ${validation.min}`;
    }
    if (validation.max !== undefined && value > validation.max) {
      return `${schema.label} must be no more than ${validation.max}`;
    }
  }

  // Array validation
  if (Array.isArray(value)) {
    if (validation.maxItems !== undefined && value.length > validation.maxItems) {
      return `${schema.label} can have at most ${validation.maxItems} items`;
    }
  }

  // Pattern validation
  if (validation.pattern && typeof value === 'string') {
    const regex = new RegExp(validation.pattern);
    if (!regex.test(value)) {
      return `${schema.label} has an invalid format`;
    }
  }

  return null;
}
