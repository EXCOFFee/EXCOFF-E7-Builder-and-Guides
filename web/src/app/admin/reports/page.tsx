'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

interface Report {
    id: number;
    reportable_type: string;
    reportable_id: number;
    reason: string;
    status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
    admin_notes: string | null;
    created_at: string;
    reporter: {
        id: number;
        name: string;
    };
    reportable?: {
        id: number;
        title?: string;
        content?: string;
    };
}

const STATUS_COLORS: Record<string, string> = {
    pending: 'bg-yellow-500',
    reviewed: 'bg-blue-500',
    resolved: 'bg-green-500',
    dismissed: 'bg-gray-500',
};

export default function AdminReportsPage() {
    const router = useRouter();
    const queryClient = useQueryClient();
    const [isAdmin, setIsAdmin] = useState(false);
    const [selectedReport, setSelectedReport] = useState<Report | null>(null);
    const [adminNotes, setAdminNotes] = useState('');
    const [filterStatus, setFilterStatus] = useState<string>('pending');

    // Check admin status
    useEffect(() => {
        const token = localStorage.getItem('auth_token');
        if (!token) {
            router.push('/login');
            return;
        }

        // Verify admin status
        fetch(`${API_URL}/user`, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
            .then(res => res.json())
            .then(data => {
                if (!data.is_admin) {
                    router.push('/');
                } else {
                    setIsAdmin(true);
                }
            })
            .catch(() => router.push('/login'));
    }, [router]);

    // Fetch reports
    const { data: reportsData, isLoading } = useQuery({
        queryKey: ['admin-reports', filterStatus],
        queryFn: async () => {
            const token = localStorage.getItem('auth_token');
            const params = filterStatus !== 'all' ? `?status=${filterStatus}` : '';
            const response = await fetch(`${API_URL}/admin/reports${params}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('Failed to fetch reports');
            return response.json();
        },
        enabled: isAdmin,
    });

    const reports: Report[] = reportsData?.data || [];

    // Update report mutation
    const updateMutation = useMutation({
        mutationFn: async ({ id, status, notes }: { id: number; status: string; notes: string }) => {
            const token = localStorage.getItem('auth_token');
            const response = await fetch(`${API_URL}/admin/reports/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ status, admin_notes: notes }),
            });
            if (!response.ok) throw new Error('Failed to update report');
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-reports'] });
            setSelectedReport(null);
            setAdminNotes('');
        },
    });

    const handleUpdateStatus = (status: string) => {
        if (selectedReport) {
            updateMutation.mutate({
                id: selectedReport.id,
                status,
                notes: adminNotes,
            });
        }
    };

    if (!isAdmin) {
        return (
            <div className="min-h-screen bg-e7-void flex items-center justify-center">
                <div className="text-e7-gold">Verificando permisos...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-e7-void py-8 px-4">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-e7-gold">Panel de Administración</h1>
                    <p className="text-gray-400 mt-1">Gestionar reportes de contenido</p>
                </div>

                {/* Filter */}
                <div className="flex gap-2 mb-6">
                    {['pending', 'reviewed', 'resolved', 'dismissed', 'all'].map((status) => (
                        <Button
                            key={status}
                            variant={filterStatus === status ? 'default' : 'outline'}
                            onClick={() => setFilterStatus(status)}
                            className={filterStatus === status ? 'bg-e7-gold text-black' : 'border-e7-gold/30'}
                            size="sm"
                        >
                            {status === 'all' ? 'Todos' : status.charAt(0).toUpperCase() + status.slice(1)}
                        </Button>
                    ))}
                </div>

                {/* Reports Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Reports List */}
                    <div className="space-y-4">
                        <h2 className="text-xl font-semibold text-white">Reportes ({reports.length})</h2>

                        {isLoading ? (
                            <div className="text-gray-400">Cargando...</div>
                        ) : reports.length === 0 ? (
                            <div className="text-gray-400">No hay reportes {filterStatus !== 'all' ? `con estado "${filterStatus}"` : ''}</div>
                        ) : (
                            <div className="space-y-3">
                                {reports.map((report) => (
                                    <Card
                                        key={report.id}
                                        className={`bg-e7-panel border-e7-gold/20 cursor-pointer hover:border-e7-gold/50 transition-colors ${selectedReport?.id === report.id ? 'border-e7-gold' : ''
                                            }`}
                                        onClick={() => {
                                            setSelectedReport(report);
                                            setAdminNotes(report.admin_notes || '');
                                        }}
                                    >
                                        <CardContent className="p-4">
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <span className={`px-2 py-0.5 text-xs rounded text-white ${STATUS_COLORS[report.status]}`}>
                                                            {report.status}
                                                        </span>
                                                        <span className="text-xs text-gray-400">
                                                            {report.reportable_type}
                                                        </span>
                                                    </div>
                                                    <p className="text-white text-sm mb-1">{report.reason}</p>
                                                    <p className="text-xs text-gray-500">
                                                        Reportado por: {report.reporter.name} • {new Date(report.created_at).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Report Detail */}
                    <div>
                        <h2 className="text-xl font-semibold text-white mb-4">Detalle del Reporte</h2>

                        {selectedReport ? (
                            <Card className="bg-e7-panel border-e7-gold/30">
                                <CardHeader>
                                    <CardTitle className="text-e7-gold">
                                        Reporte #{selectedReport.id}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <label className="text-sm text-gray-400">Tipo de contenido</label>
                                        <p className="text-white">{selectedReport.reportable_type}</p>
                                    </div>

                                    <div>
                                        <label className="text-sm text-gray-400">Razón del reporte</label>
                                        <p className="text-white">{selectedReport.reason}</p>
                                    </div>

                                    <div>
                                        <label className="text-sm text-gray-400">Estado actual</label>
                                        <p className="text-white capitalize">{selectedReport.status}</p>
                                    </div>

                                    <div>
                                        <label className="block text-sm text-gray-400 mb-2">Notas del administrador</label>
                                        <textarea
                                            value={adminNotes}
                                            onChange={(e) => setAdminNotes(e.target.value)}
                                            className="w-full px-4 py-2 rounded-lg bg-e7-void border border-e7-gold/30 text-white focus:border-e7-gold outline-none resize-none"
                                            rows={3}
                                            placeholder="Añadir notas..."
                                        />
                                    </div>

                                    <div className="flex flex-wrap gap-2 pt-4">
                                        <Button
                                            onClick={() => handleUpdateStatus('reviewed')}
                                            className="bg-blue-600 hover:bg-blue-700"
                                            disabled={updateMutation.isPending}
                                        >
                                            Marcar Revisado
                                        </Button>
                                        <Button
                                            onClick={() => handleUpdateStatus('resolved')}
                                            className="bg-green-600 hover:bg-green-700"
                                            disabled={updateMutation.isPending}
                                        >
                                            Resolver
                                        </Button>
                                        <Button
                                            onClick={() => handleUpdateStatus('dismissed')}
                                            variant="outline"
                                            className="border-gray-500 text-gray-400 hover:text-white"
                                            disabled={updateMutation.isPending}
                                        >
                                            Descartar
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="text-gray-400 text-center py-12 bg-e7-panel rounded-lg border border-e7-gold/20">
                                Selecciona un reporte para ver los detalles
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
