---
applyTo: '** /*.ts,**/*.tsx **/*.js,**/*.jsx,**'
---

# Backend Best Practices for React Apps

## Architecture
- Use **Express.js** with a modular structure: `routes/`, `controllers/`, `services/`, `middlewares/`.
- Use **async/await** and avoid synchronous functions in production.
- Use **environment variables** via `dotenv`.

## Performance
- Enable **gzip compression** using `compression` middleware.
- Use **caching** (e.g., Redis) for frequently accessed data.
- Use **clustering** for multi-core CPU utilization.

## Security
- Sanitize inputs to prevent injection attacks.
- Use **Helmet** for setting secure HTTP headers.
- Implement **rate limiting** and **CORS** policies.

## Logging & Monitoring
- Use `winston` or `pino` for structured logging.
- Integrate with monitoring tools like **New Relic** or **Datadog**.

## API Design
- Follow **RESTful principles**.
- Use **OpenAPI (Swagger)** for documentation.
- Validate requests using `Joi` or `Zod`.

## Deployment Readiness
- Set `NODE_ENV=production`.
- Use a **reverse proxy** (e.g., Nginx) in production.
