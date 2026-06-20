import api from './api'

// ─── Admin API calls ─────────────────────────────────────────────────────────
export const adminApi = {
  getStats:             ()           => api.get('/admin/stats/'),
  getNotifications:     ()           => api.get('/admin/notifications/'),
  getSettings:          ()           => api.get('/admin/settings/'),
  updateSettings:       (data)       => api.patch('/admin/settings/', data),
  getUsers:             (params)     => api.get('/admin/users/', { params }),
  createUser:           (data)       => api.post('/admin/users/', data),
  getUser:              (id)         => api.get(`/admin/users/${id}/`),
  updateUser:           (id, data)   => api.patch(`/admin/users/${id}/`, data),
  deleteUser:           (id)         => api.delete(`/admin/users/${id}/`),
  getOrders:            (params)     => api.get('/admin/orders/', { params }),
  getOrder:             (id)         => api.get(`/admin/orders/${id}/`),
  updateOrderStatus:    (id, status) => api.patch(`/admin/orders/${id}/`, { status }),
  addOrderNote:         (id, text)   => api.post(`/admin/orders/${id}/notes/`, { text }),
  deleteOrderNote:      (orderId, noteId) => api.delete(`/admin/orders/${orderId}/notes/${noteId}/`),
  getReviews:           (params)     => api.get('/admin/reviews/', { params }),
  updateReviewStatus:   (id, status) => api.patch(`/admin/reviews/${id}/`, { status }),
  deleteReview:         (id)         => api.delete(`/admin/reviews/${id}/`),
  getProducts:          (params)     => api.get('/admin/products/', { params }),
  createProduct:        (data)       => api.post('/admin/products/', data),
  getProduct:           (id)         => api.get(`/admin/products/${id}/`),
  updateProduct:        (id, data)   => api.patch(`/admin/products/${id}/`, data),
  deleteProduct:        (id)         => api.delete(`/admin/products/${id}/`),
  getBrands:            ()           => api.get('/admin/brands/'),
  createBrand:          (name)       => api.post('/admin/brands/', { name }),
  uploadImage:          (file)       => {
    const fd = new FormData()
    fd.append('file', file)
    return api.post('/admin/upload/', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
  },
  getCategories:        ()           => api.get('/admin/categories/'),
  createCategory:       (data)       => api.post('/admin/categories/', data),
  updateCategory:       (id, data)   => api.patch(`/admin/categories/${id}/`, data),
  deleteCategory:       (id)         => api.delete(`/admin/categories/${id}/`),
  getDiscounts:         ()           => api.get('/admin/discounts/'),
  createDiscount:       (data)       => api.post('/admin/discounts/', data),
  updateDiscount:       (id, data)   => api.patch(`/admin/discounts/${id}/`, data),
  deleteDiscount:       (id)         => api.delete(`/admin/discounts/${id}/`),

  // ─── Content management ──────────────────────────────────────────────────
  getSlides:            ()           => api.get('/admin/slides/'),
  createSlide:          (data)       => api.post('/admin/slides/', data),
  updateSlide:          (id, data)   => api.patch(`/admin/slides/${id}/`, data),
  deleteSlide:          (id)         => api.delete(`/admin/slides/${id}/`),

  getAbout:             ()           => api.get('/admin/about/'),
  updateAbout:          (data)       => api.patch('/admin/about/', data),

  getSubscribers:       ()           => api.get('/admin/newsletter/'),
  updateSubscriber:     (id, data)   => api.patch(`/admin/newsletter/${id}/`, data),
  deleteSubscriber:     (id)         => api.delete(`/admin/newsletter/${id}/`),

  getMessages:          ()           => api.get('/admin/messages/'),
  getMessage:           (id)         => api.get(`/admin/messages/${id}/`),
  updateMessageStatus:  (id, status) => api.patch(`/admin/messages/${id}/`, { status }),
  deleteMessage:        (id)         => api.delete(`/admin/messages/${id}/`),
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
const fa = n => new Intl.NumberFormat('fa-IR').format(n)

export function timeAgo(isoString) {
  const diff = Date.now() - new Date(isoString).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'همین الان'
  if (mins < 60) return `${fa(mins)} دقیقه پیش`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${fa(hours)} ساعت پیش`
  const days = Math.floor(hours / 24)
  if (days === 1) return 'دیروز'
  return `${fa(days)} روز پیش`
}
