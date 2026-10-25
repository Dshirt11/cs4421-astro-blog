import * as cdk from 'aws-cdk-lib';
import { Match, Template } from 'aws-cdk-lib/assertions';
import { ECSStack } from '../lib/ECS-stack';
import { StaticSiteStack } from '../lib/static-site-stack';

test('CloudFront forwards uncached requests to the SSR service', () => {
  const app = new cdk.App();
  const env = { account: '111111111111', region: 'us-east-1' };
  const ecsStack = new ECSStack(app, 'ECSStack', { env });
  const cloudFrontStack = new StaticSiteStack(app, 'StaticSiteStack', {
    env,
    loadBalancer: ecsStack.loadBalancer,
  });
  const template = Template.fromStack(cloudFrontStack);

  template.hasResourceProperties('AWS::CloudFront::Distribution', {
    DistributionConfig: Match.objectLike({
      DefaultCacheBehavior: Match.objectLike({
        AllowedMethods: Match.arrayWith(['POST', 'DELETE']),
        CachePolicyId: '4135ea2d-6df8-44a3-9df3-4b5a84be39ad',
        OriginRequestPolicyId: 'b689b0a8-53d0-40ab-baf2-68738e2966ac',
        ViewerProtocolPolicy: 'redirect-to-https',
      }),
      Origins: Match.arrayWith([
        Match.objectLike({
          CustomOriginConfig: Match.objectLike({
            OriginProtocolPolicy: 'http-only',
          }),
          DomainName: Match.anyValue(),
        }),
      ]),
    }),
  });

  template.hasOutput('CloudFrontUrl', {
    Description: 'Public HTTPS URL for the Astro application through CloudFront',
  });
});
