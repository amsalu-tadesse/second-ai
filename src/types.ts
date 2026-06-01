export interface User {
  id: string;
  username: string;
  email: string;
  name: string;
  roleId: string;
  departmentId?: string;
  isActive: boolean;
  createdAt: string;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
}

export interface Permission {
  id: string;
  name: string;
  description: string;
}

export interface Department {
  id: string;
  name: string;
  description: string;
  createdAt: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  departmentId: string;
  managerId?: string; // Limit to exactly one project manager
  memberIds: string[]; // List of project members assigned to the project
  status: 'planning' | 'active' | 'on-hold' | 'completed';
  createdAt: string;
}

export interface Session {
  id: string;
  userId: string;
  username: string;
  name: string;
  ipAddress: string;
  userAgent: string;
  loginTime: string;
  isCurrent: boolean;
}

export interface ActivityLog {
  id: string;
  userId?: string;
  userEmail?: string;
  username: string;
  action: string;
  entity: string;
  details: string;
  timestamp: string;
  ipAddress: string;
  type: 'info' | 'warning' | 'danger' | 'success';
}

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  placeholders: string[];
  updatedAt: string;
}

export interface CrudField {
  name: string;
  type: 'text' | 'number' | 'date' | 'email' | 'boolean';
  required: boolean;
  label: string;
}

export interface GeneratedModel {
  id: string;
  name: string;
  p_plural: string; // Plural name
  label: string;
  fields: CrudField[];
  createdAt: string;
  controllerCode: string;
  modelCode: string;
  viewCode: string;
  routeCode: string;
  migrationCode: string;
}

export interface DynamicRecord {
  id: string;
  modelId: string;
  data: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}
