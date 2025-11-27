/**
 * FILE PATH: /ejdk/ejidike-foundation/hooks/usePrograms.ts
 * PURPOSE: Hook for managing programs data
 */

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export function usePrograms(filters?: { status?: string; type?: string }) {
  const [programs, setPrograms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPrograms();
  }, [filters]);

  const fetchPrograms = async () => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('programs')
        .select('*');

      // Apply filters
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      if (filters?.type) {
        query = query.eq('type', filters.type);
      }

      query = query.order('created_at', { ascending: false });

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      setPrograms(data || []);
    } catch (err: any) {
      console.error('Error fetching programs:', err);
      setError(err.message);
      toast.error('Failed to load programs');
    } finally {
      setLoading(false);
    }
  };

  const createProgram = async (programData: any) => {
    try {
      const { data, error } = await supabase
        .from('programs')
        .insert(programData)
        .select()
        .single();

      if (error) throw error;

      setPrograms((prev) => [data, ...prev]);
      return data;
    } catch (err: any) {
      console.error('Error creating program:', err);
      throw err;
    }
  };

  const updateProgram = async (id: string, updates: any) => {
    try {
      const { data, error } = await supabase
        .from('programs')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setPrograms((prev) =>
        prev.map((prog) => (prog.id === id ? data : prog))
      );
      return data;
    } catch (err: any) {
      console.error('Error updating program:', err);
      throw err;
    }
  };

  const deleteProgram = async (id: string) => {
    try {
      const { error } = await supabase
        .from('programs')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setPrograms((prev) => prev.filter((prog) => prog.id !== id));
    } catch (err: any) {
      console.error('Error deleting program:', err);
      throw err;
    }
  };

  return {
    programs,
    loading,
    error,
    refresh: fetchPrograms,
    createProgram,
    updateProgram,
    deleteProgram
  };
}