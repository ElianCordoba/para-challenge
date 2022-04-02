Hi there! Excited for you to check my work.

## Running the project

Just install and run, optionally run the type checker with 

`npm run type-check`

_On porpuse_ I committed the firebase credentials for you to test.

I also created a postman workspace, invite [here](https://app.getpostman.com/join-team?invite_code=064f5060fde0c6065564599f69cbf323&ws=cfbc1e6f-bbf2-441d-891c-ff79cc85a39f) and provided the environment variables too, just import them in postman directly.

I left a couple of LOOKHERE comments with useful commentary.

Some documentation about route registering: 

## How to add a new route?

1 - If needed, create a new file inside the routes folder

2 - 
  - Declare a `routes` object
  - Use the instance server passed to declare the endpoint
  - Export `routes`

```ts
  // 1)
  const routes: RegisterHandlerFn = (server, _, next) => {
    // 2)
    server.get('/', () => {})
  }

  // 3)
  export { routes }; 
```

3 - Inside the `registerEndpoints` import the routes object and then register it as follows:
```ts
  instance.register(yourRoutesExport, { prefix: "/routePrefix" });
```

Note, every route would be declared under the global prefix (`/api/v1` in this case) declared in the `main.ts` file

## Extensions to this MVP

### A better schema validation and typings for the route
Read more about it in the LOOKHERE comment in `delivery.ts`

Also, every route should have body, querystring and / or param fully typed.

### Branded IDs

To prevent using a `driverId` in a context where a `deliveryId` is expected, we can brand the ids as follows

```ts
  type Nominal<brand = string> = string & { __brand: brand };

  type DriverId = Nominal<"driver">;
  type DeliveryId = Nominal<"delivery">;

  // Error since normal string are not assignable to branded strings
  const example1: DriverId = '123'

  // Works fine
  const example2: DriverId = '123' as DriverId

  // A showcase of the error we prevent with this approach
  function takeDriverId(id: DriverId): void {}

  const deliveryId = '321' as DeliveryId;

  // Error as expected
  takeDriverId(deliveryId)
```

### A better error management story

In the previous project what I did is a bigger scale than what is showcased here, having features such as

- Usage of error monitoring, such as sentry. Which can be configured with source maps to points where the error was originated from the Sentry dashboard
- Breadcrumbs (provided by Sentry)
- Notification to slack (Also provided by Sentry but can be easily done by ourselves to have more granular control)
- Multiple environments, log dev errors in the dev slack channel, log prod errors in the prod error channel
- More errors, also tight integration with the frontend

### Improvements to the repository library
What I showcased it's a small portion of all the work I did in my last job, but it's far from perfect, for example:

- Check the `withConverter` method perhaps my formatting could be removed
- Add more methods, for example, a couple of pretty cool ones are the following:

```ts
  class BaseRepository {

    // With the `stream` function we can iterate one by one
    async forEach(
      callback: (document: Snapshot<T>) => any,
      query?: QueryConstructor<T>,
    ) {
      const base = query ? query(this.collection) : this.collection;
      const stream = base.stream();

      for await (const document of stream) {
        await callback(document as unknown as Snapshot<T>);
      }
    }

    // Target collection is a string with the name of the new collection, such as "users_bkp"
    backupCollection(targetCollection: string) {
      const target = database.collection(targetCollection);

      return this.forEach((doc) => target.doc(doc.id).create(doc.data()));
    }
  }
```

### Injection service
Minor optimization but a good practice, instead of instantiating a new repository in every route we could have a global object to hold the singletons

## Why no tests?
Not going to lie, I left them for the end and when I got there I already put enough hours into this that made me think it was going to be enough.

I was planning to use `vite-test` for the unit test, maybe some postman test too. Some time ago the firebase team introduced the firestore local emulator, I could also take a look that that too.

# Prompt 2

Specifically, we’d want to hear:
 - @ the code:
   - What about your implementation would you change before production? What additional tools, practices, monitoring, logging would you want to put in place?
    - Use real logging and error monitoring systems.
    - Use environmental variables to use the proper server and DB
    - Have strong schema validation on every endpoint
    - Have a strong error system, mentioned in the extensions section above
    - Have tests :)

   - Would middleware would you want to add to your API server - or, if you would change API servers, which one would you go to? 
    - Definitely should add an auth system, protecting the necessary routes.
    - I would change the usage of the `?summary=1` and create a specific endpoint for that. Unless it's a very specific case I see the fact of having two different functionality in the same endpoint (same route and method) as an anti-pattern.

 - @ testing:
   - What testing frameworks should be used for unit tests? What about integration tests? 
  - I like vite-test because it's really fast, similar to Jest and esm ready.

   - What should be mocked? What shouldn't? 
  -  No idea to be honest, if I can easily firedup a dummy version of firestore we shouldn't need anything to be mocked when you can use "real" data. If you are using payments that could be mocked be it really depends on the specific case, if you use stripe you can create "real" payments and subscriptions in a dummy environment that they provide.

 - @ databases:
   - What database should we use for this type of app? 
    - Depends on your usage :) I like firestore, it's cheap, easy to work on and it has some deal-breaker features in a specific case, for example, the real-time aspect.
    
    You may also consider using other databases for another aspect of the system, like SQL for massive amounts of information, like logs, using a data warehouse.
      
   - Should we use the same data model that you designed or change it somehow? 
    - My model would work, I would need to see real usage to see if we are going to have the same bottleneck, for example, I don't know how often users switch their status or how many deliveries each user does per day. With more usage knowledge we could adapt this.

 - @ CI / CD:
   - What should the CI (continuous integration) process look like for this app? 
   - How should we trigger a deploy? 
   - How should we deploy the app? What are the tradeoffs between the different options? 
    On every commit pushed to the remote repository, also on merges to deploy the changes to the corresponding environments. Many tools have bots that comment on the PR to give you a link to a newly deployed environment to test the changes.

   - What checks should we ensure pass before letting the code merge? 
    - All test passing, linting, and approval of at least one coworker