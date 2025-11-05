import { http, HttpResponse } from 'msw';

const API_BASE_URL = 'http://localhost:9000/api/v1';

export const handlers = [
  // AUTH
  http.post(`${API_BASE_URL}/users/register`, () =>
    HttpResponse.json({ success: true, id: 42 })),
  
  http.post(`${API_BASE_URL}/users/login`, () =>
    HttpResponse.json({ success: true, token: 'FAKE_JWT' })),

  http.post(`${API_BASE_URL}/users/logout`, () =>
    HttpResponse.json({ success: true })),

  http.get(`${API_BASE_URL}/users/current-user`, () =>
    HttpResponse.json({ id: 1, name: 'Alice' })),

  http.post(`${API_BASE_URL}/users/refresh-token`, () =>
    HttpResponse.json({ success: true, token: 'NEW_FAKE_JWT' })),

  // NOTES
  http.get(`${API_BASE_URL}/notes`, ({ request }) => {
    const url = new URL(request.url);
    const search = url.searchParams.get('search') || '';
    return HttpResponse.json({
      data: [{ id: 1, title: `Note matching "${search}"`, body: 'Lorem' }],
    });
  }),

  http.post(`${API_BASE_URL}/notes`, async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({ id: 99, ...body });
  }),

  http.patch(`${API_BASE_URL}/notes/:id`, async ({ params, request }) => {
    const body = await request.json();
    return HttpResponse.json({ id: params.id, ...body });
  }),

  http.delete(`${API_BASE_URL}/notes/:id`, ({ params }) =>
    HttpResponse.json({ success: true })),

  http.patch(`${API_BASE_URL}/notes/:id/pin`, ({ params }) =>
    HttpResponse.json({ id: params.id, isPinned: true })),
];