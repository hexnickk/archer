export default {
  chrome: {
    binary: process.platform === 'linux' ? 'google-chrome-stable' : undefined,
    args: ['--disable-xss-auditor'],
  },
};