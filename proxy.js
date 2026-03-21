// 定义各音乐平台的代理配置
const PROXY_CONFIG = {
  netease: {
    target: 'https://music.163.com/',
    headers: { Cookie: 'NMTID=1' }
  },
  neteaseinterface: {
    target: 'https://interface3.music.163.com/'
  },
  qq: {
    target: 'https://y.qq.com/',
    headers: { Referer: 'https://y.qq.com/' }
  },
  cqq: {
    target: 'https://c.y.qq.com/',
    headers: { Referer: 'https://y.qq.com/' }
  },
  iqq: {
    target: 'https://i.y.qq.com/',
    headers: { Referer: 'https://y.qq.com/' }
  },
  uqq: {
    target: 'https://u.y.qq.com/',
    headers: { Referer: 'https://y.qq.com/' }
  },
  kugou: {
    target: 'https://www.kugou.com/',
    headers: { Referer: 'https://www.kugou.com/' }
  },
  kugoum: {
    target: 'https://m.kugou.com/',
    headers: { 
      'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/534.30 (KHTML, like Gecko) Version/4.0 Mobile Safari/534.30'
    }
  },
  kugousearch: {
    target: 'https://songsearch.kugou.com/',
    headers: { Referer: 'https://www.kugou.com/' }
  },
  kugoumobile: {
    target: 'http://mobilecdnbj.kugou.com/',
    headers: { Referer: 'https://www.kugou.com/' }
  },
  kugouapi: {
    target: 'https://wwwapi.kugou.com/',
    headers: { Referer: 'https://www.kugou.com/' }
  },
  kuwo: {
    target: 'https://www.kuwo.cn/',
    headers: { 
      Referer: 'https://www.kuwo.cn/',
      Origin: 'https://www.kuwo.cn/'
    }
  },
  kuwoanti: {
    target: 'https://antiserver.kuwo.cn/',
    headers: { Referer: 'https://www.kuwo.cn/' }
  },
  kuwom: {
    target: 'https://m.kuwo.cn/',
    headers: { Referer: 'https://www.kuwo.cn/' }
  },
  kuwosearch: {
    target: 'https://search.kuwo.cn/',
    headers: { Referer: 'https://www.kuwo.cn/' }
  },
  kuwonpl: {
    target: 'https://nplserver.kuwo.cn/',
    headers: { Referer: 'https://www.kuwo.cn/' }
  }
};

// 主代理处理函数
async function proxyHandler(r) {
  // 匹配路由前缀（如 /netease/ -> netease）
  const match = r.uri.match(/^\/([^\/]+)\//);
  if (!match || !PROXY_CONFIG[match[1]]) {
    return r.return(404, 'Proxy route not found');
  }

  const config = PROXY_CONFIG[match[1]];
  const targetUrl = new URL(r.uri.slice(match[0].length), config.target);

  // 构造请求选项
  const fetchOptions = {
    method: r.method,
    headers: { ...config.headers },
    body: r.method !== 'GET' && r.method !== 'HEAD' ? await r.requestBody : undefined
  };

  // 透传原始请求头
  Object.keys(r.headersIn).forEach(key => {
    if (!fetchOptions.headers[key]) {
      fetchOptions.headers[key] = r.headersIn[key];
    }
  });

  try {
    // 转发请求到目标服务器
    const response = await ngx.fetch(targetUrl.toString(), fetchOptions);
    
    // 透传响应头
    Object.keys(response.headers).forEach(key => {
      r.headersOut[key] = response.headers[key];
    });

    // 返回响应内容
    r.return(response.status, await response.text());
  } catch (error) {
    r.error(`Proxy error: ${error.message}`);
    r.return(502, 'Bad Gateway');
  }
}

export default { proxyHandler };
