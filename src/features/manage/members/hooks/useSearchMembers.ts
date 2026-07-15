import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { searchMembers } from '../api/searchMembers';
import { MEMBERS_QUERY_KEY } from '../queryKeys';
import type { MemberResponse, Page, PageParams, SearchDTO } from '../types';

type UseSearchMembersOptions = {
  filters: SearchDTO;
  pageParams: PageParams;
  enabled?: boolean;
};

export const useSearchMembers = ({ 
  filters, 
  pageParams, 
  enabled = true 
}: UseSearchMembersOptions) => {
  
  return useQuery<Page<MemberResponse>>({
    queryKey: [MEMBERS_QUERY_KEY, 'search', filters, pageParams],
    queryFn: () => searchMembers(filters, pageParams),
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60 * 1,
    enabled,
  });
};
