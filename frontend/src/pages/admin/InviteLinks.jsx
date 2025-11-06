import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Link as LinkIcon, Copy, Check, Trash2, Plus, Users, Clock, Shield, Award, TrendingUp, ChevronDown, ChevronUp } from 'lucide-react';
import Navbar from '../../components/Navbar';
import { inviteAPI } from '../../lib/api';
import toast from 'react-hot-toast';

export default function InviteLinks() {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    label: '',
    description: '',
    maxUses: '',
    expiresInDays: ''
  });
  const [copiedCode, setCopiedCode] = useState(null);
  const [expandedLink, setExpandedLink] = useState(null);
  const queryClient = useQueryClient();

  const { data: invitesData, isLoading } = useQuery({
    queryKey: ['invite-links'],
    queryFn: inviteAPI.listInvites
  });

  const createMutation = useMutation({
    mutationFn: inviteAPI.createInvite,
    onSuccess: () => {
      queryClient.invalidateQueries(['invite-links']);
      setShowCreateForm(false);
      setFormData({ label: '', description: '', maxUses: '', expiresInDays: '' });
      toast.success('Invite link created!');
    }
  });

  const deactivateMutation = useMutation({
    mutationFn: inviteAPI.deactivateInvite,
    onSuccess: () => {
      queryClient.invalidateQueries(['invite-links']);
      toast.success('Invite link deactivated');
    }
  });

  const handleCreate = (e) => {
    e.preventDefault();
    const data = {
      label: formData.label,
      description: formData.description
    };
    if (formData.maxUses) data.maxUses = parseInt(formData.maxUses);
    if (formData.expiresInDays) data.expiresInDays = parseInt(formData.expiresInDays);

    createMutation.mutate(data);
  };

  const copyToClipboard = (url, code) => {
    navigator.clipboard.writeText(url);
    setCopiedCode(code);
    toast.success('Link copied to clipboard!');
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleDeactivate = (id) => {
    if (confirm('Are you sure you want to deactivate this invite link?')) {
      deactivateMutation.mutate(id);
    }
  };

  if (isLoading) {
    return (
      <>
        <Navbar />
        <div className="pt-20 px-4 max-w-7xl mx-auto">
          <div className="text-center py-20">
            <div className="w-16 h-16 border-4 border-neon-cyan border-t-transparent rounded-full animate-spin mx-auto shadow-lg shadow-neon-cyan/50"></div>
            <p className="mt-4 text-neon-cyan font-rajdhani tracking-wider animate-pulse">&gt; LOADING INVITE SYSTEM...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="pt-20 px-4 max-w-7xl mx-auto pb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Header */}
          <div className="mb-8 flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold mb-2 glitch-text bg-gradient-to-r from-neon-cyan via-neon-magenta to-neon-purple bg-clip-text text-transparent font-orbitron">
                INVITE LINKS
              </h1>
              <p className="text-neon-cyan/70 font-rajdhani text-lg tracking-wider">
                &gt; GENERATE ACCESS CODES FOR USERS
              </p>
            </div>
            <button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="btn-primary flex items-center space-x-2"
            >
              <Plus className="w-5 h-5" />
              <span>CREATE LINK</span>
            </button>
          </div>

          {/* Create Form */}
          {showCreateForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="glass-card p-6 mb-8 border border-neon-cyan/30"
            >
              <form onSubmit={handleCreate} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-rajdhani text-neon-cyan mb-2">
                      LABEL (Required)
                    </label>
                    <input
                      type="text"
                      required
                      className="input-field"
                      placeholder="e.g., Quiz Session #1"
                      value={formData.label}
                      onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-rajdhani text-neon-cyan mb-2">
                      DESCRIPTION (Optional)
                    </label>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="e.g., For Math students"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-rajdhani text-neon-cyan mb-2">
                      MAX USES (Optional)
                    </label>
                    <input
                      type="number"
                      min="1"
                      className="input-field"
                      placeholder="Leave empty for unlimited"
                      value={formData.maxUses}
                      onChange={(e) => setFormData({ ...formData, maxUses: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-rajdhani text-neon-cyan mb-2">
                      EXPIRES IN (Days, Optional)
                    </label>
                    <input
                      type="number"
                      min="1"
                      className="input-field"
                      placeholder="Leave empty for no expiry"
                      value={formData.expiresInDays}
                      onChange={(e) => setFormData({ ...formData, expiresInDays: e.target.value })}
                    />
                  </div>
                </div>
                <div className="flex space-x-4">
                  <button type="submit" className="btn-primary" disabled={createMutation.isPending}>
                    {createMutation.isPending ? 'CREATING...' : 'GENERATE LINK'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="btn-secondary"
                  >
                    CANCEL
                  </button>
                </div>
              </form>
            </motion.div>
          )}

          {/* Invite Links List */}
          <div className="space-y-4">
            {invitesData?.inviteLinks?.length === 0 ? (
              <div className="glass-card p-12 text-center border border-neon-cyan/30">
                <LinkIcon className="w-16 h-16 text-neon-cyan/30 mx-auto mb-4" />
                <p className="text-gray-400 font-rajdhani">No invite links created yet</p>
              </div>
            ) : (
              invitesData?.inviteLinks?.map((invite) => (
                <motion.div
                  key={invite.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`glass-card p-6 border ${invite.isValid ? 'border-neon-green/30' : 'border-gray-600/30'} relative overflow-hidden group`}
                >
                  {/* Status Indicator */}
                  <div className={`absolute top-4 right-4 w-3 h-3 rounded-full ${invite.isValid ? 'bg-neon-green animate-pulse' : 'bg-gray-500'}`}></div>

                  {/* Content */}
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-xl font-bold text-neon-cyan font-orbitron">
                          {invite.metadata?.label || 'Untitled Link'}
                        </h3>
                        {invite.metadata?.description && (
                          <p className="text-sm text-gray-400 mt-1 font-rajdhani">
                            {invite.metadata.description}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => copyToClipboard(invite.url, invite.code)}
                          className="p-2 glass-card border border-neon-cyan/30 hover:border-neon-cyan transition-all rounded-lg"
                          title="Copy link"
                        >
                          {copiedCode === invite.code ? (
                            <Check className="w-5 h-5 text-neon-green" />
                          ) : (
                            <Copy className="w-5 h-5 text-neon-cyan" />
                          )}
                        </button>
                        {invite.isValid && (
                          <button
                            onClick={() => handleDeactivate(invite.id)}
                            className="p-2 glass-card border border-neon-magenta/30 hover:border-neon-magenta transition-all rounded-lg"
                            title="Deactivate"
                          >
                            <Trash2 className="w-5 h-5 text-neon-magenta" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* URL */}
                    <div className="bg-cyber-darker/50 p-3 rounded border border-neon-cyan/20 font-mono text-sm text-neon-cyan break-all">
                      {invite.url}
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-4">
                      <div className="flex items-center space-x-2">
                        <Users className="w-4 h-4 text-neon-purple" />
                        <span className="text-sm text-gray-400 font-rajdhani">
                          <span className="text-neon-purple font-bold">{invite.usedCount}</span>
                          {invite.maxUses ? ` / ${invite.maxUses}` : ' / ∞'}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-neon-orange" />
                        <span className="text-sm text-gray-400 font-rajdhani">
                          {invite.expiresAt ? new Date(invite.expiresAt).toLocaleDateString() : 'Never'}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Shield className="w-4 h-4 text-neon-green" />
                        <span className={`text-sm font-rajdhani font-bold ${invite.isValid ? 'text-neon-green' : 'text-gray-500'}`}>
                          {invite.isValid ? 'ACTIVE' : 'INACTIVE'}
                        </span>
                      </div>
                    </div>

                    {/* Top Performers Section */}
                    {invite.topPerformers && invite.topPerformers.length > 0 && (
                      <div className="border-t border-neon-cyan/10 pt-4">
                        <button
                          onClick={() => setExpandedLink(expandedLink === invite.id ? null : invite.id)}
                          className="flex items-center justify-between w-full group"
                        >
                          <div className="flex items-center space-x-2">
                            <Award className="w-4 h-4 text-neon-green" />
                            <p className="text-xs text-neon-green font-rajdhani tracking-wider">
                              TOP PERFORMERS ({invite.topPerformers.length})
                            </p>
                          </div>
                          {expandedLink === invite.id ? (
                            <ChevronUp className="w-4 h-4 text-neon-cyan group-hover:text-neon-green transition-colors" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-neon-cyan group-hover:text-neon-green transition-colors" />
                          )}
                        </button>

                        {expandedLink === invite.id && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-3 space-y-2"
                          >
                            {invite.topPerformers.map((performer, idx) => (
                              <div
                                key={idx}
                                className="glass-card p-3 border border-neon-green/20 flex items-center justify-between"
                              >
                                <div className="flex items-center space-x-3">
                                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold font-orbitron ${
                                    idx === 0 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-black' :
                                    idx === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-500 text-black' :
                                    idx === 2 ? 'bg-gradient-to-br from-amber-600 to-amber-800 text-white' :
                                    'bg-neon-cyan/20 text-neon-cyan'
                                  }`}>
                                    {idx + 1}
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium text-neon-cyan font-rajdhani">
                                      {performer.userName}
                                    </p>
                                    <p className="text-xs text-gray-500 font-mono">
                                      {performer.totalAttempts} attempts
                                    </p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="flex items-center space-x-2">
                                    <TrendingUp className="w-4 h-4 text-neon-green" />
                                    <p className="text-lg font-bold text-neon-green font-orbitron">
                                      {Math.round(performer.accuracy)}%
                                    </p>
                                  </div>
                                  <p className="text-xs text-gray-500 font-mono">
                                    {performer.correctAttempts} / {performer.totalAttempts} correct
                                  </p>
                                </div>
                              </div>
                            ))}
                          </motion.div>
                        )}
                      </div>
                    )}

                    {/* Recent Users (Below Top Performers) */}
                    {invite.usedBy && invite.usedBy.length > 0 && (
                      <div className="border-t border-neon-cyan/10 pt-4">
                        <p className="text-xs text-neon-cyan/60 mb-2 font-rajdhani">
                          TOTAL ACCESS COUNT: <span className="text-neon-cyan font-bold">{invite.usedBy.length}</span>
                        </p>
                        <p className="text-xs text-gray-500 mb-2 font-rajdhani">Recent users:</p>
                        <div className="flex flex-wrap gap-2">
                          {invite.usedBy.slice(-5).reverse().map((usage, idx) => (
                            <div key={idx} className="bg-cyber-darker/50 px-3 py-1 rounded border border-neon-cyan/20 text-xs font-mono text-gray-400">
                              {usage.userId?.name || 'Anonymous'}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </motion.div>
      </div>
    </>
  );
}
