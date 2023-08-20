### Alexa Daily Event Counter Skill

Alexa skill that can be used to replace the process of the rounding recurring events on calendar, like if you want to
keep track of how many days the maid has come or how many days you visited the gym in a month.

#### Setting up the skill
1. Install and setup the [`ask`](https://developer.amazon.com/en-US/docs/alexa/smapi/quick-start-alexa-skills-kit-command-line-interface.html#prerequisites) CLI.
2. Create a new alexa hosted skill
```shell
akhil@akhil-ThinkPad-L14:~/W/alexa $ ask new
Please follow the wizard to start your Alexa skill project ->
? Choose a modeling stack for your skill:  Interaction Model
  The Interaction Model stack enables you to define the user interactions with a combination of utterances, intents, and slots.
? Choose the programming language you will use to code your skill:  NodeJS
? Choose a method to host your skill's backend resources:  Alexa-hosted skills
  Host your skill code by Alexa (free).
? Choose the default region for your skill:  us-east-1
? Please type in your skill name:  Daily Event Counter Skill
? Please type in your folder name for the skill project (alphanumeric):  DailyEventSkill

Project directory for Youtube Music Skill created at
        /home/akhil/Work/alexa/DailyEventSkill

Lambda code for Youtube Music Skill created at
	./lambda

Skill schema and interactionModels for Youtube Music Skill created at
	./skill-package

The skill has been enabled.

Hosted skill provisioning finished. Skill-Id: amzn1.ask.skill.abcdef01-2345-6789-abcd-ef0123456789
Please follow the instructions at https://developer.amazon.com/en-US/docs/alexa/hosted-skills/alexa-hosted-skills-ask-cli.html to learn more about the usage of "git" for Hosted skill.
```
3. Run the initialization script to prepare the dev environment with the skill code
```shell
wget https://gist.githubusercontent.com/akhilerm/db4b9faa5c5ae10cf0400948927406a6/raw/prepare_dev_env.sh
chmod +x prepare_dev_env.sh
./prepare_dev_env.sh <skill root directory> akhilerm/daily-event-counter-alexa-skill
```
5. Use `make deploy` to deploy the skill to alexa. This will merge the `dev` branch to `master` branch and push
the changes to AWS CodeCommit.

NOTE: While editing interaction models, only the `en-US.json` need to be edited and use `make sync-locale` to sync with
the other locales

#### Usage
```
User > Alexa, ask daily event manager to round today for cooking
Alexa> Rounded today for cooking
----
User > Alexa, ask daily event manager to get report of cooking for this month
Alexa> Cooking has 5 occurences
```
You can also use Alexa routines to trigger the skill at a specific time everyday as per schedule
```
Alexa> Akhil, Did the cook come today
User > Yes
Alexa> Rounded today for cooking
```