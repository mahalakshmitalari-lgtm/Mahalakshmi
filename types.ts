export enum Role {
  PRE = 'PRE',
  ADMIN = 'ADMIN',
  DATACR = 'DATACR',
  BDM = 'BDM',
  ASM = 'ASM',
}

export enum TicketStatus {
  IN_PROGRESS = 'In Progress',
  COMPLETED = 'Completed',
  ESCALATED = 'Escalated',
  CLOSED = 'Closed'
}

export enum Team {
  ONBOARDING = 'Onboarding Team',
  RETARGETING = 'Retargeting Team',
  RETENTION = 'Retention Team',
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  team?: Team;
  managerId?: string;
}

export interface ErrorType {
  id: string;
  name: string;
  description: string;
}

export interface AutomatedMessage {
  id: string;
  errorTypeId: string;
  message: string;
}

export interface Ticket {
  id: string;
  uid: string;
  preId: string;
  errorTypeId: string;
  description: string;
  comment?: string;
  status: TicketStatus;
  createdAt: string;
  updatedAt: string;
  rpName?: string;
  team: Team;
}

export interface AuditLog {
  id: string;
  ticketId: string;
  userId: string;
  action: string;
  timestamp: string;
  details: string;
}

export interface SystemNotification {
  id: string;
  ticketId: string;
  preId: string;
  uid: string;
  message: string;
  timestamp: string;
  isRead: boolean;
}

export interface AdminNotification {
  id: string;
  ticketId: string;
  message: string;
  timestamp: string;
  isRead: boolean;
}

export interface Feedback {
  id: string;
  preId: string;
  feedback: string;
  timestamp: string;
}