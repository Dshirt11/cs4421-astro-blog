# CDK deployment

`ECSStack` runs the Astro SSR application on ECS Fargate. `StaticSiteStack`
places CloudFront in front of its load balancer, so both the CloudFront URL and
the direct service URL serve the same application.

Deploy both stacks from this directory:

```sh
npx cdk deploy --all
```

## Health checks and rollback

The load balancer checks `/api/health` and accepts only HTTP 200. The
`AstroUnhealthyTarget` CloudWatch alarm fires when at least one target is
unhealthy. ECS monitors that alarm during deployments and rolls back to the
previous task definition if it enters ALARM; the ECS deployment circuit
breaker is enabled as an additional failure guard.

Rollback starts automatically, but restoring a healthy target can take
minutes. Do not treat the rollback as an instantaneous seconds-level recovery.
