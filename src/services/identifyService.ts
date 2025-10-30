import CustomError from "../models/customError";
import { db } from "../db/connection";
import { contact } from "../db/schema";
import { eq, or, inArray } from "drizzle-orm";

interface IdentifyParams {
  email?: string | null;
  phoneNumber?: string | null;
}

class IdentifyService {
  async identifyContact(params: IdentifyParams) {
    const { email, phoneNumber } = params;

    if (!email && !phoneNumber) {
      throw new CustomError(
        "Either email or phoneNumber must be provided",
        400
      );
    }

    const whereConditions = [];
    if (email) whereConditions.push(eq(contact.email, email));
    if (phoneNumber) whereConditions.push(eq(contact.phoneNumber, phoneNumber));

    const matchedContacts = await db
      .select()
      .from(contact)
      .where(or(...whereConditions));

    // Case 1: No matches - create new primary contact
    if (matchedContacts.length === 0) {
      const [newContact] = await db
        .insert(contact)
        .values({
          email: email || null,
          phoneNumber: phoneNumber || null,
          linkPrecedence: "primary",
        })
        .returning();

      const responseEmails = newContact.email ? [newContact.email] : [];
      const responsePhones = newContact.phoneNumber
        ? [newContact.phoneNumber]
        : [];

      return this.formatResponse(
        newContact.id,
        [],
        responseEmails,
        responsePhones,
        newContact.email,
        newContact.phoneNumber
      );
    }

    // Collect all primary IDs in one pass
    const primaryIds = new Set<number>();
    for (const c of matchedContacts) {
      if (c.linkPrecedence === "primary") {
        primaryIds.add(c.id);
      } else if (c.linkedId) {
        primaryIds.add(c.linkedId);
      }
    }

    // Single query to fetch entire cluster using CTE for better performance
    const cluster = await db
      .select()
      .from(contact)
      .where(
        or(
          inArray(contact.id, Array.from(primaryIds)),
          inArray(contact.linkedId, Array.from(primaryIds))
        )
      );

    // Find oldest primary
    let oldestPrimary = cluster[0];
    for (const c of cluster) {
      if (
        c.linkPrecedence === "primary" &&
        new Date(c.createdAt as Date).getTime() <
          new Date(oldestPrimary.createdAt as Date).getTime()
      ) {
        oldestPrimary = c;
      }
    }

    // Collect existing data
    const existingEmails = new Set<string>();
    const existingPhones = new Set<string>();
    const secondaryIds: number[] = [];

    for (const c of cluster) {
      if (c.email) existingEmails.add(c.email);
      if (c.phoneNumber) existingPhones.add(c.phoneNumber);
      if (c.id !== oldestPrimary.id) {
        secondaryIds.push(c.id);
      }
    }

    // Check if we need to update or insert
    const needsUpdate = cluster.some(
      (c) => c.id !== oldestPrimary.id && c.linkPrecedence === "primary"
    );

    const hasNewEmail = email && !existingEmails.has(email);
    const hasNewPhone = phoneNumber && !existingPhones.has(phoneNumber);
    const needsInsert = hasNewEmail || hasNewPhone;

    // Batch all mutations in a single transaction
    if (needsUpdate || needsInsert) {
      await db.transaction(async (tx) => {
        // Update all non-primary contacts to point to oldest primary
        if (needsUpdate) {
          const idsToUpdate = cluster
            .filter((c) => c.id !== oldestPrimary.id)
            .map((c) => c.id);

          if (idsToUpdate.length > 0) {
            await tx
              .update(contact)
              .set({
                linkPrecedence: "secondary",
                linkedId: oldestPrimary.id,
              })
              .where(inArray(contact.id, idsToUpdate));
          }
        }

        // Insert new secondary contact if new information
        if (needsInsert) {
          await tx.insert(contact).values({
            email: hasNewEmail ? email : null,
            phoneNumber: hasNewPhone ? phoneNumber : null,
            linkPrecedence: "secondary",
            linkedId: oldestPrimary.id,
          });

          // Add new data to sets for response
          if (hasNewEmail && email) existingEmails.add(email);
          if (hasNewPhone && phoneNumber) existingPhones.add(phoneNumber);
        }
      });

      // Fetch updated secondary IDs if we inserted
      if (needsInsert) {
        const updatedSecondaries = await db
          .select({ id: contact.id })
          .from(contact)
          .where(eq(contact.linkedId, oldestPrimary.id));

        secondaryIds.length = 0;
        secondaryIds.push(...updatedSecondaries.map((s) => s.id));
      }
    }

    // Build response without additional queries
    const allEmailsArray = Array.from(existingEmails);
    const allPhonesArray = Array.from(existingPhones);

    return this.formatResponse(
      oldestPrimary.id,
      secondaryIds,
      allEmailsArray,
      allPhonesArray,
      oldestPrimary.email,
      oldestPrimary.phoneNumber
    );
  }

  private formatResponse(
    primaryId: number,
    secondaryIds: number[],
    allEmails: (string | null)[],
    allPhones: (string | null)[],
    primaryEmail?: string | null,
    primaryPhone?: string | null
  ) {
    // Ensure primary contact's email and phone are first, filter out nulls
    const emails = [
      ...(primaryEmail ? [primaryEmail] : []),
      ...allEmails.filter((e): e is string => e !== null && e !== primaryEmail),
    ];

    const phoneNumbers = [
      ...(primaryPhone ? [primaryPhone] : []),
      ...allPhones.filter((p): p is string => p !== null && p !== primaryPhone),
    ];

    return {
      contact: {
        primaryContactId: primaryId,
        emails,
        phoneNumbers,
        secondaryContactIds: secondaryIds,
      },
    };
  }
}

export default new IdentifyService();
