export const locationQueryKeys = {
  all: ['locations'] as const,
  page: (page: number, size = 12) => [...locationQueryKeys.all, 'page', page, size] as const,
  options: () => [...locationQueryKeys.all, 'options'] as const,
  detail: (locationId: string) => [...locationQueryKeys.all, 'detail', locationId] as const,
}
