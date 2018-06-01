module.exports = {
  chrome: {
    binary: process.platform === 'linux' ? 'google-chrome-stable' : undefined,
    args: ['--disable-xss-auditor'],
  },
};