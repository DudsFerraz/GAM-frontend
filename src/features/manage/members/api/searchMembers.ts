import { api } from '@/lib/axios';
import type { MemberResponse } from '../types';
import type { Page, SearchDTO, PageParams } from '@/types/api';

export const searchMembers = async (
    searchParams: SearchDTO, 
    pageParams: PageParams = { page: 0, size: 10 }
): Promise<Page<MemberResponse>> => {
    
  const { data } = await api.post<Page<MemberResponse>>('/member/search', searchParams, {
    params: {
      page: pageParams.page,
      size: pageParams.size,
      sort: pageParams.sort,
    },
    paramsSerializer: {
        indexes: null
    }
  });

  return data;
};