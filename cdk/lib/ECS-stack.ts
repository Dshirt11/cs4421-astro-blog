import * as cdk from 'aws-cdk-lib';
import * as ecr from 'aws-cdk-lib/aws-ecr';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as ecsPatterns from 'aws-cdk-lib/aws-ecs-patterns';
import * as logs from 'aws-cdk-lib/aws-logs';

export class ECSStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const repository = ecr.Repository.fromRepositoryName(
      this,
      'AstroRepository',
      'astro-blog',
    );
    const imageTag = process.env.IMAGE_TAG ?? 'latest';

    const cluster = new ecs.Cluster(this, 'AstroCluster');
    const logGroup = new logs.LogGroup(this, 'AstroLogGroup', {
      logGroupName: '/ecs/astro-blog',
      retention: logs.RetentionDays.ONE_MONTH,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });

    const service = new ecsPatterns.ApplicationLoadBalancedFargateService(
      this,
      'AstroService',
      {
        cluster,
        cpu: 256,
        memoryLimitMiB: 512,
        desiredCount: 1,
        minHealthyPercent: 100,
        maxHealthyPercent: 200,
        circuitBreaker: { rollback: true },
        publicLoadBalancer: true,
        healthCheckGracePeriod: cdk.Duration.seconds(60),
        taskImageOptions: {
          image: ecs.ContainerImage.fromEcrRepository(repository, imageTag),
          containerPort: 4321,
          environment: {
            HOST: '0.0.0.0',
            PORT: '4321',
          },
          logDriver: new ecs.AwsLogDriver({
            logGroup,
            streamPrefix: 'astro-blog',
          }),
        },
      },
    );

    service.targetGroup.configureHealthCheck({
      path: '/api/health',
      healthyHttpCodes: '200',
    });

    new cdk.CfnOutput(this, 'ServiceUrl', {
      value: `http://${service.loadBalancer.loadBalancerDnsName}`,
      description: 'Public URL for the Astro application',
    });

    new cdk.CfnOutput(this, 'HealthCheckUrl', {
      value: `http://${service.loadBalancer.loadBalancerDnsName}/api/health`,
      description: 'Public health check endpoint',
    });
  }
}