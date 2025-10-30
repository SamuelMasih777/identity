CREATE INDEX "contact_linked_id_idx" ON "Contact" USING btree ("linkedId");--> statement-breakpoint
CREATE INDEX "contact_email_phone_idx" ON "Contact" USING btree ("email","phoneNumber");--> statement-breakpoint
CREATE INDEX "contact_linked_precedence_idx" ON "Contact" USING btree ("linkedId","linkPrecedence");--> statement-breakpoint
CREATE INDEX "contact_created_at_idx" ON "Contact" USING btree ("createdAt");