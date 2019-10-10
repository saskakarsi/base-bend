# base-bend

Base node backend as a project starting point

config/*.env requires:

	PORT: port to serve on
	SENDGRID_API_KEY: API key from SendGrid for sending emails
	JWT_SECRET: what it says on the tin, string
	MONGODB_URL: form mongodb://${address}:${port}/${database-name}
	SYSTEM_EMAIL: email addr for automated email sending

Scripts:

	 npm run dev (uses dev.env)
	 npn run test (uses test.env)

Models:

	User: Basic model for a user
	TemplObj: Template object because users always need ownership of something or other, find and replace with desired actual thing
