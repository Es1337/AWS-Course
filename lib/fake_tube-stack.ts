import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as nodejslambda from "aws-cdk-lib/aws-lambda-nodejs";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as iam from "aws-cdk-lib/aws-iam";

export class FakeTubeStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    
    const api = new apigateway.RestApi(this, "videos-api", {
      cloudWatchRole: false, // Needed as hack for AWS Academy, usually you don't need to specify that
      restApiName: "Videos Service",
      description: "This service serves videos"
    });
    
    const handler = new nodejslambda.NodejsFunction(this, "VideoHandler", {
      runtime: lambda.Runtime.NODEJS_14_X,
      entry: 'resources/videos.ts',
      role: iam.Role.fromRoleName(this, "LabRole", "LabRole"), // Needed as hack for AWS Academy, usually you don't need to specify that
    });
   
    const videosResource = api.root.addResource('videos');
    
    const videosIntegration = new apigateway.LambdaIntegration(handler, {
      requestTemplates: { "application/json": '{ "statusCode": "200" }' }
    });
  
    videosResource.addMethod("GET", videosIntegration);
    
    const videoItemResource = videosResource.addResource('{id}')
    videoItemResource.addMethod("GET", videosIntegration);
  
  
    // create model for payload validation
  const videoModel = new apigateway.Model(this, "post-videos-validator", {
    restApi: api,
    contentType: "application/json",
    description: "To validate video create payload",
    modelName: "videomodelcdk",

    // schema (allowed shape) of our payload
    schema: {
      type: apigateway.JsonSchemaType.OBJECT,
      required: ["title"],
      properties: {
        title: { type: apigateway.JsonSchemaType.STRING },
      },
    }
  });
  
    // create request validation API Gateway resource
  const requestValidator = new apigateway.RequestValidator(
    this,
    "body-validator",
    {
      restApi: api,
      requestValidatorName: "body-validator",
      validateRequestBody: true,
    }
  );

  // create new endpoint (POST /videos) - validator and model are configuration options
  videosResource.addMethod('POST', videosIntegration, {
    requestValidator,
    requestModels: {
      "$default": videoModel
    },
  });
  }
}
