import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Crown, Edit3, Eye, Trash2, UserMinus, ArrowRightLeft, AlertTriangle, ChevronDown } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Socket } from 'socket.io-client';

const API = import.meta.env.VITE_SERVER_URL || `http://${window.location.hostname}:3001`;

interface Member {
  id: string;
  username: string;
  name: string;
  role: string;
  joinedAt: string;
}

interface ManageRoomProps {
  roomId: string;
  currentUserId: string;
  currentRole: string;
  socket: Socket | null;
  onRoomDeleted: () => void;
  onRoleChanged?: () => void;
}

export default function ManageRoom({ roomId, currentUserId, currentRole, socket, onRoomDeleted, onRoleChanged }: ManageRoomProps) {
  const [members, setMembers] = useState<Member[]>([]);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [transferTarget, setTransferTarget] = useState<string | null>(null);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const fetchMembers = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/api/rooms/${roomId}/members`);
      if (res.data.success) setMembers(res.data.members);
    } catch { /* ignore */ }
  }, [roomId]);

  useEffect(() => { fetchMembers(); }, [fetchMembers]);

  // Listen for real-time role changes from other owners (in case of transfer)
  useEffect(() => {
    if (!socket) return;
    const handleRoleChanged = () => { fetchMembers(); };
    socket.on('role-changed', handleRoleChanged);
    return () => { socket.off('role-changed', handleRoleChanged); };
  }, [socket, fetchMembers]);

  const changeRole = async (targetUserId: string, newRole: string) => {
    try {
      await axios.patch(`${API}/api/rooms/${roomId}/role`, { targetUserId, newRole });

      // Emit socket event so ALL users in the room get the update instantly
      socket?.emit('role-changed', {
        roomId,
        targetUserId,
        newRole,
        changedBy: currentUserId,
      });

      toast.success(`Role changed to ${newRole}`);
      fetchMembers();
      onRoleChanged?.();
      setOpenDropdown(null);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to change role');
    }
  };

  const removeMember = async (targetUserId: string) => {
    try {
      await axios.delete(`${API}/api/rooms/${roomId}/member`, { data: { targetUserId } });

      // Emit socket event so the removed user gets kicked out instantly
      socket?.emit('member-removed', {
        roomId,
        targetUserId,
        removedBy: currentUserId,
      });

      toast.success('Member removed');
      fetchMembers();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to remove member');
    }
  };

  const deleteRoom = async () => {
    try {
      await axios.delete(`${API}/api/rooms/${roomId}`);

      // Emit socket event so ALL members get redirected out instantly
      socket?.emit('room-deleted', {
        roomId,
        deletedBy: currentUserId,
      });

      toast.success('Room deleted');
      onRoomDeleted();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete room');
    }
  };

  const transferOwnership = async (targetUserId: string) => {
    try {
      await axios.patch(`${API}/api/rooms/${roomId}/transfer`, { targetUserId });

      // Emit role-changed for BOTH users: old owner → editor, new owner → owner
      socket?.emit('role-changed', {
        roomId,
        targetUserId,
        newRole: 'owner',
        changedBy: currentUserId,
      });
      socket?.emit('role-changed', {
        roomId,
        targetUserId: currentUserId,
        newRole: 'editor',
        changedBy: currentUserId,
      });

      toast.success('Ownership transferred!');
      setTransferTarget(null);
      fetchMembers();
      onRoleChanged?.();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to transfer');
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner': return <Crown size={12} />;
      case 'editor': return <Edit3 size={12} />;
      default: return <Eye size={12} />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'owner': return { bg: 'rgba(245,158,11,0.15)', color: '#f59e0b', border: 'rgba(245,158,11,0.3)' };
      case 'editor': return { bg: 'rgba(99,102,241,0.15)', color: '#818cf8', border: 'rgba(99,102,241,0.3)' };
      default: return { bg: 'rgba(107,114,128,0.15)', color: '#9ca3af', border: 'rgba(107,114,128,0.3)' };
    }
  };

  const isOwner = currentRole === 'owner';

  const ROLES = [
    { value: 'viewer', label: 'Viewer', icon: <Eye size={12} />, desc: 'Read-only access', color: '#9ca3af' },
    { value: 'editor', label: 'Editor', icon: <Edit3 size={12} />, desc: 'Can edit content', color: '#818cf8' },
    { value: 'owner', label: 'Owner', icon: <Crown size={12} />, desc: 'Full control (transfers ownership)', color: '#f59e0b' },
  ];

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 flex-shrink-0"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <h3 className="text-sm font-semibold uppercase tracking-wider" style={{ color: '#888' }}>
          👑 Manage Room
        </h3>
        <span className="text-xs" style={{ color: '#6b7280' }}>{members.length} members</span>
      </div>

      {/* Members List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        <AnimatePresence>
          {members.map((member) => {
            const rc = getRoleColor(member.role);
            const isSelf = member.id === currentUserId;
            const isDropdownOpen = openDropdown === member.id;
            return (
              <motion.div
                key={member.id}
                layout
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="p-3 rounded-lg"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white"
                      style={{ background: member.role === 'owner' ? 'linear-gradient(135deg, #f59e0b, #ef4444)' : 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
                      {member.name?.charAt(0).toUpperCase() || '?'}
                    </div>
                    <div>
                      <span className="text-sm font-medium text-white">{member.name}</span>
                      {isSelf && <span className="text-xs ml-1" style={{ color: '#6b7280' }}>(you)</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs"
                    style={{ background: rc.bg, color: rc.color, border: `1px solid ${rc.border}` }}>
                    {getRoleIcon(member.role)}
                    <span className="capitalize">{member.role}</span>
                  </div>
                </div>

                {/* Actions (only for owner, not on self, not on other owners) */}
                {isOwner && !isSelf && member.role !== 'owner' && (
                  <div className="mt-2 space-y-2">
                    {/* ── Role Dropdown ── */}
                    <div className="relative">
                      <button
                        onClick={() => setOpenDropdown(isDropdownOpen ? null : member.id)}
                        className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs"
                        style={{
                          background: 'rgba(99,102,241,0.08)',
                          border: '1px solid rgba(99,102,241,0.2)',
                          color: '#818cf8',
                          cursor: 'pointer',
                        }}>
                        <span className="flex items-center gap-1.5">
                          {getRoleIcon(member.role)}
                          Change Role
                        </span>
                        <ChevronDown size={12} style={{
                          transform: isDropdownOpen ? 'rotate(180deg)' : 'rotate(0)',
                          transition: 'transform 0.2s',
                        }} />
                      </button>

                      {/* Dropdown menu */}
                      <AnimatePresence>
                        {isDropdownOpen && (
                          <motion.div
                            initial={{ opacity: 0, y: -5, height: 0 }}
                            animate={{ opacity: 1, y: 0, height: 'auto' }}
                            exit={{ opacity: 0, y: -5, height: 0 }}
                            className="mt-1 rounded-lg overflow-hidden"
                            style={{
                              background: 'rgba(22,22,42,0.98)',
                              border: '1px solid rgba(99,102,241,0.25)',
                              boxShadow: '0 8px 25px rgba(0,0,0,0.4)',
                            }}>
                            {ROLES.map((r) => {
                              const isCurrentRole = member.role === r.value;
                              const isOwnerRole = r.value === 'owner';
                              return (
                                <button
                                  key={r.value}
                                  onClick={() => {
                                    if (isCurrentRole) return;
                                    if (isOwnerRole) {
                                      // Selecting "owner" triggers ownership transfer
                                      setTransferTarget(member.id);
                                      setOpenDropdown(null);
                                    } else {
                                      changeRole(member.id, r.value);
                                    }
                                  }}
                                  disabled={isCurrentRole}
                                  className="w-full flex items-center gap-3 px-3 py-2.5 text-xs text-left transition-all"
                                  style={{
                                    background: isCurrentRole ? 'rgba(99,102,241,0.1)' : 'transparent',
                                    color: isCurrentRole ? r.color : '#d1d5db',
                                    cursor: isCurrentRole ? 'default' : 'pointer',
                                    borderBottom: '1px solid rgba(255,255,255,0.03)',
                                    opacity: isCurrentRole ? 0.6 : 1,
                                  }}
                                  onMouseEnter={e => { if (!isCurrentRole) e.currentTarget.style.background = 'rgba(99,102,241,0.08)'; }}
                                  onMouseLeave={e => { if (!isCurrentRole) e.currentTarget.style.background = 'transparent'; }}
                                >
                                  <div className="flex items-center justify-center w-6 h-6 rounded-md"
                                    style={{ background: `${r.color}20`, color: r.color }}>
                                    {r.icon}
                                  </div>
                                  <div className="flex-1">
                                    <div className="font-semibold flex items-center gap-1.5">
                                      {r.label}
                                      {isCurrentRole && (
                                        <span className="text-xs px-1.5 py-0 rounded-full"
                                          style={{ background: `${r.color}20`, color: r.color, fontSize: '9px' }}>
                                          current
                                        </span>
                                      )}
                                      {isOwnerRole && !isCurrentRole && (
                                        <span className="text-xs px-1.5 py-0 rounded-full"
                                          style={{ background: 'rgba(245,158,11,0.15)', color: '#f59e0b', fontSize: '9px' }}>
                                          transfers ownership
                                        </span>
                                      )}
                                    </div>
                                    <div style={{ color: '#6b7280', fontSize: '10px' }}>{r.desc}</div>
                                  </div>
                                </button>
                              );
                            })}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Remove button */}
                    <button
                      onClick={() => removeMember(member.id)}
                      className="w-full flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-lg text-xs"
                      style={{ background: 'rgba(239,68,68,0.08)', color: '#f87171', border: '1px solid rgba(239,68,68,0.15)', cursor: 'pointer' }}>
                      <UserMinus size={12} /> Remove from room
                    </button>
                  </div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Transfer Confirmation */}
      <AnimatePresence>
        {transferTarget && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="p-4" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
            <div className="p-3 rounded-lg" style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)' }}>
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle size={14} style={{ color: '#f59e0b' }} />
                <span className="text-xs font-semibold" style={{ color: '#f59e0b' }}>Transfer Ownership?</span>
              </div>
              <p className="text-xs mb-3" style={{ color: '#9ca3af' }}>
                This will make <strong style={{ color: '#f59e0b' }}>{members.find(m => m.id === transferTarget)?.name}</strong> the new owner. You will become an editor. This happens instantly for all users.
              </p>
              <div className="flex items-center gap-2">
                <button onClick={() => transferOwnership(transferTarget)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white"
                  style={{ background: 'linear-gradient(135deg, #f59e0b, #ef4444)', border: 'none', cursor: 'pointer' }}>
                  <ArrowRightLeft size={12} /> Confirm Transfer
                </button>
                <button onClick={() => setTransferTarget(null)}
                  className="px-3 py-1.5 rounded-lg text-xs"
                  style={{ background: 'rgba(255,255,255,0.05)', color: '#9ca3af', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer' }}>
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Room (owner only) */}
      {isOwner && (
        <div className="p-4 flex-shrink-0" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          {!confirmDelete ? (
            <button onClick={() => setConfirmDelete(true)}
              className="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold"
              style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)', cursor: 'pointer' }}>
              <Trash2 size={14} /> Delete Room
            </button>
          ) : (
            <div className="p-3 rounded-lg" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)' }}>
              <p className="text-xs mb-2" style={{ color: '#f87171' }}>⚠️ This will permanently delete the room. All members will be kicked out instantly.</p>
              <div className="flex gap-2">
                <button onClick={deleteRoom}
                  className="px-3 py-1 rounded text-xs font-semibold text-white"
                  style={{ background: '#ef4444', border: 'none', cursor: 'pointer' }}>
                  Yes, Delete
                </button>
                <button onClick={() => setConfirmDelete(false)}
                  className="px-3 py-1 rounded text-xs"
                  style={{ background: 'rgba(255,255,255,0.05)', color: '#9ca3af', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer' }}>
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
