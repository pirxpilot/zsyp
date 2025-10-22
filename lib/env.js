try {
  process.loadEnvFile('/etc/default/zsyp');
} catch {
  console.error('Failed to load config file.');
}
