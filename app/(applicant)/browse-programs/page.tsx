/**
 * FILE PATH: /ejdk/ejidike-foundation/app/programs/page.tsx
 * PURPOSE: Browse all available grant programs (Applicant Portal)
 */

'use client';

import { useEffect, useState } from 'react';
import { createSupabaseClient } from '@/lib/supabase';
import { useUserProfile } from '@/hooks/useUserProfile';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Award, Calendar, DollarSign, Search } from 'lucide-react';
import Link from 'next/link';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Program } from '@/types/database';

export default function ProgramsPage() {
  const { user } = useUserProfile();
  const supabase = createSupabaseClient();
  
  const [programs, setPrograms] = useState<Program[]>([]);
  const [filteredPrograms, setFilteredPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');

  useEffect(() => {
    fetchPrograms();
  }, []);

  useEffect(() => {
    filterPrograms();
  }, [programs, searchTerm, filterType]);

  const fetchPrograms = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('programs')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPrograms(data || []);
    } catch (error) {
      console.error('Error fetching programs:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterPrograms = () => {
    let filtered = programs;

    // Filter by type
    if (filterType !== 'all') {
      filtered = filtered.filter(p => p.type === filterType);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(p =>
        p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredPrograms(filtered);
  };

  return (
    <div className="space-y-6">
          {/* Header */}
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Available Programs</h2>
            <p className="text-muted-foreground">
              Explore grants and funding opportunities
            </p>
          </div>

          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search programs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="education">Education</SelectItem>
                <SelectItem value="business">Business</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Programs Grid */}
          {loading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading programs...</p>
            </div>
          ) : filteredPrograms.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Award className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground">
                  {searchTerm || filterType !== 'all'
                    ? 'No programs match your filters'
                    : 'No open programs at the moment'}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredPrograms.map((program) => (
                <Card key={program.id} className="flex flex-col">
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <Badge variant="default">{program.type}</Badge>
                      <Badge variant="outline">{program.status}</Badge>
                    </div>
                    <CardTitle>{program.title}</CardTitle>
                    <CardDescription className="line-clamp-3">
                      {program.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col justify-between">
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <DollarSign className="h-4 w-4" />
                        <span>Budget: {formatCurrency(Number(program.budget))}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>Deadline: {formatDate(program.end_date)}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button asChild className="flex-1 rounded-sm">
                        <Link href={`/programs/${program.id}`}>
                          View Details
                        </Link>
                      </Button>
                      <Button asChild variant="outline">
                        <Link href={`/apply/${program.id}`}>
                          Apply
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
    </div>
  );
}