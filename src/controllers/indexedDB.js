class IndexedDB {
  constructor() {
    if (!indexedDB) {
      throw new Error("IndexedDB is not supported in this browser.");
    }
  }

  // initialize db with a given schema
  _dbInitHandler(db, schema) {
    // create stores
    for (const storeMetadata of schema) {
      console.debug(`[IndexedDB] Creating store ${storeMetadata.storeName}`);
      const store = db.createObjectStore(storeMetadata.storeName, {
        autoIncrement: true,
      });

      // create indexes for the store
      for (const fieldName of storeMetadata.indexFields) {
        console.debug(
          `[IndexedDB] Creating index ${storeMetadata.storeName}.${fieldName}`
        );
        store.createIndex(`${fieldName}_idx`, fieldName);
      }
    }

    return true;
  }

  async connect(dbName, schema, getInitialRecordsFn) {
    return new Promise(async (resolve, reject) => {
      this.dbName = dbName;
      let dbInitOccured;

      const dbConnectRequest = indexedDB.open(this.dbName, 1);

      dbConnectRequest.onupgradeneeded = (event) => {
        console.debug(`[IndexedDB] Initializing ${this.dbName}`);
        const db = event.target.result;
        dbInitOccured = this._dbInitHandler(db, schema);
      };

      dbConnectRequest.onerror = (event) =>
        reject(`[IndexedDB] ${event.target?.error}`);

      dbConnectRequest.onsuccess = async (event) => {
        console.debug(`[IndexedDB] Successfully connected to ${this.dbName}`);
        const db = event.target?.result;
        this.db = db;

        // if database initialization ran, seed the database
        if (dbInitOccured && getInitialRecordsFn) {
          const initialRecords = await getInitialRecordsFn();
          console.debug(
            `[IndexedDB] Seeding ${this.dbName} with ${initialRecords.length} records`
          );
          await this.add(initialRecords);
          console.debug(`[IndexedDB] Seeding completed for ${this.dbName}`);
        }
        resolve();
      };
    });
  }

  async add(records) {
    for await (const record of records) {
      const store = this.db
        .transaction(record.storeName, "readwrite")
        .objectStore(record.storeName);

      const query = store.add(record.data);

      await new Promise((resolve, reject) => {
        query.onerror = (event) => reject(`[IndexedDB] ${event.target?.error}`);
        query.onsuccess = resolve;
      });
    }
  }

  async scan(storeName, filterFunction) {
    return new Promise((resolve, reject) => {
      const records = [];

      const query = this.db
        .transaction(storeName)
        .objectStore(storeName)
        .openCursor();

      query.onsuccess = () => {
        const cursor = query.result;

        if (cursor) {
          if (filterFunction(cursor.value)) {
            records.push(cursor.value);
          }
          cursor.continue();
        } else {
          resolve(records);
        }
      };

      query.onerror = (event) => reject(`[IndexedDB] ${event.target?.error}`);
    });
  }

  async findAll(storeName) {
    return new Promise((resolve, reject) => {
      const query = this.db
        .transaction(storeName, "readonly")
        .objectStore(storeName)
        .getAll();

      query.onerror = (event) => reject(`[IndexedDB] ${event.target?.error}`);

      query.onsuccess = () => {
        resolve(query.result);
      };
    });
  }

  async dropDatabase(dbName) {
    return new Promise((resolve, reject) => {
      const dropDBRequest = indexedDB.deleteDatabase(dbName);
      dropDBRequest.onsuccess = resolve;
      dropDBRequest.onerror = (event) =>
        reject(`[IndexedDB] Failed to drop ${dbName}. ${event.target?.error}`);
      dropDBRequest.onblocked = (event) =>
        reject(`[IndexedDB] Failed to drop ${dbName}. ${event.target?.error}`);
    });
  }
}

export default IndexedDB;
