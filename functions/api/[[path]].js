export async function onRequest(context) {
  const { request } = context;
  const url = new URL(request.url);

  // 构造 Worker 的请求地址
  const workerUrl = `xpz-listen1-web-api.xiapeize.workers.dev${url.pathname}${url.search}`;

  // 转发请求到 Worker，并保持原始方法、头、body
  const workerRequest = new Request(workerUrl, {
    method: request.method,
    headers: request.headers,
    body: request.body,
  });

  // 获取 Worker 的响应
  const response = await fetch(workerRequest);

  // 将响应返回给前端
  return response;
}
