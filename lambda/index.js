const Alexa = require('ask-sdk-core');
const ddbAdapter = require('ask-sdk-dynamodb-persistence-adapter');
const AWS = require("aws-sdk");

const LaunchRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest';
    },
    handle(handlerInput) {
        const speakOutput = 'Daily Event Manager started. Ask for report or round an event';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

const HelloWorldIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'HelloWorldIntent';
    },
    handle(handlerInput) {
        const speakOutput = 'Hello World!';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            //.reprompt('add a reprompt if you want to keep the session open for the user to respond')
            .getResponse();
    }
};

const HelpIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.HelpIntent';
    },
    handle(handlerInput) {
        const speakOutput = 'You can say hello to me! How can I help?';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

const CancelAndStopIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && (Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.CancelIntent'
                || Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.StopIntent');
    },
    handle(handlerInput) {
        const speakOutput = 'Goodbye!';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .getResponse();
    }
};

const AddEventIntentHandler = {
    canHandle(handlerInput) {
        return (
            Alexa.getRequestType(handlerInput.requestEnvelope) === "IntentRequest" &&
            Alexa.getIntentName(handlerInput.requestEnvelope) === "AddEventIntent"
        );
    },
    async handle(handlerInput) {
        const eventName = handlerInput.requestEnvelope.request.intent.slots.eventName.value;
        let attributes = await db.getAllAttributes(handlerInput);
        let speakText;

        if (attributes.hasOwnProperty(eventName)) {
            speakText = `Event ${eventName} already present`;
        } else {
            attributes[eventName] = [];
            speakText = `Event ${eventName} added`;
        }

        await db.setAttributes(handlerInput, attributes);

        return handlerInput.responseBuilder
            .speak(speakText)
            .getResponse();
    },
}

const RemoveEventIntentHandler = {
    canHandle(handlerInput) {
        return (
            Alexa.getRequestType(handlerInput.requestEnvelope) === "IntentRequest" &&
            Alexa.getIntentName(handlerInput.requestEnvelope) === "RemoveEventIntent"
        );
    },
    async handle(handlerInput) {
        const eventName = handlerInput.requestEnvelope.request.intent.slots.eventName.value;
        let attributes = await db.getAllAttributes(handlerInput);

        let speakText;
        if (!attributes.hasOwnProperty(eventName)) {
            speakText = `Event ${eventName} not present`;
        } else {
            delete attributes[eventName]
            speakText = `Event ${eventName} removed`;
        }

        await db.setAttributes(handlerInput, attributes);

        return handlerInput.responseBuilder
            .speak(speakText)
            .getResponse();
    },
};

const ListEventsIntentHandler = {
    canHandle(handlerInput) {
        return (
            Alexa.getRequestType(handlerInput.requestEnvelope) === "IntentRequest" &&
            Alexa.getIntentName(handlerInput.requestEnvelope) === "ListEventsIntent"
        );
    },
    async handle(handlerInput) {
        let attributes = await db.getAllAttributes(handlerInput);
        let speakText = "";

        Object.keys(attributes).forEach((event) => {
                speakText += `${event}. `;
        })

        return handlerInput.responseBuilder
            .speak(speakText)
            .getResponse();
    },
};

const RoundEventIntentHandler = {
    canHandle(handlerInput) {
        return (
            Alexa.getRequestType(handlerInput.requestEnvelope) === "IntentRequest" &&
            Alexa.getIntentName(handlerInput.requestEnvelope) === "RoundEventIntent"
        );
    },
    async handle(handlerInput) {
        const eventName = handlerInput.requestEnvelope.request.intent.slots.eventName.value;
        let attributes = await db.getAllAttributes(handlerInput);
        let speakText;

        if (!attributes.hasOwnProperty(eventName)) {
            speakText = `Event ${eventName} not present`;
        } else {
            // add todays date to the event
            let date = new Date().toUTCString();
            attributes[eventName].push(date)
            speakText = `Rounded today for ${eventName}`
        }

        await db.setAttributes(handlerInput, attributes);

        return handlerInput.responseBuilder
            .speak(speakText)
            .getResponse();
    },
};

