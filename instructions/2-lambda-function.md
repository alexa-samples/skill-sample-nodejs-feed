# Build An Alexa Feed Reader Skill
[![Voice User Interface](https://m.media-amazon.com/images/G/01/mobile-apps/dex/alexa/alexa-skills-kit/tutorials/navigation/1-locked._TTH_.png)](./1-voice-user-interface.md)[![Lambda Function](https://m.media-amazon.com/images/G/01/mobile-apps/dex/alexa/alexa-skills-kit/tutorials/navigation/2-on._TTH_.png)](./2-lambda-function.md)[![Connect VUI to Code](https://m.media-amazon.com/images/G/01/mobile-apps/dex/alexa/alexa-skills-kit/tutorials/navigation/3-off._TTH_.png)](./3-connect-vui-to-code.md)[![Testing](https://m.media-amazon.com/images/G/01/mobile-apps/dex/alexa/alexa-skills-kit/tutorials/navigation/4-off._TTH_.png)](./4-testing.md)[![Customization](https://m.media-amazon.com/images/G/01/mobile-apps/dex/alexa/alexa-skills-kit/tutorials/navigation/5-off._TTH_.png)](./5-customization.md)[![Publication](https://m.media-amazon.com/images/G/01/mobile-apps/dex/alexa/alexa-skills-kit/tutorials/navigation/6-off._TTH_.png)](./6-publication.md)

## Setting Up A Lambda Function Using Amazon Web Services

In the [Voice User Interface](./1-voice-user-interface.md) step, you built the Voice User Interface (VUI) for our Alexa skill. In this step, we will be creating an AWS Lambda function using [Amazon Web Services](http://aws.amazon.com).  You can [read more about what a Lambda function is](http://aws.amazon.com/lambda), but for the purposes of this guide, what you need to know is that AWS Lambda is where our code lives.  When a user asks Alexa to use our skill, it is our AWS Lambda function that interprets the appropriate interaction and provides the conversation back to the user.

1.  Go to the [AWS Console](https://console.aws.amazon.com/console/home) and sign in. 

    <a href="https://console.aws.amazon.com/console/home" target="_new"><img src="https://m.media-amazon.com/images/G/01/mobile-apps/dex/alexa/alexa-skills-kit/tutorials/general/2-1-sign-in-to-the-console._TTH_.png" /></a>

	> If you don't already have an account, you will need to create one.  [Here is a quick walkthrough for setting up an AWS account](https://github.com/alexa/alexa-cookbook/blob/master/guides/aws-security-and-setup/set-up-aws.md).

2.  Click _Services_ at the top of the screen, and type ```Lambda``` in the search box.  You can also find Lambda in the list of services.  It is in the _Compute_ section.

    <a href="https://console.aws.amazon.com/lambda/home" target="_new"><img src="https://m.media-amazon.com/images/G/01/mobile-apps/dex/alexa/alexa-skills-kit/tutorials/general/2-2-services-lambda._TTH_.png" /></a>

3.  Check that your AWS region is set to US East (N. Virginia): **us-east-1**. AWS Lambda only works with the Alexa Skills Kit in four regions: US East (N. Virginia), EU (Ireland), US West (Oregon) and Asia Pacific (Tokyo).  Make sure you choose the region closest to your customers.

	<img src="https://m.media-amazon.com/images/G/01/mobile-apps/dex/alexa/alexa-skills-kit/tutorials/general/2-3-check-region._TTH_.png"/>

4.  Click the **Create function** button near the top right of the page.

    <img src="https://m.media-amazon.com/images/G/01/mobile-apps/dex/alexa/alexa-skills-kit/tutorials/general/2-4-create-a-lambda-function._TTH_.png" />

5. When prompted, make sure that **Author from scratch** is selected.
6. Set the name of the function. ```FeedReader``` is sufficient if you don't have another idea for a name. The name of your function will only be visible to you, but make sure that you name it something meaningful.  

	<img src="https://m.media-amazon.com/images/G/01/mobile-apps/dex/alexa/alexa-skills-kit/tutorials/general/2-7-configure-your-function._TTH_.png" />  

7. Create an AWS Role in IAM with access to DynamoDB, S3 and CloudWatch logs. If you haven't done this before, a [detailed walkthrough for setting up your first role for Lambda](https://alexa.design/create-lambda-role) is available.
	1. Create a new IAM role.
	![create_role_1](https://s3.amazonaws.com/lantern-public-assets/sample-skill-nodejs-feed/aws-create-role-screenshot-1.PNG "AWS Create Role Screenshot 1")<br/><br/>
	2. Select the Service type of the role as **Lambda**.
	![create_role_2](https://s3.amazonaws.com/lantern-public-assets/sample-skill-nodejs-feed/aws-create-role-screenshot-2.PNG "AWS Create Role Screenshot 2")<br/><br/>
	
	3. Add the following policies to the role:
		- AmazonDynamoDBFullAccess
		- AmazonS3FullAccess
		- CloudWatchLogsFullAccess<br/>
		
		![create_role_3](https://s3.amazonaws.com/lantern-public-assets/sample-skill-nodejs-feed/aws-create-role-screenshot-3.PNG "AWS Create Role Screenshot 3")<br/><br/>

   * Once you've set up your role, click the **Create Function** button in the bottom right corner.

8. From the _Add triggers_ section on the left add Alexa Skills Kit from the list by clicking on it.  

9. Once you have selected **Alexa Skills Kit**, scroll down to the bottom of the page. Under _Configure triggers_, select Enable for Skill ID verification. A **Skill ID** Text Box should appear. The value for this input is your Skill ID from the developer portal.

10. Now lets secure this lambda function, so that it can only be invoked by your skill. Open up the [developer portal](https://developer.amazon.com/edw/home.html#/skills) and select your skill from the list. You mays till have a browser tab open if you started at the beginning of this tutorial.

11. Browse to your list of skills in the [Alexa Developer Console](https://developer.amazon.com/alexa/console/ask) and click the **View Skill ID** link. From the popup Skill ID dialog, select and copy the value. It should look something like the following: `amzn1.ask.skill.xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`

12. Return back to your lambda function in the. You may already have this browser tab open. Otherwise, open the lambda console by clicking here: [AWS Lambda Console](https://console.aws.amazon.com/lambda/home?region=us-east-1#/functions) and selecting the appropriate function. Scroll down to **Configure triggers**, paste the Skill ID in the Skill ID edit box.

13. Click the **Add** button. Then click the **Save** button in the top right. You should see a green success message at the top of your screen. Now, click the box that has the Lambda icon followed by the name of your function and scroll down to the field called "Function code".

14. Set up your local environment to run the deployment script

      1. Configure AWS credentials the tool will use to upload code to your Skill. For full details see the instructions on [Configuring the AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-configure.html).

      2. The file should have the format, and include keys you retrieve from the AWS console:

          ```
          [default]
          aws_access_key_id = [KEY FROM AWS]
          aws_secret_access_key = [SECRET KEY FROM AWS]
          ```

      3.	Setup [NodeJS and NPM](https://nodejs.org/en/download/).

      4.	Get the code and install dependencies:

          ```
          git clone https://github.com/alexa/skill-sample-nodejs-feed.git
          cd skill-sample-nodejs-feed/lambda/custom
          npm install
          ```

15. Create an S3 Bucket

	In another tab, go to the [Amazon S3 Console](https://s3.console.aws.amazon.com/s3/home?region=us-east-1) and create an AWS S3 Bucket with a unique name like ```feed-skill-bucket-385123```. The S3 bucket name must be unique across all existing bucket names in Amazon S3. In case of a conflict, retry with another name and append with something like your initials or a random value.

	![alt text](https://s3.amazonaws.com/lantern-public-assets/sample-skill-nodejs-feed/aws-create-s3-bucket-screenshot-1.PNG "AWS DynamoDB Screenshot")


16. **[OPTIONAL]** Create an AWS DynamoDB table
	You can manually create a table named MyFeedSkillTable with the case sensitive primary key "userId".

	![alt text](https://cloud.githubusercontent.com/assets/7671574/17307587/b80787f2-57ea-11e6-9be2-3df26e8e5947.png "AWS DynamoDB Screenshot")


17. Configure the Project to Use Your Feed

      1. Open ```/lambda/custom/configuration.js``` file.

      2. Update the following information to configure the skill:

		**appId**: Your Skill's Application ID from the Skill you created at https://developer.amazon.com.<br/>
		**welcome_message**: A welcome message that will be spoken to the user when they open your skill.<br/>
		**number\_feeds\_per\_prompt**: The number of items the skill will read each time the user invokes it.<br/>
		**display\_only\_feed\_title**: A boolean flag that determines whether to speak out the title-only or title and summary of the items in your feed.<br/>
		**display\_only\_title\_in\_card** : A boolean flag to decide whether to display a card with the title only or title and summary of the items in your feed.<br/>
		**categories**: The list of RSS feeds you want to include in your Skill.  Each feed will be treated as a category.<br/>
		**speech\_style\_for\_numbering\_feeds**: Naming convention for each item.<br/>
		**s3BucketName**: Your S3 Bucket Name.<br/>
		**dynamoDBTableName**: Your DynamoDB Table Name. (If not created, the skill will create it.)<br/>

      3. A sample configuration :

		```javascript
		let config = {
			appId : 'amzn1.ask.skill.xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
			welcome_message : 'Welcome to Feed Skill',
			number_feeds_per_prompt : 3,
			display_only_feed_title : true,
			display_only_title_in_card : true,
			categories : {
				'feed name' : 'http://www.example.com/rss-feed.xml'
			},
			speech_style_for_numbering_feeds : 'Item',
			s3BucketName : '{YOUR_S3_BUCKET_NAME}',
			dynamoDBTableName : 'MyFeedSkillBucket'
			dynamoDBRegion : 'us-east-1'
		};
		```

18. Deploy Your Skill

	1. From the commmand-line, go to the `skill-sample-nodejs-feed/lambda/bin/` directory and run `deploy.js` using Node.

          ```
          npm install aws-sdk
          node deploy.js
          ```


	2. Go to the the `skill-sample-nodejs-feed/lambda/custom/` directory and zip all of the files.  Be sure to only zip the files inside the directory, and not the directory itself. The ```index.js``` file needs to be at the root of the zip file.

	3. Go to the [AWS Lambda Console](https://console.aws.amazon.com/lambda/home?region=us-east-1#/functions) select your Lambda function, locate the Function code section and upload the file by selecting "Code entry type" as "Upload a .ZIP file".

	4. Configure the rest of your function
		1. Scroll to the _Basic Settings_ section.
		2. Change the **Timeout** to 30 seconds, since feeds can become an issue.
		3. Leave the defaults for everything else.
		4. Note the ARN of the Lambda you've created, which you'll need later.

19. Update the skill interaction model.
	1. During the deploy, a copy of the interaction model was created and named `en-US-updated.json` that contains the categories specified from the configuration file. Locate that file in the _/models_ directory.
	2. Open the file and copy its contents back into the **Intents** JSON Editor of the Alexa Developer Console.
	3. Updating the contents of the interaction model will update the invocation. Doublecheck that you have the invocation name you want to use and save and build the model.

20. After you create the function, the ARN value appears in the top right corner. Copy this value for use in the next section of the guide.

    <img src="https://m.media-amazon.com/images/G/01/mobile-apps/dex/alexa/alexa-skills-kit/tutorials/quiz-game/2-12-copy-ARN._TTH_.png" />  <!--TODO: THIS IMAGE NEEDS TO BE CUSTOMIZED FOR YOUR SKILL TEMPLATE. -->

<br/><br/>
<a href="./3-connect-vui-to-code.md"><img src="https://m.media-amazon.com/images/G/01/mobile-apps/dex/alexa/alexa-skills-kit/tutorials/general/buttons/button_next_connect_vui_to_code._TTH_.png"/></a>

<img height="1" width="1" src="https://www.facebook.com/tr?id=1847448698846169&ev=PageView&noscript=1"/>
