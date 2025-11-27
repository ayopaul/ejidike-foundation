/**
 * FILE PATH: /ejdk/ejidike-foundation/hooks/useApplications.ts
 * PURPOSE: Hook for managing applications data
 */

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export function useApplications(userId?: string, filters?: { status?: string }) {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchApplications();
  }, [userId, filters]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('applications')
        .select(`
          *,
          programs (
            title,
            type,
            budget
          ),
          applicant:profiles!applicant_id (
            full_name,
            email
          )
        `);

      // Apply filters
      if (userId) {
        query = query.eq('applicant_id', userId);
      }

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      query = query.order('created_at', { ascending: false });

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      setApplications(data || []);
    } catch (err: any) {
      console.error('Error fetching applications:', err);
      setError(err.message);
      toast.error('Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  const createApplication = async (applicationData: any) => {
    try {
      const { data, error } = await supabase
        .from('applications')
        .insert(applicationData)
        .select()
        .single();

      if (error) throw error;

      setApplications((prev) => [data, ...prev]);
      return data;
    } catch (err: any) {
      console.error('Error creating application:', err);
      throw err;
    }
  };

  const updateApplication = async (id: string, updates: any) => {
    try {
      const { data, error } = await supabase
        .from('applications')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setApplications((prev) =>
        prev.map((app) => (app.id === id ? data : app))
      );
      return data;
    } catch (err: any) {
      console.error('Error updating application:', err);
      throw err;
    }
  };

  const deleteApplication = async (id: string) => {
    try {
      const { error } = await supabase
        .from('applications')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setApplications((prev) => prev.filter((app) => app.id !== id));
    } catch (err: any) {
      console.error('Error deleting application:', err);
      throw err;
    }
  };

  return {
    applications,
    loading,
    error,
    refresh: fetchApplications,
    createApplication,
    updateApplication,
    deleteApplication
  };
}