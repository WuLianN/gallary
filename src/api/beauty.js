import request from '@/utils/request'

export function pictureList(pageNo, pageSize) {
  const params = { page: pageNo, page_size: pageSize }
  return request({
    url: 'pictures',
    method: 'get',
    params,
  })
}