const GetEventReportIntentHandler = {
    canHandle(handlerInput) {
        return (
            Alexa.getRequestType(handlerInput.requestEnvelope) === "IntentRequest" &&
            Alexa.getIntentName(handlerInput.requestEnvelope) === "GetEventReportIntent"
        );
    },
    async handle(handlerInput) {
        const eventName = handlerInput.requestEnvelope.request.intent.slots.eventName.value;
        const reportDate = handlerInput.requestEnvelope.request.intent.slots.reportMonth.value;

        const month = new Date(reportDate).getMonth();

        let attributes = await db.getAllAttributes(handlerInput);

        let speakText;

            if (!attributes.hasOwnProperty(eventName)) {
                speakText = `Event ${eventName} not present`;
            } else {
                let count = 0;
                let dateArray = attributes[eventName];
                for (let i = 0; i < dateArray.length; i++) {
                    let d = new Date(dateArray[i]);
                    if (d.getMonth() === month) {
                        count++;
                    }
                }
                speakText = `${eventName} has ${count} occurences`;
            }


        return handlerInput.responseBuilder
            .speak(speakText)
            .getResponse();
    },
};

const YesIntentHandler = {
    canHandle(handlerInput) {
        return (
            Alexa.getRequestType(handlerInput.requestEnvelope) === "IntentRequest" &&
            Alexa.getIntentName(handlerInput.requestEnvelope) === "AMAZON.YesIntent" &&
            handlerInput.attributesManager.getSessionAttributes().questionAsked === 'DidTheCookComeToday'
        );
    },
    async handle(handlerInput) {
        let attributes = await db.getAllAttributes(handlerInput);
        let eventName = handlerInput.attributesManager.getSessionAttributes().triggeredEvent;
        let date = new Date().toUTCString();
        attributes[eventName].push(date);
        let speakText = `Rounded today for ${eventName}`;
        await db.setAttributes(handlerInput, attributes);
        return handlerInput.responseBuilder
            .speak(speakText)
            .getResponse();
    },
};

const NoIntentHandler = {
    canHandle(handlerInput) {
        return (
            Alexa.getRequestType(handlerInput.requestEnvelope) === "IntentRequest" &&
            Alexa.getIntentName(handlerInput.requestEnvelope) === "AMAZON.NoIntent" &&
            handlerInput.attributesManager.getSessionAttributes().questionAsked === 'DidTheCookComeToday'
        );
    },
    handle(handlerInput) {
        let speakText = 'Ok. Thanks'
        return handlerInput.responseBuilder
            .speak(speakText)
            .getResponse();
    },
};

const TriggerRoutineIntentHandler = {
    canHandle(handlerInput) {
        return (
            Alexa.getRequestType(handlerInput.requestEnvelope) === "IntentRequest" &&
            Alexa.getIntentName(handlerInput.requestEnvelope) === "TriggerRoutineIntent"
        );
    },
    handle(handlerInput) {
        const eventName = handlerInput.requestEnvelope.request.intent.slots.eventName.value;
        const speakOutput = 'Akhil, Did the cook come today?';
        setQuestion(handlerInput, 'DidTheCookComeToday');
        setEvent(handlerInput, eventName);
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    },
}

/* *
 * FallbackIntent triggers when a customer says something that doesn’t map to any intents in your skill
 * It must also be defined in the language model (if the locale supports it)
 * This handler can be safely added but will be ingnored in locales that do not support it yet 
 * */
const FallbackIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.FallbackIntent';
    },
    handle(handlerInput) {
        const speakOutput = 'Sorry, I don\'t know about that. Please try again.';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};
