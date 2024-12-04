export type AmplifyDependentResourcesAttributes = {
  api: {
    potatogoapi: {
      ApiId: 'string';
      ApiName: 'string';
      RootUrl: 'string';
    };
  };
  function: {
    cartHandler: {
      Arn: 'string';
      LambdaExecutionRole: 'string';
      LambdaExecutionRoleArn: 'string';
      Name: 'string';
      Region: 'string';
    };
    loginHandler: {
      Arn: 'string';
      LambdaExecutionRole: 'string';
      LambdaExecutionRoleArn: 'string';
      Name: 'string';
      Region: 'string';
    };
    menuHandler: {
      Arn: 'string';
      LambdaExecutionRole: 'string';
      LambdaExecutionRoleArn: 'string';
      Name: 'string';
      Region: 'string';
    };
    orderHandler: {
      Arn: 'string';
      LambdaExecutionRole: 'string';
      LambdaExecutionRoleArn: 'string';
      Name: 'string';
      Region: 'string';
    };
    registerHandler: {
      Arn: 'string';
      LambdaExecutionRole: 'string';
      LambdaExecutionRoleArn: 'string';
      Name: 'string';
      Region: 'string';
    };
    testFunction: {
      Arn: 'string';
      LambdaExecutionRole: 'string';
      LambdaExecutionRoleArn: 'string';
      Name: 'string';
      Region: 'string';
    };
  };
  storage: {
    potatogoDB: {
      Arn: 'string';
      Name: 'string';
      PartitionKeyName: 'string';
      PartitionKeyType: 'string';
      Region: 'string';
      SortKeyName: 'string';
      SortKeyType: 'string';
      StreamArn: 'string';
    };
  };
};
