#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { BackendStack } from '../lib/backend-stack';
import { BACKEND_STACK_NAME } from './config';




const app = new cdk.App();
new BackendStack(app, BACKEND_STACK_NAME);
