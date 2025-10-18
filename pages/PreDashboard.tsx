import React, { useEffect, useState, useRef } from 'react';
import { useTicketStore, useSessionStore, useAdminStore } from '../store';
import { Ticket, TicketStatus, ErrorType, SystemNotification } from '../types';
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Input, Label, Select, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Textarea, Badge } from '../components/ui';
import { ICONS } from '../constants';
import { convertToCSV, downloadCSV } from '../utils';

const StatusBadge: React.FC<{ status: TicketStatus }> = ({ status }) => {
    const variant = {
        [TicketStatus.COMPLETED]: 'success',
        [TicketStatus.IN_PROGRESS]: 'warning',
        [TicketStatus.ESCALATED]: 'danger',
        [TicketStatus.CLOSED]: 'default',
    }[status] as 'success' | 'warning' | 'danger' | 'default';
    return <Badge variant={variant}>{status}</Badge>;
};

const TicketForm: React.FC<{ errorTypes: ErrorType[], onSubmit: () => void }> = ({ errorTypes, onSubmit }) => {
    const { addTicket } = useTicketStore();
    const [uid, setUid] = useState('');
    const [errorTypeId, setErrorTypeId] = useState('');
    const [description, setDescription] = useState('');
    const [comment, setComment] = useState('');

    useEffect(() => {
        // Set initial value when error types are loaded and no type is selected
        if (errorTypes.length > 0 && !errorTypeId) {
            setErrorTypeId(errorTypes[0].id);
        }
    }, [errorTypes, errorTypeId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!uid || !errorTypeId || !description) return;
        await addTicket({ uid, errorTypeId, description, comment });
        setUid('');
        setErrorTypeId(errorTypes[0]?.id || '');
        setDescription('');
        setComment('');
        onSubmit();
    };

    return (
        <Card className="h-full">
            <CardHeader>
                <CardTitle>Create New Ticket</CardTitle>
                <CardDescription>Fill out the form to report an issue.</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <Label htmlFor="uid">UID</Label>
                        <Input id="uid" value={uid} onChange={e => setUid(e.target.value)} placeholder="e.g., UID12345" required />
                    </div>
                    <div>
                        <Label htmlFor="errorType">Error Type</Label>
                        <Select id="errorType" value={errorTypeId} onChange={e => setErrorTypeId(e.target.value)} required>
                            {errorTypes.map(et => <option key={et.id} value={et.id}>{et.name}</option>)}
                        </Select>
                    </div>
                    <div>
                        <Label htmlFor="description">Description</Label>
                        <Textarea id="description" value={description} onChange={e => setDescription(e.target.value)} placeholder="Describe the issue in detail..." required />
                    </div>
                    <div>
                        <Label htmlFor="comment">Comment (Optional)</Label>
                        <Input id="comment" value={comment} onChange={e => setComment(e.target.value)} placeholder="Any additional comments?" />
                    </div>
                    <Button type="submit" className="w-full">Submit Ticket</Button>
                </form>
            </CardContent>
        </Card>
    );
};

const FeedbackForm: React.FC = () => {
    const { addFeedback } = useTicketStore();
    const [feedback, setFeedback] = useState('');
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!feedback.trim()) return;
        await addFeedback({ feedback });
        setFeedback('');
        setSubmitted(true);
        setTimeout(() => setSubmitted(false), 3000);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Submit Feedback</CardTitle>
                <CardDescription>Have suggestions or issues? Let us know.</CardDescription>
            </CardHeader>
            <CardContent>
                {submitted ? (
                    <div className="flex items-center justify-center h-full p-4 bg-green-50 rounded-lg">
                        <p className="text-green-700 font-medium">Thank you for your feedback!</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <Label htmlFor="feedback">Your Feedback</Label>
                            <Textarea id="feedback" value={feedback} onChange={e => setFeedback(e.target.value)} placeholder="Tell us what you think..." required />
                        </div>
                        <Button type="submit" className="w-full">Submit Feedback</Button>
                    </form>
                )}
            </CardContent>
        </Card>
    );
};

