#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { Backend2Stack } from '../lib/backend2-stack';
import { BACKEND_STACK_NAME } from "./config";

const app = new cdk.App();
new Backend2Stack(app, BACKEND_STACK_NAME, {});

