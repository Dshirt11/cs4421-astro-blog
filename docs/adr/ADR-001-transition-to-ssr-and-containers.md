# ADR-001: Transition to SSR and Containers

- **Status:** Accepted; deployment migration in progress
- **Date:** 2026-10-15

## Context

The site was originally deployed as a static Astro build to an S3 bucket behind
CloudFront. That model serves prebuilt files only; it cannot run server-side
rendering or handle requests that require a live Node.js process.

The application now uses Astro's server output and the `@astrojs/node`
standalone adapter. This supports server-rendered routes and API endpoints,
including runtime-dependent responses such as the health endpoint. The
application therefore needs a server runtime, and a static asset deployment
alone is no longer a complete deployment model.

The current infrastructure and deployment workflow have not yet completed
this transition: the CDK stack still deploys `dist` to S3/CloudFront, and the
GitHub Actions deployment workflow is still configured for a static build.

## Decision

Deploy the Astro application as a Node.js server packaged in a container:

- Build the application with `astro build` using the Node standalone adapter.
- Package the generated server and its runtime dependencies into a container
  image.
- Run that image as a long-lived service on a container runtime that supports
  HTTP traffic and health checks.
- Route public web traffic to the service through an HTTPS-capable ingress or
  load balancer. A CDN may be used for caching static assets, but it must not
  replace the server origin for dynamic routes.
- Keep static content and assets in the same application deployment unless a
  future decision explicitly separates their hosting.

This ADR selects the deployment model, not a specific container orchestrator
or ingress product. Those infrastructure details should be chosen and recorded
when the CDK deployment is migrated.

## Consequences

### Benefits

- Server-rendered pages and API endpoints can run in production.
- The build artifact has a defined Node.js runtime and can be deployed
  consistently across environments.
- The service can expose runtime health checks and emit application logs.

### Trade-offs

- Production requires a continuously available server process and its
  supporting container infrastructure.
- Deployments must build, publish, and run a container image rather than only
  upload static files.
- Runtime capacity, availability, health checks, and logging need to be
  configured and monitored.
- Dynamic responses cannot be cached as static files without explicit cache
  policy.

## Migration notes

The Astro configuration already sets `output: 'server'` and uses the
`@astrojs/node` standalone adapter. The remaining deployment work is to add a
container image build and update the CDK stack and CI/CD workflow to publish
and deploy that image to the chosen container runtime. The existing S3 /
CloudFront static deployment should not be treated as serving the SSR
application until that work is complete.