import admin from "firebase-admin";

const firebaseCredential = admin.credential.cert("service-account.json");

admin.initializeApp({
  credential: firebaseCredential,
});

// Repository Library //

type Timestamp = FirebaseFirestore.Timestamp;

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

export class BaseRepository<T extends { id?: string }> {
  get collection(): Collection<T> {
    return admin.firestore().collection(this.collectionName) as Collection<T>;
  }

  constructor(private collectionName: string) {}

  insert(data: T, options: FirebaseFirestore.SetOptions = {}) {
    const id =
      typeof data.id === "string" && data.id !== ""
        ? data.id
        : this.collection.doc().id;

    const now = timestampNow();
    const doc = { updatedAt: now, createdAt: now, ...data, id };

    return this.collection.doc(id).set(doc, options);
  }
}
