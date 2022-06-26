#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { Backend3Stack } from '../lib/backend3-stack';
import { BACKEND_STACK_NAME } from "./config";

const app = new cdk.App();
new Backend3Stack(app, BACKEND_STACK_NAME, {});
