import admin from "firebase-admin";

import { Timestamp } from "@google-cloud/firestore";

const firebaseCredential = admin.credential.cert("service-account.json");

admin.initializeApp({
  credential: firebaseCredential,
});

// Repository Library //

function timestampNow(): Timestamp {
  return admin.firestore.Timestamp.now();
}

// This signature override the original `where` method one in order to provide better intellisense.
type WhereFunctionSignature<T> = (
  fieldPath: keyof T,
  opStr: FirebaseFirestore.WhereFilterOp,
  value: any
) => FirebaseFirestore.Query<T>;

export type Collection<T> = {
  where: WhereFunctionSignature<T>;
} & FirebaseFirestore.CollectionReference<T>;

export type Query<T> = {
  where: WhereFunctionSignature<T>;
} & FirebaseFirestore.Query<T>;

export type QueryConstructor<T> = (query: Query<T>) => Query<T>;

export type Snapshot<T> = FirebaseFirestore.DocumentSnapshot<T>;

type TimestampProperties<T> = (keyof T)[];

export class BaseRepository<T extends { id?: string }> {
  get collection(): Collection<T> {
    return admin.firestore().collection(this.collectionName) as Collection<T>;
  }

  defaultTimestampProperties: TimestampProperties<T> = [
    "created_at",
    "updated_at",
  ] as TimestampProperties<T>;
  timestampProperties: TimestampProperties<T>;

  constructor(
    private collectionName: string,
    options?: { timestampProperties: TimestampProperties<T> }
  ) {
    this.timestampProperties = [
      ...this.defaultTimestampProperties,
      ...(options?.timestampProperties || []),
    ];
  }

  async exists(id: string) {
    const doc = await this.collection.doc(id).get();
    return doc.exists;
  }

  insert(data: T, options: FirebaseFirestore.SetOptions = {}) {
    const id =
      typeof data.id === "string" && data.id !== ""
        ? data.id
        : this.collection.doc().id;

    const now = timestampNow();
    const doc = { updated_at: now, created_at: now, ...data, id };

    return this.collection.doc(id).set(doc, options);
  }

  async find(
    queryOrQueryBuilder: Query<T> | QueryConstructor<T> = (i) => i
  ): Promise<T[]> {
    let query = queryOrQueryBuilder as Query<T>;

    // If the `where` method is not present, it's a query constructor function
    if (!query.where) {
      query = (queryOrQueryBuilder as QueryConstructor<T>)(this.collection);
    }

    const result = await query.get();

    return this.parseResult(result);
  }

  async findById<T>(id: string) {
    const document = await this.collection.doc(id).get();
    const exists = this.parseDocument(document);

    if (!exists) {
      throw {
        error: `Document with ID ${id} of collection ${this.collectionName} doesn't exist`,
      };
    }

    return exists;
  }

  async findAll(): Promise<(T & { id: string })[]> {
    return this.parseResult(await this.collection.get()) as any;
  }

  async update(id: string, update: Partial<T>) {
    return this.collection
      .doc(id)
      .update({ updated_at: timestampNow(), ...update });
  }

  // IMPROVE: Checkout `withConverter`, perhaps this is a solved problem
  private parseResult<T>(result: FirebaseFirestore.QuerySnapshot<T>): T[] {
    if (!result || result.empty) {
      return [];
    }

    const documents: T[] = [];

    for (const document of result.docs) {
      const docExists: any = document?.data();

      if (docExists) {
        documents.push(this.parseDateProperties(docExists));
      }
    }

    return documents;
  }

  parseDocument<T>(document: Snapshot<T>): T | undefined {
    const doc = document.data();

    if (doc) {
      return this.parseDateProperties(doc);
    }
  }

  parseDateProperties(document: any) {
    const copy = { ...document };
    for (const timestampProp of this.timestampProperties) {
      if (copy[timestampProp] && copy[timestampProp] instanceof Timestamp) {
        copy[timestampProp] = copy[timestampProp].toDate();
      }
    }

    return copy;
  }
}
