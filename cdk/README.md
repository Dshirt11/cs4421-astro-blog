# CDK deployment

The `ECSStack` runs the Astro app with server-side rendering. `StaticSiteStack`
creates a CloudFront distribution in front of the ECS load balancer, so both
the CloudFront HTTPS URL and the ECS `ServiceUrl` serve the same app.

From this directory, deploy both stacks with:

```sh
npx cdk deploy --all
```

After deployment, find the CloudFront URL in the `StaticSiteStack` outputs and
the direct load-balancer URL in the `ECSStack` outputs. CloudFront forwards
requests to the app without caching dynamic responses.
