import twilio from 'twilio';

const AccessToken = twilio.jwt.AccessToken;
const VideoGrant = AccessToken.VideoGrant;

// Used when generating any kind of tokens
const twilioAccountSid = 'USc4ee701e87c5dafe82ef17aae0386e6d';
const twilioApiKey = 'SKe78d687cc3a39e8daa219e2514b1798a';
const twilioApiSecret = 'dFwovPTul8hzf7WL3fEiCBLX1QwfEfMM';

// Create an access token which we will sign and return to the client,
// containing the grant we just created
const options = { identity: 'example-user', ttl: 3600 };
const token = new AccessToken(twilioAccountSid, twilioApiKey, twilioApiSecret, options);
// Assign the generated identity to the token
token.identity = 'example-user';

// Grant the access token Twilio Video capabilities
const grant = new VideoGrant();
token.addGrant(grant);

// Serialize the token to a JWT string
console.log(token.toJwt());