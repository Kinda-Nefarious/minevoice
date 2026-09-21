'use client';
import { useState } from 'react';
import { Scale, Building2, AlertTriangle, ShieldCheck, CheckCircle2, ArrowRight, Eye, RefreshCw } from 'lucide-react';
import Link from 'next/link';

interface Node {
  id: string;
  type: 'project' | 'obligation' | 'issue' | 'authority' | 'outcome';
  label: string;
  sublabel?: string;
  badge?: string;
  badgeColor?: string;
  status?: string;
  meta?: Record<string, string>;
}

interface Edge {
  from: string;
  to: string;
  label?: string;
}

export function AccountabilityGraph() {
  const [selectedNodeId, setSelectedNodeId] = useState<string>('c-011');
  const [filterType, setFilterType] = useState<string>('all');

  const nodes: Node[] = [
    // Project
    {
      id: 'proj-mavambo',
      type: 'project',
      label: 'Mavambo Lithium Project',
      sublabel: 'Goromonzi Concession ZM-401',
      badge: 'Operator Entity',
      badgeColor: 'bg-emerald-100 text-emerald-900 border-emerald-300'
    },
    // Obligations
    {
      id: 'ob-ema-s57',
      type: 'obligation',
      label: 'EMA Act Cap 20:27 S.57',
      sublabel: 'Water Pollution Control & Discharge Prohibition',
      badge: 'Statutory Mandate',
      badgeColor: 'bg-blue-100 text-blue-900 border-blue-300',
      meta: {
        clause: 'Section 57(1)',
        remedy: 'Statutory water audit order & environmental protection order'
      }
    },
    {
      id: 'ob-mines-si109',
      type: 'obligation',
      label: 'Mining Regs SI 109/1990',
      sublabel: 'Dust Suppression & Vibration PPV Limits',
      badge: 'Operational Safety',
      badgeColor: 'bg-blue-100 text-blue-900 border-blue-300',
      meta: {
        clause: 'Section 16 & Schedule 4',
        remedy: 'Mandatory water cart suppression logs & seismic verification'
      }
    },
    {
      id: 'ob-esia-4-2',
      type: 'obligation',
      label: 'ESIA Condition 4.2',
      sublabel: 'Zero Unpermitted Discharge from Tailings',
      badge: 'Concession Licence',
      badgeColor: 'bg-blue-100 text-blue-900 border-blue-300',
      meta: {
        clause: 'Condition 4.2',
        remedy: 'Aquifer testing certificates & chemical retention berms'
      }
    },
    // Grievance / Issues
    {
      id: 'c-011',
      type: 'issue',
      label: 'MG-2026-011: Chemical Slurry Runoff',
      sublabel: 'Ward 14 Chikwaka East Spring',
      badge: 'Partially Resolved',
      badgeColor: 'bg-amber-100 text-amber-900 border-amber-300',
      status: 'Partially resolved',
      meta: {
        urgency: 'High Priority',
        date: 'Sept 2026'
      }
    },
    {
      id: 'c-1082',
      type: 'issue',
      label: 'MG-2025-1082: Borehole Contamination',
      sublabel: 'Ward 14 Communal Borehole #4',
      badge: 'Awaiting Verification',
      badgeColor: 'bg-purple-100 text-purple-900 border-purple-300',
      status: 'Awaiting community verification',
      meta: {
        urgency: 'High Priority',
        date: 'Aug 2026'
      }
    },
    {
      id: 'c-1083',
      type: 'issue',
      label: 'MG-2025-1083: Haul Dust & Blasting Cracks',
      sublabel: 'Ward 14 Haulage Corridor',
      badge: 'Under Review',
      badgeColor: 'bg-slate-100 text-slate-900 border-slate-300',
      status: 'Under review',
      meta: {
        urgency: 'Medium Priority',
        date: 'Aug 2026'
      }
    },
    // Authorities
    {
      id: 'auth-ema',
      type: 'authority',
      label: 'Environmental Management Agency (EMA)',
      sublabel: 'Mashonaland East Provincial Office',
      badge: 'Statutory Regulator',
      badgeColor: 'bg-teal-100 text-teal-900 border-teal-300'
    },
    {
      id: 'auth-mines',
      type: 'authority',
      label: 'Ministry of Mines & Mining Development',
      sublabel: 'Mining Inspectorate Division',
      badge: 'Safety Regulator',
      badgeColor: 'bg-teal-100 text-teal-900 border-teal-300'
    },
    {
      id: 'auth-rdc',
      type: 'authority',
      label: 'Goromonzi Rural District Council',
      sublabel: 'Communal Water Administration',
      badge: 'Local Authority',
      badgeColor: 'bg-teal-100 text-teal-900 border-teal-300'
    },
    // Outcomes
    {
      id: 'out-011',
      type: 'outcome',
      label: 'Spring Flushed; Lab Tests Pending',
      sublabel: 'Community confirmed colour improved; water test report awaited',
      badge: 'Verified Outcome',
      badgeColor: 'bg-emerald-100 text-emerald-900 border-emerald-300'
    },
    {
      id: 'out-1082',
      type: 'outcome',
      label: 'Potable Bowsers Dispatched',
      sublabel: 'Authority reported water tankers deployed for 48 hours',
      badge: 'Claimed Resolution',
      badgeColor: 'bg-blue-100 text-blue-900 border-blue-300'
    },
    {
      id: 'out-1083',
      type: 'outcome',
      label: 'Water Cart Log Inspection Mandated',
      sublabel: 'Inspectorate logged 3-hour suppression audit',
      badge: 'Action Mandate',
      badgeColor: 'bg-slate-100 text-slate-800 border-slate-300'
    }
  ];

  const edges: Edge[] = [
    // Project to Obligations
    { from: 'proj-mavambo', to: 'ob-ema-s57', label: 'Statutory Duty' },
    { from: 'proj-mavambo', to: 'ob-mines-si109', label: 'Safety Duty' },
    { from: 'proj-mavambo', to: 'ob-esia-4-2', label: 'Licence Permit' },

    // Grievances to Project
    { from: 'proj-mavambo', to: 'c-011', label: 'Concession Radius' },
    { from: 'proj-mavambo', to: 'c-1082', label: 'Concession Radius' },
    { from: 'proj-mavambo', to: 'c-1083', label: 'Haul Route' },

    // Grievances to Obligations
    { from: 'c-011', to: 'ob-ema-s57', label: 'Matches Duty' },
    { from: 'c-011', to: 'ob-esia-4-2', label: 'Matches Permit' },
    { from: 'c-1082', to: 'ob-ema-s57', label: 'Matches Duty' },
    { from: 'c-1083', to: 'ob-mines-si109', label: 'Matches Duty' },

    // Grievances to Authorities
    { from: 'c-011', to: 'auth-ema', label: 'Routed Intake' },
    { from: 'c-011', to: 'auth-rdc', label: 'Secondary Notice' },
    { from: 'c-1082', to: 'auth-ema', label: 'Routed Intake' },
    { from: 'c-1083', to: 'auth-mines', label: 'Routed Intake' },

    // Authorities to Outcomes
    { from: 'auth-ema', to: 'out-011', label: 'Field Audit' },
    { from: 'auth-ema', to: 'out-1082', label: 'Emergency Water' },
    { from: 'auth-mines', to: 'out-1083', label: 'Corrective Order' },

    // Grievances to Outcomes
    { from: 'c-011', to: 'out-011', label: 'Community Status' },
    { from: 'c-1082', to: 'out-1082', label: 'Awaiting Audit' },
    { from: 'c-1083', to: 'out-1083', label: 'Action Ordered' }
  ];

  const selectedNode = nodes.find(n => n.id === selectedNodeId);

  // Connected nodes to the selected node
  const connectedNodeIds = new Set<string>();
  if (selectedNodeId) {
    connectedNodeIds.add(selectedNodeId);
    edges.forEach(e => {
      if (e.from === selectedNodeId) connectedNodeIds.add(e.to);
      if (e.to === selectedNodeId) connectedNodeIds.add(e.from);
    });
  }

  const filteredNodes = nodes.filter(n => {
    if (filterType === 'all') return true;
    return n.type === filterType;
  });

  const getNodeIcon = (type: Node['type']) => {
    switch (type) {
      case 'project':
        return <Building2 className="w-4 h-4 text-emerald-700" />;
      case 'obligation':
        return <Scale className="w-4 h-4 text-blue-700" />;
      case 'issue':
        return <AlertTriangle className="w-4 h-4 text-amber-700" />;
      case 'authority':
        return <ShieldCheck className="w-4 h-4 text-teal-700" />;
      case 'outcome':
        return <CheckCircle2 className="w-4 h-4 text-emerald-700" />;
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-700 text-xs font-bold uppercase tracking-wider mb-1">
            <Scale className="w-4 h-4" />
            Accountability Architecture
          </div>
          <h3 className="text-xl font-bold text-slate-900">
            Accountability Relationship Graph
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Transparently mapping mining operators, statutory obligations, community grievances, regulatory authorities, and verified outcomes.
          </p>
        </div>

        {/* Filter Chips */}
        <div className="flex flex-wrap gap-1.5 p-1 bg-slate-100 rounded-xl text-xs font-semibold">
          {[
            { id: 'all', label: 'All Entities' },
            { id: 'obligation', label: 'Obligations' },
            { id: 'issue', label: 'Grievances' },
            { id: 'authority', label: 'Authorities' },
            { id: 'outcome', label: 'Outcomes' }
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setFilterType(f.id)}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                filterType === f.id ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Graph Canvas / Bento Relationship Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Nodes Explorer Column */}
        <div className="lg:col-span-2 grid sm:grid-cols-2 gap-3 max-h-[500px] overflow-y-auto p-1 pr-2">
          {filteredNodes.map(node => {
            const isSelected = selectedNodeId === node.id;
            const isConnected = connectedNodeIds.has(node.id);

            return (
              <div
                key={node.id}
                onClick={() => setSelectedNodeId(node.id)}
                className={`p-4 rounded-2xl border text-left cursor-pointer transition-all ${
                  isSelected
                    ? 'border-emerald-600 bg-emerald-50/50 shadow-sm ring-2 ring-emerald-500/20'
                    : isConnected
                    ? 'border-slate-300 bg-white hover:border-emerald-300'
                    : 'border-slate-200 bg-slate-50/60 opacity-60 hover:opacity-100'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-1.5">
                    {getNodeIcon(node.type)}
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      {node.type}
                    </span>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${node.badgeColor || 'bg-slate-100 text-slate-800'}`}>
                    {node.badge}
                  </span>
                </div>

                <h4 className="text-sm font-bold text-slate-900 leading-snug mb-1">
                  {node.label}
                </h4>

                {node.sublabel && (
                  <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                    {node.sublabel}
                  </p>
                )}
              </div>
            );
          })}
        </div>

        {/* Selected Entity Relationship Deep Dive Panel */}
        <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col justify-between space-y-4">
          {selectedNode ? (
            <div className="space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  {getNodeIcon(selectedNode.type)}
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Inspecting {selectedNode.type} Node
                  </span>
                </div>
                <h4 className="text-lg font-bold text-slate-900">{selectedNode.label}</h4>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">{selectedNode.sublabel}</p>
              </div>

              {selectedNode.meta && (
                <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1.5 text-xs">
                  {Object.entries(selectedNode.meta).map(([key, value]) => (
                    <div key={key}>
                      <span className="font-bold text-slate-700 capitalize">{key}: </span>
                      <span className="text-slate-900">{value}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Connected Entity Links */}
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700 block mb-2">
                  Directly Linked Entities ({connectedNodeIds.size - 1})
                </span>
                <div className="space-y-2">
                  {Array.from(connectedNodeIds)
                    .filter(id => id !== selectedNode.id)
                    .map(cId => {
                      const cNode = nodes.find(n => n.id === cId);
                      if (!cNode) return null;
                      const edge = edges.find(
                        e => (e.from === selectedNode.id && e.to === cId) || (e.to === selectedNode.id && e.from === cId)
                      );

                      return (
                        <div
                          key={cId}
                          onClick={() => setSelectedNodeId(cId)}
                          className="p-2.5 bg-white hover:bg-emerald-50 rounded-xl border border-slate-200 hover:border-emerald-300 cursor-pointer transition-colors flex items-center justify-between text-xs"
                        >
                          <div className="flex items-center gap-2 overflow-hidden">
                            {getNodeIcon(cNode.type)}
                            <div className="truncate">
                              <span className="font-semibold text-slate-900 block truncate">{cNode.label}</span>
                              <span className="text-[10px] text-slate-500 font-mono">{edge?.label || cNode.type}</span>
                            </div>
                          </div>
                          <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-2" />
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-slate-400 text-xs">
              Select any node in the accountability map to inspect connected pathways.
            </div>
          )}

          <div className="pt-3 border-t border-slate-200 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Verified Civic Evidence Pipeline</span>
            {selectedNode?.type === 'issue' && (
              <Link
                href={`/issues/${selectedNode.label.split(':')[0]}`}
                className="text-emerald-700 font-bold hover:underline inline-flex items-center gap-1"
              >
                View full case file <ArrowRight className="w-3 h-3" />
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
