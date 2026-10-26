# ADR-001: Transition to SSR and Containers

- **Status:** Accepted and implemented
- **Decision date:** 2026-10-15
- **Updated:** 2026-10-25

## Context

The site was originally deployed as a static Astro build to an S3 bucket behind
CloudFront. Static hosting serves prebuilt files, but cannot run server-side
rendering or handle routes that need a live Node.js process.

The application now uses Astro's server output and the `@astrojs/node`
standalone adapter. It includes a runtime health endpoint and request logging,
so production needs a running server as well as static asset delivery.

## Decision

Run the Astro application as a Node.js standalone server in a Docker container
on AWS ECS Fargate. The service is exposed through an Application Load
Balancer. Static content and dynamic routes are served by the same application
deployment.

The implementation uses:

- `output: 'server'` and the `@astrojs/node` standalone adapter.
- A multi-stage Docker build, with the generated server started using
  `node ./dist/server/entry.mjs` on port `4321`.
- The existing ECR repository `astro-blog`. The container deployment workflow
  tags images with the Git commit SHA and passes that tag to the CDK deployment
  through `IMAGE_TAG`.
- An ECS Fargate service with one desired task, `256` CPU units, and `512` MiB
  memory, fronted by a public Application Load Balancer. Rolling deployments
  retain 100% of the desired healthy tasks and allow up to 200% of desired
  tasks temporarily, so a replacement can pass the load balancer health check
  before the old task is stopped. The ECS deployment circuit breaker rolls
  back a deployment if the replacement cannot become healthy.
- `/api/health` as the ECS target group's health-check path.
- The target group accepts only HTTP 200. A CloudWatch alarm watches
  `UnHealthyHostCount`; ECS deployment alarms and the deployment circuit
  breaker both roll back failed deployments.
- A CloudFront distribution in front of the load balancer, forwarding all
  methods without caching responses.
- CloudWatch logs in `/ecs/astro-blog`, retained for one month.
- A CloudFront distribution in front of the ECS load balancer. It forwards all
  viewer requests, disables response caching, and redirects viewers to HTTPS.
- A GitHub Actions workflow that builds and tests the application, pushes the
  image to ECR, and deploys both CDK stacks on pushes to `main`.

## Current deployment status

CloudFront and the direct load-balancer URL serve the same SSR application.
`deploy-container.yml` builds the container and deploys both stacks on pushes
to `main`; the separate static-site workflow has been removed.

## Consequences

### Benefits

- Server-rendered pages and API endpoints can run in production.
- The same application deployment serves the site and its runtime routes.
- The container image packages the server with its production dependencies.
- ECS can use the health endpoint to determine whether a task is healthy.
- Structured request logs are available through the configured CloudWatch log
  group.

### Trade-offs

- Production requires a continuously running service and supporting AWS
  infrastructure, including an Application Load Balancer.
- CloudFront terminates viewer HTTPS and connects to the public load balancer
  over HTTP. Direct load-balancer access remains HTTP.
- The service's current desired count and task size are fixed in the CDK stack
  and may need adjustment for production traffic and availability needs.
- Rollback is automatic on unhealthy-target alarms, but full recovery and
  target deregistration can take minutes rather than seconds.
- Dynamic responses must not be cached as static files without an explicit
  cache policy.
