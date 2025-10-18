import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useTicketStore, useAdminStore, useSessionStore } from '../store';
import { Ticket, TicketStatus, User, Role, ErrorType, AutomatedMessage, AuditLog, Feedback, Team } from '../types';
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Input, Label, Select, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Badge, Modal, Textarea, Checkbox } from '../components/ui';
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

// Sub-component for main ticket dashboard
const AdminTicketDashboard: React.FC = () => {
    const { tickets, fetchTickets, updateTicket } = useTicketStore();
    const { users, errorTypes, fetchAdminData } = useAdminStore();
    const { user } = useSessionStore();
    const [activeTab, setActiveTab] = useState<TicketStatus | 'All'>('All');
    const [filter, setFilter] = useState('');
    const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
    const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
    const [copiedUid, setCopiedUid] = useState<string | null>(null);

    useEffect(() => {
        fetchTickets();
        fetchAdminData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleOpenTicketModal = (ticket: Ticket) => {
        setSelectedTicket({ ...ticket });
        setIsTicketModalOpen(true);
    };

    const handleCopyUid = (uid: string) => {
        navigator.clipboard.writeText(uid);
        setCopiedUid(uid);
        setTimeout(() => setCopiedUid(null), 2000);
    };

    const handleSolveTicket = async (ticketId: string) => {
        await updateTicket({
            id: ticketId,
            status: TicketStatus.COMPLETED,
        });
    };

    const handleUpdateTicket = async () => {
        if (!selectedTicket) return;
        await updateTicket({
            id: selectedTicket.id,
            status: selectedTicket.status,
            comment: selectedTicket.comment,
        });
        setIsTicketModalOpen(false);
        setSelectedTicket(null);
    };

    const filteredTickets = useMemo(() => {
        let filtered = tickets;
        if (activeTab !== 'All') {
            filtered = filtered.filter(t => t.status === activeTab);
        }
        if (filter) {
            const lowerFilter = filter.toLowerCase();
            filtered = filtered.filter(t => 
                t.uid.toLowerCase().includes(lowerFilter) || 
                (users.find(u => u.id === t.preId)?.name.toLowerCase().includes(lowerFilter)) ||
                (errorTypes.find(et => et.id === t.errorTypeId)?.name.toLowerCase().includes(lowerFilter))
            );
        }
        return filtered;
    }, [tickets, activeTab, filter, users, errorTypes]);

    const getMeta = (ticket: Ticket) => ({
        preName: users.find(u => u.id === ticket.preId)?.name || 'Unknown PRE',
        errorName: errorTypes.find(et => et.id === ticket.errorTypeId)?.name || 'Unknown Error'
    });
    
    const handleDownload = () => {
        const headers = [
            { key: 'id', label: 'Ticket ID' },
            { key: 'uid', label: 'UID' },
            { key: 'preName', label: 'PRE Name' },
            { key: 'errorName', label: 'Error Type' },
            { key: 'status', label: 'Status' },
            { key: 'description', label: 'Description' },
            { key: 'comment', label: 'DataCR Comments' },
            { key: 'createdAt', label: 'Created At' },
            { key: 'updatedAt', label: 'Last Updated' },
        ];

        const dataToExport = filteredTickets.map(ticket => {
            const { preName, errorName } = getMeta(ticket);
            return {
                ...ticket,
                preName,
                errorName,
                createdAt: new Date(ticket.createdAt).toLocaleString(),
                updatedAt: new Date(ticket.updatedAt).toLocaleString(),
            };
        });

        const csv = convertToCSV(dataToExport, headers);
        downloadCSV(csv, `tickets-overview-${new Date().toISOString().split('T')[0]}.csv`);
    };

    const tabs: (TicketStatus | 'All')[] = ['All', TicketStatus.IN_PROGRESS, TicketStatus.ESCALATED, TicketStatus.COMPLETED, TicketStatus.CLOSED];

    return (
        <>
        <Card>
            <CardHeader>
                <CardTitle>Ticket Overview</CardTitle>
                <CardDescription>Monitor and manage all submitted tickets.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex justify-between items-center mb-4">
                    <div className="flex space-x-1 bg-slate-100 p-1 rounded-lg">
                        {tabs.map(tab => (
                            <button key={tab} onClick={() => setActiveTab(tab)} className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${activeTab === tab ? 'bg-white text-sky-600 shadow-sm' : 'text-slate-600 hover:bg-slate-200'}`}>{tab}</button>
                        ))}
                    </div>
                     <div className="flex items-center gap-2">
                        <div className="relative w-64">
                            <Input placeholder="Search by UID, PRE, Error..." value={filter} onChange={e => setFilter(e.target.value)} className="pl-10" />
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">{ICONS.search}</span>
                        </div>
                        <Button variant="secondary" onClick={handleDownload}>
                            <span className="mr-2">{ICONS.download}</span>
                            Download Report
                        </Button>
                    </div>
                </div>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Ticket ID</TableHead>
                            <TableHead>UID</TableHead>
                            <TableHead>PRE Name</TableHead>
                            <TableHead>Error Type</TableHead>
                            <TableHead>DataCR Comments</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Created At</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredTickets.map(ticket => {
                            const { preName, errorName } = getMeta(ticket);
                            return (
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
                                    <TableCell>{preName}</TableCell>
                                    <TableCell>{errorName}</TableCell>
                                    <TableCell className="text-sm text-slate-600 max-w-xs truncate" title={ticket.comment}>{ticket.comment || '–'}</TableCell>
                                    <TableCell><StatusBadge status={ticket.status} /></TableCell>
                                    <TableCell>{new Date(ticket.createdAt).toLocaleString()}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center space-x-2">
                                            <Button variant="secondary" size="sm" className="px-2 py-1 h-auto" onClick={() => handleOpenTicketModal(ticket)}>
                                                <span className="text-slate-600">{ICONS.edit}</span>
                                            </Button>
                                            {(user?.role === Role.ADMIN || user?.role === Role.DATACR) && ticket.status === TicketStatus.ESCALATED && (
                                                <Button size="sm" onClick={() => handleSolveTicket(ticket.id)}>
                                                    Solved
                                                </Button>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
        <Modal isOpen={isTicketModalOpen} onClose={() => setIsTicketModalOpen(false)}>
            {selectedTicket && (
                <>
                    <h3 className="text-lg font-medium mb-4">Update Ticket: {selectedTicket.uid}</h3>
                    <div className="space-y-4">
                        <div>
                            <Label>Description</Label>
                            <p className="text-sm text-slate-600 p-2 bg-slate-50 rounded-md mt-1">{selectedTicket.description}</p>
                        </div>
                        <div>
                            <Label htmlFor="ticket-status">Status</Label>
                            <Select id="ticket-status" value={selectedTicket.status} onChange={e => setSelectedTicket({...selectedTicket, status: e.target.value as TicketStatus})}>
                                {Object.values(TicketStatus).map(status => (
                                    <option key={status} value={status}>{status}</option>
                                ))}
                            </Select>
                        </div>
                        <div>
                            <Label htmlFor="ticket-comment">Admin Comment / Solution</Label>
                            <Textarea id="ticket-comment" value={selectedTicket.comment || ''} onChange={e => setSelectedTicket({...selectedTicket, comment: e.target.value})} placeholder="Add a comment..."/>
                        </div>
                        <div className="flex justify-end gap-2"><Button variant="secondary" onClick={() => setIsTicketModalOpen(false)}>Cancel</Button><Button onClick={handleUpdateTicket}>Update Ticket</Button></div>
                    </div>
                </>
            )}
        </Modal>
        </>
    );
};

const StatCard: React.FC<{ title: string, value: string | number, description: string }> = ({ title, value, description }) => (
    <Card>
        <CardHeader>
            <CardDescription>{title}</CardDescription>
            <CardTitle>{value}</CardTitle>
        </CardHeader>
        <CardContent>
            <p className="text-xs text-slate-500">{description}</p>
        </CardContent>
    </Card>
);

const ErrorAnalytics: React.FC = () => {
    const { tickets, fetchTickets } = useTicketStore();
    const { errorTypes, fetchAdminData } = useAdminStore();
    const [tooltip, setTooltip] = useState<{ show: boolean, content: React.ReactNode, x: number, y: number } | null>(null);
    
    const getInitialDateRange = () => {
        const endDate = new Date();
        const startDate = new Date();
        startDate.setMonth(endDate.getMonth() - 6);
        return {
            start: startDate.toISOString().split('T')[0],
            end: endDate.toISOString().split('T')[0],
        };
    };
    const [dateRange, setDateRange] = useState(getInitialDateRange());

    useEffect(() => {
        fetchTickets();
        fetchAdminData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const analyticsData = useMemo(() => {
        if (tickets.length === 0 || errorTypes.length === 0) return null;
        const counts = errorTypes.map(et => ({
            id: et.id, name: et.name,
            count: tickets.filter(t => t.errorTypeId === et.id).length,
        }));
        const totalTickets = tickets.length;
        const mostFrequent = counts.reduce((max, current) => current.count > max.count ? current : max, counts[0]);
        const inProgress = tickets.filter(t => t.status === TicketStatus.IN_PROGRESS).length;
        return { counts, totalTickets, mostFrequent, inProgress };
    }, [tickets, errorTypes]);

    const monthlyDistributionData = useMemo(() => {
        if (tickets.length === 0 || errorTypes.length === 0 || !dateRange.start || !dateRange.end) return null;

        const startDate = new Date(dateRange.start);
        const endDate = new Date(dateRange.end);
        endDate.setHours(23, 59, 59, 999);

        const monthLabelsMap = new Map<string, string>();
        let currentDate = new Date(startDate);
        currentDate.setDate(1);

        while (currentDate <= endDate) {
            const monthKey = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
            const label = currentDate.toLocaleString('default', { month: 'short', year: '2-digit' });
            monthLabelsMap.set(monthKey, label);
            currentDate.setMonth(currentDate.getMonth() + 1);
        }
        
        const monthKeys = Array.from(monthLabelsMap.keys());
        
        const filteredTickets = tickets.filter(ticket => {
            const ticketDate = new Date(ticket.createdAt);
            return ticketDate.getTime() >= startDate.getTime() && ticketDate.getTime() <= endDate.getTime();
        });
        
        const dataByMonth: { [month: string]: { [errorTypeId: string]: number } } = {};

        filteredTickets.forEach(ticket => {
            const ticketDate = new Date(ticket.createdAt);
            const monthKey = `${ticketDate.getFullYear()}-${String(ticketDate.getMonth() + 1).padStart(2, '0')}`;
             
            if (monthLabelsMap.has(monthKey)) {
                if (!dataByMonth[monthKey]) dataByMonth[monthKey] = {};
                dataByMonth[monthKey][ticket.errorTypeId] = (dataByMonth[monthKey][ticket.errorTypeId] || 0) + 1;
            }
        });

        const chartData = monthKeys.map(key => {
            const monthData = dataByMonth[key] || {};
            const total = Object.values(monthData).reduce((sum, count) => sum + count, 0);
            return { month: monthLabelsMap.get(key)!, counts: monthData, total };
        });

        const lastMonthTotal = chartData[chartData.length - 1]?.total || 0;
        const secondLastMonthTotal = chartData.length > 1 ? chartData[chartData.length - 2]?.total : 0;
        let trend = 0;
        if (secondLastMonthTotal > 0) {
            trend = ((lastMonthTotal - secondLastMonthTotal) / secondLastMonthTotal) * 100;
        } else if (lastMonthTotal > 0) {
            trend = 100;
        }
        
        return { chartData, trend };
    }, [tickets, errorTypes, dateRange]);
    
    const handleDownloadDistribution = () => {
        if (!analyticsData) return;

        const headers = [
            { key: 'name', label: 'Error Type' },
            { key: 'count', label: 'Ticket Count' },
        ];
        
        const csv = convertToCSV(analyticsData.counts, headers);
        downloadCSV(csv, `error-type-distribution-${new Date().toISOString().split('T')[0]}.csv`);
    };

    const handleDownloadMonthly = () => {
        if (!monthlyDistributionData) return;

        const headers = [
            { key: 'month', label: 'Month' },
            { key: 'errorType', label: 'Error Type' },
            { key: 'count', label: 'Count' },
        ];
        
        const dataToExport = monthlyDistributionData.chartData.flatMap(monthData => {
            if (Object.keys(monthData.counts).length === 0) {
                return [{ month: monthData.month, errorType: 'N/A', count: 0 }];
            }
            return Object.entries(monthData.counts).map(([errorTypeId, count]) => ({
                month: monthData.month,
                errorType: errorTypes.find(et => et.id === errorTypeId)?.name || 'Unknown',
                count,
            }));
        });

        const csv = convertToCSV(dataToExport, headers);
        downloadCSV(csv, `monthly-distribution-${dateRange.start}-to-${dateRange.end}.csv`);
    };

    if (!analyticsData) {
        return <p>Loading analytics data...</p>;
    }

    const barColors = ['bg-sky-500', 'bg-teal-500', 'bg-amber-500', 'bg-indigo-500', 'bg-rose-500'];
    const errorTypeColorMap = new Map(errorTypes.map((et, i) => [et.id, barColors[i % barColors.length]]));
    const maxCount = Math.max(...analyticsData.counts.map(c => c.count), 1);
    const maxMonthlyTotal = monthlyDistributionData ? Math.max(...monthlyDistributionData.chartData.map(d => d.total), 0) : 0;
    const yAxisMax = Math.ceil(maxMonthlyTotal / 5) * 5 || 5;

    const handleMouseOver = (e: React.MouseEvent, monthData: any, errorTypeId: string) => {
        const errorType = errorTypes.find(et => et.id === errorTypeId);
        if (!errorType) return;
        const content = (<div><p className="font-bold">{monthData.month}</p><p>{errorType.name}: <span className="font-semibold">{monthData.counts[errorTypeId]}</span></p></div>);
        setTooltip({ show: true, content, x: e.clientX, y: e.clientY });
    };
    const handleMouseOut = () => setTooltip(null);

    return (
        <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatCard title="Total Tickets" value={analyticsData.totalTickets} description="All tickets submitted to the system." />
                <StatCard title="Tickets In Progress" value={analyticsData.inProgress} description="Tickets actively being worked on." />
                <StatCard title="Most Frequent Error" value={analyticsData.mostFrequent.name} description={`${analyticsData.mostFrequent.count} occurrences.`} />
                {monthlyDistributionData && (
                     <StatCard 
                        title="MoM Trend" 
                        value={`${monthlyDistributionData.trend >= 0 ? '+' : ''}${monthlyDistributionData.trend.toFixed(1)}%`}
                        description={`Change in tickets from previous month.`}
                    />
                )}
            </div>
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle>Error Type Distribution</CardTitle>
                            <CardDescription>Number of tickets submitted for each error type.</CardDescription>
                        </div>
                         <Button variant="secondary" size="sm" onClick={handleDownloadDistribution}>
                            <span className="mr-2">{ICONS.download}</span>
                            Download
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {analyticsData.counts.map((item, index) => (
                            <div key={item.id} className="grid grid-cols-4 items-center gap-4">
                                <div className="text-sm font-medium text-slate-700 truncate col-span-1">{item.name}</div>
                                <div className="col-span-3 flex items-center">
                                    <div className="w-full bg-slate-100 rounded-full h-6 mr-4">
                                        <div className={`${barColors[index % barColors.length]} h-6 rounded-full flex items-center justify-end px-2 text-white text-xs font-bold`}
                                            style={{ width: `${(item.count / maxCount) * 100}%`, minWidth: '25px' }}>
                                            {item.count}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle>Monthly Error Distribution</CardTitle>
                            <CardDescription>Ticket volume and breakdown over the past months.</CardDescription>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <Input
                                    type="date"
                                    value={dateRange.start}
                                    onChange={e => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                                    className="w-auto h-9"
                                />
                                <span className="text-sm text-slate-500">to</span>
                                <Input
                                    type="date"
                                    value={dateRange.end}
                                    onChange={e => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                                    className="w-auto h-9"
                                />
                            </div>
                             <Button variant="secondary" size="sm" onClick={handleDownloadMonthly}>
                                <span className="mr-2">{ICONS.download}</span>
                                Download
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {monthlyDistributionData && monthlyDistributionData.chartData.length > 0 ? (
                        <div className="relative">
                            {tooltip?.show && (<div className="absolute bg-slate-800 text-white text-xs rounded-md p-2 shadow-lg z-10" style={{ top: tooltip.y - 80, left: tooltip.x - 40, pointerEvents: 'none' }}>{tooltip.content}</div>)}
                            <div className="flex h-72 border-l border-b border-slate-200">
                                <div className="flex flex-col justify-between text-xs text-slate-500 pr-2 py-1 h-full -ml-1">
                                    <span>{yAxisMax}</span><span>{Math.round(yAxisMax * 0.75)}</span><span>{Math.round(yAxisMax * 0.5)}</span><span>{Math.round(yAxisMax * 0.25)}</span><span>0</span>
                                </div>
                                <div className="flex-1 grid gap-4 items-end pl-2" style={{ gridTemplateColumns: `repeat(${monthlyDistributionData.chartData.length}, 1fr)` }}>
                                    {monthlyDistributionData.chartData.map(monthData => (
                                        <div key={monthData.month} className="h-full flex flex-col items-center justify-end">
                                            <div className="w-10/12 bg-slate-100 rounded-t-md flex flex-col overflow-hidden" style={{ height: `${(monthData.total / yAxisMax) * 100}%` }}>
                                                {Object.entries(monthData.counts).map(([errorTypeId, count]) => (
                                                    <div key={errorTypeId} className={`${errorTypeColorMap.get(errorTypeId)} transition-opacity hover:opacity-80`} style={{ height: `${(count / monthData.total) * 100}%` }}
                                                        onMouseMove={(e) => handleMouseOver(e, monthData, errorTypeId)} onMouseLeave={handleMouseOut}/>
                                                ))}
                                            </div>
                                            <div className="text-xs text-slate-600 mt-2">{monthData.month}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                             <div className="flex justify-center items-center flex-wrap gap-x-4 gap-y-2 mt-6">
                                {errorTypes.map(et => (<div key={et.id} className="flex items-center text-xs text-slate-600"><span className={`h-3 w-3 rounded-sm mr-2 ${errorTypeColorMap.get(et.id)}`}></span><span>{et.name}</span></div>))}
                            </div>
                        </div>
                    ) : (<p className="text-slate-500 text-center py-8">Not enough data to display the monthly chart.</p>)}
                </CardContent>
            </Card>
        </div>
    );
};

type ChartDataPoint = {
    label: string;
    total: number;
    errors: { [errorId: string]: number };
    rps: { [errorId: string]: { [rpName: string]: number } };
};

const DetailedErrorAnalytics: React.FC = () => {
    const { tickets, fetchTickets } = useTicketStore();
    const { users, errorTypes, fetchAdminData } = useAdminStore();
    const [viewMode, setViewMode] = useState<'monthly' | 'daily'>('monthly');
    const chartContainerRef = useRef<HTMLDivElement>(null);
    const [chartDimensions, setChartDimensions] = useState({ width: 0, height: 0 });
    
    const allRpNames = useMemo(() => [...new Set(tickets.map(t => t.rpName).filter(Boolean) as string[])].sort(), [tickets]);
    const allErrorTypes = useMemo(() => errorTypes.sort((a,b) => a.name.localeCompare(b.name)), [errorTypes]);
    const allStatuses = useMemo(() => Object.values(TicketStatus).sort(), []);

    const [selectedRps, setSelectedRps] = useState<string[]>([]);
    const [selectedErrorTypes, setSelectedErrorTypes] = useState<string[]>([]);
    const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
    const [tooltip, setTooltip] = useState<{ show: boolean, content: React.ReactNode, x: number, y: number } | null>(null);

    useEffect(() => {
        fetchTickets();
        fetchAdminData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (chartContainerRef.current) {
            setChartDimensions({
                width: chartContainerRef.current.clientWidth,
                height: chartContainerRef.current.clientHeight,
            });
        }
    }, []);

    useEffect(() => {
        if (allRpNames.length > 0 && selectedRps.length === 0) setSelectedRps(allRpNames);
        if (allErrorTypes.length > 0 && selectedErrorTypes.length === 0) setSelectedErrorTypes(allErrorTypes.map(et => et.id));
        if (allStatuses.length > 0 && selectedStatuses.length === 0) setSelectedStatuses(allStatuses);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [allRpNames, allErrorTypes, allStatuses]);


    const handleCheckboxChange = (setter: React.Dispatch<React.SetStateAction<string[]>>, value: string) => {
        setter(prev => prev.includes(value) ? prev.filter(i => i !== value) : [...prev, value]);
    };
    
    const filteredTickets = useMemo(() => {
        return tickets.filter(t => {
            const isRpSelected = selectedRps.length === 0 || (t.rpName ? selectedRps.includes(t.rpName) : true);
            const isErrorTypeSelected = selectedErrorTypes.length === 0 || selectedErrorTypes.includes(t.errorTypeId);
            const isStatusSelected = selectedStatuses.length === 0 || selectedStatuses.includes(t.status);
            return isRpSelected && isErrorTypeSelected && isStatusSelected;
        });
    }, [tickets, selectedRps, selectedErrorTypes, selectedStatuses]);
    
    const chartData: ChartDataPoint[] = useMemo(() => {
        if (filteredTickets.length === 0) return [];
        
        const dataAggregator: { [key: string]: Omit<ChartDataPoint, 'label'> } = {};

        filteredTickets.forEach(ticket => {
            const key = viewMode === 'monthly'
                ? new Date(ticket.createdAt).toLocaleString('default', { month: 'short', year: '2-digit' })
                : new Date(ticket.createdAt).toISOString().split('T')[0].slice(5);

            if (!dataAggregator[key]) {
                dataAggregator[key] = { total: 0, errors: {}, rps: {} };
            }
            
            dataAggregator[key].total++;
            dataAggregator[key].errors[ticket.errorTypeId] = (dataAggregator[key].errors[ticket.errorTypeId] || 0) + 1;

            if (ticket.rpName) {
                if (!dataAggregator[key].rps[ticket.errorTypeId]) dataAggregator[key].rps[ticket.errorTypeId] = {};
                dataAggregator[key].rps[ticket.errorTypeId][ticket.rpName] = (dataAggregator[key].rps[ticket.errorTypeId][ticket.rpName] || 0) + 1;
            }
        });

        const sortedKeys = Object.keys(dataAggregator).sort((a, b) => {
            if (viewMode === 'monthly') {
                // FIX: Changed string literal to a regex to improve readability and avoid potential tool-specific parsing issues.
                const dateA = new Date(`01 ${a.replace(/'/, " 20")}`);
                const dateB = new Date(`01 ${b.replace(/'/, " 20")}`);
                return dateA.getTime() - dateB.getTime();
            }
            return new Date(`2024-${a}`).getTime() - new Date(`2024-${b}`).getTime();
        });

        return sortedKeys.map(key => ({ label: key, ...dataAggregator[key] }));

    }, [filteredTickets, viewMode]);

    const getFilterCounts = (filterType: 'rp' | 'error' | 'status') => {
        const counts: { [key: string]: number } = {};
        let sourceList: any[];
        let key: string;

        switch (filterType) {
            case 'rp':
                sourceList = allRpNames;
                key = 'rpName';
                break;
            case 'error':
                sourceList = allErrorTypes;
                key = 'errorTypeId';
                break;
            case 'status':
                sourceList = allStatuses;
                key = 'status';
                break;
        }

        const baseFilter = (t: Ticket, value: string) => {
            if(filterType === 'rp') return t.rpName === value;
            if(filterType === 'error') return t.errorTypeId === value;
            if(filterType === 'status') return t.status === value;
            return false;
        };

        sourceList.forEach(item => {
            const value = filterType === 'error' ? item.id : item;
            counts[value] = tickets.filter(t => baseFilter(t, value)).length;
        });

        return counts;
    };
    
    const rpCounts = useMemo(() => getFilterCounts('rp'), [tickets, allRpNames]);
    const errorCounts = useMemo(() => getFilterCounts('error'), [tickets, allErrorTypes]);
    const statusCounts = useMemo(() => getFilterCounts('status'), [tickets, allStatuses]);
    
    const handleDownload = () => {
        const headers = [
            { key: 'id', label: 'Ticket ID' },
            { key: 'uid', label: 'UID' },
            { key: 'preName', label: 'PRE Name' },
            { key: 'rpName', label: 'RP Name' },
            { key: 'team', label: 'Team' },
            { key: 'errorName', label: 'Error Type' },
            { key: 'status', label: 'Status' },
            { key: 'createdAt', label: 'Created At' },
        ];

        const dataToExport = filteredTickets.map(ticket => ({
            ...ticket,
            preName: users.find(u => u.id === ticket.preId)?.name || 'Unknown PRE',
            errorName: errorTypes.find(et => et.id === ticket.errorTypeId)?.name || 'Unknown Error',
            createdAt: new Date(ticket.createdAt).toLocaleString(),
        }));

        const csv = convertToCSV(dataToExport, headers);
        downloadCSV(csv, `detailed-analytics-${new Date().toISOString().split('T')[0]}.csv`);
    };

    const colors = ['#38bdf8', '#2dd4bf', '#f59e0b', '#818cf8', '#f43f5e'];
    const errorTypeColorMap = new Map(allErrorTypes.map((et, i) => [et.id, colors[i % colors.length]]));

    const handleMouseOver = (e: React.MouseEvent, dataPoint: ChartDataPoint, errorTypeId: string) => {
         const errorType = errorTypes.find(et => et.id === errorTypeId);
        if (!errorType) return;
        const rpBreakdown = dataPoint.rps[errorTypeId];
        const content = (
            <div>
                <p className="font-bold text-base mb-1">{errorType.name}: {dataPoint.errors[errorTypeId]}</p>
                <ul className="text-xs space-y-0.5">
                    {rpBreakdown && Object.entries(rpBreakdown).map(([rp, count]) => (
                        <li key={rp}>{rp}: <span className="font-semibold">{count}</span></li>
                    ))}
                </ul>
            </div>
        );
        setTooltip({ show: true, content, x: e.clientX, y: e.clientY });
    };

    const handleMouseOut = () => setTooltip(null);
    
    const margin = { top: 20, right: 20, bottom: 40, left: 40 };
    const yAxisHeight = chartDimensions.height - margin.top - margin.bottom;
    const xAxisWidth = chartDimensions.width - margin.left - margin.right;
    const maxTotal = Math.max(...chartData.map(d => d.total), 1);
    const yTickCount = 5;

    const FilterSection: React.FC<{ title: string; items: any[]; selectedItems: string[]; onSelectionChange: (value: string) => void; counts: { [key: string]: number }; nameKey?: string; idKey?: string; }> = 
    ({ title, items, selectedItems, onSelectionChange, counts, nameKey = 'name', idKey = 'id' }) => (
        <div>
            <Label className="mb-2 block font-semibold text-slate-800">{title}</Label>
            <div className="space-y-2 max-h-32 overflow-y-auto pr-2 custom-scrollbar">
                {items.map(item => {
                    const id = idKey ? item[idKey] : item;
                    const name = nameKey ? item[nameKey] : item;
                    return (
                        <div key={id} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Checkbox id={`${title}-${id}`} checked={selectedItems.includes(id)} onChange={() => onSelectionChange(id)} />
                                <Label htmlFor={`${title}-${id}`} className="font-normal cursor-pointer">{name}</Label>
                            </div>
                            <span className="text-xs font-medium text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded-full">{counts[id] || 0}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader><CardTitle>Filters</CardTitle></CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-6">
                    <FilterSection title="RP Name" items={allRpNames} selectedItems={selectedRps} onSelectionChange={(val) => handleCheckboxChange(setSelectedRps, val)} counts={rpCounts} nameKey="" idKey="" />
                    <FilterSection title="Error Type" items={allErrorTypes} selectedItems={selectedErrorTypes} onSelectionChange={(val) => handleCheckboxChange(setSelectedErrorTypes, val)} counts={errorCounts} />
                    <FilterSection title="Ticket Status" items={allStatuses} selectedItems={selectedStatuses} onSelectionChange={(val) => handleCheckboxChange(setSelectedStatuses, val)} counts={statusCounts} nameKey="" idKey="" />
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle>Monthly & Date-wise Error Distribution</CardTitle>
                            <CardDescription>Breakdown of tickets by error type and RP name.</CardDescription>
                        </div>
                         <div className="flex items-center gap-2">
                            <div className="flex space-x-1 bg-slate-100 p-1 rounded-lg">
                                <button onClick={() => setViewMode('monthly')} className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${viewMode === 'monthly' ? 'bg-white text-sky-600 shadow-sm' : 'text-slate-600 hover:bg-slate-200'}`}>Monthly</button>
                                <button onClick={() => setViewMode('daily')} className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${viewMode === 'daily' ? 'bg-white text-sky-600 shadow-sm' : 'text-slate-600 hover:bg-slate-200'}`}>Daily</button>
                            </div>
                             <Button variant="secondary" onClick={handleDownload}>
                                <span className="mr-2">{ICONS.download}</span>
                                Download Report
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="h-[450px] relative" ref={chartContainerRef}>
                    {tooltip?.show && (<div className="absolute bg-slate-800 text-white rounded-md p-2 shadow-lg z-20 pointer-events-none transition-transform" style={{ top: tooltip.y + 10, left: tooltip.x + 10, minWidth: '120px' }}>{tooltip.content}</div>)}
                    {chartData.length > 0 ? (
                        <svg width="100%" height="100%">
                           <g transform={`translate(${margin.left}, ${margin.top})`}>
                                {/* Y-Axis */}
                                {Array.from({ length: yTickCount + 1 }).map((_, i) => {
                                    const y = yAxisHeight - i * (yAxisHeight / yTickCount);
                                    const tickValue = Math.round(i * (maxTotal / yTickCount));
                                    return (
                                        <g key={i} className="text-slate-500">
                                            <line x1={-5} y1={y} x2={xAxisWidth} y2={y} stroke="currentColor" className="stroke-slate-200" strokeDasharray="2,3" />
                                            <text x={-10} y={y + 4} textAnchor="end" className="text-xs fill-current">{tickValue}</text>
                                        </g>
                                    );
                                })}
                                {/* X-Axis and Bars */}
                                {chartData.map((dataPoint, index) => {
                                    const barWidth = xAxisWidth / chartData.length * 0.7;
                                    const x = (index * (xAxisWidth / chartData.length)) + (xAxisWidth / chartData.length * 0.15);
                                    let yOffset = yAxisHeight;
                                    
                                    return (
                                        <g key={dataPoint.label}>
                                            {selectedErrorTypes.map(errorTypeId => {
                                                const count = dataPoint.errors[errorTypeId] || 0;
                                                if (count === 0) return null;
                                                
                                                const barHeight = (count / maxTotal) * yAxisHeight;
                                                yOffset -= barHeight;

                                                return (
                                                     <rect
                                                        key={errorTypeId}
                                                        x={x}
                                                        y={yOffset}
                                                        width={barWidth}
                                                        height={barHeight}
                                                        fill={errorTypeColorMap.get(errorTypeId)}
                                                        onMouseMove={(e) => handleMouseOver(e, dataPoint, errorTypeId)}
                                                        onMouseLeave={handleMouseOut}
                                                        className="transition-opacity hover:opacity-80 cursor-pointer"
                                                    />
                                                );
                                            })}
                                            <text x={x + barWidth / 2} y={yAxisHeight + 15} textAnchor="middle" className="text-xs fill-slate-600">{dataPoint.label}</text>
                                        </g>
                                    )
                                })}
                           </g>
                        </svg>
                    ) : (
                        <div className="flex items-center justify-center h-full text-slate-500">No data available for the selected filters.</div>
                    )}
                </CardContent>
                 <div className="flex justify-center items-center flex-wrap gap-x-4 gap-y-2 mt-2 pb-4">
                    {errorTypes.filter(et => selectedErrorTypes.includes(et.id)).map(et => (<div key={et.id} className="flex items-center text-xs text-slate-600"><span className={`h-3 w-3 rounded-sm mr-2`} style={{backgroundColor: errorTypeColorMap.get(et.id)}}></span><span>{et.name}</span></div>))}
                </div>
            </Card>
        </div>
    );
};

const BulkAddModal: React.FC<{ isOpen: boolean, onClose: () => void }> = ({ isOpen, onClose }) => {
    const { addBulkUsers, users } = useAdminStore();
    const [file, setFile] = useState<File | null>(null);
    const [errors, setErrors] = useState<string[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setFile(e.target.files[0]);
            setErrors([]);
        }
    };

    const downloadTemplate = () => {
        const csvContent = "name,email,team,managerEmail\nJohn Doe,john.pre@example.com,Onboarding Team,bdm@example.com";
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        downloadCSV(csvContent, 'pres_template.csv');
    };

    const processAndSubmit = () => {
        if (!file) {
            setErrors(['Please select a CSV file.']);
            return;
        }
        setIsProcessing(true);
        setErrors([]);
        
        const reader = new FileReader();
        reader.onload = async (e) => {
            const text = e.target?.result as string;
            const validationErrors: string[] = [];
            const newUsers: Omit<User, 'id'>[] = [];
            
            const allManagers = users.filter(u => u.role === Role.BDM);
            const allTeams = Object.values(Team);
            
            const rows = text.split('\n');
            const header = rows[0].trim().split(',');
            
            if (header.length < 4 || header[0] !== 'name' || header[1] !== 'email' || header[2] !== 'team' || header[3] !== 'managerEmail') {
                setErrors(['Invalid CSV header. Expected: name,email,team,managerEmail']);
                setIsProcessing(false);
                return;
            }

            for (let i = 1; i < rows.length; i++) {
                const row = rows[i].trim();
                if (!row) continue;

                const [name, email, team, managerEmail] = row.split(',').map(s => s.trim());
                const lineNumber = i + 1;

                if (!name || !email || !team || !managerEmail) {
                    validationErrors.push(`Line ${lineNumber}: All fields are required.`);
                    continue;
                }

                if (!allTeams.includes(team as Team)) {
                    validationErrors.push(`Line ${lineNumber}: Invalid team "${team}". Valid teams are: ${allTeams.join(', ')}.`);
                }

                const manager = allManagers.find(m => m.email.toLowerCase() === managerEmail.toLowerCase());
                if (!manager) {
                    validationErrors.push(`Line ${lineNumber}: BDM Manager with email "${managerEmail}" not found.`);
                }
                
                if (manager) {
                     newUsers.push({ name, email, role: Role.PRE, team: team as Team, managerId: manager.id });
                }
            }

            if (validationErrors.length > 0) {
                setErrors(validationErrors);
            } else if (newUsers.length > 0) {
                await addBulkUsers(newUsers);
                onClose();
            } else {
                 setErrors(['No valid user data found in the file.']);
            }
            setIsProcessing(false);
        };
        reader.readAsText(file);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <h3 className="text-lg font-medium mb-2">Add Bulk PREs</h3>
            <p className="text-sm text-slate-500 mb-4">
                Upload a CSV file with user data. The file must contain columns in this order: `name`, `email`, `team`, `managerEmail`.
            </p>
            <div className="space-y-4">
                <Button onClick={downloadTemplate} variant="secondary" size="sm">
                   <span className="mr-2">{ICONS.download}</span> Download Template
                </Button>
                <div>
                    <Label htmlFor="csv-file">CSV File</Label>
                    <Input id="csv-file" type="file" accept=".csv" onChange={handleFileChange} className="mt-1 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-sky-50 file:text-sky-700 hover:file:bg-sky-100"/>
                </div>
                {errors.length > 0 && (
                    <div className="bg-red-50 p-3 rounded-md">
                        <h4 className="font-semibold text-red-800 mb-2">Validation Errors</h4>
                        <ul className="list-disc list-inside text-sm text-red-700 space-y-1 max-h-40 overflow-y-auto">
                            {errors.map((error, i) => <li key={i}>{error}</li>)}
                        </ul>
                    </div>
                )}
                <div className="flex justify-end gap-2 pt-2">
                    <Button variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button onClick={processAndSubmit} disabled={isProcessing}>
                        {isProcessing ? 'Processing...' : 'Process & Add PREs'}
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

// Sub-component for PRE management
const UserManagement: React.FC = () => {
    const { users, addUser, updateUser, deleteUser, fetchAdminData } = useAdminStore();
    const { user: currentUser } = useSessionStore();
    const [isUserModalOpen, setIsUserModalOpen] = useState(false);
    const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
    const [userFormData, setUserFormData] = useState<Partial<User>>({});
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState<User | null>(null);

    const isEditMode = !!userFormData.id;
    
    useEffect(() => {
        fetchAdminData();
         // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const managers = useMemo(() => {
        if (userFormData.role === Role.PRE) return users.filter(u => u.role === Role.BDM);
        if (userFormData.role === Role.BDM) return users.filter(u => u.role === Role.ASM);
        return [];
    }, [users, userFormData.role]);

    const handleAddModalOpen = () => {
        setUserFormData({ name: '', email: '', role: Role.PRE, team: Team.ONBOARDING });
        setIsUserModalOpen(true);
    };

    const handleEditModalOpen = (user: User) => {
        setUserFormData(user);
        setIsUserModalOpen(true);
    };

    const handleSaveUser = async () => {
        if (!userFormData.name || !userFormData.email) {
            alert('Name and email are required.');
            return;
        }
        if (isEditMode) {
            await updateUser(userFormData as User);
        } else {
            await addUser(userFormData as Omit<User, 'id'>);
        }
        setIsUserModalOpen(false);
    };
    
    const handleDeleteRequest = (user: User) => {
        setUserToDelete(user);
        setIsConfirmModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (userToDelete) {
            await deleteUser(userToDelete.id);
            setIsConfirmModalOpen(false);
            setUserToDelete(null);
        }
    };

    return (
        <>
        <Card>
            <CardHeader>
                <div className="flex justify-between items-center">
                    <div>
                        <CardTitle>User Management</CardTitle>
                        <CardDescription>Add, edit, or remove users.</CardDescription>
                    </div>
                    {currentUser?.role === Role.ADMIN && (
                        <div className="flex items-center gap-2">
                           <Button onClick={() => setIsBulkModalOpen(true)} variant="secondary"><span className="mr-2">{ICONS.upload}</span>Add Bulk PREs</Button>
                           <Button onClick={handleAddModalOpen}><span className="mr-2">{ICONS.plus}</span>Add User</Button>
                        </div>
                    )}
                </div>
            </CardHeader>
            <CardContent>
                 <Table>
                    <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Email</TableHead><TableHead>Role</TableHead><TableHead>Team</TableHead><TableHead>Manager</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
                    <TableBody>
                        {users.map(user => {
                            const managerName = users.find(u => u.id === user.managerId)?.name || 'N/A';
                            return (
                                <TableRow key={user.id}>
                                    <TableCell>{user.name}</TableCell>
                                    <TableCell>{user.email}</TableCell>
                                    <TableCell><Badge>{user.role}</Badge></TableCell>
                                    <TableCell>{user.team || 'N/A'}</TableCell>
                                    <TableCell>{managerName}</TableCell>
                                    <TableCell className="space-x-2">
                                        {currentUser?.role === Role.ADMIN && user.role !== Role.ADMIN && (
                                        <>
                                            <Button onClick={() => handleEditModalOpen(user)} variant="secondary" size="sm" className="px-2 py-1 h-auto"><span className="text-slate-600">{ICONS.edit}</span></Button>
                                            <Button onClick={() => handleDeleteRequest(user)} variant="danger" size="sm" className="px-2 py-1 h-auto"><span className="text-white">{ICONS.delete}</span></Button>
                                        </>
                                        )}
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                 </Table>
            </CardContent>
        </Card>
        <Modal isOpen={isUserModalOpen} onClose={() => setIsUserModalOpen(false)}>
            <h3 className="text-lg font-medium mb-4">{isEditMode ? 'Edit User' : 'Add New User'}</h3>
            <div className="space-y-4">
                <div><Label htmlFor="user-name">Name</Label><Input id="user-name" value={userFormData.name || ''} onChange={e => setUserFormData({...userFormData, name: e.target.value})} /></div>
                <div><Label htmlFor="user-email">Email</Label><Input id="user-email" type="email" value={userFormData.email || ''} onChange={e => setUserFormData({...userFormData, email: e.target.value})} /></div>
                <div>
                    <Label htmlFor="user-role">Role</Label>
                    <Select id="user-role" value={userFormData.role} onChange={e => setUserFormData({...userFormData, role: e.target.value as Role, managerId: undefined })}>
                        {Object.values(Role).filter(r => r !== Role.ADMIN).map(role => (
                            <option key={role} value={role}>{role}</option>
                        ))}
                    </Select>
                </div>
                {(userFormData.role === Role.PRE || userFormData.role === Role.BDM || userFormData.role === Role.ASM) && (
                  <div>
                      <Label htmlFor="user-team">Team</Label>
                      <Select id="user-team" value={userFormData.team} onChange={e => setUserFormData({...userFormData, team: e.target.value as Team})}>
                          {Object.values(Team).map(team => (
                              <option key={team} value={team}>{team}</option>
                          ))}
                      </Select>
                  </div>
                )}
                {managers.length > 0 && (
                    <div>
                        <Label htmlFor="user-manager">Manager</Label>
                        <Select id="user-manager" value={userFormData.managerId || ''} onChange={e => setUserFormData({...userFormData, managerId: e.target.value })}>
                            <option value="">Select a manager</option>
                            {managers.map(manager => (
                                <option key={manager.id} value={manager.id}>{manager.name}</option>
                            ))}
                        </Select>
                    </div>
                )}
                <div className="flex justify-end gap-2"><Button variant="secondary" onClick={() => setIsUserModalOpen(false)}>Cancel</Button><Button onClick={handleSaveUser}>{isEditMode ? 'Update User' : 'Save User'}</Button></div>
            </div>
        </Modal>
        <Modal isOpen={isConfirmModalOpen} onClose={() => setIsConfirmModalOpen(false)}>
            <h3 className="text-lg font-medium mb-2">Confirm Deletion</h3>
            <p className="text-slate-600 mb-6">Are you sure you want to delete the user "{userToDelete?.name}"? This action cannot be undone.</p>
            <div className="flex justify-end gap-2">
                <Button variant="secondary" onClick={() => setIsConfirmModalOpen(false)}>Cancel</Button>
                <Button variant="danger" onClick={handleConfirmDelete}>Delete</Button>
            </div>
        </Modal>
        <BulkAddModal isOpen={isBulkModalOpen} onClose={() => setIsBulkModalOpen(false)} />
        </>
    );
};

// Sub-component for Error Types management
const ErrorTypesManagement: React.FC = () => {
    const { errorTypes, fetchAdminData, addErrorType, updateErrorType, deleteErrorType } = useAdminStore();
    const { user: currentUser } = useSessionStore();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentErrorType, setCurrentErrorType] = useState<Omit<ErrorType, 'id'> & { id?: string }>({ name: '', description: '' });
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [errorTypeToDelete, setErrorTypeToDelete] = useState<ErrorType | null>(null);

    useEffect(() => { fetchAdminData() // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleOpenModal = (errorType?: ErrorType) => {
        setCurrentErrorType(errorType || { name: '', description: '' });
        setIsModalOpen(true);
    };

    const handleSave = async () => {
        if (currentErrorType.id) {
            await updateErrorType(currentErrorType as ErrorType);
        } else {
            await addErrorType(currentErrorType);
        }
        setIsModalOpen(false);
    };

    const handleDeleteRequest = (errorType: ErrorType) => {
        setErrorTypeToDelete(errorType);
        setIsConfirmModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (errorTypeToDelete) {
            await deleteErrorType(errorTypeToDelete.id);
            setIsConfirmModalOpen(false);
            setErrorTypeToDelete(null);
        }
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-center">
                    <div><CardTitle>Error Types</CardTitle><CardDescription>Manage the dropdown values for error types.</CardDescription></div>
                    {currentUser?.role === Role.ADMIN && <Button onClick={() => handleOpenModal()}><span className="mr-2">{ICONS.plus}</span>Add Error Type</Button>}
                </div>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Description</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
                    <TableBody>
                        {errorTypes.map(et => (
                            <TableRow key={et.id}>
                                <TableCell>{et.name}</TableCell><TableCell>{et.description}</TableCell>
                                <TableCell className="space-x-2">
                                    {currentUser?.role === Role.ADMIN && (
                                    <>
                                        <Button onClick={() => handleOpenModal(et)} variant="secondary" size="sm" className="px-2 py-1 h-auto"><span className="text-slate-600">{ICONS.edit}</span></Button>
                                        <Button onClick={() => handleDeleteRequest(et)} variant="danger" size="sm" className="px-2 py-1 h-auto"><span className="text-white">{ICONS.delete}</span></Button>
                                    </>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
};

// Sub-component for Automated Messages management
const MessagesManagement: React.FC = () => {
    const { messages, errorTypes, fetchAdminData, addMessage, updateMessage, deleteMessage } = useAdminStore();
    const { user: currentUser } = useSessionStore();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentMessage, setCurrentMessage] = useState<Omit<AutomatedMessage, 'id'> & { id?: string }>({ errorTypeId: '', message: '' });
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [messageToDelete, setMessageToDelete] = useState<AutomatedMessage | null>(null);

     useEffect(() => {
        fetchAdminData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    
    const handleOpenModal = (message?: AutomatedMessage) => {
        setCurrentMessage(message || { errorTypeId: errorTypes[0]?.id || '', message: '' });
        setIsModalOpen(true);
    };

    const handleSave = async () => {
        if (currentMessage.id) {
            await updateMessage(currentMessage as AutomatedMessage);
        } else {
            await addMessage(currentMessage);
        }
        setIsModalOpen(false);
    };

    const handleDeleteRequest = (message: AutomatedMessage) => {
        setMessageToDelete(message);
        setIsConfirmModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (messageToDelete) {
            await deleteMessage(messageToDelete.id);
            setIsConfirmModalOpen(false);
            setMessageToDelete(null);
        }
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-center">
                    <div><CardTitle>Automated Messages</CardTitle><CardDescription>Manage automated messages sent for certain error types.</CardDescription></div>
                    {currentUser?.role === Role.ADMIN && <Button onClick={() => handleOpenModal()}><span className="mr-2">{ICONS.plus}</span>Add Message</Button>}
                </div>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader><TableRow><TableHead>Error Type</TableHead><TableHead>Message</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
                    <TableBody>
                        {messages.map(msg => (
                            <TableRow key={msg.id}>
                                <TableCell>{errorTypes.find(et => et.id === msg.errorTypeId)?.name || 'N/A'}</TableCell>
                                <TableCell>{msg.message}</TableCell>
                                <TableCell className="space-x-2">
                                     {currentUser?.role === Role.ADMIN && (
                                     <>
                                        <Button onClick={() => handleOpenModal(msg)} variant="secondary" size="sm" className="px-2 py-1 h-auto"><span className="text-slate-600">{ICONS.edit}</span></Button>
                                        <Button onClick={() => handleDeleteRequest(msg)} variant="danger" size="sm" className="px-2 py-1 h-auto"><span className="text-white">{ICONS.delete}</span></Button>
                                     </>
                                     )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
                <h3 className="text-lg font-medium mb-4">{currentMessage.id ? 'Edit' : 'Add'} Message</h3>
                <div className="space-y-4">
                    <div>
                        <Label htmlFor="msg-error-type">Error Type</Label>
                        <Select id="msg-error-type" value={currentMessage.errorTypeId} onChange={e => setCurrentMessage({...currentMessage, errorTypeId: e.target.value})}>
                            {errorTypes.map(et => <option key={et.id} value={et.id}>{et.name}</option>)}
                        </Select>
                    </div>
                    <div>
                        <Label htmlFor="msg-text">Message</Label>
                        <Textarea id="msg-text" value={currentMessage.message} onChange={e => setCurrentMessage({...currentMessage, message: e.target.value})} />
                    </div>
                     <div className="flex justify-end gap-2"><Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button><Button onClick={handleSave}>Save</Button></div>
                </div>
            </Modal>
            <Modal isOpen={isConfirmModalOpen} onClose={() => setIsConfirmModalOpen(false)}>
                <h3 className="text-lg font-medium mb-2">Confirm Deletion</h3>
                <p className="text-slate-600 mb-6">Are you sure you want to delete this message? This action cannot be undone.</p>
                <div className="flex justify-end gap-2">
                    <Button variant="secondary" onClick={() => setIsConfirmModalOpen(false)}>Cancel</Button>
                    <Button variant="danger" onClick={handleConfirmDelete}>Delete</Button>
                </div>
            </Modal>
        </Card>
    );
};

// Sub-component for Audit Logs
const AuditLogs: React.FC = () => {
    const { logs, users, fetchAdminData } = useAdminStore();
    useEffect(() => { fetchAdminData() // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleDownload = () => {
        const headers = [
            { key: 'timestamp', label: 'Timestamp' },
            { key: 'userName', label: 'User' },
            { key: 'action', label: 'Action' },
            { key: 'ticketId', label: 'Ticket ID' },
            { key: 'details', label: 'Details' },
        ];
        
        const dataToExport = logs.map(log => ({
            ...log,
            userName: users.find(u => u.id === log.userId)?.name || 'System',
            timestamp: new Date(log.timestamp).toLocaleString(),
        }));
    
        const csv = convertToCSV(dataToExport, headers);
        downloadCSV(csv, `audit-logs-${new Date().toISOString().split('T')[0]}.csv`);
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-center">
                    <div>
                        <CardTitle>Audit Logs</CardTitle>
                        <CardDescription>Track all actions performed in the system.</CardDescription>
                    </div>
                    <Button variant="secondary" size="sm" onClick={handleDownload}>
                        <span className="mr-2">{ICONS.download}</span>
                        Download
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader><TableRow><TableHead>Timestamp</TableHead><TableHead>User</TableHead><TableHead>Action</TableHead><TableHead>Ticket ID</TableHead><TableHead>Details</TableHead></TableRow></TableHeader>
                    <TableBody>
                        {logs.map(log => (
                            <TableRow key={log.id}>
                                <TableCell>{new Date(log.timestamp).toLocaleString()}</TableCell>
                                <TableCell>{users.find(u => u.id === log.userId)?.name || 'System'}</TableCell>
                                <TableCell><Badge>{log.action}</Badge></TableCell>
                                <TableCell>{log.ticketId}</TableCell>
                                <TableCell>{log.details}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
};

// Sub-component for Feedback
const FeedbackView: React.FC = () => {
    const { feedbacks, users, fetchAdminData } = useAdminStore();
    useEffect(() => { fetchAdminData() // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <Card>
            <CardHeader><CardTitle>User Feedback</CardTitle><CardDescription>Feedback submitted by PREs.</CardDescription></CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {feedbacks.length > 0 ? (
                        feedbacks.map(feedback => (
                            <div key={feedback.id} className="p-4 bg-slate-50 rounded-lg">
                                <p className="text-slate-800 mb-2">"{feedback.feedback}"</p>
                                <div className="text-xs text-slate-500 flex justify-between">
                                    <span>- {users.find(u => u.id === feedback.preId)?.name || 'Unknown User'}</span>
                                    <span>{new Date(feedback.timestamp).toLocaleString()}</span>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-slate-500 text-center py-4">No feedback has been submitted yet.</p>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};


export const AdminDashboard: React.FC<{ activePage: string }> = ({ activePage }) => {
    const renderPageContent = () => {
        switch (activePage) {
            case 'error-analytics': return <ErrorAnalytics />;
            case 'detailed-analytics': return <DetailedErrorAnalytics />;
            case 'pre-management': return <UserManagement />;
            case 'error-types': return <ErrorTypesManagement />;
            case 'messages': return <MessagesManagement />;
            case 'logs': return <AuditLogs />;
            case 'feedback': return <FeedbackView />;
            case 'dashboard':
            default:
                return <AdminTicketDashboard />;
        }
    };

    return <div className="space-y-6">{renderPageContent()}</div>;
};

// --- BDM / ASM DASHBOARD ---

const TicketForm: React.FC<{ errorTypes: ErrorType[], onSubmit: () => void }> = ({ errorTypes, onSubmit }) => {
    const { addTicket } = useTicketStore();
    const [uid, setUid] = useState('');
    const [errorTypeId, setErrorTypeId] = useState('');
    const [description, setDescription] = useState('');
    const [comment, setComment] = useState('');

    useEffect(() => {
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

const ManagerTicketTable: React.FC<{ tickets: Ticket[], errorTypes: ErrorType[] }> = ({ tickets, errorTypes }) => {
    const getErrorTypeName = (id: string) => errorTypes.find(et => et.id === id)?.name || 'Unknown';
    const [copiedUid, setCopiedUid] = useState<string | null>(null);

    const handleCopyUid = (uid: string) => {
        navigator.clipboard.writeText(uid);
        setCopiedUid(uid);
        setTimeout(() => setCopiedUid(null), 2000);
    };
    
    return (
        <Card>
            <CardHeader>
                <CardTitle>My Submitted Tickets</CardTitle>
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

export const AsmBdmDashboard: React.FC<{ activePage: string }> = ({ activePage }) => {
    const { user } = useSessionStore();
    const { tickets, notifications, fetchTickets, fetchNotifications } = useTicketStore();
    const { errorTypes, fetchAdminData } = useAdminStore();
    const [refreshKey, setRefreshKey] = useState(0);

    useEffect(() => {
        fetchTickets();
        fetchAdminData();
        fetchNotifications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [refreshKey]);

    const myTickets = tickets.filter(t => t.preId === user?.id);
    const myNotifications = notifications.filter(n => n.preId === user?.id);

    const renderPageContent = () => {
        switch (activePage) {
            case 'error-analytics':
                return <ErrorAnalytics />;
            case 'detailed-analytics':
                return <DetailedErrorAnalytics />;
            case 'dashboard':
            default:
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
                        <ManagerTicketTable tickets={myTickets} errorTypes={errorTypes} />
                    </>
                );
        }
    };
    return <div className="space-y-6">{renderPageContent()}</div>;
};
