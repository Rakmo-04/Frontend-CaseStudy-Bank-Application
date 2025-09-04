import { CustomerProfile } from "./CustomerProfile";

export interface SupportTicket {
  ticketId: number;
  customer: CustomerProfile;
  subject: string;
  description: string;
  status: string;
  channel: string | null;
  createdAt: string;
  updatedAt: string | null;
  assignedAdmin: string | null;
  resolutionNotes: string | null;
  escalated: boolean;
  escalatedTo: string | null;
  closedAt: string | null;
}

export type TicketStatus = "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";