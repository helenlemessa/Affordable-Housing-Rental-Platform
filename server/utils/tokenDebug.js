export const logTokenStatus = () => {
  console.group('Auth Token Status');
  console.log('LocalStorage adminToken:', localStorage.getItem('adminToken'));
  console.log('LocalStorage token:', localStorage.getItem('token'));
  console.log('Cookies:', document.cookie);
  console.groupEnd();
};