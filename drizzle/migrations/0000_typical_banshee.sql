CREATE TABLE "Contact" (
	"id" serial PRIMARY KEY NOT NULL,
	"phoneNumber" varchar,
	"email" varchar,
	"linkedId" integer,
	"linkPrecedence" varchar DEFAULT 'primary',
	"createdAt" timestamp DEFAULT now(),
	"updatedAt" timestamp DEFAULT now(),
	"deletedAt" timestamp
);
