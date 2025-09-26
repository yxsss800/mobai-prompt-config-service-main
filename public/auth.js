/**
 * 前端认证检查脚本
 * 用于处理API请求的认证错误，自动重定向到登录页面
 */

// 检查登录状态
async function checkAuthStatus() {
  try {
    const response = await fetch('/api/v1/auth/status', {
      credentials: 'include'
    });
    const data = await response.json();
    return data.success && data.data.isAuthenticated;
  } catch (error) {
    console.error('检查认证状态失败:', error);
    return false;
  }
}

// 处理认证错误
function handleAuthError(error) {
  if (error.code === 'UNAUTHORIZED' || error.code === 'TOKEN_EXPIRED') {
    // 重定向到登录页面
    window.location.href = '/login';
    return true;
  }
  return false;
}

// 包装fetch请求，自动处理认证错误
async function authenticatedFetch(url, options = {}) {
  try {
    const response = await fetch(url, {
      ...options,
      credentials: 'include'
    });

    if (response.status === 401) {
      const errorData = await response.json();
      if (handleAuthError(errorData)) {
        return null;
      }
    }

    return response;
  } catch (error) {
    console.error('请求失败:', error);
    throw error;
  }
}

// 登出函数
async function logout() {
  try {
    await fetch('/api/v1/auth/logout', {
      method: 'POST',
      credentials: 'include'
    });
    window.location.href = '/login';
  } catch (error) {
    console.error('登出失败:', error);
  }
}

// 页面加载时检查认证状态
document.addEventListener('DOMContentLoaded', async () => {
  // 如果当前不在登录页面，检查认证状态
  if (!window.location.pathname.includes('/login')) {
    const isAuthenticated = await checkAuthStatus();
    if (!isAuthenticated) {
      window.location.href = '/login';
    }
  }
});

// 导出函数供其他脚本使用
window.AuthUtils = {
  checkAuthStatus,
  handleAuthError,
  authenticatedFetch,
  logout
}; 