const TicketTable: React.FC<{ tickets: Ticket[], errorTypes: ErrorType[] }> = ({ tickets, errorTypes }) => {
    const getErrorTypeName = (id: string) => errorTypes.find(et => et.id === id)?.name || 'Unknown';
    const [copiedUid, setCopiedUid] = useState<string | null>(null);

    const handleCopyUid = (uid: string) => {
        navigator.clipboard.writeText(uid);
        setCopiedUid(uid);
        setTimeout(() => setCopiedUid(null), 2000);
    };
    
    const handleDownload = () => {
        const headers = [
            { key: 'id', label: 'Ticket ID' },
            { key: 'uid', label: 'UID' },
            { key: 'errorName', label: 'Error Type' },
            { key: 'status', label: 'Status' },
            { key: 'comment', label: 'DataCR Comments' },
            { key: 'updatedAt', label: 'Last Updated' },
        ];

        const dataToExport = tickets.map(ticket => ({
            ...ticket,
            errorName: getErrorTypeName(ticket.errorTypeId),
            updatedAt: new Date(ticket.updatedAt).toLocaleString(),
        }));

        const csv = convertToCSV(dataToExport, headers);
        downloadCSV(csv, `my-tickets-${new Date().toISOString().split('T')[0]}.csv`);
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-center">
                    <CardTitle>My Submitted Tickets</CardTitle>
                     <Button variant="secondary" size="sm" onClick={handleDownload}>
                        <span className="mr-2">{ICONS.download}</span>
                        Download
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Ticket ID</TableHead>
                            <TableHead>UID</TableHead>
                            <TableHead>Error Type</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>DataCR Comments</TableHead>
                            <TableHead>Last Updated</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {tickets.length > 0 ? tickets.map(ticket => (
                            <TableRow key={ticket.id}>
                                <TableCell>{ticket.id}</TableCell>
                                <TableCell className="font-medium">
                                    <div className="flex items-center gap-2">
                                        <span>{ticket.uid}</span>
                                        <button
                                            onClick={() => handleCopyUid(ticket.uid)}
                                            className="text-slate-400 hover:text-sky-600 p-1 rounded-md transition-colors"
                                            aria-label={`Copy UID ${ticket.uid}`}
                                        >
                                            {copiedUid === ticket.uid ? <span className="text-green-500">{ICONS.check}</span> : ICONS.copy}
                                        </button>
                                    </div>
                                </TableCell>
                                <TableCell>{getErrorTypeName(ticket.errorTypeId)}</TableCell>
                                <TableCell><StatusBadge status={ticket.status} /></TableCell>
                                <TableCell className="text-sm text-slate-600 max-w-xs truncate" title={ticket.comment}>{ticket.comment || '–'}</TableCell>
                                <TableCell>{new Date(ticket.updatedAt).toLocaleDateString()}</TableCell>
                            </TableRow>
                        )) : (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center">No tickets found.</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
};

export const PreDashboard: React.FC<{ activePage: string }> = ({ activePage }) => {
    const { user } = useSessionStore();
    const { tickets, notifications, fetchTickets, fetchNotifications } = useTicketStore();
    const { errorTypes, fetchAdminData } = useAdminStore();
    const [refreshKey, setRefreshKey] = useState(0);
    const [popupNotification, setPopupNotification] = useState<SystemNotification | null>(null);
    const shownNotificationsRef = useRef<Set<string>>(new Set());

    useEffect(() => {
        fetchTickets();
        fetchNotifications();
        fetchAdminData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [refreshKey]);

    const myTickets = tickets.filter(t => t.preId === user?.id);
    const myNotifications = notifications.filter(n => n.preId === user?.id);

    // Effect to detect and show new notifications
    useEffect(() => {
        const unseenNotifications = myNotifications.filter(n => !shownNotificationsRef.current.has(n.id));
        if (unseenNotifications.length > 0) {
            // Notifications are unshifted, so the first one is the newest
            setPopupNotification(unseenNotifications[0]);
            unseenNotifications.forEach(n => shownNotificationsRef.current.add(n.id));
        }
    }, [myNotifications]);

    // Effect to auto-close the popup notification
    useEffect(() => {
        if (popupNotification) {
            const timer = setTimeout(() => {
                setPopupNotification(null);
            }, 8000); // Auto-dismiss after 8 seconds
            return () => clearTimeout(timer);
        }
    }, [popupNotification]);

    const renderPageContent = () => {
        if (activePage === 'feedback') {
            return (
                <div className="max-w-2xl mx-auto">
                    <FeedbackForm />
                </div>
            );
        }

        // Default: 'dashboard'
        return (
            <>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    <div>
                        <TicketForm errorTypes={errorTypes} onSubmit={() => setRefreshKey(k => k + 1)} />
                    </div>
                    <Card>
                        <CardHeader>
                            <CardTitle>System Messages</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {myNotifications.length > 0 ? (
                                <ul className="space-y-3 max-h-[365px] overflow-y-auto pr-2">
                                    {myNotifications.map(notif => (
                                        <li key={notif.id} className="p-3 bg-sky-50 rounded-lg text-sm">
                                            <div className="flex justify-between items-start gap-4">
                                                <p className="text-slate-700">{notif.message}</p>
                                                <span className="text-xs text-slate-500 whitespace-nowrap shrink-0">
                                                    {new Date(notif.timestamp).toLocaleString()}
                                                </span>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            ) : <p className="text-slate-500">No system messages.</p>}
                        </CardContent>
                    </Card>
                </div>
                <TicketTable tickets={myTickets} errorTypes={errorTypes} />
            </>
        );
    };

    return (
        <div className="space-y-6">
            {renderPageContent()}

            {popupNotification && (
               <div className="fixed bottom-8 right-8 z-50 w-full max-w-sm">
                   <Card className="shadow-lg animate-fade-in-up border border-slate-200">
                       <CardHeader className="p-4">
                           <div className="flex justify-between items-center">
                               <CardTitle className="text-base flex items-center gap-3 text-slate-800">
                                   <span className="flex h-3 w-3 relative">
                                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                      <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                                   </span>
                                   Ticket Update
                               </CardTitle>
                               <button onClick={() => setPopupNotification(null)} className="text-slate-400 hover:text-slate-600">
                                   {ICONS.close}
                               </button>
                           </div>
                       </CardHeader>
                       <CardContent className="p-4 pt-0">
                           <p className="text-sm text-slate-600">{popupNotification.message}</p>
                       </CardContent>
                   </Card>
               </div>
           )}
        </div>
    );
};