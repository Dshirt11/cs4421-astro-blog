#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib/core';
import { StaticSiteStack } from '../lib/static-site-stack';
import { ECSStack } from '../lib/ECS-stack';

const app = new cdk.App();
const env = { account: '830393774434', region: 'us-east-1' };

const ecsStack = new ECSStack(app, 'ECSStack', { env });

new StaticSiteStack(app, 'StaticSiteStack', {
  /* If you don't specify 'env', this stack will be environment-agnostic.
   * Account/Region-dependent features and context lookups will not work,
   * but a single synthesized template can be deployed anywhere. */

  /* Uncomment the next line to specialize this stack for the AWS Account
   * and Region that are implied by the current CLI configuration. */
  // env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION },

  /* Uncomment the next line if you know exactly what Account and Region you
   * want to deploy the stack to. */
  env,
  loadBalancer: ecsStack.loadBalancer,
});