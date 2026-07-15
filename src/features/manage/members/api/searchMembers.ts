import { api } from '@/lib/http';
import type { MemberResponse, Page, PageParams, SearchDTO } from '../types';

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
