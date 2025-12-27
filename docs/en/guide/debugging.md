# Debugging & Observability

Gravito provides built-in tools to help you debug your application and monitor its performance. The primary tool for local debugging is **Spectrum**.

## Spectrum: The Debug Dashboard

Spectrum is a real-time observability dashboard that integrates directly into the Gravito framework. It allows you to monitor:

- **HTTP Requests**: View headers, payloads, and replay requests.
- **Database Queries**: See the exact SQL executed by Atlas ORM.
- **Logs**: Correlate application logs with incoming requests.

For detailed instructions on installation and configuration, see the dedicated [Spectrum Guide](./spectrum.md).

## Local Debugging Tips

### Using the Logger
The Gravito core logger is integrated with Spectrum. When you use `core.logger`, your logs automatically appear in the dashboard stream.

```typescript
core.logger.info('User logged in', { userId: 123 });
```

### REPL / Interactive Console
You can use the Gravito CLI to enter an interactive REPL environment with your application context loaded:

```bash
gravito console
```

---

## Next Steps
- [Spectrum Dashboard](./spectrum.md)
- [Error Handling Guide](./errors.md)
- [Logging Deep Dive](./logging.md)