/* *
 * SessionEndedRequest notifies that a session was ended. This handler will be triggered when a currently open 
 * session is closed for one of the following reasons: 1) The user says "exit" or "quit". 2) The user does not 
 * respond or says something that does not match an intent defined in your voice model. 3) An error occurs 
 * */
const SessionEndedRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'SessionEndedRequest';
    },
    handle(handlerInput) {
        console.log(`~~~~ Session ended: ${JSON.stringify(handlerInput.requestEnvelope)}`);
        // Any cleanup logic goes here.
        return handlerInput.responseBuilder.getResponse(); // notice we send an empty response
    }
};

// All DB operations require first getting the value before writing it,
// other wise it was causing overwrite in DynamoDB.
// TODO: @akhilerm fix to write items directly instead of get->set
const db = {

    async getAllAttributes(handlerInput) {
        const attributesManager = handlerInput.attributesManager;
        return await attributesManager.getPersistentAttributes() || {};
    },

    async setAttributes(handlerInput, attributes) {
        const attributesManager = handlerInput.attributesManager;
        attributesManager.setPersistentAttributes(attributes);
        await attributesManager.savePersistentAttributes();
    },
};

function setQuestion(handlerInput, question) {
    const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
    sessionAttributes.questionAsked = question;
    handlerInput.attributesManager.setSessionAttributes(sessionAttributes);
}

function setEvent(handlerInput, eventName) {
    const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
    sessionAttributes.triggeredEvent = eventName;
    handlerInput.attributesManager.setSessionAttributes(sessionAttributes);
}

/* *
 * The intent reflector is used for interaction model testing and debugging.
 * It will simply repeat the intent the user said. You can create custom handlers for your intents 
 * by defining them above, then also adding them to the request handler chain below 
 * */
const IntentReflectorHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest';
    },
    handle(handlerInput) {
        const intentName = Alexa.getIntentName(handlerInput.requestEnvelope);
        const speakOutput = `You just triggered ${intentName}`;

        return handlerInput.responseBuilder
            .speak(speakOutput)
            //.reprompt('add a reprompt if you want to keep the session open for the user to respond')
            .getResponse();
    }
};
/**
 * Generic error handling to capture any syntax or routing errors. If you receive an error
 * stating the request handler chain is not found, you have not implemented a handler for
 * the intent being invoked or included it in the skill builder below 
 * */
const ErrorHandler = {
    canHandle() {
        return true;
    },
    handle(handlerInput, error) {
        const speakOutput = 'Sorry, I had trouble doing what you asked. Please try again.';
        console.log(`~~~~ Error handled: ${JSON.stringify(error)}`);

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

/**
 * This handler acts as the entry point for your skill, routing all request and response
 * payloads to the handlers above. Make sure any new handlers or interceptors you've
 * defined are included below. The order matters - they're processed top to bottom 
 * */
exports.handler = Alexa.SkillBuilders.custom()
    .addRequestHandlers(
        LaunchRequestHandler,
        AddEventIntentHandler,
        RemoveEventIntentHandler,
        ListEventsIntentHandler,
        RoundEventIntentHandler,
        GetEventReportIntentHandler,
        TriggerRoutineIntentHandler,
        YesIntentHandler,
        NoIntentHandler,
        HelloWorldIntentHandler,
        HelpIntentHandler,
        CancelAndStopIntentHandler,
        FallbackIntentHandler,
        SessionEndedRequestHandler,
        IntentReflectorHandler)
    .addErrorHandlers(
        ErrorHandler)
    .withPersistenceAdapter(
        new ddbAdapter.DynamoDbPersistenceAdapter(
            {
                tableName: process.env.DYNAMODB_PERSISTENCE_TABLE_NAME,
                createTable: false,
                dynamoDBClient: new AWS.DynamoDB(
                    {
                        apiVersion: 'latest',
                        region: process.env.DYNAMODB_PERSISTENCE_REGION
                    }
                )
            }
        )
    )
    .withCustomUserAgent('sample/hello-world/v1.2')
    .lambda();