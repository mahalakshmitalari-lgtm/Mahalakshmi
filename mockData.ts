import { Role, TicketStatus, User, Ticket, ErrorType, AutomatedMessage, AuditLog, SystemNotification, AdminNotification, Feedback, Team } from './types';

const asmOnboarding: User = { id: 'user-asm-1', name: 'Eve (ASM Onboarding)', email: 'asm@example.com', role: Role.ASM, team: Team.ONBOARDING };
const bdmOnboarding: User = { id: 'user-bdm-1', name: 'Frank (BDM Onboarding)', email: 'bdm@example.com', role: Role.BDM, team: Team.ONBOARDING, managerId: asmOnboarding.id };
const asmRetargeting: User = { id: 'user-asm-2', name: 'Grace (ASM Retargeting)', email: 'asm2@example.com', role: Role.ASM, team: Team.RETARGETING };
const bdmRetargeting: User = { id: 'user-bdm-2', name: 'Henry (BDM Retargeting)', email: 'bdm2@example.com', role: Role.BDM, team: Team.RETARGETING, managerId: asmRetargeting.id };


export let mockUsers: User[] = [
  { id: 'user-1', name: 'Alice (PRE)', email: 'pre@example.com', role: Role.PRE, team: Team.ONBOARDING, managerId: bdmOnboarding.id },
  { id: 'user-2', name: 'Bob (Admin)', email: 'admin@example.com', role: Role.ADMIN },
  { id: 'user-3', name: 'Charlie (PRE)', email: 'charlie@example.com', role: Role.PRE, team: Team.ONBOARDING, managerId: bdmOnboarding.id },
  { id: 'user-4', name: 'David (DataCR)', email: 'datacr@example.com', role: Role.DATACR },
  asmOnboarding,
  bdmOnboarding,
  asmRetargeting,
  bdmRetargeting,
  { id: 'user-5', name: 'Ivy (PRE)', email: 'pre2@example.com', role: Role.PRE, team: Team.RETARGETING, managerId: bdmRetargeting.id },
];

export let mockErrorTypes: ErrorType[] = [
  { id: 'et-1', name: 'Data Mismatch', description: 'Discrepancy in user data records.' },
  { id: 'et-2', name: 'System Error', description: 'A critical system failure occurred.' },
  { id: 'et-3', name: 'Login Issue', description: 'User is unable to log into their account.' },
  { id: 'et-4', name: 'Fuzzy Logic Error', description: 'Error related to fuzzy logic matching.' },
];

export let mockMessages: AutomatedMessage[] = [
  { id: 'msg-1', errorTypeId: 'et-1', message: 'A data mismatch has been detected. We are investigating.' },
  { id: 'msg-2', errorTypeId: 'et-2', message: 'System error confirmed. Technical team has been notified.' },
  { id: 'msg-3', errorTypeId: 'et-4', message: 'This issue has been auto-resolved. If the problem persists, please resubmit the ticket for escalation.' },
];

const generateTickets = (): Ticket[] => {
  const tickets: Ticket[] = [];
  const rps = ['RP John', 'RP Jane', 'RP Alex'];
  const pres = mockUsers.filter(u => u.role === Role.PRE);
  const errorTypes = ['et-1', 'et-2', 'et-3', 'et-4'];
  const statuses = Object.values(TicketStatus);
  const now = new Date();

  for (let i = 0; i < 150; i++) {
    const daysAgo = Math.floor(Math.random() * 120); // Last 4 months
    const createdAt = new Date(now.getFullYear(), now.getMonth(), now.getDate() - daysAgo);
    const updatedAt = new Date(createdAt.getTime() + Math.random() * (now.getTime() - createdAt.getTime()));
    const errorTypeId = errorTypes[Math.floor(Math.random() * errorTypes.length)];
    const pre = pres[Math.floor(Math.random() * pres.length)];
    
    tickets.push({
      id: `ticket-${150 - i}`,
      uid: `UID${Math.floor(10000 + Math.random() * 90000)}`,
      preId: pre.id,
      team: pre.team!,
      errorTypeId: errorTypeId,
      description: `This is a generated ticket description for error type ${errorTypeId}.`,
      status: statuses[Math.floor(Math.random() * statuses.length)],
      createdAt: createdAt.toISOString(),
      updatedAt: updatedAt.toISOString(),
      rpName: rps[Math.floor(Math.random() * rps.length)],
      comment: Math.random() > 0.5 ? 'This is a sample comment.' : undefined,
    });
  }
  return tickets.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};


export let mockTickets: Ticket[] = generateTickets();

export let mockLogs: AuditLog[] = [
    { id: 'log-1', ticketId: 'ticket-1', userId: 'user-1', action: 'CREATE', timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), details: 'Ticket created for UID12345' },
    { id: 'log-2', ticketId: 'ticket-1', userId: 'user-2', action: 'UPDATE_STATUS', timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), details: 'Status changed to In Progress' },
];

export let mockNotifications: SystemNotification[] = [];
export let mockAdminNotifications: AdminNotification[] = [];
export let mockFeedback: Feedback[] = [];
