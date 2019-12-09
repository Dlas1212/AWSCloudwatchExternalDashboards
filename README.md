# AWS Cloudwatch Display Externally

Copy & `.env.example` -> `.env` and fill it in with your AWS Credentials.
Make sure you have your AWS IAM Permissions set correctly.

1. `cd AWSCloudwatchExternalDashboards`
2. `npm install`
3. `npm run dev`

In Index.js specify your Dashboard Name. In this case it is `Master`.

Navigate to `/aws` to generate the Cloudwatch images

Go to `/display` to display the data
