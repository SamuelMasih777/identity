CREATE INDEX "contact_email_idx" ON "Contact" USING btree ("email");--> statement-breakpoint
CREATE INDEX "contact_phone_idx" ON "Contact" USING btree ("phoneNumber");