import * as cdk from 'aws-cdk-lib';
import { Match, Template } from 'aws-cdk-lib/assertions';
import { ECSStack } from '../lib/ECS-stack';

test('failed health checks alarm and roll back ECS deployments', () => {
  const app = new cdk.App();
  const stack = new ECSStack(app, 'ECSStack', {
    env: { account: '111111111111', region: 'us-east-1' },
  });
  const template = Template.fromStack(stack);

  template.hasResourceProperties('AWS::ElasticLoadBalancingV2::TargetGroup', {
    HealthCheckPath: '/api/health',
    Matcher: { HttpCode: '200' },
  });

  template.hasResourceProperties('AWS::CloudWatch::Alarm', {
    AlarmName: 'AstroUnhealthyTarget',
    ComparisonOperator: 'GreaterThanOrEqualToThreshold',
    EvaluationPeriods: 1,
    MetricName: 'UnHealthyHostCount',
    Namespace: 'AWS/ApplicationELB',
    Threshold: 1,
    TreatMissingData: 'notBreaching',
  });

  template.hasResourceProperties('AWS::ECS::Service', {
    DeploymentConfiguration: Match.objectLike({
      Alarms: {
        AlarmNames: Match.anyValue(),
        Enable: true,
        Rollback: true,
      },
    }),
  });
});
